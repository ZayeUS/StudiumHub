import React, { useState } from "react";
import { Box, Typography, TextField, Button, Alert, CircularProgress, Paper } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { postData } from "../../utils/BackendRequestHelper";
import { useUserStore } from '../../store/userStore';

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
});

const ProfileOnboarding = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const userId = useUserStore(state => state.userId);

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

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");
  
    try {
      const response = await postData(`/profile`, data);  // ✅ No userId here
  
      if (response && (response.status === 201 || response.message === "Profile created successfully")) {
        if (response.profile) {
          useUserStore.getState().setProfile(response.profile);
        }
        navigate("/dashboard");
        return;
      }
  
      setError("Unable to save your profile. Please try again.");
    } catch (err) {
      setError("Something went wrong. Please try again later.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  

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
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 480,
          p: 5,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Box textAlign="center">
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome Aboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Let's personalize your experience
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: "100%", mt: 2 }}>
          <TextField
            {...register("first_name")}
            label="First Name"
            fullWidth
            margin="normal"
            error={!!errors.first_name}
            helperText={errors.first_name?.message}
            disabled={submitting}
            InputProps={{
              sx: {
                borderRadius: 2,
              }
            }}
          />

          <TextField
            {...register("last_name")}
            label="Last Name"
            fullWidth
            margin="normal"
            error={!!errors.last_name}
            helperText={errors.last_name?.message}
            disabled={submitting}
            InputProps={{
              sx: {
                borderRadius: 2,
              }
            }}
          />

          <TextField
            {...register("date_of_birth")}
            label="Date of Birth"
            type="date"
            fullWidth
            margin="normal"
            error={!!errors.date_of_birth}
            helperText={errors.date_of_birth?.message}
            disabled={submitting}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              sx: {
                borderRadius: 2,
              }
            }}
          />

          <Button
            variant="contained"
            type="submit"
            fullWidth
            disabled={submitting}
            sx={{
              mt: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              position: "relative",
            }}
          >
            {submitting ? (
              <CircularProgress size={24} color="inherit" sx={{ position: "absolute" }} />
            ) : (
              "Save & Continue"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfileOnboarding;
