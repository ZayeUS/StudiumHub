// src/frontend/components/OnboardingRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { FullScreenLoader } from '../FullScreenLoader';

export const OnboardingRoute = () => {
  // We need both authHydrated and profile from the store
  const { profile, authHydrated } = useUserStore();

  // If we are still waiting for the initial auth and data fetch to complete,
  // show the main loader. This is the key change.
  if (!authHydrated) {
    return <FullScreenLoader isLoading={true} />;
  }

  // If hydration is complete AND the user has already finished onboarding,
  // send them to the dashboard.
  if (profile && profile.fully_onboarded) {
    return <Navigate to="/dashboard" replace />;
  }

  // If hydration is complete and they are not fully onboarded (profile might be null
  // or fully_onboarded is false), let them pass through to the OnboardingWizard.
  return <Outlet />;
};