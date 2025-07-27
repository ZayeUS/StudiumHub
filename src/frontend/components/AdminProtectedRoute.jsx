// src/frontend/components/AdminProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export const AdminProtectedRoute = () => {
  const { role } = useUserStore();

  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};