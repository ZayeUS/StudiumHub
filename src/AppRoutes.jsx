import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./frontend/pages/Non-Authenticated/LoginPage";
import SignUpPage from "./frontend/pages/Non-Authenticated/SignUpPage";
import Dashboard from "./frontend/pages/Authenticated/Dashboard";
import ProfileOnboarding from "./frontend/pages/Authenticated/ProfileOnboarding";
import UserProfilePage from "./frontend/pages/Authenticated/UserProfilePage";
import NotFoundPage from "./frontend/pages/Non-Authenticated/NotFoundPage";
import { useUserStore } from "./frontend/store/userStore";

const AppRoutes = () => {
  const { isLoggedIn, profile } = useUserStore();

  return (
    <Routes>
      {/* Login is the main entry point */}
      <Route
        path="/"
        element={
          isLoggedIn
            ? profile
              ? <Navigate to="/dashboard" />
              : <Navigate to="/profile-onboarding" />
            : <LoginPage />
        }
      />
      
      {/* Signup route */}
      <Route
        path="/signup"
        element={
          isLoggedIn
            ? profile
              ? <Navigate to="/dashboard" />
              : <Navigate to="/profile-onboarding" />
            : <SignUpPage />
        }
      />
      
      {/* Authenticated routes */}
      <Route
        path="/profile-onboarding"
        element={
          !isLoggedIn 
            ? <Navigate to="/" /> 
            : profile
              ? <Navigate to="/dashboard" />
              : <ProfileOnboarding />
        }
      />
      
      {/* User profile route */}
      <Route
        path="/user-profile"
        element={
          !isLoggedIn 
            ? <Navigate to="/" /> 
            : !profile
              ? <Navigate to="/profile-onboarding" />
              : <UserProfilePage />
        }
      />
      
      {/* Single dashboard route with built-in protection */}
      <Route
        path="/dashboard"
        element={
          !isLoggedIn 
            ? <Navigate to="/" /> 
            : !profile
              ? <Navigate to="/profile-onboarding" />
              : <Dashboard />
        }
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;