import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
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
  PartyPopper
} from "lucide-react";

import { postData, uploadFile, getData } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"; // <-- CORRECTED IMPORT
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const STRIPE_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK;

const PhotoUpload = ({ onFileSelect, loading }) => {
    const [preview, setPreview] = useState(null);

    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            onFileSelect(file);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': [], 'image/png': [] },
        multiple: false,
    });

    return (
        <div className="flex flex-col items-center mb-1">
            <div
                {...getRootProps()}
                className={`relative w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
            >
                <input {...getInputProps()} disabled={loading} />
                <Avatar className="w-full h-full">
                    <AvatarImage src={preview} alt="User avatar" />
                    <AvatarFallback>
                        <PersonStanding className="w-12 h-12 text-muted-foreground" />
                    </AvatarFallback>
                </Avatar>
                <div
                    className={`absolute inset-0 w-full h-full bg-black/50 text-white flex flex-col items-center justify-center rounded-full transition-opacity ${preview ? 'opacity-0 hover:opacity-100' : 'opacity-100'
                        }`}
                >
                    {preview ? <Edit /> : <Camera />}
                    <p className="text-xs mt-1">{preview ? 'Change' : 'Upload'}</p>
                </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Optional, but recommended.</p>
        </div>
    );
};

const ProfileStep = ({ onProfileComplete, loading }) => {
  const [form, setForm] = useState({ first_name: "", last_name: "" });
  const [errors, setErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const handleChange = (e) => { const { name, value } = e.target; setForm((prev) => ({ ...prev, [name]: value })); if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null })); };
  const validate = () => { const errs = {}; if (!form.first_name.trim()) errs.first_name = "First name is required."; if (!form.last_name.trim()) errs.last_name = "Last name is required."; setErrors(errs); return Object.keys(errs).length === 0; };
  const handleNext = () => { if (validate()) { onProfileComplete(form, avatarFile); } };

  return (
    <div className="space-y-4">
        <div className="text-center">
            <h2 className="text-2xl font-bold">Tell us about yourself</h2>
            <p className="text-muted-foreground">This will help us personalize your experience.</p>
        </div>
      <PhotoUpload onFileSelect={setAvatarFile} loading={loading} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} />
            {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} />
            {errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}
        </div>
      </div>
      <Button onClick={handleNext} className="w-full" size="lg" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading ? "Saving Profile..." : "Next: Choose Plan"}
          {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  );
};

const SubscriptionStep = ({ onPlanSelected, backStep, loading, setLoading }) => {
    const [plans, setPlans] = useState([]);
    const [fetchError, setFetchError] = useState(null);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setIsFetching(true);
                const fetchedPlans = await getData('/plans');
                setPlans(fetchedPlans);
            } catch (error) {
                console.error("Failed to fetch plans:", error);
                setFetchError("Could not load subscription plans. Please try again later.");
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
        } catch (error) {
            console.error("Failed to select free tier:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const getPlanFeatures = (planName) => {
        if (planName.toLowerCase() === 'free') {
            return ["1 Project", "Basic Analytics", "Community Support"];
        }
        if (planName.toLowerCase() === 'mvp') {
            return ["10 Projects", "Advanced Analytics", "Priority Email Support", "Custom Branding"];
        }
        return [];
    };

    if (isFetching) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (fetchError) {
        return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{fetchError}</AlertDescription></Alert>;
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Choose Your Plan</h2>
                <p className="text-muted-foreground">You can always upgrade later.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
                {plans.map((plan) => (
                    <Card key={plan.plan_id} className={`flex flex-col ${plan.name !== 'Free' ? 'border-2 border-primary' : ''}`}>
                        <CardHeader>
                            {plan.name !== 'Free' && <div className="text-sm font-bold text-primary mb-2">Recommended</div>}
                            <CardTitle>{plan.name} Tier</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <div className="text-4xl font-extrabold mb-4">
                                ${parseFloat(plan.price_monthly).toFixed(2)}
                                <span className="text-lg font-normal text-muted-foreground">/mo</span>
                            </div>
                            <ul className="space-y-2">
                                {getPlanFeatures(plan.name).map(feature => (
                                    <li key={feature} className="flex items-center">
                                        <Check className="h-5 w-5 text-green-500 mr-2" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            {plan.name === 'Free' ? (
                                <Button onClick={handleFreeTier} variant="outline" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Get Started for Free'}
                                </Button>
                            ) : (
                                <Button asChild className="w-full" disabled={loading}>
                                    <a href={STRIPE_PAYMENT_LINK}>Go to Checkout</a>
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
             {backStep && <Button onClick={backStep} variant="outline" disabled={loading} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to Profile</Button>}
        </div>
    );
};

const WelcomeStep = () => {
    const navigate = useNavigate();
    const { setProfile, setLoading, loading } = useUserStore();
    const handleGoToDashboard = async () => { setLoading(true); try { const response = await postData('/profile/complete-onboarding', {}); setProfile(response.profile); navigate('/dashboard'); } catch (error) { console.error("Failed to finalize onboarding:", error); navigate('/dashboard'); } finally { setLoading(false); } };
    return (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 100, delay: 0.2 }}>
            <div className="text-center p-4">
                <PartyPopper className="mx-auto h-20 w-20 text-yellow-400 mb-2" />
                <h2 className="text-3xl font-bold">You're All Set!</h2>
                <p className="text-muted-foreground my-2 max-w-xs mx-auto">Your profile is complete and your plan is active. Welcome aboard!</p>
                <Button size="lg" onClick={handleGoToDashboard} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Go to My Dashboard
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
            </div>
        </motion.div>
    );
};

export const OnboardingWizard = ({ initialStep = 1 }) => {
  const [step, setStep] = useState(initialStep);
  const [apiError, setApiError] = useState("");
  const { setProfile, clearUser, loading, setLoading, isDarkMode, toggleTheme, userSubscriptionStatus } = useUserStore();

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    const hasActiveSubscription = userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing' || userSubscriptionStatus === 'free_active';
    if (step === 2 && hasActiveSubscription) {
      setStep(3);
    }
  }, [step, userSubscriptionStatus]);

  const handleProfileComplete = async (formData, avatarFile) => {
    setLoading(true);
    setApiError("");
    try {
      const profileRes = await postData("/profile", formData);
      let finalProfile = profileRes.profile;
      if (finalProfile && avatarFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("avatar", avatarFile);
        const avatarResponse = await uploadFile("/profile/avatar", uploadFormData);
        finalProfile = avatarResponse.profile;
      }
      
      if (finalProfile) {
        setProfile(finalProfile);
        setStep(2);
      } else {
        throw new Error("Profile creation failed.");
      }
    } catch (err) {
      setApiError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelected = (plan) => {
      if (plan === 'free') {
          setStep(3);
      }
  };

  const handleLogout = async () => await clearUser();
  const stepTitles = ["Create Your Profile", "Choose Your Plan", "Welcome Aboard!"];
  const canGoBack = step === 2 && initialStep === 1;

  return (
    <div className="min-h-screen py-4 flex items-center bg-background">
        <div className="container max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div className="flex-grow">
                                <CardTitle className="text-center text-2xl mb-2">{`Step ${step}: ${stepTitles[step - 1]}`}</CardTitle>
                                <Progress value={(step / 3) * 100} className="w-full" />
                            </div>
                            <div className="flex gap-1 absolute top-4 right-4">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={toggleTheme}>
                                                {isDarkMode ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Switch to {isDarkMode ? 'Light' : 'Dark'} Mode</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut className="h-5 w-5" /></Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Logout</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {apiError && <Alert variant="destructive" className="mb-4"><AlertDescription>{apiError}</AlertDescription></Alert>}
                        <AnimatePresence mode="wait">
                            <motion.div 
                              key={step} 
                              initial={{ x: 30, opacity: 0 }} 
                              animate={{ x: 0, opacity: 1 }} 
                              exit={{ x: -30, opacity: 0 }} 
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                {step === 1 && <ProfileStep onProfileComplete={handleProfileComplete} loading={loading} />}
                                {step === 2 && <SubscriptionStep onPlanSelected={handlePlanSelected} backStep={canGoBack ? () => setStep(1) : null} loading={loading} setLoading={setLoading} />}
                                {step === 3 && <WelcomeStep />}
                            </motion.div>
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    </div>
  );
};
