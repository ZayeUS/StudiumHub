// src/frontend/components/onboarding/WelcomeStep.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, PartyPopper, Sparkles, ShieldCheck, BadgeCheck } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { postData } from '../../utils/BackendRequestHelper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const panelSwap = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 220, damping: 26 } },
    exit: { opacity: 0, x: -40, transition: { duration: 0.18 } },
};

export const WelcomeStep = () => {
  const navigate = useNavigate();
  const { setProfile, setLoading, loading } = useUserStore();

  const handleGoToDashboard = async () => {
    setLoading(true);
    try {
      const response = await postData('/profile/complete-onboarding', {});
      if (response?.profile) setProfile(response.profile);
      navigate('/dashboard');
    } catch {
      console.error('Failed to finalize onboarding');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={panelSwap} initial="hidden" animate="visible" exit="exit" className="space-y-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 12, -12, 0] }}
          transition={{ type: 'tween', duration: 0.5, ease: 'easeInOut', delay: 0.1 }}
        >
          <PartyPopper className="mx-auto h-16 w-16 text-yellow-400 mb-2" />
        </motion.div>
        <h2 className="text-3xl font-bold">You’re all set!</h2>
        <p className="text-muted-foreground my-2 max-w-md mx-auto">
          Your profile is complete and your plan is active. Let’s get you to value fast.
        </p>
      <Card className="bg-muted/30 text-left">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm"><Sparkles className="h-4 w-4 text-primary" />Explore templates</div>
            <div className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-primary" />Invite your team</div>
            <div className="flex items-center gap-2 text-sm"><BadgeCheck className="h-4 w-4 text-primary" />Connect data sources</div>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-center">
        <Button size="lg" onClick={handleGoToDashboard} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Go to my dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};