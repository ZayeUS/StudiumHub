// File: src/App.jsx
import React, { useEffect, useMemo, useCallback } from "react";
import { CssBaseline, Box, useMediaQuery, ThemeProvider } from "@mui/material";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useUserStore } from "./frontend/store/userStore";
import { createAppTheme } from "./frontend/styles/theme";
import { Sidebar } from "./frontend/components/navigation/Sidebar";
import { MobileBottomNavigation } from "./frontend/components/navigation/MobileBottomNavigation";
import { LoadingModal } from "./frontend/components/LoadingModal";

// Pages
import { LoginPage } from "./frontend/pages/Non-Authenticated/LoginPage";
import { SignUpPage } from "./frontend/pages/Non-Authenticated/SignUpPage";
import { AdminDashboard } from "./frontend/pages/Authenticated/AdminDashboard";
import { UserDashboard } from "./frontend/pages/Authenticated/UserDashboard";
import { ProfileOnboarding } from "./frontend/pages/Authenticated/ProfileOnboarding";
import { UserProfilePage } from "./frontend/pages/Authenticated/UserProfilePage";
import { StripeDashboard } from "./frontend/pages/Authenticated/StripeDashboard";
import { PaymentSuccessPage } from "./frontend/pages/Authenticated/PaymentSuccessPage";
import { SubscriptionSelectionPage } from "./frontend/pages/Authenticated/SubscriptionSelectionPage"; // Import new page
import { ProtectedRoute } from "./frontend/components/ProtectedRoute";

const DRAWER_WIDTH = 60;

export const App = () => {
  const { isLoggedIn, profile, roleId, listenAuthState, authHydrated, loading, userSubscriptionStatus } = useUserStore(); 
  
  // Initialize theme from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Create theme toggle handler (memoized to prevent recreation)
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prevMode => {
      const nextMode = !prevMode;
      localStorage.setItem("theme", nextMode ? "dark" : "light");
      return nextMode;
    });
  }, []);

  // Generate theme object
  const theme = useMemo(() => 
    createAppTheme(isDarkMode ? "dark" : "light"), 
    [isDarkMode]
  );
  
  // Responsive layout hooks
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  // Cross-tab theme synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        setIsDarkMode(e.newValue === 'dark');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // System theme preference change listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only apply if user hasn't explicitly set a preference
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    
    // Older browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  // Initialize authentication listener
  useEffect(() => {
    const unsubscribe = listenAuthState();
    return unsubscribe;
  }, [listenAuthState]);

  // Layout conditions
  // Hide sidebar/mobile nav on onboarding and subscription selection pages
  const showSidebar = isLoggedIn && !isMobile && location.pathname !== "/profile-onboarding" && location.pathname !== "/subscription-selection"; 
  const showMobileNav = isLoggedIn && isMobile && location.pathname !== "/profile-onboarding" && location.pathname !== "/subscription-selection"; 

  // Redirect logic based on the new flow
  const getRedirect = useCallback(() => {
    if (!isLoggedIn) return "/login";
    if (!profile) return "/profile-onboarding";
    
    // If profile exists, and subscription is null (still fetching) or explicitly unsubscribed/inactive,
    // redirect to subscription selection.
    // userSubscriptionStatus === 'free' will allow redirection to dashboard
    if (userSubscriptionStatus === null || userSubscriptionStatus === 'unsubscribed' || userSubscriptionStatus === 'inactive') {
      return "/subscription-selection";
    }

    // If profile is complete AND subscription is active/trialing/free, go to dashboard
    return roleId === 1 ? "/admin-dashboard" : "/user-dashboard";
  }, [isLoggedIn, profile, roleId, userSubscriptionStatus]);


  // Loading states - show loading screen during authentication
  // Added userSubscriptionStatus to loading condition to ensure it's fetched before redirecting
  if (!authHydrated || loading || (isLoggedIn && profile && userSubscriptionStatus === null)) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingModal message={!authHydrated ? "Loading..." : "Just a moment..."} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar for desktop */}
        {showSidebar && (
          <Sidebar
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            isMobile={isMobile}
          />
        )}

        {/* Main content area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "background.default",
            ml: showSidebar ? `${DRAWER_WIDTH}px` : 0,
            pb: showMobileNav ? 10 : 0,
          }}
        >
          <Routes>
            {/* Authentication routes */}
            <Route
              path="/"
              element={ <Navigate to={getRedirect()} /> }
            />
            <Route
              path="/login"
              element={
                isLoggedIn && profile && (userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing' || userSubscriptionStatus === 'free') // Now also redirect if free
                  ? <Navigate to={getRedirect()} />
                  : <LoginPage />
              }
            />
            <Route
              path="/signup"
              element={
                isLoggedIn && profile && (userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing' || userSubscriptionStatus === 'free') // Now also redirect if free
                  ? <Navigate to={getRedirect()} />
                  : <SignUpPage />
              }
            />

            {/* Onboarding */}
            <Route
              path="/profile-onboarding"
              element={
                isLoggedIn && !profile
                  ? <ProfileOnboarding />
                  : <Navigate to={getRedirect()} />
              }
            />

            {/* Subscription Selection Page */}
            <Route
              path="/subscription-selection"
              element={
                <ProtectedRoute>
                  <SubscriptionSelectionPage />
                </ProtectedRoute>
              }
            />

            {/* Protected routes with role-based access */}
            <Route path="/user-profile" element={
              <ProtectedRoute><UserProfilePage /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><Navigate to={getRedirect()} /></ProtectedRoute>
            } />
            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRoles={[1]}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/user-dashboard" element={
              <ProtectedRoute allowedRoles={[2]}><UserDashboard /></ProtectedRoute>
            } />
            {/* Stripe dashboard and payment success still go here, as they are part of the payment flow */}
            <Route path="/stripe-dashboard" element={
              <ProtectedRoute allowedRoles={[1, 2]}><StripeDashboard /></ProtectedRoute>
            } />
            <Route path="/payment-success" element={
              <ProtectedRoute allowedRoles={[1, 2]}><PaymentSuccessPage /></ProtectedRoute>
            } />

            {/* Fallback route for unmatched paths */}
            <Route path="*" element={<Navigate to={getRedirect()} />} />
          </Routes>
        </Box>

        {/* Mobile navigation bar */}
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