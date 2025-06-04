import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Alert, Paper, 
  useTheme, CircularProgress, Avatar, useMediaQuery,
  Snackbar, Fade, Divider, Container
} from "@mui/material";
import { CloudUpload, Edit, Save, Cancel, Person } from "@mui/icons-material";
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
        py: { xs: 3, sm: 4 }
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

      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            fontWeight={700}
            color="text.primary"
            gutterBottom
          >
            {isEditing ? "Edit Profile" : "Profile Settings"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditing ? "Update your personal information" : "Manage your account details and preferences"}
          </Typography>
        </Box>

        {/* Main Content */}
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: theme.shape.borderRadiusLG,
          }}
        >
          {apiError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setApiError("")}>
              {apiError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Avatar Section */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
              <Avatar
                src={avatarPreview}
                sx={{
                  width: 100,
                  height: 100,
                  mb: 2,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '2rem'
                }}
              >
                {!avatarPreview && <Person fontSize="large" />}
              </Avatar>
              
              {isEditing && (
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    size="small"
                    sx={{ mb: 1 }}
                  >
                    {avatarFile ? "Change Photo" : "Upload Photo"}
                    <input
                      type="file"
                      accept="image/jpeg, image/jpg, image/png"
                      onChange={handleAvatarChange}
                      hidden
                    />
                  </Button>
                  <Typography variant="caption" display="block" color="text.secondary">
                    JPEG or PNG, max 5MB
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Form Fields */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 3 }}>
                {/* First Name */}
                <Box>
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
                      placeholder="Enter first name"
                    />
                  ) : (
                    <Typography variant="body1" fontWeight={500} color="text.primary">
                      {profile.first_name || "Not provided"}
                    </Typography>
                  )}
                </Box>

                {/* Last Name */}
                <Box>
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
                      placeholder="Enter last name"
                    />
                  ) : (
                    <Typography variant="body1" fontWeight={500} color="text.primary">
                      {profile.last_name || "Not provided"}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Date of Birth */}
              <Box>
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
                    sx={{ maxWidth: { xs: '100%', sm: '300px' } }}
                  />
                ) : (
                  <Typography variant="body1" fontWeight={500} color="text.primary">
                    {profile.date_of_birth 
                      ? new Date(profile.date_of_birth).toLocaleDateString() 
                      : "Not provided"}
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Action Buttons */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: 'wrap' }}>
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
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Save />}
                    sx={{ px: 3 }}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setIsEditing(true)}
                  startIcon={<Edit />}
                  sx={{ px: 4, py: 1.2 }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Email Section (Read-only) */}
        {/* <Paper
          elevation={8}
          sx={{
            p: { xs: 3, sm: 4 },
            mt: 3,
            borderRadius: theme.shape.borderRadiusLG,
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Account Information
          </Typography>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Email Address
            </Typography>
            <Typography variant="body1" fontWeight={500} color="text.primary">
              {profile.email}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Contact support to change your email address
            </Typography>
          </Box>
        </Paper> */}
      </Container>
    </Box>
  );
}