// src/App.jsx
import React, { useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from './frontend/store/userStore';
import { Sidebar } from './frontend/components/navigation/Sidebar';
import { MobileBottomNavigation } from './frontend/components/navigation/MobileBottomNavigation';
import { FullScreenLoader } from './frontend/components/FullScreenLoader';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import LandingPage from './frontend/pages/Non-Authenticated/LandingPage';
import { LoginPage } from './frontend/pages/Non-Authenticated/LoginPage';
import { SignUpPage } from './frontend/pages/Non-Authenticated/SignUpPage';
import { OnboardingWizard } from './frontend/pages/Authenticated/OnboardingWizard';
import { Dashboard } from './frontend/pages/Authenticated/Dashboard';
import { UserProfilePage } from './frontend/pages/Authenticated/UserProfilePage';

import { ProtectedRoute } from './frontend/components/ProtectedRoute';

export const App = () => {
  const {
    isLoggedIn,
    profile,
    listenAuthState,
    authHydrated,
    isDarkMode,
    toggleTheme,
  } = useUserStore();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = listenAuthState();
    return () => unsubscribe();
  }, [listenAuthState]);

  const getRedirect = useCallback(() => {
    if (!isLoggedIn) return '/';
    if (!profile || typeof profile.fully_onboarded !== 'boolean')
      return '/profile-onboarding';
    if (!profile.fully_onboarded) return '/profile-onboarding';
    return '/dashboard';
  }, [isLoggedIn, profile]);

  const showSidebar =
    isLoggedIn && !location.pathname.startsWith('/profile-onboarding');
  const showBottomNav =
    isLoggedIn && !location.pathname.startsWith('/profile-onboarding');
  const isLoading = !authHydrated;

  if (isLoading) {
    return <FullScreenLoader isLoading />;
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground dark:bg-background dark:text-foreground">
        <AnimatePresence mode="wait">
          <motion.div
            className="flex flex-col md:flex-row flex-grow min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* SIDEBAR */}
            {showSidebar && (
              <Sidebar
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
              />
            )}

            {/* MAIN */}
            <main
              className={[
                'flex-grow transition-all',
                showSidebar ? 'md:pl-60' : '',
                showBottomNav ? 'pb-16' : '',
              ].join(' ')}
            >
              <Routes>
                {/* PUBLIC */}
                <Route
                  path="/"
                  element={
                    isLoggedIn ? (
                      <Navigate to={getRedirect()} replace />
                    ) : (
                      <LandingPage />
                    )
                  }
                />
                <Route
                  path="/login"
                  element={
                    isLoggedIn ? (
                      <Navigate to={getRedirect()} replace />
                    ) : (
                      <LoginPage />
                    )
                  }
                />
                <Route
                  path="/signup"
                  element={
                    isLoggedIn ? (
                      <Navigate to={getRedirect()} replace />
                    ) : (
                      <SignUpPage />
                    )
                  }
                />

                {/* PROTECTED */}
                <Route element={<ProtectedRoute />}>
                  <Route
                    path="/profile-onboarding"
                    element={
                      profile?.fully_onboarded ? (
                        <Navigate to="/dashboard" replace />
                      ) : (
                        <OnboardingWizard
                          initialStep={profile ? 2 : 1}
                        />
                      )
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      !profile?.fully_onboarded ? (
                        <Navigate
                          to="/profile-onboarding"
                          replace
                        />
                      ) : (
                        <Dashboard />
                      )
                    }
                  />
                  <Route
                    path="/user-profile"
                    element={<UserProfilePage />}
                  />
                </Route>

                {/* FALLBACK */}
                <Route
                  path="*"
                  element={<Navigate to={getRedirect()} replace />}
                />
              </Routes>
            </main>

            {/* MOBILE NAV */}
            {showBottomNav && (
              <nav className="fixed bottom-0 left-0 right-0 md:hidden">
                <MobileBottomNavigation
                  isDarkMode={isDarkMode}
                  toggleTheme={toggleTheme}
                />
              </nav>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
