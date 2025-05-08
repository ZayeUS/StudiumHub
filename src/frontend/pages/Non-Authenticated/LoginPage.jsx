import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Typography,
  Snackbar,
  Alert,
  Divider,
  Dialog,
  DialogContent,
  DialogTitle,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Mail, Lock, Eye, EyeOff, ChevronRight, LogIn, KeyRound } from "lucide-react";
import { login as firebaseLogin, resetPassword } from "../../../firebase";
import { useUserStore } from "../../store/userStore";
import { useNavigate } from "react-router-dom";
import {LoadingModal} from "../../components/LoadingModal";

export  function LoginPage() {
  // Core state
  const { loading } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  
  // Hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  
  // Form handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetEmail = () => {
    if (!resetEmail) {
      setErrors({ resetEmail: "Email is required" });
      return false;
    } else if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      setErrors({ resetEmail: "Invalid email address" });
      return false;
    }
    return true;
  };

  // Form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await firebaseLogin(formData.email, formData.password);
      showNotification("Logged in successfully!", "success");
    } catch (error) {
      const errorMessage = error.message || "Incorrect email or password";
      setErrors({ auth: errorMessage });
      showNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validateResetEmail()) return;
    
    setIsResetting(true);
    try {
      await resetPassword(resetEmail);
      showNotification("Password reset email sent. Check your inbox!", "success");
      setResetOpen(false);
    } catch (error) {
      setErrors({ resetEmail: error.message || "Failed to send reset email" });
      showNotification("Failed to send reset email", "error");
    } finally {
      setIsResetting(false);
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
              <LogIn size={40} color={theme.palette.common.white} />
              <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mt: 1 }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                Sign in to your account
              </Typography>
            </Box>
          </Box>

          {/* Form Section */}
          <Box component="form" onSubmit={handleLogin} noValidate sx={{ p: 3 }}>
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

            {errors.auth && (
              <Typography 
                variant="body2" 
                color="error" 
                sx={{ mt: 1, mb: 1, fontWeight: 500 }}
              >
                {errors.auth}
              </Typography>
            )}

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
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>

            {/* Forgot Password Link */}
            <Box textAlign="center" mt={2}>
              <Button
                variant="text"
                startIcon={<KeyRound size={18} />}
                onClick={() => setResetOpen(true)}
                sx={{ textTransform: "none" }}
              >
                Forgot your password?
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            {/* Create Account Link */}
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Don't have an account?
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate("/signup")}
                sx={{
                  py: 1,
                  px: isMobile ? 2 : 3,
                  borderRadius,
                  textTransform: "none",
                  transition: buttonTransition,
                  "&:hover": buttonHoverStyles,
                }}
              >
                Create Account
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Password Reset Dialog */}
      <Dialog 
        open={resetOpen} 
        onClose={() => setResetOpen(false)}
        PaperProps={{
          sx: {
            borderRadius,
            width: isMobile ? "90%" : "400px",
          }
        }}
      >
        <DialogTitle>Reset Your Password</DialogTitle>
        <DialogContent>
          <form onSubmit={handleResetPassword} noValidate>
            <TextField
              name="resetEmail"
              label="Email Address"
              type="email"
              fullWidth
              margin="normal"
              value={resetEmail}
              onChange={(e) => {
                setResetEmail(e.target.value);
                if (errors.resetEmail) {
                  setErrors(prev => ({ ...prev, resetEmail: "" }));
                }
              }}
              error={!!errors.resetEmail}
              helperText={errors.resetEmail}
              disabled={isResetting}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius } }}
            />
            <Box sx={{ textAlign: "right", mt: 3, mb: 1 }}>
              <Button 
                onClick={() => setResetOpen(false)} 
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                type="submit" 
                disabled={isResetting}
              >
                {isResetting ? "Sending..." : "Send Reset Email"}
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}