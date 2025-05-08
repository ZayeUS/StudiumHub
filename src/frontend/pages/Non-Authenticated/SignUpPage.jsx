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

export function SignUpPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const loading = useUserStore(state => state.loading);
  const setLoading = useUserStore(state => state.setLoading);
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  const roleId = useUserStore(state => state.roleId);
  const setUser = useUserStore(state => state.setUser);

  const [formData, setFormData] = useState({ email: "", password: "", confirm: "", role: "" });
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);  // Track submission state
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch roles on component mount
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

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate(roleId === 1 ? "/admin-dashboard" : "/dashboard");
    }
  }, [isLoggedIn, roleId, navigate]);

  // Display notifications
  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  // Validate form inputs
  const validateForm = () => {
    const { email, password, confirm, role } = formData;
    const newErrors = {};

    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email address";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (!confirm) newErrors.confirm = "Please confirm your password";
    else if (confirm !== password) newErrors.confirm = "Passwords do not match";

    if (!role) newErrors.role = "Please select a role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle sign-up form submission
  const handleSignUp = async (e) => {
    e.preventDefault();  // Prevent default form submission

    if (!validateForm()) return;  // Validate form before submitting

    setIsSubmitting(true);  // Set submitting state to true

    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        setErrors(prev => ({ ...prev, email: "Email already in use" }));
        return;
      }

      // Sign up the user with Firebase
      const user = await firebaseSignUp(formData.email, formData.password);
      await firebaseLogin(formData.email, formData.password);

      // Find selected role
      const selectedRole = roles.find(r => r.role_name === formData.role);
      if (!selectedRole) throw new Error("Invalid role selected");

      // Create backend user
      const { user: backendUser } = await postData("/users", {
        firebase_uid: user.uid,
        email: user.email,
        role_id: selectedRole.role_id
      });

      // Set user data in the store
      const { user_id } = backendUser;
      setUser(user.uid, selectedRole.role_id, user_id);

      // Show success and redirect
      showNotification("Account created successfully! Redirecting...", "success");
      setTimeout(() => {
        navigate(selectedRole.role_id === 1 ? "/admin-dashboard" : "/dashboard");
      }, 1000);
    } catch (err) {
      // Handle Firebase error
      const errorMessage = err.message || "Sign-up failed";
      setErrors(prev => ({ ...prev, general: errorMessage }));
      showNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);  // Set submitting state to false
    }
  };


  // Handle field value changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    if (errors[name]) {
      setErrors(e => {
        const copy = { ...e };
        delete copy[name];
        return copy;
      });
    }
  };

  const iconStart = (icon) => ({
    startAdornment: (
      <InputAdornment position="start">
        {React.cloneElement(icon, {
          color: theme.palette.primary.main
        })}
      </InputAdornment>
    )
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2
      }}
    >
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(n => ({ ...n, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>

      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            borderRadius: theme.shape.borderRadius,
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "common.white",
              p: 3,
              textAlign: "center"
            }}
          >
            <UserPlus size={32} />
            <Typography variant="h5" fontWeight={700} mt={1}>
              Create Account
            </Typography>
            <Typography sx={{ opacity: 0.9 }}>
              Join us and get started
            </Typography>
          </Box>

          {/* Actual form */}
          <form noValidate onSubmit={handleSignUp}>
            <Box sx={{ p: 3 }}>
              {/* Global error */}
              {errors.general && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.general}
                </Alert>
              )}

              {/* Email */}
              <TextField
                name="email"
                label="Email"
                fullWidth
                margin="normal"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={isSubmitting}
                InputProps={iconStart(<Mail size={18} />)}
              />

              {/* Password */}
              <TextField
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                disabled={isSubmitting}
                InputProps={{
                  ...iconStart(<Lock size={18} />),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(v => !v)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* Confirm Password */}
              <TextField
                name="confirm"
                label="Confirm"
                type={showConfirm ? "text" : "password"}
                fullWidth
                margin="normal"
                value={formData.confirm}
                onChange={handleChange}
                error={!!errors.confirm}
                helperText={errors.confirm}
                disabled={isSubmitting}
                InputProps={{
                  ...iconStart(<Lock size={18} />),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowConfirm(v => !v)}
                      >
                        {showConfirm ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* Role */}
              <FormControl
                fullWidth
                margin="normal"
                error={!!errors.role}
              >
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                  disabled={isSubmitting || !roles.length}
                >
                  {roles.map(r => (
                    <MenuItem key={r.role_id} value={r.role_name}>
                      {r.role_name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.role && (
                  <Typography color="error" variant="caption">
                    {errors.role}
                  </Typography>
                )}
              </FormControl>

              {/* Submit Button */}
              <Button
                variant="contained"
                type="submit"
                fullWidth
                endIcon={!isSubmitting && <ChevronRight size={18} />}
                disabled={isSubmitting}
                sx={{ mt: 3 }}
              >
                {isSubmitting ? "Creating…" : "Sign Up"}
              </Button>

              <Divider sx={{ my: 3 }} />

              <Box textAlign="center">
                <Typography>Already have an account?</Typography>
                <Button
                  variant="outlined"
                  sx={{ mt: 1 }}
                  onClick={() => navigate("/login")}
                >
                  Log In
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
