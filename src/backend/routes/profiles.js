// src/backend/routes/profiles.js
import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';
import { logAudit } from '../utils/auditLogger.js';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'

const router = express.Router();

// S3 client configuration (same as documents)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})
const BUCKET = process.env.S3_BUCKET_NAME

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
 * Generate presigned S3 upload URL for avatar - EXACT copy of documents pattern
 */
router.post('/avatar/presign', authenticate, async (req, res) => {
  const { fileName, fileType } = req.body
  const { user_id } = req.user

  if (!fileName || !fileType) {
    return res
      .status(400)
      .json({ message: 'fileName and fileType are required.' })
  }
  
  // Validate image types (same validation pattern as documents)
  if (!fileType.startsWith('image/')) {
    return res.status(400).json({ message: 'Only image files are allowed.' })
  }

  try {
    // Generate unique key - same pattern as documents
    const rawBytes = crypto.randomBytes(16);
    const uniqueName = rawBytes.toString('hex');
    const fileExtension = fileName.split('.').pop() || 'jpg';
    const key = `avatars/${user_id}/${uniqueName}.${fileExtension}`;
    
    // EXACT same command structure as documents
    const cmd = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: fileType,
    })
    
    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 3600 })

    // Construct fileUrl on backend where env vars are available
    const fileUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // Return uploadUrl, key, fileName AND fileUrl
    res.json({ uploadUrl, key, fileName, fileUrl })
  } catch (err) {
    console.error('Error generating upload URL:', err)
    res.status(500).json({ message: 'Failed to generate upload URL.' })
  }
});

/**
 * READ the authenticated user's profile
 */
router.get('/', authenticate, async (req, res) => {
  const { user_id } = req.user;

  try {
    const result = await query(`SELECT p.*, u.email FROM profiles p JOIN users u ON p.user_id = u.user_id WHERE p.user_id = $1`, [user_id]);
    res.status(200).json(result.rows.length > 0 ? result.rows[0] : null);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

/**
 * UPDATE the authenticated user's profile (name, etc.)
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

// Get presigned S3 URL for viewing avatar (same pattern as documents)
router.get('/avatar/view', authenticate, async (req, res) => {
  const { user_id } = req.user

  try {
    // Get the user's current avatar_url from database
    const result = await query(
      `SELECT avatar_url FROM profiles WHERE user_id = $1`,
      [user_id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' })
    }

    const avatarUrl = result.rows[0].avatar_url
    if (!avatarUrl) {
      return res.status(404).json({ message: 'No avatar found' })
    }

    // Extract the S3 key from the full URL
    // URL format: https://bucket.s3.region.amazonaws.com/key
    const urlParts = avatarUrl.split('.amazonaws.com/')
    if (urlParts.length < 2) {
      return res.status(400).json({ message: 'Invalid avatar URL format' })
    }
    const key = urlParts[1]

    // Generate presigned URL for viewing (same as documents)
    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key })
    const url = await getSignedUrl(s3, cmd, { expiresIn: 300 }) // 5 minutes
    
    res.json({ url })
  } catch (err) {
    console.error('Error creating presigned URL for avatar:', err)
    res.status(500).json({ message: 'Could not retrieve avatar URL.' })
  }
})

/**
 * UPDATE the avatar URL for the authenticated user
 */
router.put('/avatar', authenticate, async (req, res) => {
    const { user_id } = req.user;
    const { avatar_url } = req.body;

    if (!avatar_url) {
        return res.status(400).json({ message: 'Avatar URL is required.' });
    }

    try {
        const result = await query(
            `UPDATE profiles
             SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2
             RETURNING *`,
            [avatar_url, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Profile not found.' });
        }

        await logAudit({
            actorUserId: user_id,
            action: 'update_avatar',
            tableName: 'profiles',
            recordId: result.rows[0].profile_id,
            metadata: { new_avatar_url: avatar_url }
        });

        res.status(200).json({ message: 'Avatar updated successfully', profile: result.rows[0] });
    } catch (error) {
        console.error('Error updating avatar URL:', error);
        res.status(500).json({ message: 'Failed to update avatar' });
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
    const checkQuery = `SELECT profile_id, avatar_url FROM profiles WHERE user_id = $1`;
    const checkResult = await query(checkQuery, [user_id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (!checkResult.rows[0].avatar_url) {
      return res.status(400).json({ message: 'No avatar to delete' });
    }

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

export default router;