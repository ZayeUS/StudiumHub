import React, { useState, useEffect } from "react";
import {
  Box, Container, Paper, TextField, Button, InputAdornment, IconButton,
  Typography, FormControl, InputLabel, Select, MenuItem, Divider,
  Snackbar, Alert, useTheme, useMediaQuery
} from "@mui/material";
import { Eye, EyeOff, Mail, Lock, ChevronRight, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signUp as firebaseSignUp, login as firebaseLogin, checkEmailExists } from "../../../firebase";
import { getData, postData } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";
import LoadingModal from "../../components/LoadingModal";

export default function SignUpPage() {
  // Core state - using individual selectors to prevent infinite loops
  const loading = useUserStore(state => state.loading);
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  const roleId = useUserStore(state => state.roleId);
  const setUser = useUserStore(state => state.setUser);
  
  const [formData, setFormData] = useState({ email: "", password: "", confirm: "", role: "" });
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate(roleId === 1 ? "/admin-dashboard" : "/dashboard");
    }
  }, [isLoggedIn, roleId, navigate]);

  // Fetch roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getData("/roles");
        setRoles(data);
      } catch (error) {
        showNotification("Failed to load roles. Please refresh and try again.", "error");
      }
    };
    fetchRoles();
  }, []);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    const { email, password, confirm, role } = formData;
    
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email address";
    
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    if (!confirm) newErrors.confirm = "Please confirm your password";
    else if (confirm !== password) newErrors.confirm = "Passwords must match";
    
    if (!role) newErrors.role = "Please select a role";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    useUserStore.getState().setLoading(true);
    
    try {
      // Check if email exists
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        setErrors(prev => ({ ...prev, email: "Email already in use" }));
        setIsSubmitting(false);
        useUserStore.getState().setLoading(false);
        return;
      }
      
      // Create account and sign in
      const user = await firebaseSignUp(formData.email, formData.password);
      await firebaseLogin(formData.email, formData.password);
      
      // Find role ID
      const selectedRole = roles.find(r => r.role_name === formData.role);
      if (!selectedRole) throw new Error("Invalid role selected");
      
      // Create backend user
      const backendUser = await postData("/users", {
        firebase_uid: user.uid,
        email: user.email,
        role_id: selectedRole.role_id,
      });
      
      // Update store
      setUser(user.uid, selectedRole.role_id, backendUser.user.user_id);
      
      // Success and redirect
      showNotification("Account created successfully! Redirecting...", "success");
      setTimeout(() => {
        navigate(selectedRole.role_id === 1 ? "/admin-dashboard" : "/dashboard");
      }, 1000);
    } catch (error) {
      console.error(error);
      setErrors(prev => ({ ...prev, general: error.message || "Sign-up failed. Please try again." }));
      showNotification(error.message || "Sign-up failed. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
      useUserStore.getState().setLoading(false);
    }
  };

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  // Reusable styles
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
      <LoadingModal />
      
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
              <UserPlus size={40} color={theme.palette.common.white} />
              <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mt: 1 }}>
                Create Account
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                Join our platform and get started
              </Typography>
            </Box>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSignUp} sx={{ p: 3 }}>
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
                      onClick={() => setShowConfirm(!showConfirm)} 
                      edge="end"
                      size="small"
                    >
                      {showConfirm ? 
                        <EyeOff color={theme.palette.primary.main} size={20} /> : 
                        <Eye color={theme.palette.primary.main} size={20} />
                      }
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={styles.input}
            />

            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!errors.role}
              sx={styles.input}
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

            {errors.general && (
              <Typography variant="body2" color="error" sx={{ mt: 1, fontWeight: 500 }}>
                {errors.general}
              </Typography>
            )}

            <Button
              variant="contained"
              fullWidth
              type="submit"
              disabled={isSubmitting}
              endIcon={isSubmitting ? null : <ChevronRight size={18} />}
              sx={{ ...styles.button, mt: 3 }}
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">OR</Typography>
            </Divider>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary" mb={1}>
                Already have an account?
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{ ...styles.button, py: 1 }}
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