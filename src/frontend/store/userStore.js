import { create } from 'zustand';
import { auth } from '../../firebase';
import { getData } from '../utils/BackendRequestHelper';

// Simple localStorage helpers with error handling
const safeStorage = {
  get: (key, defaultValue = null) => {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
      return false;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Error removing ${key} from storage:`, e);
      return false;
    }
  }
};

export const useUserStore = create((set, get) => {
  // Initialize from localStorage with safe fallbacks
  const initialFirebaseId = safeStorage.get('firebaseId');
  const initialRoleId = Number(safeStorage.get('roleId')) || null;
  const initialUserId = safeStorage.get('userId');

  return {
    // State
    firebaseId: initialFirebaseId,
    roleId: initialRoleId,
    userId: initialUserId,
    isLoggedIn: Boolean(initialFirebaseId && initialUserId),
    profile: null,
    loading: false,
    authHydrated: false,

    // Actions
    setLoading: (loading) => set({ loading }),
    
    setUser: (firebaseId, roleId, userId) => {
      // Normalize values for consistency
      const normalizedRoleId = Number(roleId);
      
      // Save to localStorage
      safeStorage.set('firebaseId', firebaseId);
      safeStorage.set('roleId', String(normalizedRoleId));
      safeStorage.set('userId', userId);
      
      // Update state
      set({
        firebaseId,
        roleId: normalizedRoleId,
        userId,
        isLoggedIn: true,
      });
    },
    
    setProfile: (profileData) => set({ profile: profileData }),
    
    clearUser: () => {
      // Remove from localStorage
      safeStorage.remove('firebaseId');
      safeStorage.remove('roleId');
      safeStorage.remove('userId');
      
      // Update state
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
      
      return auth.onAuthStateChanged(async (user) => {
        try {
          if (user) {
            // Fetch user data and profile in parallel
            const [userData, profileData] = await Promise.all([
              getData(`/users/${user.uid}`),
              getData(`/profile`).catch(() => null)
            ]);
            
            // Validate required user data
            if (userData && userData.role_id !== undefined && userData.user_id) {
              // Update user state
              get().setUser(user.uid, userData.role_id, userData.user_id);
              
              // Update profile and finish loading
              set({
                profile: profileData,
                loading: false,
                authHydrated: true,
              });
            } else {
              throw new Error('Invalid user data received');
            }
          } else {
            // No user is signed in
            get().clearUser();
            set({ loading: false, authHydrated: true });
          }
        } catch (err) {
          console.error('Auth listener error:', err);
          
          // Clear user on auth errors
          if (err.code?.includes('auth/') || err.message?.includes('Invalid user')) {
            get().clearUser();
          }
          
          set({ loading: false, authHydrated: true });
        }
      });
    }
  };
});