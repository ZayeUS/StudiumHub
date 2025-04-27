import { create } from 'zustand';
import { auth } from '../../firebase';
import { getData } from '../utils/BackendRequestHelper';

export const useUserStore = create((set, get) => ({
  firebaseId: localStorage.getItem('firebaseId') || null,
  roleId: Number(localStorage.getItem('roleId')) || null,
  userId: Number(localStorage.getItem('userId')) || null,
  isLoggedIn: Boolean(localStorage.getItem('firebaseId') && localStorage.getItem('userId')),
  profile: null,
  loading: false,
  manualLoginInProgress: false,
  authHydrated: false, // 🔥 NEW

  setLoading: (loading) => set({ loading }),
  setManualLogin: (status) => set({ manualLoginInProgress: status }),
  setUser: (firebaseId, roleId, userId) => {
    localStorage.setItem('firebaseId', firebaseId);
    localStorage.setItem('roleId', String(roleId));
    localStorage.setItem('userId', String(userId));
    set({ firebaseId, roleId, userId, isLoggedIn: true });
  },
  setProfile: (profileData) => {
    set({ profile: profileData });
  },
  clearUser: () => {
    ['firebaseId', 'roleId', 'userId'].forEach((k) => localStorage.removeItem(k));
    set({ firebaseId: null, roleId: null, userId: null, isLoggedIn: false, profile: null });
  },

  listenAuthState: () => {
    set({ loading: true, authHydrated: false }); // Start loading immediately
  
    const start = Date.now(); // Record start time
  
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      const ensureOneSecond = () => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 2000 - elapsed);
        return new Promise((resolve) => setTimeout(resolve, remaining));
      };
  
      if (user) {
        try {
          const { role_id, user_id } = await getData(`/users/${user.uid}`);
          const profileData = await getData(`/profile`);  
          await ensureOneSecond(); // ✅ Wait if needed
  
          set({
            firebaseId: user.uid,
            roleId: role_id,
            userId: user_id,
            isLoggedIn: true,
            profile: profileData || null,
            loading: false,
            authHydrated: true,
          });
  
          localStorage.setItem('firebaseId', user.uid);
          localStorage.setItem('roleId', String(role_id));
          localStorage.setItem('userId', String(user_id));
        } catch (err) {
          console.error('Auth listener error:', err);
  
          await ensureOneSecond(); // ✅ Wait even on error
  
          set({ loading: false, authHydrated: true });
          ['firebaseId', 'roleId', 'userId'].forEach((k) => localStorage.removeItem(k));
        }
      } else {
        await ensureOneSecond(); // ✅ Wait even if no user
  
        set({
          firebaseId: null,
          roleId: null,
          userId: null,
          isLoggedIn: false,
          profile: null,
          loading: false,
          authHydrated: true,
        });
  
        ['firebaseId', 'roleId', 'userId'].forEach((k) => localStorage.removeItem(k));
      }
    });
  
    return unsubscribe;
  },
  
  
  
  
}));
