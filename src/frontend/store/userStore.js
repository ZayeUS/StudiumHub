import { create } from "zustand";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase"; // Import Firebase auth

export const useUserStore = create((set) => ({
  firebaseId: localStorage.getItem("firebaseId") || null,
  userEmail: localStorage.getItem("userEmail") || null,
  userRole: localStorage.getItem("userRole") || null, // Store role
  isLoggedIn: localStorage.getItem("firebaseId") && localStorage.getItem("userEmail") ? true : false, // Check if the user is logged in

  setUser: (firebaseId, email, role) => {
    localStorage.setItem("firebaseId", firebaseId); // Store in localStorage
    localStorage.setItem("userEmail", email); // Store in localStorage
    localStorage.setItem("userRole", role); // Store role in localStorage
    set({ firebaseId, userEmail: email, userRole: role, isLoggedIn: true }); // Update Zustand state
  },

  clearUser: () => {
    localStorage.removeItem("firebaseId"); // Remove from localStorage
    localStorage.removeItem("userEmail"); // Remove from localStorage
    localStorage.removeItem("userRole"); // Remove from localStorage
    set({ firebaseId: null, userEmail: null, userRole: null, isLoggedIn: false }); // Reset Zustand state
  },

  // Firebase authentication listener to handle login state changes
  listenAuthState: () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // If a user is logged in
        set({ firebaseId: user.uid, userEmail: user.email, isLoggedIn: true });
        localStorage.setItem("firebaseId", user.uid); // Store in localStorage
        localStorage.setItem("userEmail", user.email); // Store in localStorage
        // Retrieve role from backend or local storage
        const role = localStorage.getItem("userRole");
        set({ userRole: role });
      } else {
        // If no user is logged in
        set({ firebaseId: null, userEmail: null, isLoggedIn: false });
        localStorage.removeItem("firebaseId"); // Clear from localStorage
        localStorage.removeItem("userEmail"); // Clear from localStorage
        localStorage.removeItem("userRole"); // Clear role from localStorage
      }
    });
  },
}));

// Call listenAuthState to start listening to Firebase auth changes
useUserStore.getState().listenAuthState();
