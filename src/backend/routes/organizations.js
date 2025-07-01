import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';
import { logAudit } from '../utils/auditLogger.js';

const router = express.Router();

// CREATE a new organization
router.post('/', authenticate, async (req, res) => {
  const { name } = req.body;
  const { user_id } = req.user;

  if (!name) {
    return res.status(400).json({ message: 'Organization name is required.' });
  }

  try {
    const orgResult = await query(
      'INSERT INTO organizations (name, owner_user_id) VALUES ($1, $2) RETURNING *',
      [name, user_id]
    );
    const organization = orgResult.rows[0];

    await query(
      'INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, $3)',
      [organization.organization_id, user_id, 'admin']
    );

    await query('UPDATE users SET organization_id = $1 WHERE user_id = $2', [
      organization.organization_id,
      user_id,
    ]);

    await logAudit({
      actorUserId: user_id,
      action: 'create_organization',
      tableName: 'organizations',
      recordId: organization.organization_id,
      metadata: { name },
    });

    res.status(201).json({ message: 'Organization created successfully', organization });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Error creating organization' });
  }
});

// GET the user's organization
router.get('/my-organization', authenticate, async (req, res) => {
    const { user_id } = req.user;

    try {
        const result = await query(
            `SELECT o.* FROM organizations o
             JOIN users u ON o.organization_id = u.organization_id
             WHERE u.user_id = $1`,
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Organization not found.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching organization:", error);
        res.status(500).json({ message: 'Error fetching organization' });
    }
});


export default router;