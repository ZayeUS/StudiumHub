// src/backend/routes/users.js
import express from 'express';
import { query, pool } from '../db.js'; // Ensure pool is imported
import authenticate from '../middlewares/authenticate.js';
import { logAudit } from '../utils/auditLogger.js';

const router = express.Router();

// GET the current user's role
router.get('/me/role', authenticate, async (req, res) => {
    const { user_id } = req.user;
    try {
        const result = await query(
            'SELECT role FROM organization_members WHERE user_id = $1',
            [user_id]
        );
        if (result.rows.length === 0) {
            return res.status(200).json({ role: null });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user role:', error);
        res.status(500).json({ message: 'Error fetching user role' });
    }
});


// CREATE a new user (handles both new sign-ups and invitations)
router.post("/", async (req, res) => {
    const { firebase_uid, email, invitation_token, organization_name } = req.body;
    if (!firebase_uid || !email) {
        return res.status(400).json({ message: "Firebase UID and email are required." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        let user;
        let organization_id;
        let role;

        if (invitation_token) {
            // --- Logic for joining an existing organization via invitation ---
            const invitationResult = await client.query(
                'SELECT * FROM invitations WHERE token = $1 AND expires_at > NOW()',
                [invitation_token]
            );

            if (invitationResult.rows.length === 0) {
                throw new Error("Invalid or expired invitation token.");
            }

            const invitation = invitationResult.rows[0];
            if (invitation.email.toLowerCase() !== email.toLowerCase()) {
                throw new Error("Invitation is for a different email address.");
            }
            
            organization_id = invitation.organization_id;
            role = invitation.role;

            // Create the user and assign them to the organization
            const userResult = await client.query(
                "INSERT INTO users (firebase_uid, email, organization_id) VALUES ($1, $2, $3) RETURNING *",
                [firebase_uid, email, organization_id]
            );
            user = userResult.rows[0];

            // Add user to the organization_members table
            await client.query(
                'INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, $3)',
                [organization_id, user.user_id, role]
            );

            // Delete the used invitation
            await client.query('DELETE FROM invitations WHERE token = $1', [invitation_token]);

        } else if (organization_name) {
            // --- Logic for creating a new user AND a new organization ---
            role = 'admin'; // The creator is the admin

            // 1. Create the user first, without an organization_id
            const userResult = await client.query(
                "INSERT INTO users (firebase_uid, email) VALUES ($1, $2) RETURNING *",
                [firebase_uid, email]
            );
            user = userResult.rows[0];

            // 2. Now create the organization with the new user as the owner
            const orgResult = await client.query(
                'INSERT INTO organizations (name, owner_user_id) VALUES ($1, $2) RETURNING organization_id',
                [organization_name, user.user_id]
            );
            organization_id = orgResult.rows[0].organization_id;

            // 3. Update the user with their new organization_id
            await client.query(
                'UPDATE users SET organization_id = $1 WHERE user_id = $2',
                [organization_id, user.user_id]
            );

            // 4. Add the user as a member of their new organization
            await client.query(
                'INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, $3)',
                [organization_id, user.user_id, role]
            );
        } else {
            throw new Error("Organization name or an invitation token is required.");
        }
      
        // Log the audit event using the same transaction client
        await logAudit({
            actorUserId: user.user_id,
            targetUserId: user.user_id,
            action: "create_user",
            tableName: "users",
            recordId: user.user_id,
            metadata: { email: user.email, role, organization_id },
            client: client // Pass the transaction client here
        });

        await client.query('COMMIT');
        res.status(201).json({ message: "User created successfully", user });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error creating user:", error);
        res.status(500).json({ message: error.message || "Error creating user" });
    } finally {
        client.release();
    }
});

// READ all users
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query('SELECT user_id, email, organization_id, created_at FROM users WHERE deleted_at IS NULL');
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
    const result = await query('SELECT user_id, email, organization_id, created_at FROM users WHERE firebase_uid = $1 AND deleted_at IS NULL', [firebase_uid]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

export default router;