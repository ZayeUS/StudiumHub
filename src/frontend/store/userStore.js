import { create } from 'zustand';
import { auth } from '../../firebase';
import { getData } from '../utils/BackendRequestHelper';

// Safe getter for localStorage
const getFromStorage = (key, defaultValue = null) => {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
};

export const useUserStore = create((set, get) => {
  const initialFirebaseId = getFromStorage('firebaseId');
  const initialRoleId = Number(getFromStorage('roleId')) || null;
  const initialUserId = getFromStorage('userId') || null; // UUID-safe

  return {
    firebaseId: initialFirebaseId,
    roleId: initialRoleId,
    userId: initialUserId,
    isLoggedIn: Boolean(initialFirebaseId && initialUserId),
    profile: null,

    // UI state
    loading: false,
    manualLoginInProgress: false,
    authHydrated: false,

    // Actions
    setLoading: (loading) => set({ loading }),

    setManualLogin: (status) => set({ manualLoginInProgress: status }),

    setUser: (firebaseId, roleId, userId) => {
      const normalizedRoleId = Number(roleId);
      const normalizedUserId = String(userId); // UUID-safe

      try {
        localStorage.setItem('firebaseId', firebaseId);
        localStorage.setItem('roleId', String(normalizedRoleId));
        localStorage.setItem('userId', normalizedUserId);
      } catch (e) {
        console.error('Error saving user data to localStorage:', e);
      }

      set({
        firebaseId,
        roleId: normalizedRoleId,
        userId: normalizedUserId,
        isLoggedIn: true,
      });
    },

    setProfile: (profileData) => set({ profile: profileData }),

    clearUser: () => {
      try {
        ['firebaseId', 'roleId', 'userId'].forEach(k => localStorage.removeItem(k));
      } catch (e) {
        console.error('Error clearing localStorage:', e);
      }

      set({
        firebaseId: null,
        roleId: null,
        userId: null,
        isLoggedIn: false,
        profile: null,
      });
    },

    listenAuthState: () => {
      set({ loading: true, authHydrated: false });
      const start = Date.now();

      const waitForBackend = () => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 2000 - elapsed);
        return new Promise(resolve => setTimeout(resolve, remaining));
      };

      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        try {
          if (user) {
            const [userData, profileData] = await Promise.all([
              getData(`/users/${user.uid}`),
              getData(`/profile`).catch(() => null)
            ]);

            await waitForBackend();

            if (userData && userData.role_id !== undefined && userData.user_id !== undefined) {
              const normalizedRoleId = Number(userData.role_id);
              const normalizedUserId = String(userData.user_id); // UUID-safe

              try {
                localStorage.setItem('firebaseId', user.uid);
                localStorage.setItem('roleId', String(normalizedRoleId));
                localStorage.setItem('userId', normalizedUserId);
              } catch (e) {
                console.error('Error saving user data to localStorage:', e);
              }

              set({
                firebaseId: user.uid,
                roleId: normalizedRoleId,
                userId: normalizedUserId,
                isLoggedIn: true,
                profile: profileData || null,
                loading: false,
                authHydrated: true,
              });
            } else {
              throw new Error('Invalid user data received from backend');
            }
          } else {
            await waitForBackend();
            get().clearUser();
            set({ loading: false, authHydrated: true });
          }
        } catch (err) {
          console.error('Auth listener error:', err);
          await waitForBackend();

          if (err.code?.includes('auth/') || err.message?.includes('Invalid user')) {
            get().clearUser();
          }

          set({ loading: false, authHydrated: true });
        }
      });

      return unsubscribe;
    }
  };
});
