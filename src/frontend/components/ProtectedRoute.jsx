import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isLoggedIn, roleId, loading } = useUserStore();

  // Check if still loading the auth state, if yes, don't render the route
  if (loading) return null;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (roleId !== allowedRole) {
    const fallback = roleId === 1 ? '/admin-dashboard' : '/user-dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;
