// src/backend/middleware/authenticate.js
import admin from "../firebaseAdmin.js";
import { query } from "../db.js";

// Middleware to verify Firebase token and fetch or create user + org info
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing or malformed" });
    }

    const token = authHeader.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token not found in Authorization header" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken?.uid) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // 1) Try to look up the user in our DB
    let { rows } = await query(
      `SELECT user_id, organization_id
         FROM users
        WHERE firebase_uid = $1`,
      [decodedToken.uid]
    );

    // 2) If they don’t exist yet, insert them
    let user_id, organization_id;
    if (rows.length === 0) {
      const insertRes = await query(
        `INSERT INTO users (firebase_uid, email)
           VALUES ($1, $2)
         RETURNING user_id, organization_id`,
        [decodedToken.uid, decodedToken.email || null]
      );
      user_id = insertRes.rows[0].user_id;
      organization_id = insertRes.rows[0].organization_id;
    } else {
      user_id = rows[0].user_id;
      organization_id = rows[0].organization_id;
    }

    // 3) Attach to req.user for downstream routes/logger
    req.user = {
      user_id,
      organization_id,
      email: decodedToken.email || null,
      firebase_uid: decodedToken.uid,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error.message || error);
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

export default authenticate;
