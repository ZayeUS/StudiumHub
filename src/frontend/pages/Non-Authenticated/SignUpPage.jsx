// src/pages/SignUpPage.jsx
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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { signUp as firebaseSignUp, login as firebaseLogin, checkEmailExists } from "../../../firebase";
import { useUserStore } from "../../store/userStore";
import { useNavigate } from "react-router-dom";
import { getData, postData } from "../../utils/BackendRequestHelper";
import LoadingModal from "../../components/LoadingModal";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: Yup.string().oneOf([Yup.ref("password"), null], "Passwords must match").required("Confirm your password"),
  role: Yup.string().required("Role is required"),
});

const SignUpPage = () => {
  const { setUser, isLoggedIn, roleId } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      if (roleId === 1) navigate("/admin-dashboard");
      else if (roleId === 2) navigate("/user-dashboard");
    }
  }, [isLoggedIn, roleId, navigate]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getData("/roles");
        setRoles(rolesData);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, []);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const checkEmailAvailability = async (email) => {
    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setEmailError("Email already in use. Please try another.");
        return false;
      }
      setEmailError("");
      return true;
    } catch (err) {
      console.error("Error checking email availability:", err);
      if (err.code === "auth/email-already-in-use") {
        setEmailError("Email already in use. Please try another.");
      } else {
        setEmailError("An error occurred while checking email.");
      }
      return false;
    }
  };

  const handleSignUp = async (values, { setSubmitting }) => {
    const { email, password, role } = values;
    const emailAvailable = await checkEmailAvailability(email);
    if (!emailAvailable) {
      setSubmitting(false);
      return;
    }
  
    // Show global loading modal before starting
    useUserStore.setState({ loading: true });
  
    try {
      const user = await firebaseSignUp(email, password);
      await firebaseLogin(email, password);
  
      const selectedRole = roles.find((r) => r.role_name === role);
      if (!selectedRole) {
        throw new Error("Invalid role selected.");
      }
  
      const payload = {
        firebase_uid: user.uid,
        email: user.email,
        role_id: selectedRole.role_id,
      };
  
      const response = await postData("/users", payload);
  
      if (response && response.user) {
        const { user_id } = response.user;
        const userData = await getData(`/users/${user.uid}`);
        if (!userData || !userData.role_id || !userData.user_id) {
          throw new Error("Failed to fetch user data after creation.");
        }
  
        setUser(user.uid, selectedRole.role_id, user_id);
        useUserStore.setState({ loading: false });
        navigate("/user-dashboard");
      } else {
        throw new Error("Failed to create user in backend.");
      }
    } catch (err) {
      console.error("Sign-up error occurred:", err);
      setEmailError(err.message || "Sign-up failed! Please try again.");
      useUserStore.setState({ loading: false });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <LoadingModal />
      <Container maxWidth="xs" sx={{ paddingTop: 8, backgroundColor: "#f4f6f9", borderRadius: "8px" }}>
        <Formik
          initialValues={{ email: "", password: "", confirmPassword: "", role: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSignUp}
        >
          {({ errors, touched, isSubmitting, values, handleChange, handleBlur }) => (
            <Form>
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
                  setEmailError("");
                }}
                onBlur={handleBlur}
                error={touched.email && (Boolean(errors.email) || Boolean(emailError))}
                helperText={touched.email ? errors.email || emailError : emailError}
              />
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
              <FormControl fullWidth margin="normal" error={touched.role && Boolean(errors.role)}>
                <InputLabel id="role-label">Role</InputLabel>
                <Select labelId="role-label" id="role" name="role" label="Role" value={values.role} onChange={handleChange} onBlur={handleBlur}>
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
              <Button variant="contained" color="primary" fullWidth type="submit" sx={{ marginTop: 2 }} disabled={isSubmitting}>
                {isSubmitting ? "Signing up..." : "Sign Up"}
              </Button>
            </Form>
          )}
        </Formik>

        <Box sx={{ textAlign: "center", marginTop: 2 }}>
          <Typography variant="body2">
            Already have an account?{" "}
            <Button color="primary" onClick={() => navigate("/login")}>
              Login
            </Button>
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default SignUpPage;
