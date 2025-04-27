import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  useTheme
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import { putData } from "../../utils/BackendRequestHelper";
import { motion, AnimatePresence } from "framer-motion";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
});

const UserProfilePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const profile = useUserStore((state) => state.profile);
  const setProfile = useUserStore((state) => state.setProfile);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      date_of_birth: "",
    },
  });

  useEffect(() => {
    if (profile && isEditing) {
      reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        date_of_birth: formatDateForInput(profile.date_of_birth) || "",
      });
    }
  }, [profile, isEditing, reset]);

  const formatDateForInput = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toISOString().split("T")[0];
  };

  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");

    try {
      const response = await putData(`/profile`, data);

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
        bgcolor: theme.palette.background.default,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: { xs: 2, md: theme.spacing(6) },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          width: "100%",
          maxWidth: theme.breakpoints.values.md,
          textAlign: "left",
          mb: theme.spacing(4),
        }}
      >
        <Typography variant="h3" fontWeight="bold" mb={1}>
          {isEditing ? "Edit Your Profile" : "Your Profile"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isEditing
            ? "Update your details below."
            : "Review your personal information."}
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
            maxWidth: theme.breakpoints.values.md,
            mx: "auto",
            p: { xs: 3, md: 5 },
            borderRadius: theme.shape.borderRadius,
            background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
            boxShadow: theme.shadows[10],
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: theme.spacing(3) }}>
              {error}
            </Alert>
          )}

          {profile ? (
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <AnimatePresence mode="wait">
                {["first_name", "last_name", "date_of_birth"].map(
                  (field, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Box mb={theme.spacing(3)}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          {field
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
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
                              "& .MuiOutlinedInput-root": {
                                borderRadius: theme.shape.borderRadius,
                                backgroundColor: "rgba(255,255,255,0.04)",
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
                    </motion.div>
                  )
                )}
              </AnimatePresence>

              <Divider sx={{ my: theme.spacing(4) }} />

              <Box display="flex" justifyContent="center" gap={2}>
                {isEditing ? (
                  <>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={toggleEditMode}
                      disabled={submitting}
                      sx={{
                        textTransform: "none",
                        borderRadius: theme.shape.borderRadius,
                        transition: theme.transitions.create(["transform", "box-shadow"], {
                          duration: theme.transitions.duration.short,
                        }),
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: theme.shadows[6],
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={submitting}
                      sx={{
                        textTransform: "none",
                        borderRadius: theme.shape.borderRadius,
                        transition: theme.transitions.create(["transform", "box-shadow"], {
                          duration: theme.transitions.duration.short,
                        }),
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: theme.shadows[6],
                        },
                      }}
                    >
                      {submitting ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={toggleEditMode}
                    sx={{
                      textTransform: "none",
                      borderRadius: theme.shape.borderRadius,
                      transition: theme.transitions.create(["transform", "box-shadow"], {
                        duration: theme.transitions.duration.short,
                      }),
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: theme.shadows[6],
                      },
                    }}
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
      </motion.div>
    </Box>
  );
};

export default UserProfilePage;
