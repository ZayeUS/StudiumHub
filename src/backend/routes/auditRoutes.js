// src/backend/routes/auditRoutes.js
import express from "express";
import { query } from "../db.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

// Only admins can view audit logs
router.get("/", authenticate, async (req, res) => {
  const { role_id } = req.user;
  if (role_id !== 1) return res.status(403).json({ message: "Unauthorized" }); // assuming 1 = admin

  try {
    const result = await query(`
    SELECT 
  al.log_id,
  al.actor_user_id,
  al.target_user_id,
  al.action,
  al.table_name,
  al.record_id,
  al.metadata,
  al.created_at AT TIME ZONE 'UTC' as created_at,
  u.email
FROM audit_logs al
JOIN users u ON al.actor_user_id = u.user_id
ORDER BY al.created_at DESC
LIMIT 100
      `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Failed to fetch audit logs:", err);
    res.status(500).json({ message: "Error fetching audit logs" });
  }
});

export default router;
