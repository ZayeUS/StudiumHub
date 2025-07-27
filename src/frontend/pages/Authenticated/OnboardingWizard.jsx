// src/frontend/pages/Authenticated/OnboardingWizard.jsx
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
import { auth } from "../../../firebase"; // Import auth for logout

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const STRIPE_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK;

// Step Indicator Component
const StepIndicator = ({ currentStep }) => {
    const steps = [
        { number: 1, title: 'Your Profile' },
        { number: 2, title: 'Select Plan' },
        { number: 3, title: 'Get Started' },
    ];
    return (
        <div className="flex items-center justify-center w-full mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center">
                        <motion.div
                            className="flex items-center justify-center rounded-full h-8 w-8 text-sm font-bold border-2"
                            animate={currentStep >= step.number ? "active" : "inactive"}
                            variants={{
                                active: { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', borderColor: 'hsl(var(--primary))' },
                                inactive: { backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--muted-foreground))', borderColor: 'hsl(var(--border))' },
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <AnimatePresence mode="wait">
                                {currentStep > step.number ? (
                                    <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                        <Check size={16} />
                                    </motion.div>
                                ) : (
                                    <motion.span key="number" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                        {step.number}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.div>
                        <p className={cn("text-xs mt-2 font-medium", currentStep >= step.number ? 'text-primary' : 'text-muted-foreground')}>
                            {step.title}
                        </p>
                    </div>
                    {index < steps.length - 1 && (
                        <motion.div 
                            className="flex-1 h-0.5 mx-4"
                            initial={false}
                            animate={{ backgroundColor: currentStep > index + 1 ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
                            transition={{ duration: 0.3 }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// PhotoUpload Component
const PhotoUpload = ({ onFileSelect, loading }) => {
    const [preview, setPreview] = useState(null);
    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            onFileSelect(file);
        }
    }, [onFileSelect]);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/jpeg': [], 'image/png': [] }, multiple: false });
    return (
        <motion.div className="flex flex-col items-center mb-1" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
            <div {...getRootProps()} className={`relative w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}`}>
                <input {...getInputProps()} disabled={loading} />
                <Avatar className="w-full h-full">
                    <AvatarImage src={preview} alt="User avatar" />
                    <AvatarFallback><PersonStanding className="w-12 h-12 text-muted-foreground" /></AvatarFallback>
                </Avatar>
                <div className={`absolute inset-0 w-full h-full bg-black/50 text-white flex flex-col items-center justify-center rounded-full transition-opacity ${preview ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                    {preview ? <Edit /> : <Camera />}
                    <p className="text-xs mt-1">{preview ? 'Change' : 'Upload'}</p>
                </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Optional, but recommended.</p>
        </motion.div>
    );
};

// Step 1: Profile Creation
const ProfileStep = ({ onProfileComplete, loading }) => {
  const [form, setForm] = useState({ first_name: "", last_name: "" });
  const [errors, setErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const handleChange = (e) => { const { name, value } = e.target; setForm((prev) => ({ ...prev, [name]: value })); if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null })); };
  const validate = () => { const errs = {}; if (!form.first_name.trim()) errs.first_name = "First name is required."; if (!form.last_name.trim()) errs.last_name = "Last name is required."; setErrors(errs); return Object.keys(errs).length === 0; };
  const handleNext = () => { if (validate()) { onProfileComplete(form, avatarFile); } };
  return (
    <motion.div className="space-y-4" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
        <motion.div variants={{hidden: {opacity: 0, y: 10}, visible: {opacity: 1, y: 0}}} className="text-center">
            <h2 className="text-2xl font-bold">Tell us about yourself</h2>
            <p className="text-muted-foreground">This will help us personalize your experience.</p>
        </motion.div>
        <motion.div variants={{hidden: {opacity: 0, scale: 0.9}, visible: {opacity: 1, scale: 1}}}>
            <PhotoUpload onFileSelect={setAvatarFile} loading={loading} />
        </motion.div>
        <motion.div variants={{hidden: {opacity: 0, y: 10}, visible: {opacity: 1, y: 0}}} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2"><Label htmlFor="first_name">First Name</Label><Input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} />{errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}</div>
            <div className="space-y-2"><Label htmlFor="last_name">Last Name</Label><Input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} />{errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}</div>
        </motion.div>
        <motion.div variants={{hidden: {opacity: 0, y: 10}, visible: {opacity: 1, y: 0}}}>
            <Button onClick={handleNext} className="w-full" size="lg" disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{loading ? "Saving Profile..." : "Next: Choose Plan"}{!loading && <ArrowRight className="ml-2 h-4 w-4" />}</Button>
        </motion.div>
    </motion.div>
  );
};

// Step 2: Subscription Plan Selection
const SubscriptionStep = ({ onPlanSelected, backStep, loading, setLoading }) => {
    const [plans, setPlans] = useState([]);
    const [fetchError, setFetchError] = useState(null);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try { setIsFetching(true); const fetchedPlans = await getData('/plans'); setPlans(fetchedPlans); }
            catch (error) { console.error("Failed to fetch plans:", error); setFetchError("Could not load plans. Please try again later."); }
            finally { setIsFetching(false); }
        };
        fetchPlans();
    }, []);
    
    const handleFreeTier = async () => { setLoading(true); try { await postData('/stripe/select-free-tier', {}); onPlanSelected('free'); } catch (error) { console.error("Failed to select free tier:", error); } finally { setLoading(false); } };
    
    const getPlanFeatures = (planName) => { if (planName.toLowerCase() === 'free') return ["1 Project", "Basic Analytics", "Community Support"]; if (planName.toLowerCase() === 'mvp') return ["10 Projects", "Advanced Analytics", "Priority Email Support", "Custom Branding"]; return []; };

    if (isFetching) return <div className="flex justify-center items-center min-h-[300px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (fetchError) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{fetchError}</AlertDescription></Alert>;

    return (
        <div className="space-y-6">
            <div className="text-center"><h2 className="text-2xl font-bold">Choose Your Plan</h2><p className="text-muted-foreground">You can always upgrade later.</p></div>
            <motion.div variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
                {plans.map((plan) => (
                    <motion.div key={plan.plan_id} variants={{hidden: {opacity: 0, y: 20}, visible: {opacity: 1, y: 0}}} whileHover={{ y: -5, boxShadow: "0px 10px 20px hsla(var(--foreground), 0.1)"}} transition={{ type: "spring", stiffness: 300 }}>
                        <Card className={`flex flex-col h-full ${plan.name !== 'Free' ? 'border-2 border-primary' : ''}`}>
                            <CardHeader>{plan.name !== 'Free' && <div className="text-sm font-bold text-primary mb-2">Recommended</div>}<CardTitle>{plan.name} Tier</CardTitle></CardHeader>
                            <CardContent className="flex-grow"><div className="text-4xl font-extrabold mb-4">${parseFloat(plan.price_monthly).toFixed(2)}<span className="text-lg font-normal text-muted-foreground">/mo</span></div><ul className="space-y-2">{getPlanFeatures(plan.name).map(feature => <li key={feature} className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><span>{feature}</span></li>)}</ul></CardContent>
                            <CardFooter>{plan.name === 'Free' ? (<Button onClick={handleFreeTier} variant="outline" className="w-full" disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Get Started for Free'}</Button>) : (<Button asChild className="w-full" disabled={loading}><a href={STRIPE_PAYMENT_LINK}>Go to Checkout</a></Button>)}</CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
             {backStep && <Button onClick={backStep} variant="outline" disabled={loading} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>}
        </div>
    );
};

// Step 3: Welcome
const WelcomeStep = () => {
    const navigate = useNavigate();
    const { setProfile, setLoading, loading } = useUserStore();
    const handleGoToDashboard = async () => { setLoading(true); try { const response = await postData('/profile/complete-onboarding', {}); setProfile(response.profile); navigate('/dashboard'); } catch (error) { console.error("Failed to finalize onboarding:", error); navigate('/dashboard'); } finally { setLoading(false); } };
    return (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 100, delay: 0.2 }}>
            <div className="text-center p-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 15, -15, 0] }} transition={{ type: "tween", duration: 0.5, ease: "easeInOut", delay: 0.3 }}>
                    <PartyPopper className="mx-auto h-20 w-20 text-yellow-400 mb-2" />
                </motion.div>
                <h2 className="text-3xl font-bold">You're All Set!</h2>
                <p className="text-muted-foreground my-2 max-w-xs mx-auto">Your profile is complete and your plan is active. Welcome aboard!</p>
                <Button size="lg" onClick={handleGoToDashboard} disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Go to My Dashboard{!loading && <ArrowRight className="ml-2 h-4 w-4" />}</Button>
            </div>
        </motion.div>
    );
};

export const OnboardingWizard = ({ initialStep = 1 }) => {
    const [step, setStep] = useState(initialStep);
    const [apiError, setApiError] = useState("");
    const { setProfile, clearUser, loading, setLoading, isDarkMode, toggleTheme, userSubscriptionStatus } = useUserStore();
    const navigate = useNavigate();

    useEffect(() => setStep(initialStep), [initialStep]);
    useEffect(() => {
        const hasActiveSubscription = userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing' || userSubscriptionStatus === 'free_active';
        if (step === 2 && hasActiveSubscription) setStep(3);
    }, [step, userSubscriptionStatus]);

    const handleProfileComplete = async (formData, avatarFile) => {
        setLoading(true); setApiError("");
        try {
            const profileRes = await postData("/profile", formData);
            let finalProfile = profileRes.profile;
            if (finalProfile && avatarFile) {
                const uploadFormData = new FormData();
                uploadFormData.append("avatar", avatarFile);
                const avatarResponse = await uploadFile("/profile/avatar", uploadFormData);
                finalProfile = avatarResponse.profile;
            }
            if (finalProfile) { setProfile(finalProfile); setStep(2); }
            else throw new Error("Profile creation failed.");
        } catch (err) {
            setApiError(err?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    
    const handlePlanSelected = (plan) => { if (plan === 'free') setStep(3) };
    
    const handleLogout = async () => {
        await auth.signOut();
        clearUser();
        navigate('/login');
    };
    
    const canGoBack = step === 2 && initialStep === 1;

    return (
        <div className="min-h-screen py-8 px-4 flex flex-col items-center justify-center bg-background">
            <div className="w-full max-w-2xl mx-auto">
                <StepIndicator currentStep={step} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Card>
                        <CardHeader>
                            <div className="flex justify-end">
                                <div className="flex gap-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={toggleTheme}>{isDarkMode ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}</Button></TooltipTrigger>
                                            <TooltipContent><p>Switch to {isDarkMode ? 'Light' : 'Dark'} Mode</p></TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={handleLogout}><LogOut className="h-5 w-5" /></Button></TooltipTrigger>
                                            <TooltipContent><p>Logout</p></TooltipContent>
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
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    variants={{
                                        hidden: { opacity: 0, x: 50 },
                                        visible: { opacity: 1, x: 0 },
                                    }}
                                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
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