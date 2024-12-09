import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  InputAdornment,
  IconButton,
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
import { signUp, login, checkEmailExists } from "../../firebase"; // Import checkEmailExists function
import { useUserStore } from "../store/userStore"; // Zustand store to track login state
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing
import { postData } from "../utils/BackendRequestHelper"; // Import postData from BackendRequestHelper

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
  const [loading, setLoading] = useState(false); // For controlling the loading state
  const [openModal, setOpenModal] = useState(false); // For showing the modal during data saving
  const [modalMessage, setModalMessage] = useState("Signing you up..."); // Modal message
  const [roles, setRoles] = useState([]); // State for storing roles
  const [emailError, setEmailError] = useState(""); // For displaying email error directly
  const navigate = useNavigate(); // useNavigate for routing

  // Fetch roles directly from the backend using the .env variable
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/roles`
        );
        const rolesData = await response.json();
        setRoles(rolesData); // Assuming response.data contains the roles array
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  // Check if email already exists in Firebase
  const checkEmailAvailability = async (email) => {
    try {
      const emailExists = await checkEmailExists(email); // Assuming checkEmailExists is implemented in firebase.js
      if (emailExists) {
        setEmailError("Email already in use. Please try another.");
        return false; // Email exists, so return false to prevent sign-up
      }
      setEmailError(""); // Reset email error if email doesn't exist
      return true; // Email doesn't exist, proceed with sign-up
    } catch (err) {
      console.error("Error checking email availability:", err);
  
      // Check if the error is a Firebase-specific email already in use error
      if (err.code === "auth/email-already-in-use") {
        setEmailError("Email already in use. Please try another.");
      } else {
        setEmailError("An error occurred while checking email.");
      }
  
      return false;
    }
  };
  

  // Handle sign-up with Firebase and backend
  const handleSignUp = async (values, { setSubmitting }) => {
    const { email, password, role } = values;
    let role_id = 2; // Default to 'User' role

    // Set role_id based on the selected role
    if (role === "admin") {
      role_id = 1; // 'Admin' role
    }

    // Prevent further actions if email already exists
    const emailAvailable = await checkEmailAvailability(email);
    if (!emailAvailable) return; // If email is not available, don't proceed

    // Open the modal to show the loading spinner if email is valid
    setOpenModal(true);
    setLoading(true);
    setModalMessage("Signing you up...");

    try {
      // Step 1: Try to create user in Firebase
      const user = await signUp(email, password);

      // Step 2: Log the user in immediately after sign-up
      await login(email, password);

      // Step 3: Save user data to backend using postData
      const payload = {
        firebase_uid: user.uid,
        email: user.email,
        role_id: role_id,
      };

      const response = await postData("/signup", payload, false);

      // Step 4: Extract user data from backend response
      const { user_id, role_name } = response.user;

      // Step 5: Display success message
      setModalMessage("Sign-up successful! Redirecting...");

      // Step 6: Redirect to appropriate dashboard based on role_id
     
        setOpenModal(false);
        if (role_id === 1) {
          navigate("/admin-dashboard"); // Redirect to admin dashboard
        } else if (role_id === 2) {
          navigate("/user-dashboard"); // Redirect to user dashboard
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
      setEmailError(err.message || "Sign-up failed! Please try again.");
      setOpenModal(false); // Close modal if there is another error

      setSubmitting(false);
      setLoading(false); // Stop loading once the process is complete
    }
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
      {/* Formik form with Yup validation */}
      <Formik
        initialValues={{
          email: "",
          password: "",
          confirmPassword: "",
          role: "",
        }}
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
              error={
                touched.email && (Boolean(errors.email) || Boolean(emailError))
              } // Ensure both errors are handled
              helperText={
                touched.email ? errors.email || emailError : emailError
              } // Display emailError if present
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
              error={touched.confirmPassword && Boolean(errors.confirmPassword)}
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
                {roles.map((role) => (
                  <MenuItem key={role.role_id} value={role.role_name}>
                    {role.role_name}
                  </MenuItem>
                ))}
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
