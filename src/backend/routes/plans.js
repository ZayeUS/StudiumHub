// File: src/backend/routes/plans.js
import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

// GET all subscription plans
// This endpoint is authenticated to ensure only logged-in users can see pricing.
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query('SELECT plan_id, name, price_monthly, max_projects, allow_custom_branding FROM plans ORDER BY price_monthly ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ message: 'Error fetching subscription plans' });
  }
});

export default router;