// src/backend/routes/profile.js
import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

// CREATE a new profile for the authenticated user
router.post('/', authenticate, async (req, res) => {
  const { user_id } = req.user;
  const { first_name, last_name, date_of_birth } = req.body;

  if (!first_name || !last_name || !date_of_birth) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const queryText = `
    INSERT INTO profiles (user_id, first_name, last_name, date_of_birth)
    VALUES ($1, $2, $3, $4) RETURNING *`;
  const values = [user_id, first_name, last_name, date_of_birth];

  try {
    const result = await query(queryText, values);
    res.status(201).json({ message: "Profile created successfully", profile: result.rows[0] });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ message: "Error creating profile" });
  }
});

// READ the authenticated user's profile
router.get('/', authenticate, async (req, res) => {
  const { user_id } = req.user;
  const queryText = 'SELECT * FROM profiles WHERE user_id = $1';
  const values = [user_id];

  try {
    const result = await query(queryText, values);
    if (result.rows.length === 0) {
      return res.status(200).json(null); // No profile yet is OK
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// UPDATE the authenticated user's profile
router.put('/', authenticate, async (req, res) => {
  const { user_id } = req.user;
  const { first_name, last_name, date_of_birth } = req.body;

  if (!first_name || !last_name || !date_of_birth) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const queryText = `
    UPDATE profiles
    SET first_name = $1, last_name = $2, date_of_birth = $3, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $4 RETURNING *`;
  const values = [first_name, last_name, date_of_birth, user_id];

  try {
    const result = await query(queryText, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json({ message: 'Profile updated', profile: result.rows[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// DELETE the authenticated user's profile
router.delete('/', authenticate, async (req, res) => {
  const { user_id } = req.user;
  const queryText = 'DELETE FROM profiles WHERE user_id = $1 RETURNING *';
  const values = [user_id];

  try {
    const result = await query(queryText, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'Error deleting profile' });
  }
});

export default router;
