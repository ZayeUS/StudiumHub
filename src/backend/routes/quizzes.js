// src/backend/routes/quizzes.js
import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';
import checkRole from '../middlewares/checkRole.js';

const router = express.Router();

// NEW: Public route for students (no authentication)
router.get('/public/:quizId', async (req, res) => {
    const { quizId } = req.params;
    try {
        const quizResult = await query(
            'SELECT question_id, question_text, options, correct_answer FROM quiz_questions WHERE quiz_id = $1',
            [quizId]
        );
        res.status(200).json(quizResult.rows);
    } catch (error) {
        console.error('Error fetching public quiz:', error);
        res.status(500).json({ message: 'Failed to retrieve quiz.' });
    }
});

// GET a quiz and all its questions, now including the question_id
router.get('/:quizId', authenticate, checkRole(['admin', 'member']), async (req, res) => { // Allow members to also fetch quizzes
    const { quizId } = req.params;
    try {
        const quizResult = await query(
            'SELECT question_id, question_text, options, correct_answer FROM quiz_questions WHERE quiz_id = $1', // <-- Added question_id
            [quizId]
        );
        res.status(200).json(quizResult.rows);
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ message: 'Failed to retrieve quiz.' });
    }
});

export default router;