// src/backend/utils/s3.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from 'crypto';

// Use the EXACT same S3 client as documents
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

export const generateUploadUrl = async (userId, fileName, fileType) => {
  // Generate unique filename while preserving extension
  const rawBytes = crypto.randomBytes(16);
  const uniqueName = rawBytes.toString('hex');
  const fileExtension = fileName.split('.').pop() || 'jpg';
  const key = `avatars/${userId}/${uniqueName}.${fileExtension}`;

  // Use EXACT same pattern as documents
  const cmd = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, cmd, { expiresIn: 3600 });

  return { uploadUrl, key, fileName }; // Return same format as documents
};