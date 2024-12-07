import express from 'express';
import { query } from '../db.js'; // Import the query function from db.js
import authenticate from '../middlewares/authenticate.js'; // Import the authenticate middleware

const router = express.Router();


// CREATE a new user
router.post("/", authenticate, async (req, res) => {
    const { firebase_uid, email, role_id } = req.body; // Notice 'email' instead of 'user_email'
  
    if (!firebase_uid || !email || !role_id) {
      return res.status(400).json({ message: "All fields are required." });
    }
  
    const queryText = "INSERT INTO users (firebase_uid, email, role_id) VALUES ($1, $2, $3) RETURNING *"; // Use 'email' column
    const values = [firebase_uid, email, role_id];
  
    try {
      const result = await query(queryText, values);
      res.status(201).json({ message: "User created successfully", user: result.rows[0] });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });
  

// READ all users
router.get('/', authenticate, async (req, res) => {
  const queryText = 'SELECT * FROM users';

  try {
    const result = await query(queryText);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// READ a single user by firebase_uid
router.get('/:firebase_uid', authenticate, async (req, res) => {
  const { firebase_uid } = req.params;
  const queryText = 'SELECT * FROM users WHERE firebase_uid = $1';
  const values = [firebase_uid];

  try {
    const result = await query(queryText, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// UPDATE a user's role
router.put('/:firebase_uid', authenticate, async (req, res) => {
  const { firebase_uid } = req.params;
  const { role_id } = req.body;

  if (!role_id) {
    return res.status(400).json({ message: 'Role ID is required' });
  }

  const queryText = 'UPDATE users SET role_id = $1 WHERE firebase_uid = $2 RETURNING *';
  const values = [role_id, firebase_uid];

  try {
    const result = await query(queryText, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User role updated', user: result.rows[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// DELETE a user by firebase_uid
router.delete('/:firebase_uid', authenticate, async (req, res) => {
  const { firebase_uid } = req.params;
  const queryText = 'DELETE FROM users WHERE firebase_uid = $1 RETURNING *';
  const values = [firebase_uid];

  try {
    const result = await query(queryText, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

export default router;
