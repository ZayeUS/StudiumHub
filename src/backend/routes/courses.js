// src/backend/routes/courses.js
import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';
import checkRole from '../middlewares/checkRole.js';

const router = express.Router();


// NEW: Public route for students (no authentication)
router.get('/public/:courseId', async (req, res) => {
    const { courseId } = req.params;
    try {
        // This query is almost identical to the authenticated one but without checking the organization
        const courseQuery = `
            SELECT c.course_id, c.title, c.description, cm.file_name as source_file_name
            FROM courses c
            JOIN course_materials cm ON c.source_material_id = cm.material_id
            WHERE c.course_id = $1
        `;
        const courseResult = await query(courseQuery, [courseId]);

        if (courseResult.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        const modulesQuery = `
            SELECT module_id, title, module_order
            FROM course_modules
            WHERE course_id = $1
            ORDER BY module_order ASC
        `;
        const modulesResult = await query(modulesQuery, [courseId]);

        const courseData = {
            ...courseResult.rows[0],
            modules: modulesResult.rows,
        };

        res.status(200).json(courseData);
    } catch (error) {
        console.error('Error fetching public course details:', error);
        res.status(500).json({ message: 'Failed to retrieve course details.' });
    }
});
// GET a single course by its ID
router.get('/:courseId', authenticate, checkRole(['admin']), async (req, res) => {
    const { courseId } = req.params;
    const { organization_id } = req.user;

    try {
        const courseQuery = `
            SELECT c.*, cm.file_name as source_file_name
            FROM courses c
            JOIN course_materials cm ON c.source_material_id = cm.material_id
            WHERE c.course_id = $1 AND c.organization_id = $2
        `;
        const courseResult = await query(courseQuery, [courseId, organization_id]);

        if (courseResult.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        // --- THE FIX IS HERE ---
        // Add flashcard_deck_id and quiz_id to the SELECT statement
        const modulesQuery = `
            SELECT module_id, title, module_order, ai_summary, flashcard_deck_id, quiz_id
            FROM course_modules
            WHERE course_id = $1
            ORDER BY module_order ASC
        `;
        const modulesResult = await query(modulesQuery, [courseId]);

        const courseData = {
            ...courseResult.rows[0],
            modules: modulesResult.rows,
        };

        res.status(200).json(courseData);
    } catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).json({ message: 'Failed to retrieve course details.' });
    }
});

// POST a new course
router.post('/', authenticate, checkRole(['admin']), async (req, res) => {
    const { title, source_material_id } = req.body;
    const { user_id, organization_id } = req.user;

    if (!title || !source_material_id) {
        return res.status(400).json({ message: 'Title and source material ID are required.' });
    }

    try {
        const result = await query(
            `INSERT INTO courses (organization_id, created_by_user_id, source_material_id, title)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [organization_id, user_id, source_material_id, title]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Failed to create course.' });
    }
});

export default router;