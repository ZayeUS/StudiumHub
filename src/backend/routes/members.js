// src/backend/routes/members.js
import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';
import checkRole from '../middlewares/checkRole.js';
import { logAudit } from '../utils/auditLogger.js';

const router = express.Router();

// Middleware to ensure all routes in this file are accessed by admins
router.use(authenticate, checkRole(['admin']));

// PUT /api/members/:userId/role - Update a member's role
router.put('/:userId/role', async (req, res) => {
  const { organization_id, user_id: actorUserId } = req.user;
  const { userId: targetUserId } = req.params;
  const { role } = req.body;

  if (!role || !['admin', 'member'].includes(role)) {
    return res.status(400).json({ message: 'A valid role is required.' });
  }
  
  // Prevent admin from changing their own role
  if (actorUserId === targetUserId) {
    return res.status(400).json({ message: "Admins cannot change their own role." });
  }

  try {
    const result = await query(
      `UPDATE organization_members
       SET role = $1
       WHERE user_id = $2 AND organization_id = $3
       RETURNING *`,
      [role, targetUserId, organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Member not found in this organization.' });
    }

    await logAudit({
      actorUserId,
      targetUserId,
      action: 'update_member_role',
      tableName: 'organization_members',
      recordId: result.rows[0].membership_id,
      metadata: { new_role: role }
    });

    res.status(200).json({ message: 'Member role updated successfully.', member: result.rows[0] });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;