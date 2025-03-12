import { create } from 'zustand';
import { auth } from '../../firebase';
import { getData } from '../utils/BackendRequestHelper';

export const useUserStore = create((set) => ({
  firebaseId: localStorage.getItem("firebaseId") || null,
  roleId: localStorage.getItem("roleId") ? Number(localStorage.getItem("roleId")) : null,
  userId: localStorage.getItem("userId") ? Number(localStorage.getItem("userId")) : null,
  isLoggedIn: !!localStorage.getItem("firebaseId") && !!localStorage.getItem("userId"),
  loading: false, // Loading state

  setUser: (firebaseId, roleId = null, userId = null) => {
    localStorage.setItem("firebaseId", firebaseId);
    localStorage.setItem("roleId", roleId);
    localStorage.setItem("userId", userId);

    set({
      firebaseId,
      roleId: Number(roleId),
      userId: Number(userId),
      isLoggedIn: true,
    });
  },

  clearUser: () => {
    ["firebaseId", "roleId", "userId"].forEach((key) => localStorage.removeItem(key));
    set({
      firebaseId: null,
      roleId: null,
      userId: null,
      isLoggedIn: false,
    });
  },

  listenAuthState: () => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        set({ loading: true });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for loading animation
          const userData = await getData(`/users/${user.uid}`);

          if (!userData || !userData.user_id) throw new Error("Invalid user data received.");

          const roleId = userData.role_id || null;
          const userId = userData.user_id || null;

          set({
            firebaseId: user.uid,
            roleId,
            userId,
            isLoggedIn: true,
            loading: false,
          });

          localStorage.setItem("firebaseId", user.uid);
          localStorage.setItem("roleId", roleId);
          localStorage.setItem("userId", userId);
        } catch (error) {
          console.error("Error fetching user data:", error);
          set({
            firebaseId: null,
            roleId: null,
            userId: null,
            isLoggedIn: false,
            loading: false,
          });
          ["firebaseId", "roleId", "userId"].forEach((key) => localStorage.removeItem(key));
        }
      } else {
        set({
          firebaseId: null,
          roleId: null,
          userId: null,
          isLoggedIn: false,
          loading: false,
        });
        ["firebaseId", "roleId", "userId"].forEach((key) => localStorage.removeItem(key));
      }
    });
    return unsubscribe;
  }
}));