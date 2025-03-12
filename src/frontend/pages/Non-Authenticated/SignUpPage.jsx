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
  Paper,
  useTheme,
  useMediaQuery,
  Divider,
  alpha
} from "@mui/material";
import { motion } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  UserPlus, 
  Mail, 
  Lock, 
  Briefcase,
  ChevronRight 
} from "lucide-react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { signUp as firebaseSignUp, login as firebaseLogin, checkEmailExists } from "../../../firebase";
import { useUserStore } from "../../store/userStore";
import { useNavigate } from "react-router-dom";
import { getData, postData } from "../../utils/BackendRequestHelper";
import LoadingModal from "../../components/LoadingModal";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

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
  const [formSubmitted, setFormSubmitted] = useState(false);
  const navigate = useNavigate();
  
  // Theme and responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    setFormSubmitted(true);
    
    const emailAvailable = await checkEmailAvailability(email);
    if (!emailAvailable) {
      setSubmitting(false);
      setFormSubmitted(false);
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
      setFormSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        padding: 2
      }}
    >
      <LoadingModal />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ width: "100%" }}
      >
        <Container maxWidth="sm">
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)"
            }}
          >
            <Box 
              sx={{ 
                backgroundColor: theme.palette.primary.main,
                padding: 3,
                textAlign: "center"
              }}
            >
              <motion.div variants={itemVariants}>
                <UserPlus 
                  size={40} 
                  color="white" 
                  style={{ 
                    marginBottom: "8px",
                  }}
                />
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ 
                    color: "white",
                    fontWeight: "bold",
                    marginBottom: 1
                  }}
                >
                  Create Account
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: alpha("#ffffff", 0.8)
                  }}
                >
                  Join our platform and get started today.
                </Typography>
              </motion.div>
            </Box>

            <Box sx={{ padding: 3 }}>
              <Formik
                initialValues={{ email: "", password: "", confirmPassword: "", role: "" }}
                validationSchema={validationSchema}
                onSubmit={handleSignUp}
              >
                {({ errors, touched, isSubmitting, values, handleChange, handleBlur }) => (
                  <Form>
                    <motion.div variants={itemVariants}>
                      <Field
                        name="email"
                        as={TextField}
                        label="Email Address"
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
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Mail size={20} color={theme.palette.text.secondary} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                          }
                        }}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
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
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock size={20} color={theme.palette.text.secondary} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                                size="small"
                              >
                                {showPassword ? 
                                  <EyeOff size={20} color={theme.palette.text.secondary} /> : 
                                  <Eye size={20} color={theme.palette.text.secondary} />
                                }
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                          }
                        }}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
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
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock size={20} color={theme.palette.text.secondary} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle confirm password visibility"
                                onClick={handleClickShowConfirmPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                                size="small"
                              >
                                {showConfirmPassword ? 
                                  <EyeOff size={20} color={theme.palette.text.secondary} /> : 
                                  <Eye size={20} color={theme.palette.text.secondary} />
                                }
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                          }
                        }}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FormControl 
                        fullWidth 
                        margin="normal" 
                        error={touched.role && Boolean(errors.role)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                          }
                        }}
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
                          startAdornment={
                            <InputAdornment position="start">
                              <Briefcase size={20} color={theme.palette.text.secondary} />
                            </InputAdornment>
                          }
                        >
                          {roles.map((role) => (
                            <MenuItem key={role.role_id} value={role.role_name}>
                              {role.role_name}
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.role && errors.role && (
                          <Typography variant="body2" color="error" sx={{ mt: 1, ml: 2 }}>
                            {errors.role}
                          </Typography>
                        )}
                      </FormControl>
                    </motion.div>

                    <motion.div variants={itemVariants} style={{ marginTop: "24px" }}>
                      <Button
                        component={motion.button}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        type="submit" 
                        disabled={isSubmitting || formSubmitted}
                        sx={{ 
                          padding: "12px", 
                          borderRadius: "10px",
                          textTransform: "none",
                          fontSize: "16px",
                          fontWeight: "bold",
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
                        }}
                        endIcon={<ChevronRight size={20} />}
                      >
                        {isSubmitting || formSubmitted ? "Creating Account..." : "Sign Up"}
                      </Button>
                    </motion.div>
                  </Form>
                )}
              </Formik>

              <motion.div variants={itemVariants}>
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Already have an account?
                  </Typography>
                  <Button 
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    variant="outlined" 
                    color="primary" 
                    onClick={() => navigate("/login")}
                    sx={{ 
                      padding: isMobile ? "8px 16px" : "10px 24px",
                      borderRadius: "10px",
                      textTransform: "none"
                    }}
                  >
                    Log In
                  </Button>
                </Box>
              </motion.div>
            </Box>
          </Paper>
        </Container>
      </motion.div>
    </Box>
  );
};

export default SignUpPage;