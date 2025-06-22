import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, roleId, authHydrated } = useUserStore();

  // If we don't know the auth state yet, don't render anything.
  // The FullScreenLoader in App.jsx will be visible.
  if (!authHydrated) {
    return null; 
  }

  // The primary guard: if the user is not logged in, redirect them to the login page.
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // Optional guard for role-based access. If the route requires a specific role
  // and the user doesn't have it, send them to their default dashboard.
  if (allowedRoles && !allowedRoles.includes(roleId)) {
    return <Navigate to="/dashboard" replace />;
  }

  // If all checks pass, render the component this route is protecting.
  return children;
};