import { create } from 'zustand';
import { auth } from '../../firebase';
import { getData } from '../utils/BackendRequestHelper';

// Safe localStorage utilities
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

export const useUserStore = create((set, get) => {
  const initialFirebaseId = safeStorage.get('firebaseId');
  const initialRoleId = Number(safeStorage.get('roleId')) || null;
  const initialUserId = safeStorage.get('userId');

  return {
    // STATE
    firebaseId: initialFirebaseId,
    roleId: initialRoleId,
    userId: initialUserId,
    isLoggedIn: Boolean(initialFirebaseId && initialUserId),
    profile: null,
    loading: false,       // For general UI (form/API)
    authLoading: false,   // For auth-specific logic
    authHydrated: false,  // When Firebase auth has finished

    // ACTIONS
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

    setProfile: (profileData) => set({ profile: profileData }),

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

    listenAuthState: () => {
      set({ authLoading: true, authHydrated: false });

      return auth.onAuthStateChanged(async (user) => {
        try {
          if (user) {
            const [userData, profileData] = await Promise.all([
              getData(`/users/${user.uid}`),
              getData(`/profile`).catch(() => null)
            ]);

            if (userData && userData.role_id !== undefined && userData.user_id) {
              get().setUser(user.uid, userData.role_id, userData.user_id);

              set({
                profile: profileData,
                authLoading: false,
                authHydrated: true,
              });
            } else {
              throw new Error('Invalid user data');
            }
          } else {
            get().clearUser();
            set({ authLoading: false, authHydrated: true });
          }
        } catch (err) {
          console.error('Auth listener error:', err);
          get().clearUser();
          set({ authLoading: false, authHydrated: true });
        }
      });
    }
  };
});
