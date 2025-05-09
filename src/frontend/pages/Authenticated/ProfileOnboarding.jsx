import React, { useState } from "react";
import {
  Box, Typography, TextField, Button, Alert, Paper,
  useTheme, useMediaQuery, Snackbar, Avatar
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { postData, uploadFile } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";

export const ProfileOnboarding = () => {
  // Form state
  const [form, setForm] = useState({ 
    first_name: "", 
    last_name: "", 
    date_of_birth: "",
    is_new_user: true // Add this flag to indicate a new user
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [notification, setNotification] = useState({ 
    open: false, 
    message: "", 
    severity: "success" 
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  
  // Get user store functions
  const { setProfile, clearUser, loading, setLoading } = useUserStore();

  // Notification handler
  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  // Form input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when field is edited
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (apiError) setApiError("");
  };

  // Avatar upload handler
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Form validation
  const validate = () => {
    const errs = {};
    const { first_name, last_name, date_of_birth } = form;

    if (!first_name.trim()) errs.first_name = "First name is required";
    if (!last_name.trim()) errs.last_name = "Last name is required";

    if (date_of_birth) {
      const dob = new Date(date_of_birth);
      const today = new Date();
      
      if (isNaN(dob.getTime())) {
        errs.date_of_birth = "Invalid date";
      } else if (dob > today) {
        errs.date_of_birth = "Cannot be in the future";
      } else if (today.getFullYear() - dob.getFullYear() > 120) {
        errs.date_of_birth = "Too old to be true";
      }
    } else {
      errs.date_of_birth = "Date of birth is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let profileData = { ...form };

      // Step 1: Create the profile first
      const profileRes = await postData("/profile", profileData);

      if (profileRes?.profile) {
        setProfile(profileRes.profile);

        // Step 2: If avatar file exists, upload it
        if (avatarFile) {
          const formData = new FormData();
          formData.append("avatar", avatarFile);
          
          // Upload avatar file to backend
          const avatarResponse = await uploadFile("/profile/avatar", formData);
          if (avatarResponse?.profile?.avatar_url) {
            profileRes.profile.avatar_url = avatarResponse.profile.avatar_url; // Update avatar URL
            setProfile(profileRes.profile); // Update profile in state
          }
        }

        showNotification("Profile saved successfully!");
        
        // Redirect to the stripe dashboard instead of regular dashboard
        setTimeout(() => navigate("/stripe-dashboard"), 800);
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

  // Logout handler
  const handleLogout = () => {
    clearUser();
    navigate("/login");
  };

  // Common styles
  const borderRadius = theme.shape.borderRadius;
  const transition = theme.transitions.create(["transform", "box-shadow"]);
  
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
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          mb: 4,
          gap: isMobile ? 2 : 0
        }}
      >
        <Box>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            sx={{ fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" } }}
          >
            Welcome Aboard
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Let's personalize your experience
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          onClick={handleLogout}
          size={isMobile ? "small" : "medium"}
          sx={{
            borderRadius,
            textTransform: "none",
            color: "error.main",
            borderColor: "error.main",
            px: 2,
            py: 0.75,
            transition,
            "&:hover": {
              backgroundColor: "error.main",
              color: "#fff",
              transform: "translateY(-2px)",
              boxShadow: theme.shadows[4]
            }
          }}
        >
          Logout
        </Button>
      </Box>

      {/* Main Form Card */}
      <Paper
        elevation={10}
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
          {/* Avatar Upload Section */}
          <Box 
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
              mt: 1
            }}
          >
            {/* Avatar Preview */}
            <Avatar
              src={avatarPreview}
              sx={{
                width: 100,
                height: 100,
                mb: 2,
                boxShadow: theme.shadows[3],
                border: `2px solid ${theme.palette.primary.main}`
              }}
            />
            
            {/* Upload Button */}
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUpload />}
              sx={{ 
                textTransform: "none", 
                borderRadius,
                transition,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[2]
                }
              }}
            >
              {avatarPreview ? "Change Photo" : "Upload Profile Picture"}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                hidden
              />
            </Button>
          </Box>

          {/* Form Fields */}
          <Box 
            sx={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
              gap: 2
            }}
          >
            <TextField
              name="first_name"
              label="First Name"
              value={form.first_name}
              onChange={handleChange}
              fullWidth
              error={!!errors.first_name}
              helperText={errors.first_name}
              disabled={loading}
              sx={inputStyle}
            />

            <TextField
              name="last_name"
              label="Last Name"
              value={form.last_name}
              onChange={handleChange}
              fullWidth
              error={!!errors.last_name}
              helperText={errors.last_name}
              disabled={loading}
              sx={inputStyle}
            />
          </Box>

          <TextField
            name="date_of_birth"
            type="date"
            label="Date of Birth"
            value={form.date_of_birth}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            error={!!errors.date_of_birth}
            helperText={errors.date_of_birth}
            disabled={loading}
            sx={{ ...inputStyle, mt: 2 }}
          />

          {/* Next Step Alert */}
          <Alert 
            severity="info" 
            sx={{ mt: 3, borderRadius }}
          >
            After completing your profile, you'll be directed to set up your subscription.
          </Alert>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 4,
              py: 1.5,
              borderRadius,
              fontWeight: 600,
              textTransform: "none",
              transition,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: `0 8px 20px rgba(99, 102, 241, 0.3)`
              }
            }}
          >
            {loading ? "Saving..." : "Save & Continue to Subscription"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};