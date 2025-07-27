// src/frontend/store/userStore.js
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
  userId: null,
  role: null,
  isLoggedIn: false,
  profile: null,
  organization: null,
  loading: false,
  authLoading: false,
  authHydrated: false,
  userSubscriptionStatus: null,
  isSidebarExpanded: false, // <-- Add this state

  isDarkMode: (() => {
    const savedTheme = storage.get("theme");
    if (savedTheme) return savedTheme === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  })(),

  // Actions
  setLoading: (loading) => set({ loading }),
  setProfile: (profile) => set({ profile }),
  setOrganization: (organization) => set({ organization }),
  setUserSubscriptionStatus: (status) => set({ userSubscriptionStatus: status }),
  setIsSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }), // <-- Add this action

  toggleTheme: () => {
    set(state => {
      const newIsDarkMode = !state.isDarkMode;
      storage.set('theme', newIsDarkMode ? 'dark' : 'light');
      return { isDarkMode: newIsDarkMode };
    });
  },

  setUser: (firebaseId, userId) => {
    set({
      firebaseId,
      userId,
      isLoggedIn: true,
    });
  },

  clearUser: () => {
    set({
      firebaseId: null,
      userId: null,
      role: null,
      isLoggedIn: false,
      profile: null,
      organization: null,
      userSubscriptionStatus: null,
      loading: false,
      authLoading: false,
      authHydrated: true,
    });
  },

  listenAuthState: () => {
    set({ authHydrated: false, authLoading: true, isLoggedIn: false });
    return auth.onAuthStateChanged(async (user) => {
      if (user) {
        let userData;
        try {
          userData = await getData(`/users/${user.uid}`);
          if (!userData?.user_id) {
            get().clearUser();
            return;
          }
        } catch (error) {
          get().clearUser();
          return;
        }

        get().setUser(user.uid, userData.user_id);

        try {
            const [profileData, paymentData, orgData, roleData] = await Promise.all([
                getData(`/profile`).catch(() => null),
                getData(`/stripe/payment-status`).catch(() => ({ status: 'unsubscribed' })),
                getData(`/organizations/my-organization`).catch(() => null),
                getData('/users/me/role').catch(() => null)
            ]);

            set({
                profile: profileData,
                userSubscriptionStatus: paymentData?.status || 'unsubscribed',
                organization: orgData,
                role: roleData?.role
            });

        } catch (error) {
            console.error("Failed to fetch user session details:", error);
            set({ profile: null, userSubscriptionStatus: 'unsubscribed', organization: null, role: null });
        }

      } else {
        get().clearUser();
      }
      set({ authLoading: false, authHydrated: true });
    });
  }
}));
