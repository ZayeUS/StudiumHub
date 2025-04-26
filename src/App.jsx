import React, { useEffect } from "react";
import { CssBaseline, Box, useMediaQuery, useTheme } from "@mui/material";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./frontend/pages/Non-Authenticated/LandingPage";
import LoginPage from "./frontend/pages/Non-Authenticated/LoginPage";
import SignUpPage from "./frontend/pages/Non-Authenticated/SignUpPage";
import AdminDashboard from "./frontend/pages/Authenticated/AdminDashboard";
import UserDashboard from "./frontend/pages/Authenticated/UserDashboard";
import ProfileOnboarding from "./frontend/pages/Authenticated/ProfileOnboarding";
import UserProfilePage from "./frontend/pages/Authenticated/UserProfilePage";
import NavBar from "./frontend/components/navigation/NavBar";
import Sidebar from "./frontend/components/navigation/Sidebar";
import MobileBottomNavigation from "./frontend/components/navigation/MobileBottomNavigation";
import ProtectedRoute from "./frontend/components/ProtectedRoute";
import LoadingModal from "./frontend/components/LoadingModal";
import { useUserStore } from "./frontend/store/userStore";

const drawerWidth = 60;

const App = () => {
  const { isLoggedIn, profile, roleId, listenAuthState, authHydrated, loading } = useUserStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = listenAuthState();
    return unsubscribe;
  }, [listenAuthState]);

  const determineDashboardRedirect = () => {
    if (roleId === 1) return "/admin-dashboard";
    if (roleId === 2) return "/user-dashboard";
    return "/";
  };

  const showSidebar = isLoggedIn && !isMobile && location.pathname !== "/profile-onboarding";
  const showMobileNav = isLoggedIn && isMobile && location.pathname !== "/profile-onboarding";
  const showNavBar = !isLoggedIn && location.pathname !== "/profile-onboarding";

  // 🛑 IMPORTANT: show a special LoadingModal if authHydrated hasn't finished yet
  if (!authHydrated) {
    return <LoadingModal message="Waking up the dragon..." />;
  }

  return (
    <>
      <CssBaseline />

      {/* 🔥 Add spinner globally if loading */}
      {loading && <LoadingModal message="Just a moment..." />}

      <Box sx={{ display: "flex" }}>
        {showSidebar && <Sidebar />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "background.default",
            ml: showSidebar ? `${drawerWidth}px` : 0,
            transition: theme.transitions.create("margin-left", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          {showNavBar && <NavBar />}

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
            <Route
              path="*"
              element={
                isLoggedIn ? (
                  <Navigate to={determineDashboardRedirect()} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
          </Routes>
        </Box>

        {showMobileNav && <MobileBottomNavigation />}
      </Box>
    </>
  );
};

export default App;
