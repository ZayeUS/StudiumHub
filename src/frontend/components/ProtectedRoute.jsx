import React from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";

const ProtectedRoute = ({ children, roleId }) => {
  const { isLoggedIn, roleId: userRoleId } = useUserStore();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (userRoleId !== roleId) {
    // Redirect users to their correct dashboard if they try accessing the wrong one
    return userRoleId === 1 ? <Navigate to="/admin-dashboard" replace /> : <Navigate to="/user-dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
