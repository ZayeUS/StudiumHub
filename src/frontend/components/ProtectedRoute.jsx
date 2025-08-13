import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export const ProtectedRoute = () => {
  const { authHydrated, isLoggedIn } = useUserStore();

  // Still waiting on Firebase to confirm auth state
  if (!authHydrated) {
    return null; // or a loading spinner
  }

  // Not signed in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // User is signed in, render the child route
  return <Outlet />;
};