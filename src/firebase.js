import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = () => signInWithPopup(auth, googleProvider);


// Core Auth Functions
const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password);
const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
const logout = () => signOut(auth);
const resetPassword = (email) => sendPasswordResetEmail(auth, email);
const checkEmailExists = (email) => fetchSignInMethodsForEmail(auth, email).then(methods => methods.length > 0);
const onAuthStateChangedListener = (callback) => onAuthStateChanged(auth, callback);

// User Management Functions
const reauthenticateUser = (password) => {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, password);
  return reauthenticateWithCredential(user, credential);
};

const updateUserPassword = (newPassword) => {
  const user = auth.currentUser;
  return updatePassword(user, newPassword);
};

const deleteFirebaseUser = () => {
  const user = auth.currentUser;
  return deleteUser(user);
};

export {
  auth,
  analytics,
  signUp,
  login,
  logout,
  resetPassword,
  checkEmailExists,
  onAuthStateChangedListener,
  reauthenticateUser,
  updateUserPassword,
  deleteFirebaseUser,
  signInWithGoogle,
};