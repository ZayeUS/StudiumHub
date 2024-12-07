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
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material"; // Add icons for visibility toggle
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { signUp, login } from "../../firebase"; // Import signUp and login function
import { useUserStore } from "../store/userStore"; // Zustand store to track login state
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing

// Yup validation schema for sign up
const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm your password"),
  role: Yup.string().required("Role is required"), // Validate role selection
});

const SignUpPage = () => {
  const { setUser } = useUserStore(); // Zustand setter to update the user store
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(""); // For handling error messages during sign up
  const [openSnackbar, setOpenSnackbar] = useState(false); // For Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Message for Snackbar
  const navigate = useNavigate(); // useNavigate for routing

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  // Handle sign-up with Firebase and auto login
  const handleSignUp = async (values, { setSubmitting }) => {
    const { email, password, role } = values;
    let role_id = 2; // Default to 'User' role

    // Set role_id based on the selected role
    if (role === "admin") {
      role_id = 1; // 'Admin' role
    }

    try {
      // Step 1: Create user in Firebase
      const user = await signUp(email, password);

      // Step 2: Log the user in immediately after sign-up
      await login(email, password); // Custom login function to log the user in after signup

      // Step 3: Save user data to Zustand store and localStorage
      setUser(user.uid, user.email, role_id);

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify({
        uid: user.uid,
        email: user.email,
        role: role,
      }));

      setSnackbarMessage("Sign-up successful! Redirecting...");
      setOpenSnackbar(true);

      // Redirect to appropriate dashboard
      if (role_id === 1) {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      setError(err.message);
      setSnackbarMessage("Sign-up failed! Please try again.");
      setOpenSnackbar(true);
    }
    setSubmitting(false);
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
        initialValues={{ email: "", password: "", confirmPassword: "", role: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSignUp}
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

            {/* Confirm Password Field */}
            <Field
              name="confirmPassword"
              as={TextField}
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              margin="normal"
              error={touched.confirmPassword && !!errors.confirmPassword}
              helperText={touched.confirmPassword && errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowConfirmPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Role Selection */}
            <FormControl fullWidth margin="normal" error={touched.role && !!errors.role}>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={touched.role ? errors.role : ""}
                label="Role"
                fullWidth
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
              {touched.role && <Typography variant="body2" color="error">{errors.role}</Typography>}
            </FormControl>

            {/* Submit Button */}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              sx={{ marginTop: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing up..." : "Sign Up"}
            </Button>
          </Form>
        )}
      </Formik>

      {/* Sign-up Link */}
      <Box sx={{ textAlign: "center", marginTop: 2 }}>
        <Typography variant="body2">
          Already have an account?{" "}
          <Button color="primary" onClick={() => navigate("/login")}>
            Login
          </Button>
        </Typography>
      </Box>
    </Container>
  );
};

export default SignUpPage;
