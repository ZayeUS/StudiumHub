import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';
import {logAudit} from '../utils/auditLogger.js'; // ✅ Correct default import

const router = express.Router();

// CREATE a new user
router.post("/", async (req, res) => {
  const { firebase_uid, email, role_id } = req.body;

  if (!firebase_uid || !email || !role_id) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const queryText = "INSERT INTO users (firebase_uid, email, role_id) VALUES ($1, $2, $3) RETURNING *";
  const values = [firebase_uid, email, role_id];

  try {
    const result = await query(queryText, values);
    const user = result.rows[0];

    await logAudit({
      actorUserId: user.user_id,     // self-created user
      targetUserId: user.user_id,
      action: "create_user",
      tableName: "users",
      recordId: user.user_id,
      metadata: { email: user.email, role_id: user.role_id }
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

// READ a single user
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

// UPDATE a user's role
router.put('/:firebase_uid', authenticate, async (req, res) => {
  const { firebase_uid } = req.params;
  const { role_id } = req.body;
  const actorUserId = req.user?.user_id;

  if (!role_id) return res.status(400).json({ message: 'Role ID is required' });

  try {
    const result = await query(
      'UPDATE users SET role_id = $1 WHERE firebase_uid = $2 RETURNING *',
      [role_id, firebase_uid]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    await logAudit({
      actorUserId,
      targetUserId: result.rows[0].user_id,
      action: "update_user_role",
      tableName: "users",
      recordId: result.rows[0].user_id,
      metadata: { new_role_id: role_id }
    });

    res.status(200).json({ message: 'User role updated', user: result.rows[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// DELETE a user
router.delete('/:firebase_uid', authenticate, async (req, res) => {
  const { firebase_uid } = req.params;
  const actorUserId = req.user?.user_id;

  try {
    const result = await query(
      'DELETE FROM users WHERE firebase_uid = $1 RETURNING *',
      [firebase_uid]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    await logAudit({
      actorUserId,
      targetUserId: result.rows[0].user_id,
      action: "delete_user",
      tableName: "users",
      recordId: result.rows[0].user_id,
      metadata: { email: result.rows[0].email }
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

export default router;
