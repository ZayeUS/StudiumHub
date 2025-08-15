// src/frontend/components/Router.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/userStore';

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
import { CourseDetailPage } from '../pages/Authenticated/CourseDetailPage';
import { QuizPlayerPage } from '../pages/Authenticated/QuizPlayerPage';
import { QuizEditorPage } from '../pages/Authenticated/QuizEditorPage';
import { PublicCoursePage } from '../pages/Non-Authenticated/PublicCoursePage'; // <-- Import the new page
import { PublicModulePage } from '../pages/Non-Authenticated/PublicModulePage'; // <-- Import the new module page
import { PublicFlashcardPage } from '../pages/Non-Authenticated/PublicFlashcardPage'; // <-- Import the new flashcard page
import { PublicQuizPage } from '../pages/Non-Authenticated/PublicQuizPage'; // <-- Import the new quiz page



export const AppRouter = () => {
  const { authHydrated, isLoggedIn, profile } = useUserStore();
  const location = useLocation();

  if (!authHydrated) {
    return <FullScreenLoader isLoading={true} />;
  }

  const getAuthenticatedRedirect = () => {
    return profile?.fully_onboarded ? "/dashboard" : "/profile-onboarding";
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {isLoggedIn ? (
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
              <Route path="/course/:courseId" element={<AnimatedPage><CourseDetailPage /></AnimatedPage>} />
              <Route path="/course/:courseId/quiz/:quizId" element={<AnimatedPage><QuizPlayerPage /></AnimatedPage>} />
              <Route path="/course/:courseId/quiz/:quizId/edit" element={<AnimatedPage><QuizEditorPage /></AnimatedPage>} />


            </Route>
            <Route path="*" element={<Navigate to={getAuthenticatedRedirect()} replace />} />
          </Route>
        ) : (
          <>
          <Route path="/course/public/:courseId" element={<AnimatedPage><PublicCoursePage /></AnimatedPage>} />
          <Route path="/learn/module/:moduleId" element={<AnimatedPage><PublicModulePage /></AnimatedPage>} /> {/* <-- Add this new route */}
          <Route path="/course/:courseId/deck/:deckId" element={<AnimatedPage><PublicFlashcardPage /></AnimatedPage>} />
          <Route path="/course/:courseId/quiz/:quizId" element={<AnimatedPage><PublicQuizPage /></AnimatedPage>} />
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

const AnimatedPage = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="h-full"
  >
    {children}
  </motion.div>
);