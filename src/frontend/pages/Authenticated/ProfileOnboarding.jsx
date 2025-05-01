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
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { postData } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";

const ProfileOnboarding = () => {
  // Core state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  
  // Hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { clearUser } = useUserStore();
  
  // Form handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear API error when user makes any change
    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { first_name, last_name, date_of_birth } = formData;
    
    if (!first_name.trim()) {
      newErrors.first_name = "First name is required";
    }
    
    if (!last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }
    
    if (!date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    } else {
      // Basic date validation
      const dob = new Date(date_of_birth);
      const today = new Date();
      
      if (isNaN(dob.getTime())) {
        newErrors.date_of_birth = "Invalid date format";
      } else if (dob > today) {
        newErrors.date_of_birth = "Date of birth cannot be in the future";
      } else if (today.getFullYear() - dob.getFullYear() > 120) {
        newErrors.date_of_birth = "Please enter a valid date of birth";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setApiError("");
    
    try {
      const response = await postData(`/profile`, formData);
      
      if (response && (response.status === 201 || response.message === "Profile created successfully")) {
        if (response.profile) {
          useUserStore.getState().setProfile(response.profile);
        }
        navigate("/dashboard");
      } else {
        setApiError("Unable to save your profile. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    clearUser();
    navigate("/login");
  };

  // Styles derived from theme
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
        
        {/* Logout Button */}
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

      {/* Form Container */}
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
          {/* First Name */}
          <TextField
            name="first_name"
            label="First Name"
            value={formData.first_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.first_name}
            helperText={errors.first_name}
            disabled={isSubmitting}
            sx={inputStyles}
          />

          {/* Last Name */}
          <TextField
            name="last_name"
            label="Last Name"
            value={formData.last_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.last_name}
            helperText={errors.last_name}
            disabled={isSubmitting}
            sx={inputStyles}
          />

          {/* Date of Birth */}
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
            disabled={isSubmitting}
            InputLabelProps={{ shrink: true }}
            sx={inputStyles}
          />

          {/* Submit Button */}
          <Button
            variant="contained"
            type="submit"
            fullWidth
            disabled={isSubmitting}
            sx={{
              mt: 4,
              py: 1.5,
              borderRadius,
              fontWeight: 600,
              textTransform: "none",
              position: 'relative',
              transition: buttonTransition,
              "&:hover": buttonHoverStyles,
            }}
          >
            {isSubmitting ? (
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
    </Box>
  );
};

export default ProfileOnboarding;