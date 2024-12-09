import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firebase Analytics (Optional)
const analytics = getAnalytics(app);

// Sign Up Function
const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing up: ', error.message);
    throw new Error(error.message); // You can throw the error for the caller to handle
  }
};

// Login Function
const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user; // This should contain the logged-in user
  } catch (error) {
    console.error("Error logging in:", error.message);
    if (error.code === "auth/user-not-found") {
      console.error("User not found. Please check the email address.");
    } else if (error.code === "auth/wrong-password") {
      console.error("Incorrect password. Please try again.");
    }
    throw new Error(error.message); // Ensure the error is propagated
  }
};


// Logout Function
const logout = async () => {
  try {
    await signOut(auth); // Sign the user out from Firebase
  } catch (error) {
    console.error("Error logging out: ", error.message);
    throw new Error(error.message); // Handle logout errors
  }
};

// Password Reset Function
const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email); // Firebase function to send password reset email
  } catch (error) {
    console.error("Error sending password reset email: ", error.message);
    throw new Error(error.message); // Handle errors in sending reset email
  }
};

// Check if email exists in Firebase
const checkEmailExists = async (email) => {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods.length > 0; // If the email exists, it will return an array with sign-in methods
  } catch (error) {
    console.error("Error checking email existence: ", error.message);
    throw new Error(error.message); // Handle errors in checking email
  }
};

// Auth State Listener (for global state management)
const onAuthStateChangedListener = (callback) => {
  onAuthStateChanged(auth, callback);
};

export { auth, analytics, signUp, login, logout, resetPassword, checkEmailExists, onAuthStateChangedListener };
