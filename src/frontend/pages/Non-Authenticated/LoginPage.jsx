import React, { useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  useTheme,
  Checkbox,
  FormControlLabel,
  Paper
} from "@mui/material";
import { login as firebaseLogin, resetPassword } from "../../../firebase";
import { useUserStore } from "../../store/userStore";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  // State - simplified and focused
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Simplified validation
  const validateEmail = (email) => {
    return email && /\S+@\S+\.\S+/.test(email);
  };
  
  // Clear form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await firebaseLogin(email, password);
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      }
      // Navigation happens automatically via auth state
    } catch (error) {
      // Provide helpful error messages
      switch (error.code) {
        case "auth/user-not-found":
          setError("No account found with this email");
          break;
        case "auth/wrong-password":
          setError("Incorrect password");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later");
          break;
        default:
          setError("Login failed. Please check your credentials");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Password reset handler
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setResetSuccess(true);
    } catch (error) {
      setError("Failed to send reset email. Please check your email address");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Load remembered email on mount
  React.useEffect(() => {
    const remembered = localStorage.getItem("rememberedEmail");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);
  
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        bgcolor: theme.palette.background.default,
        // Subtle gradient background
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark' 
            ? `radial-gradient(circle at 30% 20%, ${theme.palette.primary.dark}15 0%, transparent 50%),
               radial-gradient(circle at 70% 80%, ${theme.palette.secondary.dark}10 0%, transparent 50%)`
            : `radial-gradient(circle at 30% 20%, ${theme.palette.primary.light}15 0%, transparent 50%),
               radial-gradient(circle at 70% 80%, ${theme.palette.secondary.light}10 0%, transparent 50%)`,
          zIndex: 0,
        },
        // Subtle pattern overlay
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${theme.palette.mode === 'dark' ? '444' : 'ddd'}' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: theme.palette.mode === 'dark' ? 0.02 : 0.05,
          zIndex: 0,
        }
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Logo/Brand */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Cofoundless
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {resetMode ? "Reset your password" : "Sign in to your account"}
            </Typography>
          </Box>
          
          {/* Main Form */}
          <Box
            component="form"
            onSubmit={resetMode ? handlePasswordReset : handleLogin}
            noValidate
          >
            {/* Error Alert - Single source of truth */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {/* Success Message for Password Reset */}
            {resetSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Password reset email sent! Check your inbox.
              </Alert>
            )}
            
            {/* Email Field */}
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
              disabled={isSubmitting}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 0.7)',
                }
              }}
            />
            
            {/* Password Field - Only show in login mode */}
            {!resetMode && (
              <>
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.7)',
                    }
                  }}
                />
                
                {/* Remember Me & Forgot Password - Same Line */}
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  mt: 1,
                  mb: 3
                }}>
                  
                  
                  <Link
                    component="button"
                    variant="body2"
                    onClick={(e) => {
                      e.preventDefault();
                      setResetMode(true);
                      setError("");
                    }}
                    disabled={isSubmitting}
                    sx={{ textDecoration: "none" }}
                  >
                    Forgot password?
                  </Link>
                </Box>
              </>
            )}
            
            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ 
                py: 1.5,
                mt: resetMode ? 3 : 0,
                position: "relative"
              }}
            >
              {isSubmitting && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: "absolute",
                    left: "50%",
                    marginLeft: "-12px",
                  }}
                />
              )}
              {resetMode ? "Send Reset Email" : "Sign In"}
            </Button>
            
            {/* Secondary Actions */}
            <Box sx={{ mt: 3, textAlign: "center" }}>
              {resetMode ? (
                <Link
                  component="button"
                  variant="body2"
                  onClick={(e) => {
                    e.preventDefault();
                    setResetMode(false);
                    setResetSuccess(false);
                    setError("");
                  }}
                  sx={{ textDecoration: "none" }}
                >
                  Back to sign in
                </Link>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{" "}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/signup");
                    }}
                    sx={{ textDecoration: "none", fontWeight: 600 }}
                  >
                    Sign up
                  </Link>
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Footer - Optional */}
          <Box sx={{ mt: 5, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              © 2024 Cofoundless. All rights reserved.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}