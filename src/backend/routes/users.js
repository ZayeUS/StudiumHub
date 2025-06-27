import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';
import {logAudit} from '../utils/auditLogger.js';

const router = express.Router();

// CREATE a new user
router.post("/", async (req, res) => {
  const { firebase_uid, email } = req.body; // MODIFIED: role_id removed
  if (!firebase_uid || !email) {
    return res.status(400).json({ message: "Firebase UID and email are required." });
  }
  const queryText = "INSERT INTO users (firebase_uid, email) VALUES ($1, $2) RETURNING *"; // MODIFIED: role_id removed
  const values = [firebase_uid, email];
  try {
    const result = await query(queryText, values);
    const user = result.rows[0];
    await logAudit({
      actorUserId: user.user_id,
      targetUserId: user.user_id,
      action: "create_user",
      tableName: "users",
      recordId: user.user_id,
      metadata: { email: user.email }
    });
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// READ all users
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// DELETE the authenticated user (Soft Delete)
router.delete('/me', authenticate, async (req, res) => {
  const { user_id, email } = req.user;
  const queryText = `
    UPDATE users 
    SET deleted_at = CURRENT_TIMESTAMP 
    WHERE user_id = $1 AND deleted_at IS NULL 
    RETURNING user_id`;
  try {
    const result = await query(queryText, [user_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found or already deleted.' });
    }
    await logAudit({
      actorUserId: user_id,
      targetUserId: user_id,
      action: "soft_delete_user",
      tableName: "users",
      recordId: user_id,
      metadata: { email }
    });
    res.status(200).json({ message: 'User account marked for deletion.' });
  } catch (error) {
    console.error('Error soft-deleting user:', error);
    res.status(500).json({ message: 'Error deleting user account.' });
  }
});

// READ a single user by firebase_uid
router.get('/:firebase_uid', authenticate, async (req, res) => {
  const { firebase_uid } = req.params;
  try {
    const result = await query('SELECT * FROM users WHERE firebase_uid = $1', [firebase_uid]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});


// DELETE a user by firebase_uid (For Admins)
router.delete('/:firebase_uid', authenticate, async (req, res) => {
  // NOTE: You will need a new way to determine if a user is an admin
  // For now, this is accessible to any authenticated user.
  const { firebase_uid } = req.params;
  const actorUserId = req.user?.user_id;
  try {
    const result = await query('DELETE FROM users WHERE firebase_uid = $1 RETURNING *', [firebase_uid]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    await logAudit({
      actorUserId,
      targetUserId: result.rows[0].user_id,
      action: "admin_delete_user",
      tableName: "users",
      recordId: result.rows[0].user_id,
      metadata: { email: result.rows[0].email }
    });
    res.status(200).json({ message: 'User deleted successfully by admin' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

export default router;