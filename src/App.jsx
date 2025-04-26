import React, { useEffect } from "react";
import { CssBaseline, Box, useMediaQuery, useTheme } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./frontend/pages/Non-Authenticated/LandingPage";
import LoginPage from "./frontend/pages/Non-Authenticated/LoginPage";
import SignUpPage from "./frontend/pages/Non-Authenticated/SignUpPage";
import AdminDashboard from "./frontend/pages/Authenticated/AdminDashboard";
import UserDashboard from "./frontend/pages/Authenticated/UserDashboard";
import ProfileOnboarding from "./frontend/pages/Authenticated/ProfileOnboarding";
import UserProfilePage from "./frontend/pages/Authenticated/UserProfilePage"; // Importing UserProfilePage
import NavBar from "./frontend/components/navigation/NavBar";
import Sidebar from "./frontend/components/navigation/Sidebar";
import MobileBottomNavigation from "./frontend/components/navigation/MobileBottomNavigation";
import ProtectedRoute from "./frontend/components/ProtectedRoute";
import { useUserStore } from "./frontend/store/userStore";
import LoadingModal from "./frontend/components/LoadingModal";

const drawerWidth = 60;

const App = () => {
  const { isLoggedIn, profile, roleId, loading, listenAuthState } = useUserStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const unsubscribe = listenAuthState();
    return unsubscribe;
  }, [listenAuthState]);

  // If still loading, show the loading screen
  if (loading) return <LoadingModal open={loading} />;

  const determineDashboardRedirect = () => {
    if (roleId === 1) {
      return "/admin-dashboard"; // Redirect to Admin Dashboard
    } else if (roleId === 2) {
      return "/user-dashboard"; // Redirect to User Dashboard
    } else {
      return "/"; // Default redirect (fallback if role is unknown)
    }
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        {/* Hide Sidebar and Bottom Navigation on ProfileOnboardingPage */}
        {isLoggedIn && !isMobile && window.location.pathname !== "/profile-onboarding" && <Sidebar />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "background.default",
            ml:
              isLoggedIn &&
              !isMobile &&
              window.location.pathname !== "/profile-onboarding"
                ? `${drawerWidth}px`
                : 0,
            transition: theme.transitions.create("margin-left", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          {/* Hide NavBar on ProfileOnboardingPage */}
          {!isLoggedIn && window.location.pathname !== "/profile-onboarding" && <NavBar />}
          <Routes>
            {/* Redirect from landing page if logged in */}
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

            {/* Redirect from login if logged in */}
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

            {/* Redirect from signup if logged in */}
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

            {/* Profile onboarding should be accessible when logged in */}
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

            {/* User Profile Page */}
            <Route
              path="/user-profile"
              element={
                isLoggedIn ? (
                  <UserProfilePage />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Protecting the dashboard route */}
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

            {/* Admin Dashboard Route */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRole={1}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* User Dashboard Route */}
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute allowedRole={2}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route - redirect to dashboard if logged in, landing page if not */}
            <Route
              path="*"
              element={
                isLoggedIn ? <Navigate to={determineDashboardRedirect()} /> : <Navigate to="/" />
              }
            />
          </Routes>
        </Box>
        {isLoggedIn && isMobile && window.location.pathname !== "/profile-onboarding" && <MobileBottomNavigation />}
      </Box>
    </>
  );
};

export default App;
