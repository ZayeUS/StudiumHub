import React, { useEffect, useMemo, useCallback } from "react";
import { CssBaseline, Box, useMediaQuery, ThemeProvider } from "@mui/material";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useUserStore } from "./frontend/store/userStore";
import { createAppTheme } from "./frontend/styles/theme";
import { Sidebar } from "./frontend/components/navigation/Sidebar";
import { MobileBottomNavigation } from "./frontend/components/navigation/MobileBottomNavigation";
import { FullScreenLoader } from "./frontend/components/FullScreenLoader";
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import { LoginPage } from "./frontend/pages/Non-Authenticated/LoginPage";
import { SignUpPage } from "./frontend/pages/Non-Authenticated/SignUpPage";
import { Dashboard } from "./frontend/pages/Authenticated/Dashboard"; // <-- Name updated here
import { OnboardingWizard } from "./frontend/pages/Authenticated/OnboardingWizard";
import { UserProfilePage } from "./frontend/pages/Authenticated/UserProfilePage";
import { PaymentSuccessPage } from "./frontend/pages/Authenticated/PaymentSuccessPage";
import { ProtectedRoute } from "./frontend/components/ProtectedRoute";
import LandingPage from "./frontend/pages/Non-Authenticated/LandingPage"; // Import the LandingPage

const DRAWER_WIDTH = 60;

export const App = () => {
  const {
    isLoggedIn, profile, listenAuthState, authHydrated,
    isDarkMode, toggleTheme
  } = useUserStore();
  
  const theme = useMemo(() => createAppTheme(isDarkMode ? "dark" : "light"), [isDarkMode]);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = listenAuthState();
    return () => unsubscribe();
  }, [listenAuthState]);
  
  const getRedirect = useCallback(() => {
    if (!isLoggedIn) return "/"; // Default to landing page if not logged in
    
    if (!profile || !profile.fully_onboarded) {
      return "/profile-onboarding";
    }

    return "/dashboard";
  }, [isLoggedIn, profile]);

  const showSidebar = isLoggedIn && location.pathname !== "/profile-onboarding";
  const showBottomNav = isLoggedIn && isMobile && location.pathname !== "/profile-onboarding";
  
  const isLoading = !authHydrated;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FullScreenLoader isLoading={isLoading} />
      


      <AnimatePresence>
        {!isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ display: 'flex', flexGrow: 1, minHeight: '100vh' }}>
            <Box sx={{ display: "flex", flexGrow: 1 }}>
              {showSidebar && !isMobile && <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
              <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default", ml: showSidebar && !isMobile ? `${isLoggedIn ? 80 : 0}px` : 0, pb: showBottomNav ? 10 : 0 }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <LandingPage />} />
                  <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage />} />
                  <Route path="/signup" element={isLoggedIn ? <Navigate to="/dashboard" /> : <SignUpPage />} />
                  
                  {/* Protected Routes */}
                  <Route
                    path="/profile-onboarding"
                    element={
                      <ProtectedRoute>
                        {profile && profile.fully_onboarded ? (
                          <Navigate to="/dashboard" replace />
                        ) : (
                          <OnboardingWizard initialStep={profile ? 2 : 1} />
                        )}
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/user-profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
                  
                  {/* Catch-all Redirect */}
                  <Route path="*" element={<Navigate to={getRedirect()} />} />
                </Routes>
              </Box>
              {showBottomNav && <MobileBottomNavigation isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
};