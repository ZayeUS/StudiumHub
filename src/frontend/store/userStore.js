// File: src/frontend/store/userStore.js
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
  loading: false, // Overall loading
  authLoading: false, // Specific to auth listener process
  authHydrated: false,
  userSubscriptionStatus: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setProfile: (profile) => set({ profile }),
  setUserSubscriptionStatus: (status) => set({ userSubscriptionStatus: status }),
  // NEW ACTION: Explicitly mark free tier selected
  markFreeTierSelected: () => set({ userSubscriptionStatus: 'free' }), 

  setUser: (firebaseId, roleId, userId) => {
    const normalizedRoleId = Number(roleId);
    storage.set('firebaseId', firebaseId);
    storage.set('roleId', String(normalizedRoleId));
    storage.set('userId', userId);
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
      userSubscriptionStatus: null,
      loading: false, // Ensure overall loading is false
      authLoading: false, // Ensure auth loading is false
      authHydrated: true, // Ensure auth is hydrated to avoid endless loading screen
    });
  },

  // Firebase Auth Listener
  listenAuthState: () => {
    set({ authHydrated: false, authLoading: true, isLoggedIn: false, userSubscriptionStatus: null, profile: null }); // Reset states

    return auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Step 1: Fetch primary user data from your backend
        let userData = null;
        try {
          userData = await getData(`/users/${user.uid}`);
          // If userData is null or invalid, consider it a failure to find user in system
          if (!userData?.user_id || userData?.role_id === undefined) {
            console.warn("User authenticated with Firebase but not found in system or invalid data, clearing session.");
            get().clearUser();
            return; // Stop further processing for this auth event
          }
        } catch (error) {
          console.error("Error fetching user data from backend:", error);
          // If this primary fetch fails, user is not fully authenticated in our system
          get().clearUser();
          return; // Stop further processing for this auth event
        }

        // Set essential user data immediately
        get().setUser(user.uid, userData.role_id, userData.user_id);
        
        // Step 2: Fetch secondary data (profile, payment) concurrently
        let profileData = null;
        try {
          profileData = await getData(`/profile`);
        } catch (error) {
          console.warn("Error fetching profile data, proceeding without it:", error);
          // Profile data is not critical for initial login, can be null
        }
        set({ profile: profileData || null }); // Set profile even if null

        let paymentData = null;
        let subscriptionStatus = 'unsubscribed'; // Default to unsubscribed if no payment found or error
        try {
          paymentData = await getData(`/stripe/payment-status`);
          subscriptionStatus = paymentData?.status || 'unsubscribed';
        } catch (error) {
          if (error.response && error.response.status === 404) {
            subscriptionStatus = 'unsubscribed'; // Explicitly set if no record found
          } else {
            console.error("Error fetching payment status, defaulting to unsubscribed:", error);
            subscriptionStatus = 'unsubscribed'; // Any other error, default to unsubscribed
          }
        }
        get().setUserSubscriptionStatus(subscriptionStatus);

      } else {
        // User is not logged in via Firebase
        get().clearUser();
      }
      
      // Finally, set auth hydrated and auth loading to false
      set({ authLoading: false, authHydrated: true });
    });
  }
}));