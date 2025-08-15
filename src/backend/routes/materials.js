// src/backend/routes/materials.js
import express from 'express';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';
import checkRole from '../middlewares/checkRole.js';
import { upload } from '../middlewares/multer.js';
import { processPdfAndCreateEmbeddings } from '../utils/vectorProcessor.js';
import crypto from 'crypto';

const router = express.Router();

router.post('/upload', authenticate, checkRole(['admin']), upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { user_id, organization_id } = req.user;
    const { originalname, path: tempFilePath } = req.file;

    const rawBytes = crypto.randomBytes(16);
    const uniqueName = rawBytes.toString('hex');
    const fileExtension = originalname.split('.').pop() || 'pdf';
    const s3Key = `course_material/${organization_id}/${uniqueName}.${fileExtension}`;

    try {
        const result = await query(
            `INSERT INTO course_materials (organization_id, uploaded_by_user_id, file_name, s3_key, status)
             VALUES ($1, $2, $3, $4, 'processing')
             RETURNING *`,
            [organization_id, user_id, originalname, s3Key]
        );
        const newMaterial = result.rows[0];

        processPdfAndCreateEmbeddings(newMaterial.material_id, tempFilePath, s3Key);

        res.status(202).json({ 
            message: "File is being processed. It will be available in your library shortly.",
            material: newMaterial 
        });

    } catch (error) {
        console.error('Error initiating course material processing:', error);
        res.status(500).json({ message: 'Failed to start file processing.' });
    }
});

export default router;