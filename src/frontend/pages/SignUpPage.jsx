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
  FormControl,
  CircularProgress,
  Modal,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material"; // Icons for visibility toggle
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { signUp, login } from "../../firebase"; // Import signUp and login functions
import { useUserStore } from "../store/userStore"; // Zustand store to track login state
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing
import { postData } from "../utils/BackendRequestHelper"; // Import BackendRequestHelper

// Yup validation schema for sign up
const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
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
  const [loading, setLoading] = useState(false); // For controlling the loading state
  const [openModal, setOpenModal] = useState(false); // For showing the modal during data saving
  const [modalMessage, setModalMessage] = useState("Signing you up..."); // Modal message
  const navigate = useNavigate(); // useNavigate for routing

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  // Handle sign-up with Firebase and backend
  const handleSignUp = async (values, { setSubmitting }) => {
    const { email, password, role } = values;
    let role_id = 2; // Default to 'User' role
  
    // Set role_id based on the selected role
    if (role === "admin") {
      role_id = 1; // 'Admin' role
    }

    // Open the modal to show the loading spinner
    setOpenModal(true);
    setLoading(true);
    setModalMessage("Signing you up..."); // Update message

    try {

  
      // Step 1: Create user in Firebase
      const user = await signUp(email, password);
  
      // Step 2: Log the user in immediately after sign-up
      await login(email, password);
  
      // Step 3: Save user data to backend
      const payload = {
        firebase_uid: user.uid,
        email: user.email,
        role_id: role_id,
      };
  
      const response = await postData("/signup", payload, false);
  
      // Step 4: Extract user data from backend response
      const { user_id, role_name } = response.user;
  
      // Step 5: Redirect immediately after login before storing data
      setSnackbarMessage("Sign-up successful! Redirecting...");
      setOpenSnackbar(true);
  
      // Step 6: Redirect to appropriate dashboard based on role_id
      if (role_id === 1) {
      
        // Set the modal to open
        setOpenModal(true);
      
        // Wait for 1 second before closing the modal and navigating
        setTimeout(() => {
          setOpenModal(false); // Close the modal after 1 second
      
          // Now that the modal is closed, navigate
          navigate("/admin-dashboard"); 
        }, 500); // 1000ms (1 second) delay before redirecting
      } else if (role_id === 2) {
      
        // Set the modal to open
        setOpenModal(true);
      
        // Wait for 1 second before closing the modal and navigating
        setTimeout(() => {
          setOpenModal(false); // Close the modal after 1 second
      
          // Now that the modal is closed, navigate
          navigate("/user-dashboard"); 
        }, 1000); // 1000ms (1 second) delay before redirecting
      } else {
        console.error(`Invalid role_id: ${role_id}. Navigation aborted.`);
      }
      
      

      // Step 7: Save user data to Zustand store and localStorage after redirect
      setUser(user.uid, user.email, role_name, role_id, user_id);
  
      localStorage.setItem(
        "user",
        JSON.stringify({
          user_id: user_id,
          email: user.email,
          role: role_name,
          roleId: role_id,
        })
      );
      
       
  
    } catch (err) {
      console.error("Sign-up error occurred:", err);
      setError(err.message || "Sign-up failed! Please try again.");
      setSnackbarMessage(
        err.message ? `Error: ${err.message}` : "Sign-up failed! Please try again."
      );
      setOpenSnackbar(true);
    }

    setSubmitting(false);
    setLoading(false); // Stop loading once the process is complete
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        paddingTop: 8,
        backgroundColor: "#f4f6f9",
        borderRadius: "8px",
      }}
    >
      {/* Snackbar for error/success messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000} // Auto hide after 3 seconds
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Formik form with Yup validation */}
      <Formik
        initialValues={{ email: "", password: "", confirmPassword: "", role: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSignUp}
      >
        {({
          errors,
          touched,
          isSubmitting,
          values,
          handleChange,
          handleBlur,
        }) => (
          <Form>
            {/* Email Field */}
            <Field
              name="email"
              as={TextField}
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
            />

            {/* Password Field */}
            <Field
              name="password"
              as={TextField}
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              margin="normal"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && Boolean(errors.password)}
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
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.confirmPassword && Boolean(errors.confirmPassword)
              }
              helperText={touched.confirmPassword && errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
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
            <FormControl
              fullWidth
              margin="normal"
              error={touched.role && Boolean(errors.role)}
            >
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                label="Role"
                value={values.role}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
              {touched.role && errors.role && (
                <Typography variant="body2" color="error">
                  {errors.role}
                </Typography>
              )}
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

      {/* Modal Overlay with Loading Spinner */}
      <Modal
        open={openModal}
        onClose={() => {}}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <Box
          sx={{
            padding: 3,
            backgroundColor: "#fff",
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={50} />
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            {modalMessage}
          </Typography>
        </Box>
      </Modal>
    </Container>
  );
};

export default SignUpPage;
