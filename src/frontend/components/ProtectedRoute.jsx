// ProtectedRoute.js - Simplified Authentication Guard
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { LoadingModal } from '../components/LoadingModal';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, roleId, profile, authHydrated } = useUserStore();

  // Always show loading until auth is confirmed
  if (!authHydrated) return <LoadingModal message="Authenticating..." />;
  
  // Auth checks with early returns
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!profile) return <Navigate to="/profile-onboarding" replace />;
  if (allowedRoles && !allowedRoles.includes(roleId)) {
    return <Navigate to={roleId === 1 ? '/admin-dashboard' : '/user-dashboard'} replace />;
  }

  return children;
};