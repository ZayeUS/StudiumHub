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

export function LoginPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const loading = useUserStore(state => state.loading);
  const setLoading = useUserStore(state => state.setLoading);
  const listenAuthState = useUserStore(state => state.listenAuthState);

  const [form, setForm] = useState({ email: "", password: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  const showNotification = (message, severity = "success") =>
    setNotification({ open: true, message, severity });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email required";
    if (!form.password) errs.password = "Password required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await firebaseLogin(form.email, form.password);
      listenAuthState();
      showNotification("Logged in!");
      navigate("/dashboard");
    } catch (err) {
      showNotification(err.message || "Login failed", "error");
      setErrors({ auth: "Invalid email or password" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) {
      setErrors({ resetEmail: "Enter a valid email" });
      return;
    }
    setLoading(true);
    try {
      await resetPassword(resetEmail);
      showNotification("Reset email sent");
      setResetOpen(false);
    } catch (err) {
      setErrors({ resetEmail: err.message });
    } finally {
      setLoading(false);
    }
  };

  const iconStart = (icon) => ({
    startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
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

      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            borderRadius: theme.shape.borderRadius,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "common.white",
              p: 3,
              textAlign: "center",
            }}
          >
            <LogIn size={32} />
            <Typography variant="h5" fontWeight={700} mt={1}>
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Sign in to continue
            </Typography>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleLogin} sx={{ p: 3 }}>
            <TextField
              name="email"
              label="Email"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              InputProps={iconStart(<Mail size={18} />)}
            />

            <TextField
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={form.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              InputProps={{
                ...iconStart(<Lock size={18} />),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {errors.auth && (
              <Typography variant="body2" color="error" mt={1}>
                {errors.auth}
              </Typography>
            )}

            <Button
              variant="contained"
              type="submit"
              fullWidth
              sx={{ mt: 3 }}
              endIcon={!loading && <ChevronRight size={18} />}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <Box textAlign="center" mt={2}>
              <Button variant="text" startIcon={<KeyRound size={18} />} onClick={() => setResetOpen(true)}>
                Forgot password?
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box textAlign="center">
              <Typography variant="body2">Don't have an account?</Typography>
              <Button variant="outlined" sx={{ mt: 1 }} onClick={() => navigate("/signup")}>
                Create Account
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Reset Password Dialog */}
      <Dialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        PaperProps={{ sx: { borderRadius: theme.shape.borderRadius, width: isMobile ? "90%" : 400 } }}
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <form onSubmit={handleResetPassword}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              error={!!errors.resetEmail}
              helperText={errors.resetEmail}
              disabled={loading}
            />
            <Box textAlign="right" mt={3}>
              <Button onClick={() => setResetOpen(false)} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button variant="contained" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send"}
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
