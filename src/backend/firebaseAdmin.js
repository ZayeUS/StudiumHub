import admin from "firebase-admin";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle newlines in private key
};

// Initialize Firebase Admin SDK with the simplified service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin; // Ensure this is exported for use in other files
