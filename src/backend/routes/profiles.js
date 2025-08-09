import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';
import { logAudit } from '../utils/auditLogger.js';
import { uploadAvatar } from '../middlewares/multer.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

/**
 * CREATE a new profile for the authenticated user
 */
router.post('/', authenticate, async (req, res) => {
  const { user_id } = req.user;
  const { first_name, last_name } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ message: "First and last name are required." });
  }

  try {
    const result = await query(
      `INSERT INTO profiles (user_id, first_name, last_name)
       VALUES ($1, $2, $3) RETURNING *`,
      [user_id, first_name, last_name]
    );

    await logAudit({
      actorUserId: user_id,
      targetUserId: user_id,
      action: 'create_profile',
      tableName: 'profiles',
      recordId: result.rows[0].profile_id,
      metadata: { first_name, last_name }
    });

    res.status(201).json({ message: "Profile created successfully", profile: result.rows[0] });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ message: "Error creating profile" });
  }
});

/**
 * UPLOAD an avatar for the authenticated user
 */
router.post('/avatar', authenticate, uploadAvatar, async (req, res) => {
  const { user_id } = req.user;

  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }

  try {
    // Ensure profile exists before uploading avatar
    const existingProfile = await query(`SELECT * FROM profiles WHERE user_id = $1`, [user_id]);
    if (existingProfile.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found. Please create a profile first.' });
    }

    const uploadResult = await uploadToCloudinary(req.file.path);

    const result = await query(
      `UPDATE profiles
       SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [uploadResult.secure_url, user_id]
    );

    await logAudit({
      actorUserId: user_id,
      targetUserId: user_id,
      action: 'upload_avatar',
      tableName: 'profiles',
      recordId: result.rows[0].profile_id,
      metadata: { avatar_url: uploadResult.secure_url }
    });

    res.status(200).json({ message: 'Avatar uploaded successfully', profile: result.rows[0] });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

/**
 * READ the authenticated user's profile
 */
router.get('/', authenticate, async (req, res) => {
  const { user_id } = req.user;

  try {
    const result = await query(`SELECT * FROM profiles WHERE user_id = $1`, [user_id]);
    res.status(200).json(result.rows.length > 0 ? result.rows[0] : null);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

/**
 * UPDATE the authenticated user's profile
 */
router.put('/', authenticate, async (req, res) => {
  const { user_id } = req.user;
  const { first_name, last_name } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ message: "First and last name are required." });
  }

  try {
    const result = await query(
      `UPDATE profiles
       SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3
       RETURNING *`,
      [first_name, last_name, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    await logAudit({
      actorUserId: user_id,
      targetUserId: user_id,
      action: 'update_profile',
      tableName: 'profiles',
      recordId: result.rows[0].profile_id,
      metadata: { first_name, last_name }
    });

    res.status(200).json({ message: 'Profile updated', profile: result.rows[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

/**
 * COMPLETE ONBOARDING for the authenticated user
 */
router.post('/complete-onboarding', authenticate, async (req, res) => {
  const { user_id } = req.user;

  try {
    const result = await query(
      `UPDATE profiles
       SET fully_onboarded = TRUE, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING *`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    await logAudit({
      actorUserId: user_id,
      targetUserId: user_id,
      action: 'complete_onboarding',
      tableName: 'profiles',
      recordId: result.rows[0].profile_id
    });

    res.status(200).json({ message: 'Onboarding marked as complete', profile: result.rows[0] });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ message: 'Error completing onboarding' });
  }
});

// DELETE the authenticated user's avatar
router.delete('/avatar', authenticate, async (req, res) => {
  const { user_id } = req.user;

  try {
    // First check if user has a profile with an avatar
    const checkQuery = `SELECT profile_id, avatar_url FROM profiles WHERE user_id = $1`;
    const checkResult = await query(checkQuery, [user_id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (!checkResult.rows[0].avatar_url) {
      return res.status(400).json({ message: 'No avatar to delete' });
    }

    // Remove avatar URL from DB
    const updateQuery = `
      UPDATE profiles
      SET avatar_url = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *`;
    const result = await query(updateQuery, [user_id]);

    await logAudit({
      actorUserId: user_id,
      targetUserId: user_id,
      action: 'delete_avatar',
      tableName: 'profiles',
      recordId: result.rows[0].profile_id,
      metadata: { previous_avatar: checkResult.rows[0].avatar_url }
    });

    res.status(200).json({ message: 'Avatar removed successfully', profile: result.rows[0] });
  } catch (error) {
    console.error('Error deleting avatar:', error);
    res.status(500).json({ message: 'Failed to delete avatar' });
  }
});


/**
 * DELETE the authenticated user's profile
 */
router.delete('/', authenticate, async (req, res) => {
  const { user_id } = req.user;

  try {
    const result = await query(
      `DELETE FROM profiles WHERE user_id = $1 RETURNING *`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    await logAudit({
      actorUserId: user_id,
      targetUserId: user_id,
      action: 'delete_profile',
      tableName: 'profiles',
      recordId: result.rows[0].profile_id
    });

    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'Error deleting profile' });
  }
});



export default router;
