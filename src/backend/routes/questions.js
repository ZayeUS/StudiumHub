// src/backend/routes/questions.js
import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';
import checkRole from '../middlewares/checkRole.js';

const router = express.Router();

// Middleware to ensure the user is an admin for all routes in this file
router.use(authenticate, checkRole(['admin']));

// POST /api/questions - Add a new question to a quiz
router.post('/', async (req, res) => {
    const { quiz_id, question_text, options, correct_answer } = req.body;

    if (!quiz_id || !question_text || !options || !correct_answer) {
        return res.status(400).json({ message: 'All question fields are required.' });
    }

    try {
        const result = await query(
            'INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer) VALUES ($1, $2, $3, $4) RETURNING *',
            [quiz_id, question_text, JSON.stringify(options), correct_answer]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding new question:', error);
        res.status(500).json({ message: 'Failed to add question.' });
    }
});

// PUT /api/questions/:questionId - Update an existing question
router.put('/:questionId', async (req, res) => {
    const { questionId } = req.params;
    const { question_text, options, correct_answer } = req.body;

    if (!question_text || !options || !correct_answer) {
        return res.status(400).json({ message: 'All question fields are required.' });
    }

    try {
        const result = await query(
            'UPDATE quiz_questions SET question_text = $1, options = $2, correct_answer = $3 WHERE question_id = $4 RETURNING *',
            [question_text, JSON.stringify(options), correct_answer, questionId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Question not found.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ message: 'Failed to update question.' });
    }
});

// DELETE /api/questions/:questionId - Delete a question
router.delete('/:questionId', async (req, res) => {
    const { questionId } = req.params;
    try {
        const result = await query('DELETE FROM quiz_questions WHERE question_id = $1 RETURNING *', [questionId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Question not found.' });
        }
        res.status(200).json({ message: 'Question deleted successfully.' });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ message: 'Failed to delete question.' });
    }
});

export default router;