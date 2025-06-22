import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';
import {logAudit} from '../utils/auditLogger.js';
import { uploadAvatar } from '../middlewares/multer.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

// CREATE a new profile for the authenticated user
router.post('/', authenticate, async (req, res) => {
  const { user_id } = req.user;
  const { first_name, last_name } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ message: "First and last name are required." });
  }

  const queryText = `
    INSERT INTO profiles (user_id, first_name, last_name)
    VALUES ($1, $2, $3) RETURNING *`;
  const values = [user_id, first_name, last_name];

  try {
    const result = await query(queryText, values);
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

// UPLOAD an avatar for the authenticated user
router.post('/avatar', authenticate, uploadAvatar, async (req, res) => {
  const { user_id } = req.user;

  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }

  try {
    const uploadResult = await uploadToCloudinary(req.file.path);
    const updateQuery = `
      UPDATE profiles
      SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING *`;
    const values = [uploadResult.secure_url, user_id];
    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      // This can happen if the profile is created, but avatar is uploaded before the profile record is committed.
      // A more robust solution might be to find or create. For an MVP, we assume profile exists.
      return res.status(404).json({ message: 'Profile not found. Please create a profile first.' });
    }

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

// READ the authenticated user's profile
router.get('/', authenticate, async (req, res) => {
  const { user_id } = req.user;
  const queryText = 'SELECT * FROM profiles WHERE user_id = $1';
  const values = [user_id];

  try {
    const result = await query(queryText, values);
    if (result.rows.length === 0) {
      return res.status(200).json(null);
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// UPDATE the authenticated user's profile
router.put('/', authenticate, async (req, res) => {
  const { user_id } = req.user;
  const { first_name, last_name } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ message: "First and last name are required." });
  }

  const queryText = `
    UPDATE profiles
    SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $3 RETURNING *`;
  const values = [first_name, last_name, user_id];

  try {
    const result = await query(queryText, values);
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

router.post('/complete-onboarding', authenticate, async (req, res) => {
  const { user_id } = req.user;

  const queryText = `
    UPDATE profiles
    SET fully_onboarded = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1 RETURNING *`;
  
  try {
    const result = await query(queryText, [user_id]);
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


// DELETE the authenticated user's profile
router.delete('/', authenticate, async (req, res) => {
  const { user_id } = req.user;
  const queryText = 'DELETE FROM profiles WHERE user_id = $1 RETURNING *';
  const values = [user_id];

  try {
    const result = await query(queryText, values);
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