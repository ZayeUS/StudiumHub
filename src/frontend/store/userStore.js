import { create } from 'zustand';
import { auth } from '../../firebase';
import { getData } from '../utils/BackendRequestHelper';

// Safe localStorage wrapper
const safeStorage = {
  get: (key, defaultValue = null) => {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

export const useUserStore = create((set, get) => ({
  // Initial state — assume unauthenticated
  firebaseId: null,
  roleId: null,
  userId: null,
  isLoggedIn: false,
  profile: null,
  loading: false,
  authLoading: false,
  authHydrated: false, // ← becomes true only after Firebase confirms

  // Setters
  setLoading: (loading) => set({ loading }),
  setAuthLoading: (authLoading) => set({ authLoading }),

  setUser: (firebaseId, roleId, userId) => {
    const normalizedRoleId = Number(roleId);
    safeStorage.set('firebaseId', firebaseId);
    safeStorage.set('roleId', String(normalizedRoleId));
    safeStorage.set('userId', userId);

    set({
      firebaseId,
      roleId: normalizedRoleId,
      userId,
      isLoggedIn: true,
    });
  },

  setProfile: (profile) => set({ profile }),

  clearUser: () => {
    safeStorage.remove('firebaseId');
    safeStorage.remove('roleId');
    safeStorage.remove('userId');

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

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const [userData, profileData] = await Promise.all([
            getData(`/users/${user.uid}`),
            getData(`/profile`).catch(() => null),
          ]);

          if (!userData?.user_id || userData?.role_id === undefined) {
            console.warn("Invalid user data, clearing session.");
            get().clearUser();
            return set({ authLoading: false, authHydrated: true });
          }

          get().setUser(user.uid, userData.role_id, userData.user_id);
          set({
            profile: profileData || null,
            authLoading: false,
            authHydrated: true,
          });
        } else {
          get().clearUser();
          set({ authLoading: false, authHydrated: true });
        }
      } catch (err) {
        console.error("Auth listener error:", err);
        get().clearUser();
        set({ authLoading: false, authHydrated: true });
      }
    });

    return unsubscribe;
  }
}));
