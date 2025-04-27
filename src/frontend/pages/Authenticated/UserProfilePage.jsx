import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Alert, CircularProgress, Paper, Divider } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useUserStore } from '../../store/userStore';
import { putData } from "../../utils/BackendRequestHelper";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
});

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const profile = useUserStore(state => state.profile);
  const userId = useUserStore(state => state.userId);
  const setProfile = useUserStore(state => state.setProfile);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      date_of_birth: ""
    }
  });

  useEffect(() => {
    if (profile && isEditing) {
      reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        date_of_birth: formatDateForInput(profile.date_of_birth) || ""
      });
    }
  }, [profile, isEditing, reset]);

  const formatDateForInput = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return `${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getDate().toString().padStart(2,'0')}/${date.getFullYear()}`;
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");
  
    try {
      const response = await putData(`/profile`, data); // ✅ NO userId in URL
  
      if (response && response.profile) {
        setProfile(response.profile);
        setIsEditing(false);
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };
  

  const toggleEditMode = () => setIsEditing(!isEditing);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 3,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 600,
          p: 5,
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          transition: 'all 0.3s ease',
        }}
      >
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {isEditing ? "Update Your Profile" : "Your Profile"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditing ? "Make changes below and save your profile." : "Here's your current information."}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {profile ? (
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {["first_name", "last_name", "date_of_birth"].map((field, index) => (
              <Box key={index} mb={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {field.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </Typography>
                {isEditing ? (
                  <TextField
                    {...register(field)}
                    type={field === "date_of_birth" ? "date" : "text"}
                    fullWidth
                    error={!!errors[field]}
                    helperText={errors[field]?.message}
                    disabled={submitting}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                ) : (
                  <Typography variant="h6" fontWeight="500">
                    {field === "date_of_birth"
                      ? formatDateForDisplay(profile[field])
                      : profile[field]}
                  </Typography>
                )}
              </Box>
            ))}

            <Divider sx={{ my: 4 }} />

            <Box display="flex" justifyContent="center" gap={2}>
              {isEditing ? (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={toggleEditMode}
                    disabled={submitting}
                    sx={{ textTransform: "none" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={submitting}
                    sx={{ textTransform: "none" }}
                  >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={toggleEditMode}
                  sx={{ textTransform: "none" }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Box>
        ) : (
          <Box textAlign="center">
            <CircularProgress />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default UserProfilePage;
