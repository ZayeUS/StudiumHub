import { create } from 'zustand';
import { auth } from '../../firebase';  // Assuming you're using Firebase for authentication

export const useUserStore = create((set) => ({
  firebaseId: localStorage.getItem("firebaseId") || null,
  userEmail: localStorage.getItem("userEmail") || null,
  userRole: localStorage.getItem("userRole") || null, // Store role_name
  roleId: localStorage.getItem("roleId") || null, // Store role_id
  userId: localStorage.getItem("userId") || null, // Optional: store user_id
  isLoggedIn: localStorage.getItem("firebaseId") && localStorage.getItem("userEmail") ? true : false,

  setUser: (firebaseId, email, role, roleId, userId = null) => {
    localStorage.setItem("firebaseId", firebaseId);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", role);
    localStorage.setItem("roleId", roleId);
    if (userId) localStorage.setItem("userId", userId);
    set({
      firebaseId,
      userEmail: email,
      userRole: role,
      roleId,
      userId,
      isLoggedIn: true,
    });
  },

  clearUser: () => {
    localStorage.clear();
    set({
      firebaseId: null,
      userEmail: null,
      userRole: null,
      roleId: null,
      userId: null,
      isLoggedIn: false,
    });
  },

  // Direct role management methods can be handled via the backend now.
  setRole: (roleName, roleId) => {
    localStorage.setItem("userRole", roleName);
    localStorage.setItem("roleId", roleId);
    set({
      userRole: roleName,
      roleId,
    });
  },

  // Firebase listener setup
  listenAuthState: () => {
    auth.onAuthStateChanged(user => {
      if (user) {
        // Assuming your Firebase user object contains role and userId
        set({
          firebaseId: user.uid,
          userEmail: user.email,
          userRole: user.role, // Make sure you handle this properly in Firebase
          roleId: user.roleId, // Assuming roleId is set in Firebase
          userId: user.uid,
          isLoggedIn: true,
        });
        localStorage.setItem("firebaseId", user.uid);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("roleId", user.roleId);
        localStorage.setItem("userId", user.uid);
      } else {
        set({
          firebaseId: null,
          userEmail: null,
          userRole: null,
          roleId: null,
          userId: null,
          isLoggedIn: false,
        });
        localStorage.clear();
      }
    });
  }
}));
