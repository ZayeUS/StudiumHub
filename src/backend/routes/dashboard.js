// src/backend/routes/dashboard.js
import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';
import checkRole from '../middlewares/checkRole.js';

const router = express.Router();

// GET endpoint for the teacher's dashboard data
router.get('/teacher', authenticate, checkRole(['admin']), async (req, res) => {
    const { organization_id } = req.user;

    try {
        // Run all queries in parallel for efficiency
        const [statsResult, materialsResult, coursesResult] = await Promise.all([
            // Query for aggregate stats
            query(`
                SELECT
                    (SELECT COUNT(*) FROM course_materials WHERE organization_id = $1) as total_materials,
                    (SELECT COUNT(*) FROM courses WHERE organization_id = $1) as total_courses
            `, [organization_id]),
            // Query for the 5 most recently uploaded materials
            query(`
                SELECT material_id, file_name, status, created_at
                FROM course_materials
                WHERE organization_id = $1
                ORDER BY created_at DESC
                LIMIT 5
            `, [organization_id]),
            // Query for the 5 most recently updated courses
            query(`
                SELECT course_id, title, description, updated_at
                FROM courses
                WHERE organization_id = $1
                ORDER BY updated_at DESC
                LIMIT 5
            `, [organization_id])
        ]);

        const dashboardData = {
            stats: {
                totalMaterials: parseInt(statsResult.rows[0].total_materials, 10) || 0,
                totalCourses: parseInt(statsResult.rows[0].total_courses, 10) || 0,
            },
            recentMaterials: materialsResult.rows,
            recentCourses: coursesResult.rows,
        };

        res.status(200).json(dashboardData);
    } catch (error) {
        console.error('Error fetching teacher dashboard data:', error);
        res.status(500).json({ message: 'Failed to retrieve dashboard data.' });
    }
});

export default router;