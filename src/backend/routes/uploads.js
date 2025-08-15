// src/backend/routes/uploads.js
import express from 'express';
import authenticate from '../middlewares/authenticate.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { query } from '../db.js';

const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const BUCKET = process.env.S3_BUCKET_NAME;

router.post('/presign', authenticate, async (req, res) => {
  const { fileName, fileType, purpose = 'avatar' } = req.body;
  const { user_id, organization_id } = req.user;

  if (!fileName || !fileType) {
    return res.status(400).json({ message: 'fileName and fileType are required.' });
  }

  const allowedTypes = {
    avatar: ['image/jpeg', 'image/png', 'image/webp'],
    course_material: ['application/pdf'],
  };

  if (!allowedTypes[purpose] || !allowedTypes[purpose].includes(fileType)) {
    return res.status(400).json({ message: `Invalid file type for purpose '${purpose}'.` });
  }

  try {
    const rawBytes = crypto.randomBytes(16);
    const uniqueName = rawBytes.toString('hex');
    const fileExtension = fileName.split('.').pop() || '';
    
    // Organize files in S3 by purpose and organization
    const key = `${purpose}/${organization_id}/${uniqueName}.${fileExtension}`;

    const cmd = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: fileType,
      ServerSideEncryption: "AES256"
    });

    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
    const fileUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.json({ uploadUrl, key, fileUrl });
  } catch (err) {
    console.error('Error generating presigned URL:', err);
    res.status(500).json({ message: 'Failed to generate upload URL.' });
  }
});

export default router;