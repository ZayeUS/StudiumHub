import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Alert, Paper, 
  useTheme, CircularProgress, Avatar, useMediaQuery,
  Snackbar, Fade, Divider
} from "@mui/material";
import { CloudUpload, Edit, Save, Cancel } from "@mui/icons-material";
import { useUserStore } from "../../store/userStore";
import { putData, uploadFile } from "../../utils/BackendRequestHelper";

export function UserProfilePage() {
  // State
  const [formData, setFormData] = useState({ 
    first_name: "", 
    last_name: "", 
    date_of_birth: "" 
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Hooks
  const profile = useUserStore(state => state.profile);
  const setProfile = useUserStore(state => state.setProfile);
  const loading = useUserStore(state => state.loading);
  const setLoading = useUserStore(state => state.setLoading);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        date_of_birth: profile.date_of_birth
          ? new Date(profile.date_of_birth).toISOString().split("T")[0]
          : ""
      });
      setAvatarPreview(profile.avatar_url);
    }
  }, [profile]);

  // Show notification
  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  // Form input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors
    if (errors[name]) {
      const updated = { ...errors };
      delete updated[name];
      setErrors(updated);
    }
    if (apiError) setApiError("");
  };

  // Avatar handler
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // File type validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        showNotification("Only JPEG and PNG images are allowed", "error");
        e.target.value = null;
        return;
      }

      // File size validation (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showNotification("Image size should be less than 5MB", "error");
        e.target.value = null;
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Form validation
  const validateForm = () => {
    const errs = {};
    if (!formData.first_name.trim()) errs.first_name = "First name is required";
    if (!formData.last_name.trim()) errs.last_name = "Last name is required";

    if (!formData.date_of_birth) {
      errs.date_of_birth = "Date of birth is required";
    } else {
      const dob = new Date(formData.date_of_birth);
      if (dob > new Date()) errs.date_of_birth = "Cannot be in the future";
      if (isNaN(dob.getTime())) errs.date_of_birth = "Invalid date";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let profileData = { ...formData };

      // If avatar file exists, upload it first
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        
        try {
          const avatarResponse = await uploadFile("/profile/avatar", formData);
          if (avatarResponse?.profile?.avatar_url) {
            profileData.avatar_url = avatarResponse.profile.avatar_url;
          }
        } catch (uploadError) {
          showNotification("Profile updated but avatar upload failed", "warning");
        }
      }

      // Submit profile data
      const response = await putData(`/profile`, profileData);
      if (response?.profile) {
        setProfile(response.profile);
        setIsEditing(false);
        showNotification("Profile updated successfully!");
        setAvatarFile(null);
      } else {
        setApiError("Update failed");
      }
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setApiError("");
    
    // Reset form to original profile data
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        date_of_birth: profile.date_of_birth
          ? new Date(profile.date_of_birth).toISOString().split("T")[0]
          : ""
      });
      setAvatarPreview(profile.avatar_url);
      setAvatarFile(null);
    }
  };

  // Loading state
  if (!profile) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        position: "relative",
        overflow: "hidden",
        // Same animated background as onboarding
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

      {/* Header */}
      <Box sx={{ p: { xs: 2, sm: 3 }, position: "relative", zIndex: 1 }}>
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
          <Fade in timeout={500}>
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
              {isEditing ? "Edit Profile" : "Your Profile"}
            </Typography>
          </Fade>
          <Fade in timeout={700}>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {isEditing ? "Update your personal information" : "Manage your account settings"}
            </Typography>
          </Fade>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: { xs: 2, sm: 3 }, position: "relative", zIndex: 1 }}>
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              maxWidth: 800,
              mx: "auto",
              p: { xs: 3, sm: 5 },
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

            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Avatar Section */}
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
                />
                
                {isEditing && (
                  <>
                    <Button
                      component="label"
                      variant={avatarFile ? "outlined" : "contained"}
                      startIcon={<CloudUpload />}
                      sx={{ mb: 1 }}
                    >
                      {avatarFile ? "Change Photo" : "Upload Profile Picture"}
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
                  </>
                )}
              </Box>

              {/* Form Fields */}
              <Box sx={{ mb: 4 }}>
                {/* First Name */}
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    First Name
                  </Typography>
                  {isEditing ? (
                    <TextField
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      fullWidth
                      error={!!errors.first_name}
                      helperText={errors.first_name}
                      disabled={loading}
                    />
                  ) : (
                    <Typography variant="body1" fontWeight={500}>
                      {profile.first_name || "—"}
                    </Typography>
                  )}
                </Box>

                {/* Last Name */}
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Last Name
                  </Typography>
                  {isEditing ? (
                    <TextField
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      fullWidth
                      error={!!errors.last_name}
                      helperText={errors.last_name}
                      disabled={loading}
                    />
                  ) : (
                    <Typography variant="body1" fontWeight={500}>
                      {profile.last_name || "—"}
                    </Typography>
                  )}
                </Box>

                {/* Date of Birth */}
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Date of Birth
                  </Typography>
                  {isEditing ? (
                    <TextField
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      fullWidth
                      error={!!errors.date_of_birth}
                      helperText={errors.date_of_birth}
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                    />
                  ) : (
                    <Typography variant="body1" fontWeight={500}>
                      {profile.date_of_birth 
                        ? new Date(profile.date_of_birth).toLocaleDateString() 
                        : "—"}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Action Buttons */}
              <Box display="flex" justifyContent="center" gap={2}>
                {isEditing ? (
                  <>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      disabled={loading}
                      startIcon={<Cancel />}
                      sx={{ px: 3 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={loading}
                      startIcon={<Save />}
                      sx={{
                        px: 3,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                        }
                      }}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setIsEditing(true)}
                    startIcon={<Edit />}
                    sx={{
                      px: 4,
                      py: 1.2,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      }
                    }}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
}