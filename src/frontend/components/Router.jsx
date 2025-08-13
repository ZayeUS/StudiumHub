import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/userStore';

// Import all your components and pages as before...
import { FullScreenLoader } from './FullScreenLoader';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminProtectedRoute } from './AdminProtectedRoute';
import { OnboardingRoute } from './onboarding/OnboardingRoute';
import LandingPage from '../pages/Non-Authenticated/LandingPage';
import { AuthPage } from '../pages/Non-Authenticated/AuthPage';
import { OnboardingWizard } from '../pages/Authenticated/OnboardingWizard';
import { Dashboard } from '../pages/Authenticated/Dashboard';
import { UserProfilePage } from '../pages/Authenticated/UserProfilePage';
import { OrganizationPage } from '../pages/Authenticated/OrganizationPage';

export const AppRouter = () => {
  const { authHydrated, isLoggedIn, profile } = useUserStore();
  const location = useLocation();

  // This loading logic now runs inside a stable component.
  if (!authHydrated || (isLoggedIn && !profile)) {
    return <FullScreenLoader isLoading={true} />;
  }

  const getAuthenticatedRedirect = () => {
    if (!profile?.fully_onboarded) {
      return "/profile-onboarding";
    }
    return "/dashboard";
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* We wrap each page component in a motion.div for the transition */}
        {isLoggedIn ? (
          // --- AUTHENTICATED ROUTES ---
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to={getAuthenticatedRedirect()} replace />} />
            <Route path="/login" element={<Navigate to={getAuthenticatedRedirect()} replace />} />
            <Route path="/signup" element={<Navigate to={getAuthenticatedRedirect()} replace />} />
            
            <Route element={<OnboardingRoute />}>
              <Route path="/profile-onboarding" element={<AnimatedPage><OnboardingWizard /></AnimatedPage>} />
            </Route>
            <Route path="/dashboard" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
            <Route path="/user-profile" element={<AnimatedPage><UserProfilePage /></AnimatedPage>} />
            
            <Route element={<AdminProtectedRoute />}>
              <Route path="/organization" element={<AnimatedPage><OrganizationPage /></AnimatedPage>} />
            </Route>
            
            <Route path="*" element={<Navigate to={getAuthenticatedRedirect()} replace />} />
          </Route>
        ) : (
          // --- PUBLIC ROUTES ---
          <>
            <Route path="/" element={<AnimatedPage><LandingPage /></AnimatedPage>} />
            <Route path="/login" element={<AnimatedPage><AuthPage /></AnimatedPage>} />
            <Route path="/signup" element={<AnimatedPage><AuthPage /></AnimatedPage>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </AnimatePresence>
  );
};

// A simple helper component to wrap our pages with the animation props
const AnimatedPage = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);