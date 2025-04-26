import React, { useState } from "react";
import { Box, Typography, TextField, Button, Alert, CircularProgress, useTheme } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { postData } from "../../utils/BackendRequestHelper";
import { useUserStore } from '../../store/userStore';

// Validation schema using Zod
const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required")
});

const ProfileOnboarding = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const userId = useUserStore(state => state.userId);
  
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      date_of_birth: ""
    }
  });

  // Handle form submission
  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    
    if (!userId) {
      setError("Authentication error. Please log in again.");
      setSubmitting(false);
      return;
    }
    
    try {
      const response = await postData(`/profiles/${userId}`, data);
      
      // The critical fix: properly check response structure, not just status
      if (response && (response.status === 201 || response.message === "Profile created successfully")) {
        // Store profile data in state if needed
        if (response.profile) {
          useUserStore.getState().setProfile(response.profile);
        }
        
        // Navigate to dashboard
        navigate("/dashboard");
        return; // Early return after success
      }
      
      // If we get here, something went wrong
      setError("Failed to save your profile. Please try again.");
    } catch (err) {
      setError("Something went wrong. Please check your connection and try again.");
      console.error("Error saving profile:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: theme.spacing(6),
        bgcolor: theme.palette.background.default,
        p: 3
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 400 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
          Complete Your Profile
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, color: theme.palette.text.secondary }}>
          Fill out these details to personalize your experience.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* First Name Field */}
          <TextField
            {...register("first_name")}
            label="First Name"
            fullWidth
            margin="normal"
            error={!!errors.first_name}
            helperText={errors.first_name?.message}
            disabled={submitting}
            aria-invalid={!!errors.first_name}
            InputLabelProps={{ shrink: true }}
          />

          {/* Last Name Field */}
          <TextField
            {...register("last_name")}
            label="Last Name"
            fullWidth
            margin="normal"
            error={!!errors.last_name}
            helperText={errors.last_name?.message}
            disabled={submitting}
            aria-invalid={!!errors.last_name}
            InputLabelProps={{ shrink: true }}
          />

          {/* Date of Birth Field */}
          <TextField
            {...register("date_of_birth")}
            label="Date of Birth"
            type="date"
            fullWidth
            margin="normal"
            error={!!errors.date_of_birth}
            helperText={errors.date_of_birth?.message}
            disabled={submitting}
            aria-invalid={!!errors.date_of_birth}
            InputLabelProps={{ shrink: true }}
          />

          {/* Submit Button */}
          <Button
            variant="contained"
            fullWidth
            type="submit"
            disabled={submitting}
            sx={{
              py: 1.5,
              mt: 3,
              textTransform: "none",
              position: "relative"
            }}
          >
            {submitting ? (
              <CircularProgress size={24} color="inherit" sx={{ position: "absolute" }} />
            ) : (
              "Save Profile"
            )}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default ProfileOnboarding;
