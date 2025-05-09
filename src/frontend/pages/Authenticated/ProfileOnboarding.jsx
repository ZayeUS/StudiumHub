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
      else if (today.getFullYear() - dob.getFullYear() > 120) errs.date_of_birth = "Too old to be true";
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
          const avatarResponse = await uploadFile("/profile/avatar", formData);
          
          if (avatarResponse?.profile?.avatar_url) {
            profileRes.profile.avatar_url = avatarResponse.profile.avatar_url;
            setProfile(profileRes.profile);
          }
        }

        setNotification({ open: true, message: "Profile saved successfully!", severity: "success" });
        setTimeout(() => navigate("/dashboard"), 800);
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

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", alignItems: "center" }}>
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
      <Box sx={{ width: "100%", maxWidth: 800, display: "flex", 
                 flexDirection: isMobile ? "column" : "row",
                 justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", mb: 4 }}>
        <Typography variant="h3" fontWeight="bold">Welcome Aboard</Typography>
        <Button variant="outlined" color="error" onClick={() => {clearUser(); navigate("/login");}}>Logout</Button>
      </Box>

      {/* Form */}
      <Paper sx={{ p: 3, width: "100%", maxWidth: 800 }}>
        {apiError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setApiError("")}>{apiError}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Avatar */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <Avatar src={avatarPreview} sx={{ width: 100, height: 100, mb: 2 }}/>
            <Button component="label" variant="outlined" startIcon={<CloudUpload />}>
              {avatarPreview ? "Change Photo" : "Upload Profile Picture"}
              <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
            </Button>
          </Box>

          {/* Fields */}
          <Box sx={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2 }}>
            <TextField
              name="first_name" label="First Name" value={form.first_name} onChange={handleChange}
              error={!!errors.first_name} helperText={errors.first_name} disabled={loading} fullWidth
            />
            <TextField
              name="last_name" label="Last Name" value={form.last_name} onChange={handleChange}
              error={!!errors.last_name} helperText={errors.last_name} disabled={loading} fullWidth
            />
          </Box>

          <TextField
            name="date_of_birth" type="date" label="Date of Birth" value={form.date_of_birth} onChange={handleChange}
            InputLabelProps={{ shrink: true }} error={!!errors.date_of_birth} helperText={errors.date_of_birth}
            disabled={loading} fullWidth sx={{ mt: 2 }}
          />

          {/* Submit */}
          <Button
            type="submit" variant="contained" fullWidth disabled={loading}
            sx={{ mt: 3, py: 1.5 }}
          >
            {loading ? "Saving..." : "Save & Continue"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};