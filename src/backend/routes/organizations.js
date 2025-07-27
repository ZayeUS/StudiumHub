// src/backend/routes/organizations.js
import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';
import { logAudit } from '../utils/auditLogger.js';
import checkRole from '../middlewares/checkRole.js';

const router = express.Router();

// GET the current user's organization details
router.get('/my-organization', authenticate, async (req, res) => {
    const { user_id } = req.user;

    try {
        // The user's organization_id is attached to them in the users table
        const result = await query(
            `SELECT o.* FROM organizations o
             JOIN users u ON o.organization_id = u.organization_id
             WHERE u.user_id = $1`,
            [user_id]
        );

        if (result.rows.length === 0) {
            // This can happen if a user was created but not fully assigned to an org, which shouldn't happen with the current flow.
            return res.status(404).json({ message: 'Organization not found for this user.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching organization:", error);
        res.status(500).json({ message: 'Error fetching organization details' });
    }
});

// GET all members of the user's current organization
router.get('/my-organization/members', authenticate, async (req, res) => {
    const { user_id } = req.user;

    try {
        // First, get the user's organization_id
        const userOrgResult = await query('SELECT organization_id FROM users WHERE user_id = $1', [user_id]);
        if (userOrgResult.rows.length === 0 || !userOrgResult.rows[0].organization_id) {
            return res.status(404).json({ message: "You are not part of an organization." });
        }
        const { organization_id } = userOrgResult.rows[0];

        // Now, fetch all members of that organization
        const membersResult = await query(
            `SELECT
                u.user_id,
                u.email,
                om.role,
                p.first_name,
                p.last_name,
                p.avatar_url
            FROM
                organization_members om
            JOIN
                users u ON om.user_id = u.user_id
            LEFT JOIN
                profiles p ON u.user_id = p.user_id
            WHERE
                om.organization_id = $1
            ORDER BY
                CASE om.role WHEN 'admin' THEN 1 WHEN 'member' THEN 2 ELSE 3 END,
                p.first_name,
                p.last_name`,
            [organization_id]
        );

        res.status(200).json(membersResult.rows);
    } catch (error) {
        console.error("Error fetching organization members:", error);
        res.status(500).json({ message: 'Error fetching team members' });
    }
});


// CREATE a new organization (This route is kept for potential future use, e.g., allowing a user to create a second organization)
// Note: The primary organization creation now happens in the /api/users POST route during sign-up.
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

    // Note: In a multi-org scenario, you would decide here whether to switch the user's active org
    // For now, we just create it and add them as an admin member.
    await query(
      'INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, $3)',
      [organization.organization_id, user_id, 'admin']
    );

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


export default router;