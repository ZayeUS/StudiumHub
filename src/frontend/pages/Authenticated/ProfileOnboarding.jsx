import React, { useState } from "react";
import {
  Box, Typography, TextField, Button, Alert, Paper,
  useTheme, useMediaQuery, Snackbar, Avatar, LinearProgress, Fade
} from "@mui/material";
import { CloudUpload, Person, CalendarMonth } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { postData, uploadFile } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";

export const ProfileOnboarding = () => {
  // State
  const [form, setForm] = useState({ 
    first_name: "", last_name: "", date_of_birth: "", is_new_user: true 
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { setProfile, clearUser, loading, setLoading } = useUserStore();

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (apiError) setApiError("");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setNotification({ 
          open: true, 
          message: "Only JPEG and PNG images are allowed", 
          severity: "error" 
        });
        e.target.value = null;
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setNotification({ 
          open: true, 
          message: "Image size should be less than 5MB", 
          severity: "error" 
        });
        e.target.value = null;
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Validation
  const validate = () => {
    const errs = {};
    const { first_name, last_name, date_of_birth } = form;

    if (!first_name.trim()) errs.first_name = "First name is required";
    if (!last_name.trim()) errs.last_name = "Last name is required";

    if (date_of_birth) {
      const dob = new Date(date_of_birth);
      const today = new Date();
      
      if (isNaN(dob.getTime())) errs.date_of_birth = "Invalid date";
      else if (dob > today) errs.date_of_birth = "Cannot be in the future";
      else {
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 13) errs.date_of_birth = "Must be at least 13 years old";
        if (age > 120) errs.date_of_birth = "Please enter a valid date";
      }
    } else {
      errs.date_of_birth = "Date of birth is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Create profile
      const profileRes = await postData("/profile", form);
      
      if (profileRes?.profile) {
        setProfile(profileRes.profile);

        // Upload avatar if exists
        if (avatarFile) {
          const formData = new FormData();
          formData.append("avatar", avatarFile);
          
          try {
            const avatarResponse = await uploadFile("/profile/avatar", formData);
            
            if (avatarResponse?.profile?.avatar_url) {
              profileRes.profile.avatar_url = avatarResponse.profile.avatar_url;
              setProfile(profileRes.profile);
            }
          } catch (uploadError) {
            setNotification({ 
              open: true, 
              message: "Profile saved but avatar upload failed", 
              severity: "warning" 
            });
          }
        }

        setNotification({ open: true, message: "Welcome to Cofoundless!", severity: "success" });
        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        setApiError("Unable to save profile");
      }
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress
  const progress = () => {
    let completed = 0;
    if (avatarFile) completed += 25;
    if (form.first_name) completed += 25;
    if (form.last_name) completed += 25;
    if (form.date_of_birth) completed += 25;
    return completed;
  };

  return (
    <Box 
      sx={{ 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column",
        bgcolor: theme.palette.background.default,
        position: "relative",
        overflow: "hidden",
        // Subtle animated background
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark'
            ? `radial-gradient(circle at 20% 80%, ${theme.palette.primary.dark}20 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, ${theme.palette.secondary.dark}15 0%, transparent 50%)`
            : `radial-gradient(circle at 20% 80%, ${theme.palette.primary.light}20 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, ${theme.palette.secondary.light}15 0%, transparent 50%)`,
          animation: "drift 20s ease-in-out infinite",
          zIndex: 0,
        },
        "@keyframes drift": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(-20px, -20px)" },
        }
      }}
    >
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={notification.severity}>{notification.message}</Alert>
      </Snackbar>

      {/* Progress Bar */}
      <LinearProgress 
        variant="determinate" 
        value={progress()} 
        sx={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          height: 3,
          zIndex: 1200,
          bgcolor: 'transparent',
          '& .MuiLinearProgress-bar': {
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          }
        }} 
      />

      {/* Header */}
      <Box sx={{ p: { xs: 2, sm: 3 }, zIndex: 1 }}>
        <Box sx={{ 
          width: "100%", 
          maxWidth: 1000, 
          mx: "auto",
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <Fade in timeout={800}>
            <Box>
              <Typography 
                variant="h4" 
                fontWeight="bold"
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: "text",
                  textFillColor: "transparent",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Welcome to Cofoundless
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Complete your profile to get started
              </Typography>
            </Box>
          </Fade>
          <Button 
            variant="text" 
            color="error" 
            onClick={() => {clearUser(); navigate("/login");}}
            sx={{ minWidth: 'auto' }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 2, sm: 3 }, zIndex: 1 }}>
        <Fade in timeout={1000}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, sm: 5 }, 
              width: "100%", 
              maxWidth: 800,
              borderRadius: 3,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {apiError && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setApiError("")}>
                {apiError}
              </Alert>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Avatar Upload */}
              <Fade in timeout={500}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 5 }}>
                  <Avatar 
                    src={avatarPreview} 
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      mb: 3,
                      border: `4px solid ${theme.palette.primary.main}`,
                      boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
                    }}
                  >
                    {!avatarPreview && <Person sx={{ fontSize: 60 }} />}
                  </Avatar>
                  
                  <Button 
                    component="label" 
                    variant={avatarPreview ? "outlined" : "contained"}
                    startIcon={<CloudUpload />}
                    sx={{ mb: 1 }}
                  >
                    {avatarPreview ? "Change Photo" : "Upload Profile Picture"}
                    <input 
                      type="file" 
                      accept="image/jpeg, image/jpg, image/png" 
                      onChange={handleAvatarChange} 
                      hidden 
                    />
                  </Button>
                  
                  <Typography variant="caption" color="text.secondary">
                    JPEG or PNG only, max 5MB
                  </Typography>
                </Box>
              </Fade>

              {/* Name Fields */}
              <Fade in timeout={700}>
                <Box sx={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 3, mb: 3 }}>
                  <TextField
                    name="first_name" 
                    label="First Name" 
                    value={form.first_name} 
                    onChange={handleChange}
                    error={!!errors.first_name} 
                    helperText={errors.first_name} 
                    disabled={loading} 
                    fullWidth
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                    }}
                  />
                  <TextField
                    name="last_name" 
                    label="Last Name" 
                    value={form.last_name} 
                    onChange={handleChange}
                    error={!!errors.last_name} 
                    helperText={errors.last_name} 
                    disabled={loading} 
                    fullWidth
                  />
                </Box>
              </Fade>

              {/* Date of Birth */}
              <Fade in timeout={900}>
                <TextField
                  name="date_of_birth" 
                  type="date" 
                  label="Date of Birth" 
                  value={form.date_of_birth} 
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }} 
                  error={!!errors.date_of_birth} 
                  helperText={errors.date_of_birth}
                  disabled={loading} 
                  fullWidth
                  InputProps={{
                    startAdornment: <CalendarMonth sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                  }}
                />
              </Fade>

              {/* Submit Button */}
              <Fade in timeout={1100}>
                <Button
                  type="submit" 
                  variant="contained" 
                  fullWidth 
                  disabled={loading || progress() < 75} // Only require 75% since avatar is optional
                  sx={{ 
                    mt: 5, 
                    py: 1.5,
                    fontSize: '1.1rem',
                    background: loading ? theme.palette.grey[400] : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    }
                  }}
                >
                  {loading ? "Creating Your Profile..." : "Complete Setup"}
                </Button>
              </Fade>

              {/* Progress Indicator */}
              {progress() < 75 && (
                <Fade in timeout={1300}>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ mt: 2, display: 'block', textAlign: 'center' }}
                  >
                    Complete all required fields to continue
                  </Typography>
                </Fade>
              )}
            </form>
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
};