// src/frontend/store/userStore.js
import { create } from 'zustand';
import { auth } from '../../firebase';
import { getData } from '../utils/BackendRequestHelper';
import { signOut } from 'firebase/auth';

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
  firebaseId: null,
  userId: null,
  role: null,
  isLoggedIn: false,
  profile: null,
  organization: null,
  loading: false,
  authLoading: false,
  authHydrated: false,
  profileHydrated: false, // ✅ NEW - profile state fully resolved
  userSubscriptionStatus: null,
  isSidebarExpanded: false,
  sessionReady: false,

  isDarkMode: (() => {
    const savedTheme = storage.get("theme");
    if (savedTheme) return savedTheme === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  })(),

  setLoading: (loading) => set({ loading }),

  // ✅ Merge profile data so removing avatar doesn't remove name fields
  setProfile: (profile) => 
    set((state) => ({
      profile: { ...state.profile, ...profile },
      profileHydrated: true
    })),

  setOrganization: (organization) => set({ organization }),
  setUserSubscriptionStatus: (status) => set({ userSubscriptionStatus: status }),
  setIsSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),

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
      profileHydrated: false,
      sessionReady: true
    });
  },

  listenAuthState: () => {
    set({
      authHydrated: false,
      profileHydrated: false,
      authLoading: true,
      sessionReady: false,
      isLoggedIn: false
    });

    return auth.onAuthStateChanged(async (user) => {
      if (user) {
        let userData;
        try {
          userData = await getData(`/users/${user.uid}`);
          if (!userData?.user_id) {
            await signOut(auth);
            get().clearUser();
            return;
          }
        } catch {
          await signOut(auth);
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
            profile: profileData || {},
            profileHydrated: true,
            userSubscriptionStatus: paymentData?.status || 'unsubscribed',
            organization: orgData,
            role: roleData?.role
          });

        } catch {
          set({
            profile: {},
            profileHydrated: true,
            userSubscriptionStatus: 'unsubscribed',
            organization: null,
            role: null
          });
        }
      } else {
        get().clearUser();
        return;
      }

      set({
        authLoading: false,
        authHydrated: true,
        sessionReady: true
      });
    });
  }
}));
