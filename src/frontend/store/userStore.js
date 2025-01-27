import { create } from 'zustand';
import { auth } from '../../firebase';  // Ensure correct path
import { getData } from '../utils/BackendRequestHelper'; // Import getData

export const useUserStore = create((set) => ({
  firebaseId: localStorage.getItem("firebaseId") || null,
  roleId: localStorage.getItem("roleId") || null, // Store role_id
  userId: localStorage.getItem("userId") || null, // Store user_id
  isLoggedIn: localStorage.getItem("firebaseId") && localStorage.getItem("userId") ? true : false,

  setUser: (firebaseId, roleId, userId = null) => {
    localStorage.setItem("firebaseId", firebaseId);
    localStorage.setItem("roleId", roleId);
    if (userId) localStorage.setItem("userId", userId);
    set({
      firebaseId,
      roleId,
      userId,
      isLoggedIn: true,
    });
  },

  clearUser: () => {
    localStorage.removeItem("firebaseId");
    localStorage.removeItem("roleId");
    localStorage.removeItem("userId");
    set({
      firebaseId: null,
      roleId: null,
      userId: null,
      isLoggedIn: false,
    });
  },

  // Firebase listener setup with a delay for fetching user data (with proper handling to avoid infinite loops)
  listenAuthState: () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Step 1: Get the Firebase ID token for authentication with backend
          const idToken = await user.getIdToken();

          // Step 2: Introduce a delay before fetching user data
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3-second delay

          // Step 3: Fetch user data from backend using BackendRequestHelper
          const userData = await getData(`/users/${user.uid}`);

          if (!userData || !userData.role_id || !userData.user_id) {
            throw new Error("Incomplete user data received from backend.");
          }

          // Step 4: Save user data to Zustand store and localStorage only once
          set({
            firebaseId: user.uid,
            roleId: userData.role_id,
            userId: userData.user_id,
            isLoggedIn: true,
          });

          localStorage.setItem("firebaseId", user.uid);
          localStorage.setItem("roleId", userData.role_id);
          localStorage.setItem("userId", userData.user_id);
        } catch (error) {
          console.error("Error fetching user data:", error);
          set({
            firebaseId: null,
            roleId: null,
            userId: null,
            isLoggedIn: false,
          });
          localStorage.clear();
        }
      } else {
        set({
          firebaseId: null,
          roleId: null,
          userId: null,
          isLoggedIn: false,
        });
        localStorage.clear();
      }
    });
  }
}));
