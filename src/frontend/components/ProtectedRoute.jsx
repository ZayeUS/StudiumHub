import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export const ProtectedRoute = ({ children }) => { // MODIFIED: allowedRoles removed
  const { isLoggedIn, authHydrated } = useUserStore();

  if (!authHydrated) {
    return null; 
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // Role-based access check has been removed.

  return children;
};