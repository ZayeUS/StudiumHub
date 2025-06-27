import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, TextField, Button, Alert, Paper, Container, Avatar, Grid,
  CircularProgress, IconButton, Tooltip, LinearProgress, Chip, Stack, useTheme, alpha
} from "@mui/material";
import {
  PersonOutline, Logout, ArrowForward, CheckCircle, ArrowBack, 
  LightMode, DarkMode, Celebration, Image as ImageIcon, Edit
} from "@mui/icons-material";
import { Star } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from "react-router-dom";
import { postData, uploadFile, getData } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";
import { motion, AnimatePresence } from 'framer-motion';

const STRIPE_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK;

// --- FINAL ENHANCED PHOTO UPLOAD ---
const PhotoUpload = ({ onFileSelect, loading }) => {
    const theme = useTheme();
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
            <Box
                {...getRootProps()}
                sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                        borderColor: theme.palette.primary.main,
                        '& .upload-overlay': {
                            opacity: 1,
                        }
                    },
                }}
            >
                <input {...getInputProps()} disabled={loading} />
                <Avatar src={preview} sx={{ width: '100%', height: '100%', bgcolor: 'action.hover' }}>
                    <PersonOutline sx={{ fontSize: 40, color: 'text.secondary' }} />
                </Avatar>

                <Box
                    className="upload-overlay"
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        bgcolor: alpha(theme.palette.common.black, 0.5),
                        color: theme.palette.common.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        opacity: isDragActive ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                    }}
                >
                    {preview ? <Edit /> : <ImageIcon />}
                    <Typography variant="caption" sx={{ mt: 0.5 }}>
                        {isDragActive ? 'Drop here' : 'Change Photo'}
                    </Typography>
                </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                Optional, but recommended.
            </Typography>
        </Box>
    );
};

// --- PROFILE STEP ---
const ProfileStep = ({ onProfileComplete, loading }) => {
  const [form, setForm] = useState({ first_name: "", last_name: "" });
  const [errors, setErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const handleChange = (e) => { const { name, value } = e.target; setForm((prev) => ({ ...prev, [name]: value })); if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null })); };
  const validate = () => { const errs = {}; if (!form.first_name.trim()) errs.first_name = "First name is required."; if (!form.last_name.trim()) errs.last_name = "Last name is required."; setErrors(errs); return Object.keys(errs).length === 0; };
  const handleNext = () => { if (validate()) { onProfileComplete(form, avatarFile); } };

  return (
    <Box>
      <Typography variant="h5" align="center" fontWeight="bold">Tell us about yourself</Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>This will help us personalize your experience.</Typography>
      <PhotoUpload onFileSelect={setAvatarFile} loading={loading} />
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6}>
            <TextField name="first_name" label="First Name" fullWidth value={form.first_name} onChange={handleChange} error={!!errors.first_name} helperText={errors.first_name} />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField name="last_name" label="Last Name" fullWidth value={form.last_name} onChange={handleChange} error={!!errors.last_name} helperText={errors.last_name} />
        </Grid>
      </Grid>
      <Button onClick={handleNext} fullWidth variant="contained" size="large" disabled={loading} endIcon={loading ? <CircularProgress size={20} /> : <ArrowForward />} sx={{ mt: 4, py: 1.5 }}>
          {loading ? "Saving Profile..." : "Next: Choose Plan"}
      </Button>
    </Box>
  );
};

// --- DATA-DRIVEN SUBSCRIPTION STEP ---
const SubscriptionStep = ({ onPlanSelected, backStep, loading, setLoading }) => {
    const theme = useTheme();
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
    
    // Placeholder features - you can make these dynamic later
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (fetchError) {
        return <Alert severity="error">{fetchError}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h5" align="center" fontWeight="bold">Choose Your Plan</Typography>
            <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>You can always upgrade later.</Typography>
            <Grid container spacing={{xs: 3, md: 4}} justifyContent="center">
                {plans.map((plan) => (
                    <Grid item xs={12} md={6} key={plan.plan_id}>
                        <motion.div whileHover={{ y: -5, boxShadow: `0 10px 20px ${alpha(plan.name === 'Free' ? theme.palette.primary.main : theme.palette.secondary.main, 0.15)}` }}>
                            <Paper sx={{ 
                                p: 4, 
                                display: 'flex', 
                                flexDirection: 'column', 
                                height: '100%', 
                                borderRadius: 4,
                                border: plan.name !== 'Free' ? `2px solid ${theme.palette.secondary.main}` : `1px solid ${theme.palette.divider}`,
                                position: 'relative'
                            }}>
                                {plan.name !== 'Free' && (
                                    <Chip label="Recommended" color="secondary" size="small" sx={{ position: 'absolute', top: -12, left: 24, fontWeight: 'bold' }} />
                                )}
                                <Typography variant="h6" fontWeight={700}>{plan.name} Tier</Typography>
                                <Typography variant="h4" fontWeight={800} sx={{ my: 2 }} color={plan.name === 'Free' ? 'text.primary' : 'secondary.main'}>
                                    ${parseFloat(plan.price_monthly).toFixed(2)}
                                    <Typography component="span" variant="body1" color="text.secondary">/mo</Typography>
                                </Typography>
                                <Stack spacing={1.5} sx={{ mb: 4, flexGrow: 1 }}>
                                    {getPlanFeatures(plan.name).map(feature => (
                                        <Box key={feature} sx={{display: 'flex', alignItems: 'center'}}>
                                            <CheckCircle fontSize="small" color={plan.name === 'Free' ? 'success' : 'secondary'} sx={{mr:1.5}}/>
                                            <Typography variant="body2">{feature}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                                {plan.name === 'Free' ? (
                                    <Button onClick={handleFreeTier} variant="outlined" color="primary" fullWidth size="large" disabled={loading}>
                                        {loading ? <CircularProgress size={24}/> : 'Get Started for Free'}
                                    </Button>
                                ) : (
                                    <Button href={STRIPE_PAYMENT_LINK} variant="contained" color="secondary" fullWidth size="large" disabled={loading}>
                                        Go to Checkout
                                    </Button>
                                )}
                            </Paper>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>
            {backStep && <Button onClick={backStep} startIcon={<ArrowBack />} sx={{ mt: 4 }} disabled={loading}>Back to Profile</Button>}
        </Box>
    );
};

// --- WELCOME STEP ---
const WelcomeStep = () => {
    const navigate = useNavigate();
    const { setProfile, setLoading, loading } = useUserStore();
    const handleGoToDashboard = async () => { setLoading(true); try { const response = await postData('/profile/complete-onboarding', {}); setProfile(response.profile); navigate('/dashboard'); } catch (error) { console.error("Failed to finalize onboarding:", error); navigate('/dashboard'); } finally { setLoading(false); } };
    return (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 100, delay: 0.2 }}>
            <Box textAlign="center" p={4}>
                <Celebration color="success" sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h4" fontWeight="bold">You're All Set!</Typography>
                <Typography color="text.secondary" sx={{ my: 2, maxWidth: 350, mx: 'auto' }}>Your profile is complete and your plan is active. Welcome aboard!</Typography>
                <Button variant="contained" size="large" onClick={handleGoToDashboard} disabled={loading} endIcon={loading ? <CircularProgress size={20}/> : <ArrowForward />}>Go to My Dashboard</Button>
            </Box>
        </motion.div>
    );
};

// --- MAIN ONBOARDING WIZARD ---
export const OnboardingWizard = ({ initialStep = 1 }) => {
  const [step, setStep] = useState(initialStep);
  const [apiError, setApiError] = useState("");
  const { setProfile, clearUser, loading, setLoading, isDarkMode, toggleTheme, userSubscriptionStatus } = useUserStore();
  const theme = useTheme();

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
    <Box sx={{ 
        minHeight: "100vh", 
        py: 4, 
        display: 'flex', 
        alignItems: 'center',
        background: `radial-gradient(circle at top left, ${alpha(theme.palette.primary.main, 0.1)}, transparent 40%), radial-gradient(circle at bottom right, ${alpha(theme.palette.secondary.main, 0.1)}, transparent 40%)`,
        bgcolor: 'background.default'
    }}>
        <Container maxWidth="md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Paper elevation={12} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex' }}>
                        <Tooltip title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}><IconButton onClick={toggleTheme}>{isDarkMode ? <LightMode /> : <DarkMode />}</IconButton></Tooltip>
                        <Tooltip title="Logout"><IconButton onClick={handleLogout}><Logout /></IconButton></Tooltip>
                    </Box>
                    <Box sx={{ mb: 4, width: '100%' }}>
                        <Typography variant="h4" fontWeight="bold" align="center" sx={{ mb: 2 }}>
                            {`Step ${step}: ${stepTitles[step - 1]}`}
                        </Typography>
                        <LinearProgress variant="determinate" value={(step / 3) * 100} sx={{height: 8, borderRadius: 4}} />
                    </Box>
                    {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
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
                </Paper>
            </motion.div>
        </Container>
    </Box>
  );
};