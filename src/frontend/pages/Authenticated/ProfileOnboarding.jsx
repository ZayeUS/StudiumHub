import React, { useState } from "react";
import {
  Box, Typography, TextField, Button, Alert, Paper,
  useTheme, useMediaQuery, Snackbar
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { postData } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";

export const ProfileOnboarding = () => {
  const [form, setForm] = useState({ first_name: "", last_name: "", date_of_birth: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const { setProfile, clearUser, loading, setLoading } = useUserStore();

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const errs = {};
    const { first_name, last_name, date_of_birth } = form;

    if (!first_name.trim()) errs.first_name = "First name is required";
    if (!last_name.trim()) errs.last_name = "Last name is required";

    const dob = new Date(date_of_birth);
    const today = new Date();
    if (!date_of_birth) errs.date_of_birth = "Date of birth is required";
    else if (isNaN(dob.getTime())) errs.date_of_birth = "Invalid date";
    else if (dob > today) errs.date_of_birth = "Cannot be in the future";
    else if (today.getFullYear() - dob.getFullYear() > 120) errs.date_of_birth = "Too old to be true";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await postData("/profile", form);
      if (res?.profile) {
        setProfile(res.profile);
        showNotification("Profile saved!");
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

  const handleLogout = () => {
    clearUser();
    navigate("/login");
  };

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
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={notification.severity}>{notification.message}</Alert>
      </Snackbar>

      <Box
        sx={{
          width: "100%",
          maxWidth: "800px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h3" fontWeight="bold" sx={{ fontSize: { xs: "2rem", md: "2.75rem" } }}>
            Welcome Aboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Let’s personalize your experience
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={handleLogout}
          sx={{
            borderRadius,
            textTransform: "none",
            color: "error.main",
            borderColor: "error.main",
            px: 2,
            py: 1,
            transition,
            "&:hover": {
              backgroundColor: "error.light",
              borderColor: "error.dark",
              transform: "translateY(-2px)",
              boxShadow: theme.shadows[4]
            }
          }}
        >
          Logout
        </Button>
      </Box>

      <Paper
        elevation={10}
        sx={{
          p: { xs: 3, md: 5 },
          width: "100%",
          maxWidth: "800px",
          borderRadius,
          background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          boxShadow: theme.shadows[10],
          transition: "transform 0.3s ease",
          "&:hover": { transform: "translateY(-5px)" }
        }}
      >
        {apiError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius }}>
            {apiError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            name="first_name"
            label="First Name"
            value={form.first_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
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
            margin="normal"
            error={!!errors.last_name}
            helperText={errors.last_name}
            disabled={loading}
            sx={inputStyle}
          />

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
            sx={inputStyle}
          />

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
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: theme.shadows[6]
              }
            }}
          >
            {loading ? "Saving..." : "Save & Continue"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
