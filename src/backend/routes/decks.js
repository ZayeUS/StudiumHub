// src/backend/routes/decks.js
import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';
import checkRole from '../middlewares/checkRole.js';

const router = express.Router();

// NEW: Public route for students (no authentication)
router.get('/public/:deckId', async (req, res) => {
    const { deckId } = req.params;
    try {
        const cardsResult = await query(
            'SELECT term, definition FROM flashcards WHERE deck_id = $1',
            [deckId]
        );
        res.status(200).json(cardsResult.rows);
    } catch (error) {
        console.error('Error fetching public flashcard deck:', error);
        res.status(500).json({ message: 'Failed to retrieve flashcards.' });
    }
});


// GET a flashcard deck and all its cards
router.get('/:deckId', authenticate, checkRole(['admin']), async (req, res) => {
    const { deckId } = req.params;
    try {
        const cardsResult = await query(
            'SELECT term, definition FROM flashcards WHERE deck_id = $1',
            [deckId]
        );
        res.status(200).json(cardsResult.rows);
    } catch (error) {
        console.error('Error fetching flashcard deck:', error);
        res.status(500).json({ message: 'Failed to retrieve flashcards.' });
    }
});

export default router;