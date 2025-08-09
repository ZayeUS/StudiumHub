// src/backend/middleware/authenticate.js
import admin from "../firebaseAdmin.js";
import { query } from "../db.js";

// Middleware to verify Firebase token and fetch user + org info
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

    // 1) Look up the user in our DB.
    const { rows } = await query(
      `SELECT user_id, organization_id
         FROM users
        WHERE firebase_uid = $1 AND deleted_at IS NULL`, // Added check for soft delete
      [decodedToken.uid]
    );

    // 2) If they don’t exist in our database, they are not a registered user yet.
    if (rows.length === 0) {
      // This is the key change: we no longer create a user here.
      // This forces the app to complete the sign-up flow via POST /api/users.
      return res.status(401).json({ message: "User not registered in the application." });
    }

    const { user_id, organization_id } = rows[0];

    // 3) Attach user info to req.user for downstream routes
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