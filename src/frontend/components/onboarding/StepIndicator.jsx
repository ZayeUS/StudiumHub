// src/frontend/components/onboarding/StepIndicator.jsx
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from "@/components/ui/progress";

export const StepIndicator = ({ currentStep = 1 }) => {
  const steps = useMemo(
    () => [
      { number: 1, title: 'Your Profile' },
      { number: 2, title: 'Select Plan' },
      { number: 3, title: 'Get Started' },
    ],
    []
  );

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-center">
        {steps.map((step, idx) => {
          const active = currentStep >= step.number;
          const done = currentStep > step.number;
          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center min-w-[84px] text-center">
                <motion.div
                  className={cn(
                    'flex items-center justify-center rounded-full h-9 w-9 text-sm font-bold border-2',
                    active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground'
                  )}
                  initial={false}
                  animate={{ scale: active ? 1 : 0.98 }}
                >
                  <AnimatePresence mode="wait">
                    {done ? (
                      <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Check size={16} />
                      </motion.div>
                    ) : (
                      <motion.span key="num" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        {step.number}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
                <p className={cn('text-xs mt-2 font-medium', active ? 'text-primary' : 'text-muted-foreground')}>
                  {step.title}
                </p>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-3 bg-border">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: '0%' }}
                    animate={{ width: currentStep > idx + 1 ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};