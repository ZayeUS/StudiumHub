// src/frontend/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export const ProtectedRoute = () => {
  const { authHydrated, profileHydrated, isLoggedIn } = useUserStore();

  // Wait until both auth + profile are ready
  if (!authHydrated || !profileHydrated) return null; // Or show a loader

  // Not signed in → go to login
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return <Outlet />;
};
