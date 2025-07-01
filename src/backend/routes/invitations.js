import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';
import checkRole from '../middlewares/checkRole.js';
import { logAudit } from '../utils/auditLogger.js';
import { sendEmail } from '../utils/email.js';
import crypto from 'crypto';

const router = express.Router();

// Invite a user (Protected for Admins only)
router.post('/', authenticate, checkRole(['admin']), async (req, res) => {
  const { email, role } = req.body; // <-- role is now accepted
  const { user_id, organization_id } = req.user;

  if (!email || !role) {
    return res.status(400).json({ message: 'Email and role are required.' });
  }

  if (!['admin', 'member'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  try {
    const result = await query(
      'INSERT INTO invitations (organization_id, email, role, token, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [organization_id, email, role, token, expires_at]
    );

    const invitation = result.rows[0];

    // Send invitation email
    const invitationLink = `${process.env.CORS_ORIGIN}/signup?token=${token}&email=${encodeURIComponent(email)}`;
    await sendEmail({
      to: email,
      subject: 'You have been invited to join an organization',
      html: `<p>Please click the following link to accept your invitation:</p><p><a href="${invitationLink}">${invitationLink}</a></p>`,
    });

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
      return res.status(409).json({ message: 'An invitation has already been sent to this email address.'});
    }
    console.error('Error sending invitation:', error);
    res.status(500).json({ message: 'Error sending invitation' });
  }
});

export default router;