import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import {LoadingModal} from '../components/LoadingModal';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, roleId, profile, authHydrated } = useUserStore();

  if (!authHydrated) {
    return <LoadingModal message="Authenticating..." />;
  }

  // Not logged in → bounce to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but no profile → force onboarding
  if (!profile) {
    return <Navigate to="/profile-onboarding" replace />;
  }

  // Logged in, profile complete, wrong role
  if (allowedRoles && !allowedRoles.includes(roleId)) {
    const fallback = roleId === 1 ? '/admin-dashboard' : '/user-dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

