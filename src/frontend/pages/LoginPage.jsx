// frontend/pages/LoginPage.jsx

import React, { useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { login, resetPassword } from "../../firebase";
import { useUserStore } from "../store/userStore";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Ensure axios is installed

// Yup validation schema for login
const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const LoginPage = () => {
  const { setUser } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [emailForReset, setEmailForReset] = useState("");
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  // Corrected handleLogin function
  const handleLogin = async (values, { setSubmitting }) => {
    const { email, password } = values;
    try {
      // Step 1: Log the user in using Firebase
      const user = await login(email, password);

      if (!user) {
        throw new Error("No user returned from Firebase.");
      }

      // Step 2: Get the Firebase ID token for authentication with backend
      const idToken = await user.getIdToken();

      // Step 3: Fetch user data from backend
      const response = await axios.get(`http://localhost:5000/api/users/${user.uid}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const userData = response.data;

      if (!userData || !userData.role_name) {
        throw new Error("User role not found.");
      }

      // Step 4: Save user data to Zustand store and localStorage
      setUser(user.uid, user.email, userData.role_name); // Ensure role_name is used
      localStorage.setItem("user", JSON.stringify({
        user_id: userData.user_id, // Assuming backend returns user_id
        email: userData.email,
        role: userData.role_name,
      }));

      setSnackbarMessage("Login successful!");
      setOpenSnackbar(true);

      // Step 5: Redirect based on role
      if (userData.role_name === "admin") {
        navigate("/admin-dashboard");
      } else if (userData.role_name === "user") {
        navigate("/user-dashboard");
      } else {
        navigate("/login"); // Default fallback
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed! Please check your credentials.");
      setSnackbarMessage(err.message ? `Error: ${err.message}` : "Login failed! Please check your credentials.");
      setOpenSnackbar(true);
    }
    setSubmitting(false);
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!emailForReset) {
      setSnackbarMessage("Please enter a valid email address.");
      setOpenSnackbar(true);
      return;
    }
    try {
      await resetPassword(emailForReset);
      setSnackbarMessage("Password reset email sent!");
      setOpenSnackbar(true);
      setForgotPasswordModal(false);
    } catch (err) {
      console.error("Reset password error:", err);
      setSnackbarMessage("Failed to send reset email. Please try again.");
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ paddingTop: 8, backgroundColor: '#f4f6f9', borderRadius: '8px' }}>

      {/* Snackbar for error/success messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000} // Auto hide after 3 seconds
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={error ? 'error' : 'success'} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Formik form with Yup validation */}
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            {/* Email Field */}
            <Field
              name="email"
              as={TextField}
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
            />

            {/* Password Field */}
            <Field
              name="password"
              as={TextField}
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              margin="normal"
              error={touched.password && !!errors.password}
              helperText={touched.password && errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Submit Button */}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              sx={{ marginTop: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </Form>
        )}
      </Formik>

      {/* Forgot Password Link */}
      <Box sx={{ textAlign: 'center', marginTop: 2 }}>
        <Typography variant="body2">
          Forgot your password?{" "}
          <Button color="primary" onClick={() => setForgotPasswordModal(true)}>Reset Password</Button>
        </Typography>
      </Box>

      {/* Sign-up Link */}
      <Box sx={{ textAlign: 'center', marginTop: 2 }}>
        <Typography variant="body2">
          Don’t have an account?{' '}
          <Button color="primary" onClick={() => navigate('/signup')}>Sign Up</Button>
        </Typography>
      </Box>

      {/* Forgot Password Modal */}
      <Dialog open={forgotPasswordModal} onClose={() => setForgotPasswordModal(false)}>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ marginBottom: 2 }}>
            Enter your email address to receive a password reset link.
          </Typography>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={(e) => setEmailForReset(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotPasswordModal(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleForgotPassword} color="primary">
            Send Reset Link
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LoginPage;
