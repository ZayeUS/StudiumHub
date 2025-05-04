import React, { useState } from "react";
import {
  Box, Container, Paper, TextField, Button, InputAdornment, IconButton,
  Typography, Snackbar, Alert, Divider, Dialog, DialogContent, DialogTitle,
  useTheme, useMediaQuery
} from "@mui/material";
import { Mail, Lock, Eye, EyeOff, ChevronRight, LogIn, KeyRound } from "lucide-react";
import { login as firebaseLogin, resetPassword } from "../../../firebase";
import { useUserStore } from "../../store/userStore";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const loading = useUserStore(state => state.loading);
  const setLoading = useUserStore(state => state.setLoading);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const { email, password } = formData;
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Minimum 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await firebaseLogin(formData.email, formData.password);
      showNotification("Logged in successfully!", "success");
    } catch (error) {
      setErrors({ auth: error.message || "Incorrect email or password" });
      showNotification(error.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) {
      setErrors({ resetEmail: "Valid email required" });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetEmail);
      showNotification("Password reset email sent", "success");
      setResetOpen(false);
    } catch (error) {
      setErrors({ resetEmail: error.message || "Failed to send reset email" });
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  const styles = {
    input: {
      "& .MuiOutlinedInput-root": {
        borderRadius: theme.shape.borderRadius,
        backgroundColor: "rgba(255,255,255,0.04)",
      }
    },
    button: {
      py: 1.5,
      borderRadius: theme.shape.borderRadius,
      textTransform: "none",
      fontWeight: "bold",
      transition: theme.transitions.create(["transform", "box-shadow"]),
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: theme.shadows[6],
      }
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: theme.palette.background.default,
      p: { xs: 2, md: 4 },
    }}>
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={notification.severity}>{notification.message}</Alert>
      </Snackbar>

      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            borderRadius: theme.shape.borderRadius,
            background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
            overflow: "hidden",
            transform: "translateY(0)",
            transition: "transform 0.5s ease-out",
            "&:hover": { transform: "translateY(-5px)" }
          }}
        >
          {/* Header */}
          <Box sx={{
            bgcolor: theme.palette.primary.main,
            p: 3,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 70% 30%, ${theme.palette.primary.light}20, transparent 50%)`,
              zIndex: 1,
            }
          }}>
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

          {/* Form */}
          <Box component="form" onSubmit={handleLogin} sx={{ p: 3 }}>
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
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail color={theme.palette.primary.main} size={20} />
                  </InputAdornment>
                ),
              }}
              sx={styles.input}
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
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color={theme.palette.primary.main} size={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowPassword(!showPassword)} 
                      edge="end"
                      size="small"
                    >
                      {showPassword ? 
                        <EyeOff color={theme.palette.primary.main} size={20} /> : 
                        <Eye color={theme.palette.primary.main} size={20} />
                      }
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={styles.input}
            />

            {errors.auth && (
              <Typography variant="body2" color="error" sx={{ mt: 1, fontWeight: 500 }}>
                {errors.auth}
              </Typography>
            )}

            <Button
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading}
              endIcon={!loading ? <ChevronRight size={18} /> : null}
              sx={{ ...styles.button, mt: 3 }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

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
              <Typography variant="body2" color="text.secondary">OR</Typography>
            </Divider>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary" mb={1}>
                Don't have an account?
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate("/signup")}
                sx={{ ...styles.button, py: 1 }}
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
        PaperProps={{ sx: { borderRadius: theme.shape.borderRadius, width: isMobile ? "90%" : "400px" } }}
      >
        <DialogTitle>Reset Your Password</DialogTitle>
        <DialogContent>
          <form onSubmit={handleResetPassword}>
            <TextField
              name="resetEmail"
              label="Email Address"
              type="email"
              fullWidth
              margin="normal"
              value={resetEmail}
              onChange={(e) => {
                setResetEmail(e.target.value);
                if (errors.resetEmail) setErrors(prev => ({ ...prev, resetEmail: "" }));
              }}
              error={!!errors.resetEmail}
              helperText={errors.resetEmail}
              disabled={loading}
              sx={styles.input}
            />
            <Box sx={{ textAlign: "right", mt: 3 }}>
              <Button onClick={() => setResetOpen(false)} sx={{ mr: 2 }}>
                Cancel
              </Button>
              <Button variant="contained" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Email"}
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
