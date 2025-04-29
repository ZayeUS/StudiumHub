import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Eye, EyeOff, Mail, Lock, ChevronRight, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signUp as firebaseSignUp, login as firebaseLogin, checkEmailExists } from "../../../firebase";
import { getData, postData } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";
import LoadingModal from "../../components/LoadingModal";

export default function SignUpPage() {
  // Core state
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "", 
    confirm: "", 
    role: "" 
  });
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: "", 
    severity: "success" 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { setUser, isLoggedIn, roleId, loading } = useUserStore();

  // Redirects if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate(roleId === 1 ? "/admin-dashboard" : "/dashboard");
    }
  }, [isLoggedIn, roleId, navigate]);

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getData("/roles");
        setRoles(data);
      } catch (error) {
        showNotification(
          "Failed to load roles. Please refresh and try again.", 
          "error"
        );
      }
    };
    fetchRoles();
  }, []);

  // Form handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { email, password, confirm, role } = formData;
    
    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email address";
    }
    
    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    // Confirm password validation
    if (!confirm) {
      newErrors.confirm = "Please confirm your password";
    } else if (confirm !== password) {
      newErrors.confirm = "Passwords must match";
    }
    
    // Role validation
    if (!role) {
      newErrors.role = "Please select a role";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    useUserStore.setState({ loading: true });
    
    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        setErrors(prev => ({ 
          ...prev, 
          email: "Email already in use" 
        }));
        setIsSubmitting(false);
        useUserStore.setState({ loading: false });
        return;
      }
      
      // Create Firebase account
      const user = await firebaseSignUp(formData.email, formData.password);
      
      // Sign in the user
      await firebaseLogin(formData.email, formData.password);
      
      // Find role ID from selected role name
      const selectedRole = roles.find(r => r.role_name === formData.role);
      if (!selectedRole) {
        throw new Error("Invalid role selected");
      }
      
      // Create backend user
      const backendUser = await postData("/users", {
        firebase_uid: user.uid,
        email: user.email,
        role_id: selectedRole.role_id,
      });
      
      // Update user store
      const { user_id } = backendUser.user;
      setUser(user.uid, selectedRole.role_id, user_id);
      
      // Show success and redirect
      showNotification("Account created successfully! Redirecting...", "success");
      
      setTimeout(() => {
        navigate(selectedRole.role_id === 1 ? "/admin-dashboard" : "/dashboard");
      }, 1000);
      
    } catch (error) {
      console.error(error);
      setErrors(prev => ({ 
        ...prev, 
        general: error.message || "Sign-up failed. Please try again." 
      }));
      showNotification(error.message || "Sign-up failed. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
      useUserStore.setState({ loading: false });
    }
  };

  // Utility functions
  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };
  
  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Styles derived from theme
  const borderRadius = theme.shape.borderRadius;
  const mainBgGradient = `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`;
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
    boxShadow: theme.shadows[6],
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: theme.palette.background.default,
        p: { xs: 2, md: 6 },
      }}
    >
      {/* Loading overlay */}
      <LoadingModal open={loading} />
      
      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={notification.severity}>{notification.message}</Alert>
      </Snackbar>

      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            borderRadius,
            background: mainBgGradient,
            overflow: "hidden",
            transform: "translateY(0)",
            transition: "transform 0.5s ease-out",
            "&:hover": {
              transform: "translateY(-5px)",
            }
          }}
        >
          {/* Header Section */}
          <Box 
            sx={{ 
              bgcolor: theme.palette.primary.main, 
              p: 3, 
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at 70% 30%, ${theme.palette.primary.light}20, transparent 50%)`,
                zIndex: 1,
              }
            }}
          >
            <Box position="relative" zIndex={2}>
              <UserPlus size={40} color={theme.palette.common.white} />
              <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mt: 1 }}>
                Create Account
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                Join our platform and get started
              </Typography>
            </Box>
          </Box>

          {/* Form Section */}
          <Box 
            component="form" 
            onSubmit={handleSignUp} 
            noValidate 
            sx={{ p: 3 }}
          >
            {/* Email Field */}
            <TextField
              name="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail color={theme.palette.primary.main} size={20} />
                  </InputAdornment>
                ),
              }}
              sx={fieldStyles}
            />

            {/* Password Field */}
            <TextField
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color={theme.palette.primary.main} size={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={() => setShowPassword(!showPassword)} 
                      edge="end"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? 
                        <EyeOff color={theme.palette.primary.main} size={20} /> : 
                        <Eye color={theme.palette.primary.main} size={20} />
                      }
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldStyles}
            />

            {/* Confirm Password Field */}
            <TextField
              name="confirm"
              type={showConfirm ? "text" : "password"}
              label="Confirm Password"
              value={formData.confirm}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.confirm}
              helperText={errors.confirm}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color={theme.palette.primary.main} size={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={() => setShowConfirm(!showConfirm)} 
                      edge="end"
                      aria-label={showConfirm ? "Hide password confirmation" : "Show password confirmation"}
                    >
                      {showConfirm ? 
                        <EyeOff color={theme.palette.primary.main} size={20} /> : 
                        <Eye color={theme.palette.primary.main} size={20} />
                      }
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldStyles}
            />

            {/* Role Selection */}
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!errors.role}
              sx={fieldStyles}
            >
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Role"
                disabled={isSubmitting || !roles.length}
              >
                {roles.length ? (
                  roles.map(r => (
                    <MenuItem key={r.role_id} value={r.role_name}>
                      {r.role_name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">Loading roles...</MenuItem>
                )}
              </Select>
              {errors.role && (
                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                  {errors.role}
                </Typography>
              )}
            </FormControl>

            {/* General Error Message */}
            {errors.general && (
              <Typography variant="body2" color="error" sx={{ mt: 1, mb: 1, fontWeight: 500 }}>
                {errors.general}
              </Typography>
            )}

            {/* Submit Button */}
            <Button
              variant="contained"
              fullWidth
              type="submit"
              disabled={isSubmitting}
              endIcon={isSubmitting ? null : <ChevronRight size={18} />}
              sx={{
                mt: 3,
                py: 1.5,
                borderRadius,
                textTransform: "none",
                fontWeight: "bold",
                transition: buttonTransition,
                "&:hover": buttonHoverStyles,
              }}
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            {/* Login Link */}
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Already have an account?
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{
                  py: 1,
                  px: isMobile ? 2 : 3,
                  borderRadius,
                  textTransform: "none",
                  transition: buttonTransition,
                  "&:hover": buttonHoverStyles,
                }}
              >
                Log In
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}