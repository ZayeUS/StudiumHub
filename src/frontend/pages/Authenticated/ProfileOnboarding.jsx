// File: src/frontend/pages/Authenticated/ProfileOnboarding.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  useTheme,
  useMediaQuery,
  Snackbar,
  Avatar,
  LinearProgress,
  Fade,
  Grid,
  Hidden,
  IconButton,
  InputAdornment,
  alpha,
  Container,
  Tooltip
} from "@mui/material";
import { 
  CloudUpload, 
  PersonOutline, 
  CalendarMonth, 
  ArrowForward, 
  Logout,
  AccountCircle // For Avatar placeholder
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { postData, uploadFile } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";

// Graphic component for the onboarding page
const OnboardingGraphic = () => {
  const theme = useTheme();
  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          // Using primary color as base, with a subtle gradient overlay
          bgcolor: theme.palette.primary.main, 
          p: { xs: 4, md: 7 },
          color: theme.palette.common.white,
          textAlign: 'center',
          borderTopLeftRadius: { md: theme.shape.borderRadiusLG }, // For right-aligned form
          borderBottomLeftRadius: { md: theme.shape.borderRadiusLG },
          borderTopRightRadius: { xs: theme.shape.borderRadiusLG, md: 0 },
          borderBottomRightRadius: { xs: theme.shape.borderRadiusLG, md: 0 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': { 
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, transparent 0%, ${alpha(theme.palette.primary.dark, 0.35)} 100%)`,
            pointerEvents: 'none',
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Fade in timeout={500} style={{ transitionDelay: '100ms' }}>
                 <Box sx={{ mb: 3 }}>
                    <AccountCircle sx={{ fontSize: {xs: '4rem', md: '5rem'}, mb: 2, opacity: 0.8, color: theme.palette.common.white }} />
                    <Typography variant="h3" fontWeight="bold" component="div" sx={{ mb: 1, letterSpacing: '-1px' }}>
                        Almost There!
                    </Typography>
                 </Box>
            </Fade>
            <Fade in timeout={700} style={{ transitionDelay: '300ms' }}>
            <Typography variant="h6" sx={{ opacity: 0.95, mb: 2, fontWeight: 500 }}>
                Let's Personalize Your Experience
            </Typography>
            </Fade>
            <Fade in timeout={700} style={{ transitionDelay: '500ms' }}>
            <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 400, mx: 'auto', lineHeight: 1.75, mb: 5 }}>
                Complete your profile to unlock the full potential of Cofoundless. This helps us tailor the platform just for you.
            </Typography>
            </Fade>
            <Fade in timeout={700} style={{ transitionDelay: '700ms' }}>
                <Box sx={{ 
                display: 'flex', 
                gap: 1.5, 
                justifyContent: 'center',
                opacity: 0.8,
                fontSize: '0.8rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
                }}>
                <span>Secure</span>
                <span>•</span>
                <span>Personalized</span>
                <span>•</span>
                <span>Ready</span>
                </Box>
          </Fade>
        </Box>
      </Box>
    </Fade>
  );
};


export const ProfileOnboarding = () => {
  const [form, setForm] = useState({ 
    first_name: "", 
    last_name: "", 
    date_of_birth: "", 
    is_new_user: true // This flag is important
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { setProfile, clearUser, loading, setLoading, authLoading, authHydrated, isLoggedIn } = useUserStore();

  // Redirect if not logged in or auth state not determined
   useEffect(() => {
    if (authHydrated && !isLoggedIn) {
      navigate("/login");
    }
  }, [authHydrated, isLoggedIn, navigate]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (apiError) setApiError("");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setNotification({ open: true, message: "Only JPEG and PNG images are allowed.", severity: "error" });
        e.target.value = null; // Reset file input
        return;
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setNotification({ open: true, message: "Image size should be less than 5MB.", severity: "error" });
        e.target.value = null; // Reset file input
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const errs = {};
    const { first_name, last_name, date_of_birth } = form;

    if (!first_name.trim()) errs.first_name = "First name is required.";
    if (first_name.trim().length > 50) errs.first_name = "First name is too long (max 50 chars).";
    
    if (!last_name.trim()) errs.last_name = "Last name is required.";
    if (last_name.trim().length > 50) errs.last_name = "Last name is too long (max 50 chars).";

    if (!date_of_birth) {
      errs.date_of_birth = "Date of birth is required.";
    } else {
      const dob = new Date(date_of_birth);
      const today = new Date();
      const minAgeDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
      const maxAgeDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());

      if (isNaN(dob.getTime())) errs.date_of_birth = "Invalid date format.";
      else if (dob > today) errs.date_of_birth = "Date of birth cannot be in the future.";
      else if (dob > minAgeDate) errs.date_of_birth = "You must be at least 13 years old.";
      else if (dob < maxAgeDate) errs.date_of_birth = "Please enter a valid date of birth.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
        setLoading(false); // Make sure loading is off if validation fails
        return;
    }

    setLoading(true);
    setApiError("");
    try {
      const profilePayload = { ...form };
      
      const profileRes = await postData("/profile", profilePayload);
      
      if (profileRes?.profile) {
        let finalProfile = profileRes.profile;
        if (avatarFile) {
          const formData = new FormData();
          formData.append("avatar", avatarFile);
          try {
            const avatarResponse = await uploadFile("/profile/avatar", formData);
            if (avatarResponse?.profile?.avatar_url) {
              finalProfile.avatar_url = avatarResponse.profile.avatar_url;
            }
          } catch (uploadError) {
            console.error("Avatar upload failed:", uploadError);
            setNotification({ open: true, message: "Profile saved, but avatar upload failed. You can update it later.", severity: "warning" });
          }
        }
        setProfile(finalProfile); // Update global store
        setNotification({ open: true, message: "Welcome to Cofoundless! Your profile is set.", severity: "success" });
        
        // --- CHANGE HERE: Set loading to false *before* navigation ---
        setLoading(false); 
        navigate("/subscription-selection"); 
        // -------------------------------------------------------------
      } else {
        setApiError(profileRes?.message || "Unable to save profile. Please try again.");
        setLoading(false); // Always set to false on backend error
      }
    } catch (err) {
      console.error("Profile onboarding error:", err);
      setApiError(err?.message || "Something went wrong. Please try again.");
      setLoading(false); // Always set to false on any error
    } 
  };

  const handleLogout = async () => {
    await clearUser(); // This should also handle Firebase sign out if implemented in store
    navigate("/login");
  };

  const progress = () => {
    let completedFields = 0;
    if (form.first_name.trim()) completedFields++;
    if (form.last_name.trim()) completedFields++;
    if (form.date_of_birth) completedFields++;
    if (avatarPreview) completedFields++; // Count avatar as a step
    return (completedFields / 4) * 100; // 4 fields: first, last, dob, avatar
  };

  if (authLoading || !authHydrated) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: theme.palette.background.default }}>
        <CircularProgress size={60} />
      </Box>
    );
  }


  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: 'column', // Main Box is column for progress bar
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(160deg, ${alpha(theme.palette.background.default, 1)} 30%, ${alpha(theme.palette.primary.dark, 0.1)} 100%)`
          : `linear-gradient(160deg, ${alpha(theme.palette.grey[100], 1)} 30%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
        overflow: 'hidden', // Prevent scrollbars from background elements
      }}
    >
      <LinearProgress 
        variant="determinate" 
        value={progress()} 
        color="primary"
        sx={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          height: 5, // Slightly thicker
          zIndex: 1200, // Ensure it's above other content
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
        }} 
      />
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={notification.severity} onClose={() => setNotification(prev => ({ ...prev, open: false }))} sx={{width: '100%'}}>
            {notification.message}
        </Alert>
      </Snackbar>

      <Container maxWidth="xl" sx={{ p: 0, display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Paper
          elevation={8}
          sx={{
            display: 'flex',
            width: '100%',
            maxWidth: {xs: '100%', md: '1000px', lg: '1100px'},
            minHeight: {xs: 'auto', md: '700px'},
            overflow: 'hidden',
            m: {xs: 0, sm: 2, md:3}
          }}
        >
          <Hidden mdDown>
            <Grid item md={5.5} sx={{ position: 'relative' }}>
              <OnboardingGraphic />
            </Grid>
          </Hidden>
          <Grid item xs={12} md={6.5} container alignItems="center" justifyContent="center">
            <Box sx={{ p: { xs: 3, sm: 4, md: 5 }, width: '100%', maxWidth: 500, mx: 'auto' }}>
              <Fade in timeout={600}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
                        Complete Your Profile
                    </Typography>
                    <Tooltip title="Logout">
                        <IconButton onClick={handleLogout} size="small" color="error">
                            <Logout />
                        </IconButton>
                    </Tooltip>
                </Box>
              </Fade>
              <Fade in timeout={700} style={{ transitionDelay: '100ms' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Help us get to know you better. This information will be visible on your profile.
                </Typography>
              </Fade>

              {apiError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setApiError("")}>
                  {apiError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Fade in timeout={700} style={{ transitionDelay: '200ms' }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
                    <Avatar 
                      src={avatarPreview} 
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        mb: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontSize: '3rem', // For placeholder icon
                        border: `3px solid ${theme.palette.primary.main}`
                      }}
                    >
                      {!avatarPreview && <AccountCircle sx={{ fontSize: 'inherit' }} />}
                    </Avatar>
                    <Button 
                      component="label" 
                      variant="outlined"
                      color="primary"
                      startIcon={<CloudUpload />}
                      disabled={loading}
                      size="small"
                    >
                      {avatarPreview ? "Change Photo" : "Upload Profile Photo"}
                      <input type="file" accept="image/jpeg, image/jpg, image/png" onChange={handleAvatarChange} hidden />
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{mt: 0.5}}>
                        PNG, JPG up to 5MB.
                    </Typography>
                  </Box>
                </Fade>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Fade in timeout={700} style={{ transitionDelay: '300ms' }}>
                      <TextField
                        name="first_name" 
                        label="First Name" 
                        fullWidth
                        value={form.first_name} 
                        onChange={handleChange}
                        error={!!errors.first_name} 
                        helperText={errors.first_name} 
                        disabled={loading} 
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><PersonOutline color="action" /></InputAdornment>,
                        }}
                      />
                    </Fade>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Fade in timeout={700} style={{ transitionDelay: '400ms' }}>
                      <TextField
                        name="last_name" 
                        label="Last Name" 
                        fullWidth
                        value={form.last_name} 
                        onChange={handleChange}
                        error={!!errors.last_name} 
                        helperText={errors.last_name} 
                        disabled={loading} 
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><PersonOutline color="action" /></InputAdornment>,
                        }}
                      />
                    </Fade>
                  </Grid>
                  <Grid item xs={12}>
                    <Fade in timeout={700} style={{ transitionDelay: '500ms' }}>
                      <TextField
                        name="date_of_birth" 
                        type="date" 
                        label="Date of Birth" 
                        fullWidth
                        value={form.date_of_birth} 
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }} 
                        error={!!errors.date_of_birth} 
                        helperText={errors.date_of_birth}
                        disabled={loading} 
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><CalendarMonth color="action" /></InputAdornment>,
                        }}
                      />
                    </Fade>
                  </Grid>
                </Grid>
                
                <Fade in timeout={700} style={{ transitionDelay: '600ms' }}>
                  <Button
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    fullWidth 
                    size="large"
                    disabled={loading || progress() < 75} // Require at least 3/4 fields
                    endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                    sx={{ mt: 4, py: 1.5 }}
                  >
                    {loading ? "Saving Profile..." : "Complete Setup"}
                  </Button>
                </Fade>
              </Box>
            </Box>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};