import React from "react";
import { useUserStore } from "../../store/userStore";
import AdminDashboard from "../Authenticated/AdminDashboard";
import UserDashboard from "../Authenticated/UserDashboard";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { roleId, isLoggedIn, profile } = useUserStore();
  
  // Redirect logic
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (isLoggedIn && !profile) {
    return <Navigate to="/profile-onboarding" replace />;
  }
  
  // Render the appropriate dashboard based on role
  return roleId === 1 ? <AdminDashboard /> : <UserDashboard />;
};

export default Dashboard;