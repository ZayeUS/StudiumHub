// src/backend/utils/auditLogger.js
import { query } from '../db.js';

export async function logAudit({
  actorUserId = null,
  targetUserId = null,
  action,
  tableName = null,
  recordId = null,
  metadata = null,
  client = null // Accept an optional client
}) {
  // Use the provided client if it exists, otherwise use the default pool query
  const db = client || { query };

  try {
    await db.query(`
      INSERT INTO audit_logs (
        actor_user_id,
        target_user_id,
        action,
        table_name,
        record_id,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      actorUserId,
      targetUserId,
      action,
      tableName,
      recordId,
      metadata ? JSON.stringify(metadata) : null
    ]);
  } catch (err) {
    console.error("Audit log failed:", err); // Non-blocking
  }
}