// userStore.js - Optimized Global State
import { create } from 'zustand';
import { auth } from '../../firebase';
import { getData } from '../utils/BackendRequestHelper';

// Safe localStorage with error handling
const storage = {
  get: (key) => {
    try { return localStorage.getItem(key); } 
    catch { return null; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, value); return true; } 
    catch { return false; }
  },
  remove: (key) => {
    try { localStorage.removeItem(key); return true; } 
    catch { return false; }
  }
};

export const useUserStore = create((set, get) => ({
  // State
  firebaseId: null,
  roleId: null,
  userId: null,
  isLoggedIn: false,
  profile: null,
  loading: false,
  authLoading: false,
  authHydrated: false,

  // Actions
  setLoading: (loading) => set({ loading }),
  setProfile: (profile) => set({ profile }),

  setUser: (firebaseId, roleId, userId) => {
    const normalizedRoleId = Number(roleId);
    
    // Update storage
    storage.set('firebaseId', firebaseId);
    storage.set('roleId', String(normalizedRoleId));
    storage.set('userId', userId);

    // Update state
    set({
      firebaseId,
      roleId: normalizedRoleId,
      userId,
      isLoggedIn: true,
    });
  },

  clearUser: () => {
    // Clear storage
    storage.remove('firebaseId');
    storage.remove('roleId');
    storage.remove('userId');

    // Reset state
    set({
      firebaseId: null,
      roleId: null,
      userId: null,
      isLoggedIn: false,
      profile: null,
    });
  },

  // Firebase Auth Listener
  listenAuthState: () => {
    set({ authHydrated: false, authLoading: true, isLoggedIn: false });

    return auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          // Parallel requests for user and profile data
          const [userData, profileData] = await Promise.all([
            getData(`/users/${user.uid}`),
            getData(`/profile`).catch(() => null),
          ]);

          // Validate user data
          if (!userData?.user_id || userData?.role_id === undefined) {
            console.warn("Invalid user data, clearing session.");
            get().clearUser();
          } else {
            // Set user data
            get().setUser(user.uid, userData.role_id, userData.user_id);
            set({ profile: profileData || null });
          }
        } else {
          get().clearUser();
        }
      } catch (err) {
        console.error("Auth listener error:", err);
        get().clearUser();
      } finally {
        set({ authLoading: false, authHydrated: true });
      }
    });
  }
}));