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
  authLoading: true, // Start in a loading state
  authHydrated: false,
  userSubscriptionStatus: null,
  isSidebarExpanded: false,
  isCommandPaletteOpen: false,

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
  setIsSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),
  toggleCommandPalette: (open) => set(state => ({ isCommandPaletteOpen: typeof open === 'boolean' ? open : !state.isCommandPaletteOpen })),

  toggleTheme: () => {
    set(state => {
      const newIsDarkMode = !state.isDarkMode;
      storage.set('theme', newIsDarkMode ? 'dark' : 'light');
      return { isDarkMode: newIsDarkMode };
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

  // *** THE REFACTORED AUTH LISTENER ***
  listenAuthState: () => {
    set({ authLoading: true, authHydrated: false }); // Ensure we start in a loading state
    return auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userData = await getData(`/users/${user.uid}`);
          if (!userData?.user_id) {
            throw new Error("User not found in application database.");
          }

          const [profileData, paymentData, orgData, roleData] = await Promise.all([
              getData(`/profile`).catch(() => null),
              getData(`/stripe/payment-status`).catch(() => ({ status: 'unsubscribed' })),
              getData(`/organizations/my-organization`).catch(() => null),
              getData('/users/me/role').catch(() => null)
          ]);

          // This is now one single, atomic update.
          set({
            firebaseId: user.uid,
            userId: userData.user_id,
            isLoggedIn: true,
            profile: profileData,
            userSubscriptionStatus: paymentData?.status || 'unsubscribed',
            organization: orgData,
            role: roleData?.role,
            authLoading: false,
            authHydrated: true,
          });

        } catch (error) {
          console.error("Auth state change error:", error);
          get().clearUser(); // Clear user on any failure during hydration
        }
      } else {
        get().clearUser();
      }
    });
  }
}));