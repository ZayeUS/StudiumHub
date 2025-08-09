// src/backend/routes/invitations.js
import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';
import checkRole from '../middlewares/checkRole.js';
import { logAudit } from '../utils/auditLogger.js';
import { sendEmail } from '../utils/email.js';
import { baseTemplate } from '../templates/baseTemplate.js';
import crypto from 'crypto';

const router = express.Router();

// --- NEW: Verify an invitation token ---
router.get('/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const result = await query(
            `SELECT i.email, o.name as organization_name
             FROM invitations i
             JOIN organizations o ON i.organization_id = o.organization_id
             WHERE i.token = $1 AND i.expires_at > NOW()`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Invitation not found or has expired.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error verifying invitation token:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get invitations for the current organization
router.get('/', authenticate, checkRole(['admin']), async (req, res) => {
  const { organization_id } = req.user;

  try {
    const result = await query(
      `SELECT invitation_id, email, role, token, expires_at, created_at
       FROM invitations
       WHERE organization_id = $1
       ORDER BY created_at DESC`,
      [organization_id]
    );

    // Optional: emulate "pending" by checking if link hasn't expired yet
    const pendingInvites = result.rows.filter(
      invite => new Date(invite.expires_at) > new Date()
    );

    res.status(200).json(pendingInvites);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Invite a user (Protected for Admins only)
router.post('/', authenticate, checkRole(['admin']), async (req, res) => {
  const { email, role } = req.body;
  const { user_id, organization_id } = req.user;

  if (!email || !role) {
    return res.status(400).json({ message: 'Email and role are required.' });
  }
  if (!['admin', 'member'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    const result = await query(
      'INSERT INTO invitations (organization_id, email, role, token, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [organization_id, email, role, token, expires_at]
    );

    const invitation = result.rows[0];
    const organizationResult = await query('SELECT name FROM organizations WHERE organization_id = $1', [organization_id]);
    const orgName = organizationResult.rows[0].name;
    const invitationLink = `${process.env.CORS_ORIGIN}/signup?token=${token}`;

    const emailHtml = baseTemplate({
        title: `You're Invited to Join ${orgName}`,
        body: `
            <p>You have been invited to join the <strong>${orgName}</strong> organization on our platform.</p>
            <p>Please click the button below to accept your invitation and create your account. This link will expire in 24 hours.</p>
            <a href="${invitationLink}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; font-size: 16px; color: #ffffff; background-color: #007bff; border-radius: 5px; text-decoration: none;">Accept Invitation</a>
            <p>If you cannot click the button, copy and paste this link into your browser:</p>
            <p><a href="${invitationLink}">${invitationLink}</a></p>
        `,
    });

    await sendEmail({ to: email, subject: `Invitation to join ${orgName}`, html: emailHtml });
    await logAudit({
        actorUserId: user_id,
        action: 'send_invitation',
        tableName: 'invitations',
        recordId: invitation.invitation_id,
        metadata: { email, role, organization_id }
      });

    res.status(201).json({ message: 'Invitation sent successfully.' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'An invitation has already been sent to this email address for your organization.'});
    }
    console.error('Error sending invitation:', error);
    res.status(500).json({ message: 'Error sending invitation' });
  }
});

export default router;