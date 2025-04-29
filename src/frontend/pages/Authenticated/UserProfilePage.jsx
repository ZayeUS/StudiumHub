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
  useTheme,
  useMediaQuery
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import { putData } from "../../utils/BackendRequestHelper";

const UserProfilePage = () => {
  // Core state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: ""
  });
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // Hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const profile = useUserStore((state) => state.profile);
  const setProfile = useUserStore((state) => state.setProfile);

  // Load profile data when available or when edit mode changes
  useEffect(() => {
    if (profile) {
      const formattedData = {
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        date_of_birth: formatDateForInput(profile.date_of_birth) || ""
      };
      
      setFormData(formattedData);
      setOriginalData(formattedData);
    }
  }, [profile]);

  // Date formatting utilities
  const formatDateForInput = (isoDate) => {
    if (!isoDate) return "";
    try {
      const date = new Date(isoDate);
      return date.toISOString().split("T")[0];
    } catch (e) {
      console.error("Invalid date format:", e);
      return "";
    }
  };

  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return "";
    try {
      const date = new Date(isoDate);
      return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
        .getDate()
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
    } catch (e) {
      console.error("Invalid date format:", e);
      return "";
    }
  };

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
      const response = await putData(`/profile`, formData);
      
      if (response && response.profile) {
        setProfile(response.profile);
        setIsEditing(false);
        setOriginalData({ ...formData });
      } else {
        setApiError("Failed to update profile. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Reset form data to original values when cancelling
      setFormData({ ...originalData });
      setErrors({});
    }
    setIsEditing(!isEditing);
    setApiError("");
  };

  // Check if form has changes to enable/disable save button
  const hasChanges = () => {
    return Object.keys(originalData).some(key => originalData[key] !== formData[key]);
  };

  // Styles derived from theme
  const borderRadius = theme.shape.borderRadius;
  const fieldStyles = {
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
    boxShadow: theme.shadows[4],
  };
  
  const mainBgGradient = `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`;

  // Field configurations for easier mapping
  const fields = [
    { 
      name: "first_name", 
      label: "First Name", 
      type: "text" 
    },
    { 
      name: "last_name", 
      label: "Last Name", 
      type: "text" 
    },
    { 
      name: "date_of_birth", 
      label: "Date of Birth", 
      type: "date",
      formatter: formatDateForDisplay
    }
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: { xs: 2, md: 6 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          width: "100%",
          maxWidth: theme.breakpoints.values.md,
          textAlign: "left",
          mb: 4,
        }}
      >
        <Typography 
          variant="h3" 
          fontWeight="bold" 
          mb={1}
          sx={{
            fontSize: { xs: "2.2rem", md: "3rem" },
            transition: "fontSize 0.3s ease",
          }}
        >
          {isEditing ? "Edit Your Profile" : "Your Profile"}
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}
        >
          {isEditing
            ? "Update your details below."
            : "Review your personal information."}
        </Typography>
      </Box>

      {/* Profile Container */}
      <Paper
        elevation={10}
        sx={{
          width: "100%",
          maxWidth: theme.breakpoints.values.md,
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

        {profile ? (
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            noValidate
            sx={{ width: "100%" }}
          >
            {fields.map((field, index) => (
              <Box 
                key={field.name}
                mb={3}
                sx={{
                  opacity: 1,
                  transform: "translateY(0)",
                  transition: `all 0.3s ease ${index * 0.1}s`,
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {field.label}
                </Typography>
                
                {isEditing ? (
                  <TextField
                    name={field.name}
                    type={field.type}
                    value={formData[field.name]}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors[field.name]}
                    helperText={errors[field.name]}
                    disabled={isSubmitting}
                    InputLabelProps={{ shrink: true }}
                    sx={fieldStyles}
                  />
                ) : (
                  <Typography 
                    variant="h6" 
                    fontWeight="500"
                    sx={{
                      minHeight: "40px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {field.formatter
                      ? field.formatter(profile[field.name])
                      : profile[field.name] || "—"}
                  </Typography>
                )}
              </Box>
            ))}

            <Divider sx={{ my: 4 }} />

            <Box 
              display="flex" 
              justifyContent="center" 
              gap={2}
              sx={{ mt: 2 }}
            >
              {isEditing ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={toggleEditMode}
                    disabled={isSubmitting}
                    sx={{
                      px: 3,
                      py: 1,
                      borderRadius,
                      textTransform: "none",
                      transition: buttonTransition,
                      "&:hover": buttonHoverStyles,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting || !hasChanges()}
                    sx={{
                      px: 3,
                      py: 1,
                      borderRadius,
                      textTransform: "none",
                      position: "relative",
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
                      "Save Changes"
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={toggleEditMode}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius,
                    textTransform: "none",
                    transition: buttonTransition,
                    "&:hover": buttonHoverStyles,
                  }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Box>
        ) : (
          <Box 
            sx={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              minHeight: "300px"
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default UserProfilePage;