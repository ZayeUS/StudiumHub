// src/frontend/pages/Authenticated/OnboardingWizard.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  PersonStanding,
  LogOut,
  ArrowRight,
  Check,
  ArrowLeft,
  Sun,
  Moon,
  Camera,
  Edit,
  Loader2,
  Star,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  BadgeCheck,
} from "lucide-react";

import { postData, uploadFile, getData } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";
import { auth } from "../../../firebase";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const STRIPE_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK;

/* --------------------------- Motion Presets --------------------------- */
const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 16 } },
};
const panelSwap = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 220, damping: 26 } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.18 } },
};

/* ---------------------------- Step Indicator --------------------------- */
const StepIndicator = ({ currentStep = 1 }) => {
  const steps = useMemo(
    () => [
      { number: 1, title: "Your Profile" },
      { number: 2, title: "Select Plan" },
      { number: 3, title: "Get Started" },
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
              <div className="flex flex-col items-center min-w-[84px]">
                <motion.div
                  className={cn(
                    "flex items-center justify-center rounded-full h-9 w-9 text-sm font-bold border-2",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"
                  )}
                  initial={false}
                  animate={{ scale: active ? 1 : 0.98 }}
                  transition={{ duration: 0.2 }}
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
                <p className={cn("text-xs mt-2 font-medium", active ? "text-primary" : "text-muted-foreground")}>{step.title}</p>
              </div>
              {idx < steps.length - 1 && (
                <motion.div
                  className="flex-1 h-0.5 mx-3"
                  initial={false}
                  animate={{ backgroundColor: currentStep > idx + 1 ? "hsl(var(--primary))" : "hsl(var(--border))" }}
                  transition={{ duration: 0.25 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${(currentStep / 3) * 100}%` }}
          transition={{ type: "spring", stiffness: 160, damping: 18 }}
        />
      </div>
    </div>
  );
};

/* ----------------------------- Photo Upload ---------------------------- */
const PhotoUpload = ({ onFileSelect, loading }) => {
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles?.[0];
      if (!file) return;
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [] },
    multiple: false,
    disabled: loading,
  });

  return (
    <motion.div className="flex flex-col items-center" variants={fadeIn}>
      <div
        {...getRootProps()}
        className={cn(
          "relative w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all",
          isDragActive ? "border-primary bg-primary/10" : "border-border",
          loading && "opacity-70 pointer-events-none"
        )}
        aria-label="Upload profile photo"
      >
        <input {...getInputProps()} />
        <Avatar className="w-full h-full">
          <AvatarImage src={preview || undefined} alt="User avatar" />
          <AvatarFallback>
            <PersonStanding className="w-12 h-12 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "absolute inset-0 w-full h-full bg-black/50 text-white flex flex-col items-center justify-center rounded-full transition-opacity",
            preview ? "opacity-0 hover:opacity-100" : "opacity-100"
          )}
        >
          {preview ? <Edit /> : <Camera />}
          <p className="text-xs mt-1">{preview ? "Change" : "Upload"}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-2">Optional, but recommended for a personal touch.</p>
    </motion.div>
  );
};

/* ------------------------------ Step 1 --------------------------------- */
const ProfileStep = ({ onProfileComplete, loading }) => {
  const [form, setForm] = useState({ first_name: "", last_name: "" });
  const [errors, setErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = "First name is required.";
    if (!form.last_name.trim()) errs.last_name = "Last name is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) onProfileComplete(form, avatarFile);
  };

  return (
    <motion.div variants={panelSwap} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Tell us about yourself</h2>
        <p className="text-muted-foreground">We’ll use this to personalize your experience.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <PhotoUpload onFileSelect={setAvatarFile} loading={loading} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="space-y-2">
            <Label htmlFor="first_name">First name</Label>
            <Input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} autoComplete="given-name" />
            {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last name</Label>
            <Input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} autoComplete="family-name" />
            {errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}
          </div>
        </div>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Your info is private. Edit anytime in Profile.
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <span />
        <Button onClick={handleNext} size="lg" className="w-full sm:w-auto" disabled={loading} aria-disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!loading ? "Next: Choose plan" : "Saving profile…"}
          {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </motion.div>
  );
};

/* ------------------------------ Step 2 --------------------------------- */
const PlanBadge = ({ children }) => (
  <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
    <Star className="h-3 w-3" />
    {children}
  </div>
);

const SubscriptionStep = ({ onPlanSelected, backStep, loading, setLoading }) => {
  const [plans, setPlans] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsFetching(true);
        const fetched = await getData("/plans");
        setPlans(fetched || []);
      } catch (e) {
        setFetchError("Could not load plans. Please try again later.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchPlans();
  }, []);

  const handleFreeTier = async () => {
    setLoading(true);
    try {
      await postData("/stripe/select-free-tier", {});
      onPlanSelected("free");
    } catch {
      setFetchError("Failed to select free tier. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPlanFeatures = (name) => {
    const n = (name || "").toLowerCase();
    if (n === "free") return ["1 Project", "Basic Analytics", "Community Support"];
    if (n === "mvp") return ["10 Projects", "Advanced Analytics", "Priority Email Support", "Custom Branding"];
    if (n === "pro") return ["Unlimited Projects", "AI Insights", "SLA Support", "SSO & Audit Logs"];
    return ["Great features included"];
  };

  if (isFetching)
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (fetchError)
    return (
      <Alert variant="destructive">
        <AlertDescription>{fetchError}</AlertDescription>
      </Alert>
    );

  return (
    <motion.div variants={panelSwap} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Choose your plan</h2>
        <p className="text-muted-foreground">Start free. Upgrade anytime. No credit card for Free.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const highlight = plan.name?.toLowerCase() !== "free";
          return (
            <motion.div
              key={plan.plan_id}
              variants={fadeIn}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <Card className={cn("flex h-full flex-col", highlight && "border-2 border-primary")}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {plan.name} {highlight && <PlanBadge>Best value</PlanBadge>}
                    </CardTitle>
                    {plan.name?.toLowerCase() === "pro" && <BadgeCheck className="h-5 w-5 text-primary" />}
                  </div>
                  <CardDescription>Everything you need to get going.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-4xl font-extrabold mb-4">
                    ${Number(plan.price_monthly || 0).toFixed(2)}
                    <span className="text-lg font-normal text-muted-foreground">/mo</span>
                  </div>
                  <ul className="space-y-2">
                    {getPlanFeatures(plan.name).map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {plan.name?.toLowerCase() === "free" ? (
                    <Button onClick={handleFreeTier} variant="outline" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Get started for free"}
                    </Button>
                  ) : (
                    <Button asChild className="w-full" disabled={loading}>
                      <a href={STRIPE_PAYMENT_LINK} aria-label={`Go to checkout for ${plan.name}`}>Go to checkout</a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        {backStep ? (
          <Button onClick={backStep} variant="outline" disabled={loading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2 text-muted-foreground">
          <HelpCircle className="h-4 w-4" />
          Questions? We’re here to help.
        </div>
      </div>
    </motion.div>
  );
};

/* ------------------------------ Step 3 --------------------------------- */
const WelcomeStep = () => {
  const navigate = useNavigate();
  const { setProfile, setLoading, loading } = useUserStore();

  const handleGoToDashboard = async () => {
    setLoading(true);
    try {
      const response = await postData("/profile/complete-onboarding", {});
      if (response?.profile) setProfile(response.profile);
      navigate("/dashboard");
    } catch {
      // Fail open to dashboard but keep console context for dev
      console.error("Failed to finalize onboarding");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={panelSwap} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 12, -12, 0] }}
          transition={{ type: "tween", duration: 0.5, ease: "easeInOut", delay: 0.1 }}
        >
          <PartyPopper className="mx-auto h-16 w-16 text-yellow-400 mb-2" />
        </motion.div>
        <h2 className="text-3xl font-bold">You’re all set!</h2>
        <p className="text-muted-foreground my-2 max-w-md mx-auto">
          Your profile is complete and your plan is active. Let’s get you to value fast.
        </p>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              Explore templates
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Invite your team
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BadgeCheck className="h-4 w-4 text-primary" />
              Connect data sources
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center">
        <Button size="lg" onClick={handleGoToDashboard} disabled={loading} aria-disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Go to my dashboard
          {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </motion.div>
  );
};

/* --------------------------- Onboarding Shell --------------------------- */
export const OnboardingWizard = ({ initialStep = 1 }) => {
  const [step, setStep] = useState(initialStep);
  const [apiError, setApiError] = useState("");
  const { setProfile, clearUser, loading, setLoading, isDarkMode, toggleTheme, userSubscriptionStatus } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => setStep(initialStep), [initialStep]);

  // Skip plan step if already subscribed or on free_active
  useEffect(() => {
    const active =
      userSubscriptionStatus === "active" ||
      userSubscriptionStatus === "trialing" ||
      userSubscriptionStatus === "free_active";
    if (step === 2 && active) setStep(3);
  }, [step, userSubscriptionStatus]);

  const handleProfileComplete = async (formData, avatarFile) => {
    setLoading(true);
    setApiError("");
    try {
      const profileRes = await postData("/profile", formData);
      let finalProfile = profileRes?.profile;
      if (finalProfile && avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        const avatarResponse = await uploadFile("/profile/avatar", fd);
        finalProfile = avatarResponse?.profile || finalProfile;
      }
      if (!finalProfile) throw new Error("Profile creation failed.");
      setProfile(finalProfile);
      setStep(2);
    } catch (err) {
      setApiError(err?.message || "Something went wrong saving your profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelected = (plan) => {
    if (plan === "free") setStep(3);
  };

  const handleLogout = async () => {
    await auth.signOut();
    clearUser();
    navigate("/login");
  };

  const canGoBack = step === 2 && initialStep === 1;

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
          className="relative"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">
                {step === 1 && "Create your profile"}
                {step === 2 && "Select your plan"}
                {step === 3 && "Welcome aboard"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "A few details to personalize your workspace."}
                {step === 2 && "Pick a plan that fits now—you can change anytime."}
                {step === 3 && "You’re ready to get to work."}
              </CardDescription>
            </CardHeader>

            <Separator />

            <CardContent className="p-6">
              {apiError && (
                <Alert variant="destructive" className="mb-4" role="alert">
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}

              <AnimatePresence mode="wait">
                {step === 1 && <ProfileStep key="step1" onProfileComplete={handleProfileComplete} loading={loading} />}
                {step === 2 && (
                  <SubscriptionStep
                    key="step2"
                    onPlanSelected={handlePlanSelected}
                    backStep={canGoBack ? () => setStep(1) : null}
                    loading={loading}
                    setLoading={setLoading}
                  />
                )}
                {step === 3 && <WelcomeStep key="step3" />}
              </AnimatePresence>
            </CardContent>

        
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
