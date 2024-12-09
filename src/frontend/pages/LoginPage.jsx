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
import { login as firebaseLogin } from "../../firebase"; // Ensure the login function is correctly imported
import { useUserStore } from "../store/userStore";
import { useNavigate } from "react-router-dom";
import { getData } from "../utils/BackendRequestHelper"; // Import the getData utility

// Yup validation schema for login
const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const LoginPage = () => {
  const { setUser } = useUserStore(); // Zustand store to manage user state
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [emailForReset, setEmailForReset] = useState("");
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  // Updated handleLogin function with role-based redirection
  const handleLogin = async (values, { setSubmitting }) => {
    const { email, password } = values;
    try {
      // Call the login function from firebase.js
      const user = await firebaseLogin(email, password);

      if (!user || !user.uid) {
        throw new Error("Invalid user object returned from Firebase.");
      }


      // Fetch user data from the backend using the Firebase UID
      const idToken = await user.getIdToken(); // Get the Firebase ID token
      const userData = await getData(`/users/${user.uid}`, idToken); // Fetch user data including role_id

      if (!userData || !userData.role_id) {
        throw new Error("Failed to fetch user role. Please contact support.");
      }


      // Save user data in Zustand store
      setUser(user.uid, userData.role_id, userData.user_id);

      setSnackbarMessage("Login successful!");
      setOpenSnackbar(true);

      // Role-based redirection
      if (userData.role_id === 1) {
        navigate("/admin-dashboard"); // Redirect to admin dashboard if role is 1 (admin)
      } else if (userData.role_id === 2) {
        navigate("/user-dashboard"); // Redirect to user dashboard if role is 2 (user)
      } else {
        throw new Error("Invalid role detected. Please contact support.");
      }
    } catch (err) {
      console.error("Login error:", err.message);
      setError(err.message || "Login failed! Please check your credentials.");
      setSnackbarMessage(err.message ? `Error: ${err.message}` : "Login failed! Please check your credentials.");
      setOpenSnackbar(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!emailForReset) {
      setSnackbarMessage("Please enter a valid email address.");
      setOpenSnackbar(true);
      return;
    }
    try {
      // Call the resetPassword function to send a reset email
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
