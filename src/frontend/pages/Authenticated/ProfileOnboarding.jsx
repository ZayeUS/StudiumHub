import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  useTheme,
  useMediaQuery,
  Snackbar
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { postData } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";

const ProfileOnboarding = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: ""
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const { clearUser } = useUserStore();
  const loading = useUserStore(state => state.loading);
  const setLoading = useUserStore(state => state.setLoading);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
    if (apiError) setApiError("");
  };

  const validateForm = () => {
    const { first_name, last_name, date_of_birth } = formData;
    const newErrors = {};
    if (!first_name.trim()) newErrors.first_name = "First name is required";
    if (!last_name.trim()) newErrors.last_name = "Last name is required";

    if (!date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    } else {
      const dob = new Date(date_of_birth);
      const today = new Date();
      if (isNaN(dob.getTime())) newErrors.date_of_birth = "Invalid date format";
      else if (dob > today) newErrors.date_of_birth = "Date of birth cannot be in the future";
      else if (today.getFullYear() - dob.getFullYear() > 120) newErrors.date_of_birth = "Please enter a valid date of birth";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError("");

    try {
      const response = await postData(`/profile`, formData);

      if (response && (response.status === 201 || response.message === "Profile created successfully")) {
        if (response.profile) useUserStore.getState().setProfile(response.profile);
        showNotification("Profile created successfully!", "success");
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        setApiError("Unable to save your profile. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearUser();
    navigate("/login");
  };

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  const borderRadius = theme.shape.borderRadius;
  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius,
      backgroundColor: "rgba(255,255,255,0.04)",
    }
  };

  const buttonTransition = theme.transitions.create(["transform", "box-shadow"], {
    duration: theme.transitions.duration.short,
  });

  const buttonHoverStyles = {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[6],
  };

  const mainBgGradient = `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: theme.palette.background.default,
        p: { xs: 2, md: 6 },
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

      {/* Header with Logout */}
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
          <Typography
            variant="h3"
            fontWeight="bold"
            mb={1}
            sx={{
              fontSize: { xs: "2.2rem", md: "3rem" },
              transition: "fontSize 0.3s ease",
            }}
          >
            Welcome Aboard
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}
          >
            Let's personalize your experience
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={handleLogout}
          sx={{
            borderRadius,
            textTransform: "none",
            px: 2,
            py: 0.75,
            transition: buttonTransition,
            borderColor: theme.palette.error.main,
            color: theme.palette.error.main,
            "&:hover": {
              borderColor: theme.palette.error.dark,
              backgroundColor: `${theme.palette.error.main}10`,
              ...buttonHoverStyles
            },
          }}
        >
          Logout
        </Button>
      </Box>

      {/* Form */}
      <Paper
        elevation={10}
        sx={{
          width: "100%",
          maxWidth: "800px",
          mx: "auto",
          p: { xs: 3, md: 5 },
          borderRadius,
          background: mainBgGradient,
          boxShadow: theme.shadows[10],
          transform: "translateY(0)",
          transition: "transform 0.5s ease-out",
          "&:hover": {
            transform: "translateY(-5px)",
          }
        }}
      >
        {apiError && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius,
              '& .MuiAlert-icon': { alignSelf: 'center' }
            }}
          >
            {apiError}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ width: "100%" }}
        >
          <TextField
            name="first_name"
            label="First Name"
            value={formData.first_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.first_name}
            helperText={errors.first_name}
            disabled={loading}
            sx={inputStyles}
          />

          <TextField
            name="last_name"
            label="Last Name"
            value={formData.last_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.last_name}
            helperText={errors.last_name}
            disabled={loading}
            sx={inputStyles}
          />

          <TextField
            name="date_of_birth"
            label="Date of Birth"
            type="date"
            value={formData.date_of_birth}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.date_of_birth}
            helperText={errors.date_of_birth}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
            sx={inputStyles}
          />

          <Button
            variant="contained"
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              mt: 4,
              py: 1.5,
              borderRadius,
              fontWeight: 600,
              textTransform: "none",
              transition: buttonTransition,
              "&:hover": buttonHoverStyles,
            }}
          >
            {loading ? "Saving..." : "Save & Continue"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfileOnboarding;
