import { query } from '../db.js';

export async function logAudit({
  actorUserId = null,         // Who performed the action (nullable for system actions)
  targetUserId = null,        // Who/what was acted upon
  action,                     // e.g. "update_profile"
  tableName = null,
  recordId = null,
  metadata = null
}) {
  try {
    await query(`
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
