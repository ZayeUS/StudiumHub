import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./frontend/pages/Non-Authenticated/LandingPage";
import LoginPage from "./frontend/pages/Non-Authenticated/LoginPage";
import SignUpPage from "./frontend/pages/Non-Authenticated/SignUpPage";
import AdminDashboard from "./frontend/pages/Authenticated/AdminDashboard";
import UserDashboard from "./frontend/pages/Authenticated/UserDashboard";
import ProfileOnboarding from "./frontend/pages/Authenticated/ProfileOnboarding";
import UserProfilePage from "./frontend/pages/Authenticated/UserProfilePage";
import ProtectedRoute from "./frontend/components/ProtectedRoute";
import { useUserStore } from "./frontend/store/userStore";
import NotFoundPage from "./frontend/pages/Non-Authenticated/NotFoundPage";

const AppRoutes = () => {
  // Using individual selectors to prevent infinite loops
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  const profile = useUserStore(state => state.profile);
  const roleId = useUserStore(state => state.roleId);

  const determineDashboardRedirect = () => {
    if (roleId === 1) return "/admin-dashboard";
    if (roleId === 2) return "/user-dashboard";
    return "/";
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <Navigate to={profile ? determineDashboardRedirect() : "/profile-onboarding"} />
          ) : (
            <LandingPage />
          )
        }
      />
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to={profile ? determineDashboardRedirect() : "/profile-onboarding"} />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/signup"
        element={
          isLoggedIn ? (
            <Navigate to={profile ? determineDashboardRedirect() : "/profile-onboarding"} />
          ) : (
            <SignUpPage />
          )
        }
      />
      <Route
        path="/profile-onboarding"
        element={
          isLoggedIn && !profile ? (
            <ProfileOnboarding />
          ) : (
            <Navigate to={determineDashboardRedirect()} />
          )
        }
      />
      <Route
        path="/user-profile"
        element={isLoggedIn ? <UserProfilePage /> : <Navigate to="/login" />}
      />
      <Route
        path="/dashboard"
        element={
          isLoggedIn ? (
            <Navigate to={determineDashboardRedirect()} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-dashboard"
        element={
          <ProtectedRoute allowedRoles={[2]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      {/* 404 Page - Always accessible, no protection needed */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;