import express from 'express';
import { query } from '../db.js'; // Import the query function from db.js
import authenticate from '../middlewares/authenticate.js'; // Import the authenticate middleware

const router = express.Router();

// CREATE a new role
router.post('/', authenticate, async (req, res) => {
  const { role_name } = req.body;

  if (!role_name) {
    return res.status(400).json({ message: 'Role name is required.' });
  }

  const queryText = 'INSERT INTO roles (role_name) VALUES ($1) RETURNING *';
  const values = [role_name];

  try {
    const result = await query(queryText, values);
    res.status(201).json({ message: 'Role created successfully', role: result.rows[0] });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Error creating role' });
  }
});

// READ all roles
router.get('/', authenticate, async (req, res) => {
  const queryText = 'SELECT * FROM roles';

  try {
    const result = await query(queryText);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Error fetching roles' });
  }
});

// READ a single role by role_id
router.get('/:role_id', authenticate, async (req, res) => {
  const { role_id } = req.params;
  const queryText = 'SELECT * FROM roles WHERE role_id = $1';
  const values = [role_id];

  try {
    const result = await query(queryText, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ message: 'Error fetching role' });
  }
});

// UPDATE a role's name
router.put('/:role_id', authenticate, async (req, res) => {
  const { role_id } = req.params;
  const { role_name } = req.body;

  if (!role_name) {
    return res.status(400).json({ message: 'Role name is required' });
  }

  const queryText = 'UPDATE roles SET role_name = $1 WHERE role_id = $2 RETURNING *';
  const values = [role_name, role_id];

  try {
    const result = await query(queryText, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json({ message: 'Role updated', role: result.rows[0] });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Error updating role' });
  }
});

// DELETE a role by role_id
router.delete('/:role_id', authenticate, async (req, res) => {
  const { role_id } = req.params;
  const queryText = 'DELETE FROM roles WHERE role_id = $1 RETURNING *';
  const values = [role_id];

  try {
    const result = await query(queryText, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ message: 'Error deleting role' });
  }
});

export default router;
