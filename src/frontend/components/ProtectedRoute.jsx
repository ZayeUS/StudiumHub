import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isLoggedIn, roleId, profile, loading } = useUserStore();

  // If the app is still loading user state, don't render anything
  if (loading) return null; 

  // Check if user is logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Check if role matches
  if (roleId !== allowedRole) {
    const fallback = roleId === 1 ? '/admin-dashboard' : '/user-dashboard';
    return <Navigate to={fallback} replace />;
  }



  // If all checks pass, render the protected content
  return children;
};

export default ProtectedRoute;
