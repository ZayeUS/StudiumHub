// frontend/store/userStore.js

import { create } from "zustand";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase"; // Import Firebase auth

export const useUserStore = create((set) => ({
  firebaseId: localStorage.getItem("firebaseId") || null,
  userEmail: localStorage.getItem("userEmail") || null,
  userRole: localStorage.getItem("userRole") || null, // Store role_name
  roleId: localStorage.getItem("roleId") || null, // Store role_id
  userId: localStorage.getItem("userId") || null, // Optional: store user_id
  isLoggedIn:
    localStorage.getItem("firebaseId") && localStorage.getItem("userEmail")
      ? true
      : false, // Check if the user is logged in

  setUser: (firebaseId, email, role, roleId, userId = null) => {
    localStorage.setItem("firebaseId", firebaseId); // Store in localStorage
    localStorage.setItem("userEmail", email); // Store in localStorage
    localStorage.setItem("userRole", role); // Store role_name in localStorage
    localStorage.setItem("roleId", roleId); // Store role_id in localStorage
    if (userId) {
      localStorage.setItem("userId", userId); // Optional: store user_id
    }
    set({
      firebaseId,
      userEmail: email,
      userRole: role,
      roleId,
      userId,
      isLoggedIn: true,
    }); // Update Zustand state
  },

  clearUser: () => {
    localStorage.removeItem("firebaseId"); // Remove from localStorage
    localStorage.removeItem("userEmail"); // Remove from localStorage
    localStorage.removeItem("userRole"); // Remove role from localStorage
    localStorage.removeItem("roleId"); // Remove role_id from localStorage
    localStorage.removeItem("userId"); // Optional: remove user_id
    set({
      firebaseId: null,
      userEmail: null,
      userRole: null,
      roleId: null,
      userId: null,
      isLoggedIn: false,
    }); // Reset Zustand state
  },

  // Firebase authentication listener to handle login state changes
  listenAuthState: () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // If a user is logged in
        set({ firebaseId: user.uid, userEmail: user.email, isLoggedIn: true });
        localStorage.setItem("firebaseId", user.uid); // Store in localStorage
        localStorage.setItem("userEmail", user.email); // Store in localStorage
        // Retrieve role and user_id from local storage
        const role = localStorage.getItem("userRole");
        const roleId = localStorage.getItem("roleId");
        const userId = localStorage.getItem("userId");
        set({ userRole: role, roleId: roleId, userId: userId });
      } else {
        // If no user is logged in
        set({
          firebaseId: null,
          userEmail: null,
          userRole: null,
          roleId: null,
          userId: null,
          isLoggedIn: false,
        });
        localStorage.removeItem("firebaseId"); // Clear from localStorage
        localStorage.removeItem("userEmail"); // Clear from localStorage
        localStorage.removeItem("userRole"); // Clear role from localStorage
        localStorage.removeItem("roleId"); // Clear role_id from localStorage
        localStorage.removeItem("userId"); // Optional: clear user_id
      }
    });
  },
}));

// Call listenAuthState to start listening to Firebase auth changes
useUserStore.getState().listenAuthState();
