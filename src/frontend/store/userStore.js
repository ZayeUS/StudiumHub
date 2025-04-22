import { create } from 'zustand';
import { auth } from '../../firebase';
import { getData } from '../utils/BackendRequestHelper';

export const useUserStore = create((set) => ({
  firebaseId: localStorage.getItem('firebaseId') || null,
  roleId: Number(localStorage.getItem('roleId')) || null,
  userId: Number(localStorage.getItem('userId')) || null,
  isLoggedIn: Boolean(localStorage.getItem('firebaseId') && localStorage.getItem('userId')),
  loading: false,

  setLoading: (loading) => set({ loading }),

  setUser: (firebaseId, roleId, userId) => {
    localStorage.setItem('firebaseId', firebaseId);
    localStorage.setItem('roleId', String(roleId));
    localStorage.setItem('userId', String(userId));
    set({ firebaseId, roleId, userId, isLoggedIn: true });
  },

  clearUser: () => {
    ['firebaseId','roleId','userId'].forEach((k) => localStorage.removeItem(k));
    set({ firebaseId: null, roleId: null, userId: null, isLoggedIn: false });
  },

  listenAuthState: () => {
    set({ loading: true });
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const { role_id, user_id } = await getData(`/users/${user.uid}`);
          set({
            firebaseId: user.uid,
            roleId: role_id,
            userId: user_id,
            isLoggedIn: true,
            loading: false
          });
          localStorage.setItem('firebaseId', user.uid);
          localStorage.setItem('roleId', String(role_id));
          localStorage.setItem('userId', String(user_id));
        } catch (err) {
          console.error('Auth listener error:', err);
          set({ loading: false });
          ['firebaseId','roleId','userId'].forEach((k) => localStorage.removeItem(k));
        }
      } else {
        set({ firebaseId: null, roleId: null, userId: null, isLoggedIn: false, loading: false });
        ['firebaseId','roleId','userId'].forEach((k) => localStorage.removeItem(k));
      }
    });
    return unsubscribe;
  }
}));
