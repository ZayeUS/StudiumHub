import express from 'express';
import { query } from '../db.js'; // Import the query function from db.js
import authenticate from '../middlewares/authenticate.js'; // Import the authenticate middleware

const router = express.Router();

// CREATE a new profile for a user
router.post('/:user_id', authenticate, async (req, res) => {
  const { user_id } = req.params;
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

// READ a user's profile
router.get('/:user_id', authenticate, async (req, res) => {
  const { user_id } = req.params;
  const queryText = 'SELECT * FROM profiles WHERE user_id = $1';
  const values = [user_id];

  try {
    const result = await query(queryText, values);
    if (result.rows.length === 0) {
      // Return null when profile is not found
      return res.status(200).json(null);
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});


// UPDATE a user's profile
router.put('/:user_id', authenticate, async (req, res) => {
  const { user_id } = req.params;
  const { first_name, last_name, date_of_birth } = req.body;

  if (!first_name || !last_name || !date_of_birth) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const queryText = `
    UPDATE profiles
    SET first_name = $1, last_name = $2, date_of_birth = $3
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

// DELETE a user's profile
router.delete('/:user_id', authenticate, async (req, res) => {
  const { user_id } = req.params;
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
