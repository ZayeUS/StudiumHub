import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

// Components & Pages
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

  // 1. Wait for the initial Firebase auth check to complete.
  if (!authHydrated) {
    return <FullScreenLoader isLoading={true} />;
  }

  // 2. NEW: If logged in, ALSO wait for the user's profile to be loaded.
  // This is the fix that prevents the premature redirect.
  if (isLoggedIn && !profile) {
    return <FullScreenLoader isLoading={true} />;
  }

  // Determine the correct redirect path for an authenticated user
  const getAuthenticatedRedirect = () => {
    // By the time this function runs, `profile` is guaranteed to be available.
    if (!profile?.fully_onboarded) {
      return "/profile-onboarding";
    }
    return "/dashboard";
  };

  return (
    <Routes>
      {isLoggedIn ? (
        // --- AUTHENTICATED ROUTES ---
        <Route element={<ProtectedRoute />}>
          {/* These redirects will now have the correct profile data */}
          <Route path="/" element={<Navigate to={getAuthenticatedRedirect()} replace />} />
          <Route path="/login" element={<Navigate to={getAuthenticatedRedirect()} replace />} />
          <Route path="/signup" element={<Navigate to={getAuthenticatedRedirect()} replace />} />

          {/* Onboarding & Main App Routes */}
          <Route element={<OnboardingRoute />}>
            <Route path="/profile-onboarding" element={<OnboardingWizard />} />
          </Route>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-profile" element={<UserProfilePage />} />
          
          <Route element={<AdminProtectedRoute />}>
            <Route path="/organization" element={<OrganizationPage />} />
          </Route>

          {/* Catch-all for any other authenticated routes */}
          <Route path="*" element={<Navigate to={getAuthenticatedRedirect()} replace />} />
        </Route>
      ) : (
        // --- PUBLIC ROUTES ---
        <>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
};