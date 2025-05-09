import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Alert, Paper, 
  Divider, useTheme, CircularProgress, Avatar, useMediaQuery,
  Snackbar
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
        const avatarResponse = await uploadFile("/profile/avatar", formData);
        if (avatarResponse?.profile?.avatar_url) {
          profileData.avatar_url = avatarResponse.profile.avatar_url;
        }
      }

      // Submit profile data
      const response = await putData(`/profile`, profileData);
      if (response?.profile) {
        setProfile(response.profile);
        setIsEditing(false);
        showNotification("Profile updated successfully!");
        setAvatarFile(null); // Reset after successful upload
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

  // Field definitions
  const fields = [
    { name: "first_name", label: "First Name" },
    { name: "last_name", label: "Last Name" },
    {
      name: "date_of_birth",
      label: "Date of Birth",
      type: "date",
      format: val => val ? new Date(val).toLocaleDateString() : "—"
    }
  ];

  // Loading state
  if (!profile) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Common styles
  const borderRadius = theme.shape.borderRadius;
  
  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius,
      backgroundColor: "rgba(255,255,255,0.04)"
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        p: { xs: 2, sm: 3 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
      <Box
        sx={{
          width: "100%",
          maxWidth: "800px",
          mb: 3
        }}
      >
        <Typography 
          variant="h3" 
          fontWeight="bold" 
          sx={{ fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" } }}
        >
          {isEditing ? "Edit Profile" : "Your Profile"}
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          {isEditing ? "Update your personal information" : "View and manage your personal information"}
        </Typography>
      </Box>

      {/* Main Profile Card */}
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2.5, sm: 3, md: 4 },
          width: "100%",
          maxWidth: "800px",
          borderRadius,
          background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          boxShadow: theme.shadows[10],
          transition: "transform 0.3s ease",
          "&:hover": { transform: "translateY(-5px)" }
        }}
      >
        {/* API Error Alert */}
        {apiError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius }}
            onClose={() => setApiError("")}
          >
            {apiError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Avatar Section */}
          <Box 
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 4,
              mt: 1
            }}
          >
            {/* Avatar Preview */}
            <Avatar
              src={avatarPreview || "https://via.placeholder.com/150"}
              alt="Profile Avatar"
              sx={{
                width: 130,
                height: 130,
                mb: 2,
                boxShadow: theme.shadows[3],
                border: `2px solid ${theme.palette.primary.main}`
              }}
            />
            
            {/* Upload Button - only show in edit mode */}
            {isEditing && (
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                sx={{ 
                  textTransform: "none", 
                  borderRadius,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[2]
                  }
                }}
              >
                {avatarFile ? "Change Photo" : "Upload Profile Picture"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  hidden
                />
              </Button>
            )}
          </Box>

          {/* Form Fields */}
          <Box sx={{ mb: 4 }}>
            {fields.map(({ name, label, type = "text", format }) => (
              <Box key={name} mb={3}>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary" 
                  gutterBottom
                  fontWeight={500}
                >
                  {label}
                </Typography>
                
                {isEditing ? (
                  <TextField
                    name={name}
                    type={type}
                    value={formData[name]}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors[name]}
                    helperText={errors[name]}
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                    sx={inputStyle}
                  />
                ) : (
                  <Typography 
                    variant="body1" 
                    fontWeight={500}
                    sx={{ py: 1 }}
                  >
                    {format ? format(profile[name]) : profile[name] || "—"}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Action Buttons */}
          <Box 
            display="flex" 
            justifyContent="center" 
            gap={2}
            flexDirection={isMobile ? "column" : "row"}
          >
            {isEditing ? (
              <>
                <Button 
                  variant="outlined" 
                  onClick={handleCancel} 
                  disabled={loading}
                  startIcon={<Cancel />}
                  fullWidth={isMobile}
                  sx={{
                    borderRadius,
                    py: 1,
                    textTransform: "none",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[2]
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  type="submit" 
                  disabled={loading}
                  startIcon={<Save />}
                  fullWidth={isMobile}
                  sx={{
                    borderRadius,
                    py: 1,
                    textTransform: "none",
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 8px 20px rgba(99, 102, 241, 0.3)`
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
                  borderRadius,
                  py: 1.2,
                  px: 3,
                  textTransform: "none",
                  background: theme.palette.primary.main,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}