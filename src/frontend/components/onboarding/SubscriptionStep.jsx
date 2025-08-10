// src/frontend/components/onboarding/SubscriptionStep.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, HelpCircle, CheckCircle2 } from 'lucide-react';
import { getData, postData } from '../../utils/BackendRequestHelper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STRIPE_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK;

const panelSwap = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 220, damping: 26 } },
    exit: { opacity: 0, x: -40, transition: { duration: 0.18 } },
};

export const SubscriptionStep = ({ onPlanSelected, backStep, loading, setLoading }) => {
  const [plans, setPlans] = useState([]);
  const [fetchError, setFetchError] = useState('');
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const fetched = await getData('/plans');
        setPlans(fetched || []);
      } catch (e) {
        setFetchError('Could not load plans. Please try again later.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchPlans();
  }, []);

  const handleFreeTier = async () => {
    setLoading(true);
    try {
      await postData('/stripe/select-free-tier', {});
      onPlanSelected('free');
    } catch {
      setFetchError('Failed to select free tier. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanFeatures = (name) => {
    const n = (name || "").toLowerCase();
    if (n === "free") return ["1 Project", "Basic Analytics", "Community Support"];
    return ["10 Projects", "Advanced Analytics", "Priority Email Support", "Custom Branding"];
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{fetchError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div variants={panelSwap} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <motion.div
            key={plan.plan_id}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <Card className={cn('flex h-full flex-col text-center md:text-left', plan.name?.toLowerCase() !== 'free' && 'border-primary shadow-lg')}>
              <CardHeader>
                <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.name?.toLowerCase() !== 'free' && <Badge variant="default">Best Value</Badge>}
                </div>
                 <div className="text-3xl font-extrabold mt-2">
                    ${Number(plan.price_monthly || 0).toFixed(2)}
                    <span className="text-base font-normal text-muted-foreground">/mo</span>
                  </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {getPlanFeatures(plan.name).map((feature) => (
                    <li key={feature} className="flex items-center justify-center md:justify-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.name?.toLowerCase() === 'free' ? (
                  <Button onClick={handleFreeTier} variant="outline" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Get started for free'}
                  </Button>
                ) : (
                  <Button asChild className="w-full font-bold" disabled={loading}>
                    <a href={STRIPE_PAYMENT_LINK}>Go to checkout</a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-4">
        {backStep ? (
          <Button onClick={backStep} variant="outline" disabled={loading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : <span />}
        
      </div>
    </motion.div>
  );
};