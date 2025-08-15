// src/backend/utils/vectorProcessor.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { OpenAI } from 'openai';
import { spawn } from 'child_process';
import { pool } from '../db.js';
import fs from 'fs';

// Initialize clients
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const BUCKET = process.env.S3_BUCKET_NAME;

/**
 * Parse PDF with Poppler (streaming mode to avoid maxBuffer issues)
 */
async function parsePdfWithPoppler(filePath) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        const pdftotext = spawn('pdftotext', [filePath, '-']);

        pdftotext.stdout.on('data', (data) => {
            chunks.push(data.toString());
        });

        pdftotext.stderr.on('data', (err) => {
            console.error("pdftotext stderr:", err.toString());
        });

        pdftotext.on('close', (code) => {
            if (code === 0) {
                resolve(chunks.join(''));
            } else {
                reject(new Error(`pdftotext failed with code ${code}`));
            }
        });
    });
}

/**
 * Split text into chunks with overlap
 */
function chunkText(text, chunkSize = 1000, overlap = 100) {
    const chunks = [];
    const cleanedText = text
        .replace(/(\r\n|\n|\r)/gm, " ")
        .replace(/\s+/g, ' ')
        .trim();
    for (let i = 0; i < cleanedText.length; i += (chunkSize - overlap)) {
        chunks.push(cleanedText.substring(i, i + chunkSize));
    }
    return chunks;
}

/**
 * Batch embeddings to avoid hitting OpenAI token limit
 */
async function embedChunks(textChunks, model = "text-embedding-3-large", batchSize = 100) {
    const allEmbeddings = [];

    for (let i = 0; i < textChunks.length; i += batchSize) {
        const batch = textChunks.slice(i, i + batchSize);
        console.log(`[Processor] Embedding batch ${i / batchSize + 1} (${batch.length} chunks)`);

        const response = await openai.embeddings.create({
            model,
            input: batch
        });

        allEmbeddings.push(...response.data.map(item => item.embedding));
    }

    return allEmbeddings;
}

/**
 * Process PDF, upload to S3, embed, and store in Postgres
 */
export async function processPdfAndCreateEmbeddings(materialId, filePath, s3Key) {
    const client = await pool.connect();
    try {
        console.log(`[Processor] Starting processing for material: ${materialId}`);

        const textContent = await parsePdfWithPoppler(filePath);
        console.log(`[Processor] Parsed PDF using pdftotext.`);

        const pdfBuffer = fs.readFileSync(filePath);
        const uploadCommand = new PutObjectCommand({
            Bucket: BUCKET,
            Key: s3Key,
            Body: pdfBuffer,
            ContentType: 'application/pdf'
        });
        await s3.send(uploadCommand);
        console.log(`[Processor] Uploaded original PDF to S3 at ${s3Key}`);

        const textChunks = chunkText(textContent);
        if (textChunks.length === 0) throw new Error("No text content could be extracted from the PDF.");
        console.log(`[Processor] Created ${textChunks.length} text chunks.`);

        const embeddings = await embedChunks(textChunks);

        await client.query('BEGIN');
        for (let i = 0; i < textChunks.length; i++) {
            await client.query(
                `INSERT INTO chunks (material_id, content, embedding) VALUES ($1, $2, $3::vector)`,
                [materialId, textChunks[i], `[${embeddings[i].join(',')}]`]
            );
        }

        await client.query("UPDATE course_materials SET status = 'ready' WHERE material_id = $1", [materialId]);
        await client.query('COMMIT');

        console.log(`[Processor] Successfully processed and stored material: ${materialId}`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`[Processor] Error processing material ${materialId}:`, error);
        await pool.query("UPDATE course_materials SET status = 'error' WHERE material_id = $1", [materialId]);
    } finally {
        client.release();
        fs.unlink(filePath, (err) => {
            if (err) console.error(`[Processor] Failed to delete temp file: ${filePath}`, err);
        });
    }
}
