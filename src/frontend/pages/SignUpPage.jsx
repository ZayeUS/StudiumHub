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
import { signUp as firebaseSignUp, login as firebaseLogin, checkEmailExists } from "../../firebase"; // Import checkEmailExists function
import { useUserStore } from "../store/userStore"; // Zustand store to track login state
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing
import { getData, postData } from "../utils/BackendRequestHelper"; // Import getData and postData

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

  // Fetch roles directly from the backend using GET request
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getData("/roles", false); // GET /roles instead of POST
        setRoles(rolesData); // Assuming response is an array of roles
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

  // Handle sign-up with Firebase and backend using BackendRequestHelper
  const handleSignUp = async (values, { setSubmitting }) => {
    const { email, password, role } = values;
  
    // Prevent further actions if email already exists
    const emailAvailable = await checkEmailAvailability(email);
    if (!emailAvailable) return;
  
    // Open the modal to show the loading spinner if email is valid
    setOpenModal(true);
    setLoading(true);
    setModalMessage("Signing you up...");
  
    try {
      // Step 1: Try to create user in Firebase
      const user = await firebaseSignUp(email, password);
  
      // Step 2: Log the user in immediately after sign-up
      await firebaseLogin(email, password);
  
      // Step 3: Find the selected role ID from the roles array
      const selectedRole = roles.find((r) => r.role_name === role);
      if (!selectedRole) {
        throw new Error("Invalid role selected.");
      }
  
      // Step 4: Save user data to backend using postData, including role_id
      const payload = {
        firebase_uid: user.uid,
        email: user.email,
        role_id: selectedRole.role_id, // Send the role_id
      };
  
      const response = await postData("/users", payload, false);
  
      if (response && response.user) {
        const { user_id } = response.user;
  
        // Now fetch the user data after successful backend creation
        const userData = await getData(`/users/${user.uid}`);
  
        if (!userData || !userData.role_id || !userData.user_id) {
          throw new Error("Failed to fetch user data after creation.");
        }
  
        // Save user data to Zustand store and localStorage
        setUser(user.uid, selectedRole.role_id, user_id);
  
        localStorage.setItem(
          "user",
          JSON.stringify({
            user_id: user_id,
            email: user.email,
            role_id: selectedRole.role_id,
          })
        );
  
        // Step 5: Redirect to the user dashboard
        setOpenModal(false);
        navigate(`/user-dashboard`);
      } else {
        throw new Error("Failed to create user in backend.");
      }
    } catch (err) {
      console.error("Sign-up error occurred:", err);
      setEmailError(err.message || "Sign-up failed! Please try again.");
      setOpenModal(false);
    } finally {
      setSubmitting(false);
      setLoading(false);
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
              onChange={(e) => {
                handleChange(e);
                setEmailError(""); // Reset email error on change
              }}
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
