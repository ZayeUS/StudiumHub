import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { postData } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";
import { motion } from "framer-motion"; // ✅ Add motion luxury like Profile page

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
});

const ProfileOnboarding = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const userId = useUserStore((state) => state.userId);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      date_of_birth: "",
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");

    try {
      const response = await postData(`/profile`, data);

      if (
        response &&
        (response.status === 201 ||
          response.message === "Profile created successfully")
      ) {
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
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "background.default",
        p: { xs: 2, md: 6 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "800px",
          textAlign: "left",
          mb: 4,
        }}
      >
        <Typography variant="h3" fontWeight="bold" mb={1}>
          Welcome Aboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Let's personalize your experience
        </Typography>
      </Box>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ width: "100%" }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: "800px",
            mx: "auto",
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: "linear-gradient(145deg, #1B263B, #0D1B2A)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ width: "100%" }}
          >
            {/* First Name */}
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
                  backgroundColor: "rgba(255,255,255,0.04)",
                },
              }}
            />

            {/* Last Name */}
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
                  backgroundColor: "rgba(255,255,255,0.04)",
                },
              }}
            />

            {/* Date of Birth */}
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
                  backgroundColor: "rgba(255,255,255,0.04)",
                },
              }}
            />

            {/* Submit Button */}
            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={submitting}
              sx={{
                mt: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 600,
                position: "relative",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(10,132,255,0.3)",
                },
              }}
            >
              {submitting ? (
                <CircularProgress
                  size={24}
                  color="inherit"
                  sx={{ position: "absolute" }}
                />
              ) : (
                "Save & Continue"
              )}
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default ProfileOnboarding;
