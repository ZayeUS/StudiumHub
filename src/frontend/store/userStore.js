import { create } from 'zustand';
import { auth } from '../../firebase';
import { getData } from '../utils/BackendRequestHelper';

export const useUserStore = create((set) => ({
  firebaseId: localStorage.getItem("firebaseId") || null,
  roleId: localStorage.getItem("roleId") ? Number(localStorage.getItem("roleId")) : null,
  userId: localStorage.getItem("userId") ? Number(localStorage.getItem("userId")) : null,
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

  // Listen to Firebase auth changes with cleanup support
  listenAuthState: () => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          await new Promise(resolve => setTimeout(resolve, 3000));
          const userData = await getData(`/users/${user.uid}`);
          if (!userData || !userData.role_id || !userData.user_id) {
            throw new Error("Incomplete user data received from backend.");
          }
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
    return unsubscribe;
  }
}));
