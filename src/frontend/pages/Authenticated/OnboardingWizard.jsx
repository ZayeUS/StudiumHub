// src/frontend/pages/Authenticated/OnboardingWizard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Sun, Moon, Sparkles } from 'lucide-react';

import { postData, putData } from '../../utils/BackendRequestHelper';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

export const OnboardingWizard = ({ initialStep = 1 }) => {
  const [step, setStep] = useState(initialStep);
  const [apiError, setApiError] = useState('');
  const { profile, setProfile, clearUser, loading, setLoading, isDarkMode, toggleTheme, userSubscriptionStatus } = useUserStore();
  const { upload: uploadAvatar } = useDirectUpload();
  const navigate = useNavigate();

  useEffect(() => setStep(initialStep), [initialStep]);

  // Skip plan step if user is already subscribed
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
      // Step 1: Create/update the profile
      const profileRes = await postData('/profile', formData);
      let finalProfile = profileRes?.profile;

      if (!finalProfile) throw new Error('Profile creation failed.');

      // Step 2: Upload avatar if provided
      if (avatarFile) {
        try {
          const updatedProfile = await uploadAvatar(avatarFile);
          finalProfile = updatedProfile;
        } catch (avatarError) {
          console.error('Avatar upload failed:', avatarError);
          // Continue with profile creation even if avatar upload fails
          setApiError('Profile created, but avatar upload failed. You can upload it later.');
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
      title: 'Create your profile',
      description: 'A few details to personalize your workspace.',
      component: (
        <ProfileStep 
          onProfileComplete={handleProfileComplete} 
          loading={loading} 
          profile={profile}
        />
      ),
    },
    {
      title: 'Select your plan',
      description: 'Pick a plan that fits now—you can change anytime.',
      component: (
        <SubscriptionStep
          onPlanSelected={handlePlanSelected}
          backStep={canGoBack ? () => setStep(1) : null}
          loading={loading}
          setLoading={setLoading}
        />
      ),
    },
    {
      title: 'Welcome aboard',
      description: 'You`re ready to get to work.',
      component: <WelcomeStep />,
    },
  ];

  const currentStepDetails = steps[step - 1];

  return (
    <div className="min-h-screen py-8 px-4 flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">Setup takes ~2 minutes</span>
            </div>
            <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}>
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to {isDarkMode ? "Light" : "Dark"} Mode</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <StepIndicator currentStep={step} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{currentStepDetails.title}</CardTitle>
              <CardDescription>{currentStepDetails.description}</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              {apiError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}
              <AnimatePresence mode="wait">
                {React.cloneElement(currentStepDetails.component, { key: step })}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};