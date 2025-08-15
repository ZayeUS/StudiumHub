// src/backend/routes/modules.js
import express from 'express';
import { query, pool } from '../db.js';
import authenticate from '../middlewares/authenticate.js';
import checkRole from '../middlewares/checkRole.js';
import { OpenAI } from 'openai';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- helper to safely limit text ---
function limitChunks(chunks, limit = 50) {
  return chunks.slice(0, limit).map(r => r.content).join(' ');
}

// --- helper: robust JSON parse (throws with clearer message) ---
function safeParseJson(str, context = 'AI response') {
  try {
    return JSON.parse(str);
  } catch (e) {
    const snippet = String(str || '').slice(0, 200);
    throw new Error(`Failed to parse ${context} as JSON. First 200 chars: ${snippet}`);
  }
}

// --- helper: enforce exact array size of 10 ---
function enforceExactlyTen(arr, label) {
  if (!Array.isArray(arr)) {
    throw new Error(`${label} is not an array.`);
  }
  if (arr.length < 10) {
    throw new Error(`AI returned fewer than 10 ${label.toLowerCase()}.`);
  }
  // If more than 10, hard cap at 10 to comply with "only ever return 10".
  return arr.slice(0, 10);
}



// NEW: Public route to get a single module's content
router.get('/:moduleId', async (req, res) => {
  const { moduleId } = req.params;
  try {
      const result = await query(
          `SELECT module_id, course_id, title, ai_summary, flashcard_deck_id, quiz_id 
           FROM course_modules 
           WHERE module_id = $1`,
          [moduleId]
      );

      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Module not found.' });
      }

      res.status(200).json(result.rows[0]);
  } catch (error) {
      console.error('Error fetching public module:', error);
      res.status(500).json({ message: 'Failed to retrieve module content.' });
  }
});
// POST a new module
router.post('/', authenticate, checkRole(['admin']), async (req, res) => {
  const { course_id, title } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const courseRes = await client.query(
      'SELECT source_material_id FROM courses WHERE course_id = $1',
      [course_id]
    );
    if (courseRes.rows.length === 0) throw new Error('Course not found.');
    const { source_material_id } = courseRes.rows[0];

    const chunksRes = await client.query(
      'SELECT content FROM chunks WHERE material_id = $1 ORDER BY chunk_id',
      [source_material_id]
    );
    if (chunksRes.rows.length === 0) throw new Error('No text content for this material.');

    // --- FIX: don't send the entire book ---
    const limitedText = limitChunks(chunksRes.rows, 50);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            `You are an expert educator working in STRICT extraction mode.\n` +
            `Rules:\n` +
            `1) Use ONLY the provided textbook content. Do NOT invent, infer, or add external knowledge.\n` +
            `2) Return JSON ONLY (no commentary). Keys: "summary" (2–3 sentences), "keyConcepts" (array of { "concept", "details" }), "takeaways" (array of 3–5 strings).\n` +
            `3) Keep all content grounded in the given text; if the specified title is not explicitly present, still derive a concise summary strictly from the provided excerpt that best matches the title.\n`
        },
        {
          role: 'user',
          content:
            `Textbook Content:\n"""${limitedText}"""\n\n` +
            `Module Title to Summarize: "${title}"`
        }
      ]
    });

    const aiSummaryJson = safeParseJson(completion.choices[0]?.message?.content, 'module summary');

    const orderRes = await client.query(
      'SELECT COUNT(*) as count FROM course_modules WHERE course_id = $1',
      [course_id]
    );
    const moduleOrder = parseInt(orderRes.rows[0].count, 10) + 1;

    const result = await client.query(
      `INSERT INTO course_modules (course_id, title, module_order, ai_summary)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [course_id, title, moduleOrder, aiSummaryJson]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating course module:', error);
    res.status(500).json({ message: error.message || 'Failed to create module.' });
  } finally {
    client.release();
  }
});

// POST /api/modules/:moduleId/generate-flashcards
router.post('/:moduleId/generate-flashcards', authenticate, checkRole(['admin']), async (req, res) => {
  const { moduleId } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const moduleRes = await client.query(
      'SELECT ai_summary FROM course_modules WHERE module_id = $1',
      [moduleId]
    );
    if (moduleRes.rows.length === 0) throw new Error('Module not found.');

    const summaryJson = moduleRes.rows[0].ai_summary;
    const textForAi =
      `Overview: ${summaryJson.summary}\n` +
      `Key Concepts:\n${summaryJson.keyConcepts.map(c => `${c.concept}: ${c.details}`).join('\n')}\n` +
      `Important Takeaways:\n${summaryJson.takeaways.join('\n')}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            `You create flashcards in STRICT extraction mode.\n` +
            `Rules:\n` +
            `1) Use ONLY the provided text; do NOT fabricate or add outside knowledge.\n` +
            `2) Return JSON ONLY with a single key "flashcards".\n` +
            `3) "flashcards" MUST be an array of EXACTLY 10 items.\n` +
            `4) Each item is an object: { "term": string, "definition": string }.\n` +
            `5) Keep definitions short, precise, and directly supported by the text.\n`
        },
        {
          role: 'user',
          content:
            `Generate EXACTLY 10 flashcards ONLY from this text:\n"""${textForAi}"""\n` +
            `Return ONLY JSON with the "flashcards" array.`
        }
      ]
    });

    const parsed = safeParseJson(completion.choices[0]?.message?.content, 'flashcards');
    let flashcards = enforceExactlyTen(parsed.flashcards, 'Flashcards');

    // Insert into DB
    const deckRes = await client.query(
      'INSERT INTO flashcard_decks (module_id) VALUES ($1) RETURNING deck_id',
      [moduleId]
    );
    const { deck_id } = deckRes.rows[0];

    for (const card of flashcards) {
      await client.query(
        'INSERT INTO flashcards (deck_id, term, definition) VALUES ($1, $2, $3)',
        [deck_id, card.term, card.definition]
      );
    }
    await client.query(
      'UPDATE course_modules SET flashcard_deck_id = $1 WHERE module_id = $2',
      [deck_id, moduleId]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Flashcards generated successfully.', deck_id });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error generating flashcards:', error);
    res.status(500).json({ message: error.message || 'Failed to generate flashcards.' });
  } finally {
    client.release();
  }
});

// POST /api/modules/:moduleId/generate-quiz
router.post('/:moduleId/generate-quiz', authenticate, checkRole(['admin']), async (req, res) => {
  const { moduleId } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const moduleRes = await client.query(
      'SELECT title, ai_summary FROM course_modules WHERE module_id = $1',
      [moduleId]
    );
    if (moduleRes.rows.length === 0) throw new Error('Module not found.');

    const { title, ai_summary } = moduleRes.rows[0];
    const textForAi =
      `Overview: ${ai_summary.summary}\n` +
      `Key Concepts:\n${ai_summary.keyConcepts.map(c => `${c.concept}: ${c.details}`).join('\n')}\n` +
      `Important Takeaways:\n${ai_summary.takeaways.join('\n')}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            `You create quizzes in STRICT extraction mode.\n` +
            `Rules:\n` +
            `1) Use ONLY the provided text; do NOT fabricate or use outside knowledge.\n` +
            `2) Return JSON ONLY with a single key "questions".\n` +
            `3) "questions" MUST be an array of EXACTLY 10 items.\n` +
            `4) Each item: {\n` +
            `   "question_text": string (clear, short, unambiguous),\n` +
            `   "options": array of 4 distinct strings,\n` +
            `   "correct_answer": string (must exactly match one of the options)\n` +
            `}\n` +
            `5) Every question must be answerable directly from the provided text.\n`
        },
        {
          role: 'user',
          content:
            `Generate EXACTLY 10 multiple-choice questions STRICTLY from this text:\n"""${textForAi}"""\n` +
            `Return ONLY JSON with the "questions" array.`
        }
      ]
    });

    const parsed = safeParseJson(completion.choices[0]?.message?.content, 'quiz');
    let questions = enforceExactlyTen(parsed.questions, 'Questions');

    // (Optional) Minimal validation: ensure each question has 4 options and correct_answer within options
    questions = questions.map((q, idx) => {
      if (!q || typeof q.question_text !== 'string') {
        throw new Error(`Question ${idx + 1} missing "question_text".`);
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question "${q.question_text}" must have exactly 4 options.`);
      }
      if (typeof q.correct_answer !== 'string' || !q.options.includes(q.correct_answer)) {
        throw new Error(`Question "${q.question_text}" has an invalid "correct_answer".`);
      }
      return q;
    });

    const quizRes = await client.query(
      'INSERT INTO quizzes (module_id, title) VALUES ($1, $2) RETURNING quiz_id',
      [moduleId, `${title} Quiz`]
    );
    const { quiz_id } = quizRes.rows[0];

    for (const q of questions) {
      await client.query(
        'INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer) VALUES ($1, $2, $3, $4)',
        [quiz_id, q.question_text, JSON.stringify(q.options), q.correct_answer]
      );
    }
    await client.query(
      'UPDATE course_modules SET quiz_id = $1 WHERE module_id = $2',
      [quiz_id, moduleId]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Quiz generated successfully.', quiz_id });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error generating quiz:', error);
    res.status(500).json({ message: error.message || 'Failed to generate quiz.' });
  } finally {
    client.release();
  }
});

export default router;
