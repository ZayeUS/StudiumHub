// src/backend/middleware/authenticate.js
import admin from "../firebaseAdmin.js";
import { query } from "../db.js";  // ✅ import only query function

// Middleware to verify Firebase token and fetch internal user_id
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

    if (!decodedToken || !decodedToken.uid) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Lookup user in your database using firebase_uid
    const { rows } = await query(
      "SELECT user_id, role_id FROM users WHERE firebase_uid = $1 ",
      [decodedToken.uid]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found in system" });
    }

    const user = rows[0];

    // Attach your own user info to the request
    req.user = {
      user_id: user.user_id,  // Your internal UUID
      role_id: user.role_id,  // Might be useful for role-based protection
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
