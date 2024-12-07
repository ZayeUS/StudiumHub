// src/backend/middleware/authenticate.js
import admin from "../firebaseAdmin.js"; // Make sure to import firebaseAdmin

// Middleware function to check if the user is authenticated
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach the user info to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default authenticate;
