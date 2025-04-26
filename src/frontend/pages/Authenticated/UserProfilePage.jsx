import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Alert, CircularProgress, useTheme, Paper, Divider } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useUserStore } from '../../store/userStore';
import { putData } from "../../utils/BackendRequestHelper";

// Validation schema using Zod
const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required")
});

const UserProfilePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const profile = useUserStore(state => state.profile);
  const userId = useUserStore(state => state.userId);
  const setProfile = useUserStore(state => state.setProfile); // Get setProfile function from store

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      date_of_birth: ""
    }
  });

  // Format date from ISO to YYYY-MM-DD for input display
  const formatDateForInput = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toISOString().split('T')[0];
  };

  // Format date for display (MM/DD/YYYY)
  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Set form values when profile data is available or when switching to edit mode
  useEffect(() => {
    if (profile && isEditing) {
      reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        date_of_birth: formatDateForInput(profile.date_of_birth) || ""
      });
    }
  }, [profile, isEditing, reset]);

  // Form submission handler
  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");

    try {
      const response = await putData(`/profiles/${userId}`, data);

      if (response && response.profile) {
        // Update the store with the new profile data
        setProfile(response.profile);
        setIsEditing(false);
        // Success message could be added here
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please check your connection and try again.");
      console.error("Error saving profile:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel - reset form to original values
      setIsEditing(false);
    } else {
      // Enable edit mode
      setIsEditing(true);
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
      <Box sx={{ width: "100%", maxWidth: 600 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
          {isEditing ? "Edit Your Profile" : "Your Profile"}
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, color: theme.palette.text.secondary }}>
          {isEditing ? "Update your profile details below." : "View your profile information."}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          {profile ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Typography variant="h6">First Name</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {isEditing ? (
                  <TextField
                    {...register("first_name")}
                    fullWidth
                    error={!!errors.first_name}
                    helperText={errors.first_name?.message}
                    disabled={submitting}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: theme.shape.borderRadius
                      }
                    }}
                  />
                ) : (
                  profile.first_name
                )}
              </Typography>

              <Typography variant="h6">Last Name</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {isEditing ? (
                  <TextField
                    {...register("last_name")}
                    fullWidth
                    error={!!errors.last_name}
                    helperText={errors.last_name?.message}
                    disabled={submitting}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: theme.shape.borderRadius
                      }
                    }}
                  />
                ) : (
                  profile.last_name
                )}
              </Typography>

              <Typography variant="h6">Date of Birth</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {isEditing ? (
                  <TextField
                    {...register("date_of_birth")}
                    type="date"
                    fullWidth
                    error={!!errors.date_of_birth}
                    helperText={errors.date_of_birth?.message}
                    disabled={submitting}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: theme.shape.borderRadius
                      }
                    }}
                  />
                ) : (
                  formatDateForDisplay(profile.date_of_birth)
                )}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              {/* Action buttons */}
              {isEditing ? (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={toggleEditMode}
                    disabled={submitting}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={submitting}
                    sx={{ ml: 2 }}
                  >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : "Save Profile"}
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  onClick={toggleEditMode}
                  sx={{ mt: 2 }}
                  type="button"
                >
                  Edit Profile
                </Button>
              )}
            </form>
          ) : (
            <CircularProgress />
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default UserProfilePage;