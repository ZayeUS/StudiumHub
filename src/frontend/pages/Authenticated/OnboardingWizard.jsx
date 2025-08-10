// src/frontend/pages/Authenticated/OnboardingWizard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Sun, Moon, Sparkles, User, CreditCard, PartyPopper } from 'lucide-react';

import { postData, putData } from '../../utils/BackendRequestHelper'; // Make sure putData is imported
import { useUserStore } from '../../store/userStore';
import { useDirectUpload } from '../../../hooks/useDirectUpload';
import { auth } from '../../../firebase';

// Onboarding Step Components
import { StepIndicator } from '../../components/onboarding/StepIndicator';
import { ProfileStep } from '../../components/onboarding/ProfileStep';
import { SubscriptionStep } from '../../components/onboarding/SubscriptionStep';
import { WelcomeStep } from '../../components/onboarding/WelcomeStep';

// shadcn/ui
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const panelVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 220, damping: 26 } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.18 } },
};

const sidePanelVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const OnboardingWizard = ({ initialStep = 1 }) => {
  const [step, setStep] = useState(initialStep);
  const [apiError, setApiError] = useState('');
  const { profile, setProfile, clearUser, loading, setLoading, isDarkMode, toggleTheme, userSubscriptionStatus } = useUserStore();
  const { upload: uploadAvatar } = useDirectUpload();
  const navigate = useNavigate();

  useEffect(() => setStep(initialStep), [initialStep]);

  useEffect(() => {
    const isActive = userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing' || userSubscriptionStatus === 'free_active';
    if (step === 2 && isActive) {
      setStep(3);
    }
  }, [step, userSubscriptionStatus]);
  
  const handleProfileComplete = async (formData, avatarFile) => {
    setLoading(true);
    setApiError('');
    try {
      let profileRes;
      
      // *** THE FIX IS HERE ***
      // If a profile already exists in our global state, we UPDATE it with PUT.
      // Otherwise, we CREATE it with POST.
      if (profile) {
        profileRes = await putData('/profile', {
          first_name: formData.first_name,
          last_name: formData.last_name,
        });
      } else {
        profileRes = await postData('/profile', {
          first_name: formData.first_name,
          last_name: formData.last_name,
        });
      }

      let finalProfile = profileRes?.profile;

      if (!finalProfile) throw new Error('Profile creation/update failed.');

      if (avatarFile) {
        try {
          const updatedProfile = await uploadAvatar(avatarFile);
          finalProfile = updatedProfile;
        } catch (avatarError) {
          console.error('Avatar upload failed:', avatarError);
          setApiError('Profile saved, but avatar upload failed. You can try again later.');
        }
      }
      
      setProfile(finalProfile);
      setStep(2);
    } catch (err) {
      setApiError(err?.message || 'Something went wrong saving your profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelected = (plan) => {
    if (plan === 'free') setStep(3);
  };

  const handleLogout = async () => {
    await auth.signOut();
    clearUser();
    navigate('/login');
  };
  
  const canGoBack = step === 2 && initialStep === 1;

  const steps = [
    {
      step: 1,
      title: 'Create your profile',
      description: 'A few details to personalize your workspace.',
      Icon: User,
      Component: <ProfileStep onProfileComplete={handleProfileComplete} loading={loading} profile={profile} />,
    },
    {
      step: 2,
      title: 'Select your plan',
      description: 'Pick a plan that fits your needs. You can change it anytime.',
      Icon: CreditCard,
      Component: <SubscriptionStep onPlanSelected={handlePlanSelected} backStep={canGoBack ? () => setStep(1) : null} loading={loading} setLoading={setLoading} />,
    },
    {
      step: 3,
      title: 'Welcome aboard!',
      description: "You're all set and ready to get to work.",
      Icon: PartyPopper,
      Component: <WelcomeStep />,
    },
  ];

  const currentStepDetails = steps[step - 1];
  const CurrentIcon = currentStepDetails.Icon;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}>
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Switch Theme</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Logout</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
      </div>

      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
        <div className="hidden bg-muted lg:flex flex-col items-center justify-center p-10 text-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={sidePanelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex flex-col items-center"
            >
              <div className="mb-6 rounded-full bg-primary/10 p-4 text-primary">
                <CurrentIcon className="h-12 w-12" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">{currentStepDetails.title}</h2>
              <p className="text-muted-foreground mt-3 max-w-sm">{currentStepDetails.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="flex items-center justify-center py-12 px-4 sm:px-0">
          <div className="mx-auto w-full max-w-md space-y-6">
            <StepIndicator currentStep={step} />
            {apiError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}
            <AnimatePresence mode="wait">
              {React.cloneElement(currentStepDetails.Component, { key: step })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
