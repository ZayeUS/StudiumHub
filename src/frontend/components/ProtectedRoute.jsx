import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import LoadingModal from '../components/LoadingModal';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, roleId, profile, loading } = useUserStore();
  const location = useLocation(); // 🔥 Grab current location

  if (loading) {
    return <LoadingModal open={true} />;
  }

  // 🔥 ONLY Redirect if needed
  if (!isLoggedIn && location.pathname !== '/login' && location.pathname !== '/signup') {
    return <Navigate to="/login" replace />;
  }

  if (isLoggedIn && !profile && location.pathname !== '/profile-onboarding') {
    return <Navigate to="/profile-onboarding" replace />;
  }

  if (isLoggedIn && profile && !allowedRoles.includes(roleId)) {
    const fallback = roleId === 1 ? '/admin-dashboard' : '/user-dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;
