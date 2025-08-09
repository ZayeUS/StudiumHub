// src/frontend/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export const ProtectedRoute = () => {
  const { authHydrated, isLoggedIn } = useUserStore();

  // still waiting on Firebase/profile
  if (!authHydrated) return null;

  // not signed in → login
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  // otherwise render whatever child route matched
  return <Outlet />;
};