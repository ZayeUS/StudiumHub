import React, { useEffect, useState, useMemo } from "react";
import {
  CssBaseline,
  Box,
  useMediaQuery,
  ThemeProvider,
} from "@mui/material";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useUserStore } from "./frontend/store/userStore";
import { createAppTheme } from "./frontend/styles/theme"; // ✅ ensure this path is correct

// Pages
import { LoginPage } from "./frontend/pages/Non-Authenticated/LoginPage";
import { SignUpPage } from "./frontend/pages/Non-Authenticated/SignUpPage";
import { AdminDashboard } from "./frontend/pages/Authenticated/AdminDashboard";
import { UserDashboard } from "./frontend/pages/Authenticated/UserDashboard";
import { ProfileOnboarding } from "./frontend/pages/Authenticated/ProfileOnboarding";
import { UserProfilePage } from "./frontend/pages/Authenticated/UserProfilePage";

// Components
import { Sidebar } from "./frontend/components/navigation/Sidebar";
import { MobileBottomNavigation } from "./frontend/components/navigation/MobileBottomNavigation";
import { ProtectedRoute } from "./frontend/components/ProtectedRoute";
import { LoadingModal } from "./frontend/components/LoadingModal";

const drawerWidth = 60;

export const App = () => {
  const {
    isLoggedIn,
    profile,
    roleId,
    listenAuthState,
    authHydrated,
    loading,
  } = useUserStore();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const theme = useMemo(() => createAppTheme(isDarkMode ? "dark" : "light"), [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = listenAuthState();
    return () => unsubscribe();
  }, [listenAuthState]);

  const showSidebar = isLoggedIn && !isMobile && location.pathname !== "/profile-onboarding";
  const showMobileNav = isLoggedIn && isMobile && location.pathname !== "/profile-onboarding";

  const getRedirect = () => {
    if (roleId === 1) return "/admin-dashboard";
    if (roleId === 2) return "/user-dashboard";
    return "/";
  };

  if (!authHydrated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingModal message="Loading..." />
      </ThemeProvider>
    );
  }

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingModal message="Just a moment..." />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        {showSidebar && (
          <Sidebar
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            isMobile={isMobile}
            onClose={() => {}}
          />
        )}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "background.default",
            ml: showSidebar ? `${drawerWidth}px` : 0,
            pb: showMobileNav ? 10 : 0,
            transition: theme.transitions.create(["margin-left", "padding-bottom"]),
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                isLoggedIn
                  ? <Navigate to={profile ? getRedirect() : "/profile-onboarding"} />
                  : <LoginPage />
              }
            />
            <Route
              path="/login"
              element={
                isLoggedIn
                  ? <Navigate to={profile ? getRedirect() : "/profile-onboarding"} />
                  : <LoginPage />
              }
            />
            <Route
              path="/signup"
              element={
                isLoggedIn
                  ? <Navigate to={profile ? getRedirect() : "/profile-onboarding"} />
                  : <SignUpPage />
              }
            />
            <Route
              path="/profile-onboarding"
              element={
                isLoggedIn && !profile
                  ? <ProfileOnboarding />
                  : <Navigate to={getRedirect()} />
              }
            />
            <Route
              path="/user-profile"
              element={
                isLoggedIn
                  ? <UserProfilePage />
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="/dashboard"
              element={
                isLoggedIn
                  ? <Navigate to={getRedirect()} />
                  : <Navigate to="/login" />
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
            <Route path="*" element={<Navigate to={isLoggedIn ? getRedirect() : "/"} />} />
          </Routes>
        </Box>
        {showMobileNav && (
          <MobileBottomNavigation
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
          />
        )}
      </Box>
    </ThemeProvider>
  );
};
