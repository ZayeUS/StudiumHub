import React, { useState, useEffect } from "react";
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
  Mail, 
  Lock, 
  LogIn,
  ChevronRight,
  KeyRound
} from "lucide-react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { login as firebaseLogin, resetPassword } from "../../../firebase";
import { useUserStore } from "../../store/userStore";
import { useNavigate } from "react-router-dom";
import { getData } from "../../utils/BackendRequestHelper";
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
});

const LoginPage = () => {
  const { setUser, isLoggedIn, roleId } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [emailForReset, setEmailForReset] = useState("");
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

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleLogin = async (values, { setSubmitting }) => {
    const { email, password } = values;
    setFormSubmitted(true);
    setError("");
    
    try {
      // Show modal before starting
      useUserStore.setState({ loading: true });
      const user = await firebaseLogin(email, password);
      if (!user || !user.uid) {
        throw new Error("Invalid user object returned from Firebase.");
      }
      const idToken = await user.getIdToken();
      const userData = await getData(`/users/${user.uid}`, idToken);
      if (!userData || !userData.role_id) {
        throw new Error("Failed to fetch user role. Please contact support.");
      }
      // Save user data
      setUser(user.uid, userData.role_id, userData.user_id);
      setSnackbarMessage("Login successful!");
      setOpenSnackbar(true);
      // Hide modal once fully loaded then navigate
      useUserStore.setState({ loading: false });
      if (userData.role_id === 1) {
        navigate("/admin-dashboard");
      } else if (userData.role_id === 2) {
        navigate("/user-dashboard");
      } else {
        throw new Error("Invalid role detected. Please contact support.");
      }
    } catch (err) {
      console.error("Login error:", err.message);
      setError(err.message || "Login failed! Please check your credentials.");
      setSnackbarMessage(err.message ? `Error: ${err.message}` : "Login failed! Please check your credentials.");
      setOpenSnackbar(true);
      useUserStore.setState({ loading: false });
      setFormSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

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
        <Snackbar 
          open={openSnackbar} 
          autoHideDuration={4000} 
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setOpenSnackbar(false)} 
            severity={error ? "error" : "success"} 
            sx={{ 
              width: "100%",
              borderRadius: "10px"
            }}
            variant="filled"
            elevation={6}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

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
                <LogIn 
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
                  Welcome Back
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: alpha("#ffffff", 0.8)
                  }}
                >
                  Sign in to access your account
                </Typography>
              </motion.div>
            </Box>

            <Box sx={{ padding: 3 }}>
              <Formik
                initialValues={{ email: "", password: "" }}
                validationSchema={validationSchema}
                onSubmit={handleLogin}
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
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
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

                    <motion.div 
                      variants={itemVariants}
                      style={{ marginTop: "24px" }}
                    >
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
                        {isSubmitting || formSubmitted ? "Signing in..." : "Sign In"}
                      </Button>
                    </motion.div>
                  </Form>
                )}
              </Formik>

              <motion.div variants={itemVariants}>
                <Box sx={{ textAlign: "center", marginTop: 2 }}>
                  <Button 
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    variant="text" 
                    color="primary" 
                    onClick={() => setForgotPasswordModal(true)}
                    startIcon={<KeyRound size={16} />}
                    sx={{ 
                      textTransform: "none",
                      fontWeight: "medium",
                      fontSize: "14px"
                    }}
                  >
                    Forgot your password?
                  </Button>
                </Box>
              </motion.div>

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
                    Don't have an account?
                  </Typography>
                  <Button 
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    variant="outlined" 
                    color="primary" 
                    onClick={() => navigate("/signup")}
                    sx={{ 
                      padding: isMobile ? "8px 16px" : "10px 24px",
                      borderRadius: "10px",
                      textTransform: "none"
                    }}
                  >
                    Create Account
                  </Button>
                </Box>
              </motion.div>
            </Box>
          </Paper>
        </Container>
      </motion.div>

      {/* Password Reset Modal */}
      <Dialog 
        open={forgotPasswordModal} 
        onClose={() => setForgotPasswordModal(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: 1
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <KeyRound size={20} color={theme.palette.primary.main} />
              <Typography variant="h6" component="span" fontWeight="bold">
                Reset Your Password
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Enter your email address to receive a password reset link.
            </Typography>
            <TextField 
              label="Email Address" 
              variant="outlined" 
              fullWidth 
              margin="normal" 
              onChange={(e) => setEmailForReset(e.target.value)}
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
          </DialogContent>
          <DialogActions sx={{ padding: 2, pt: 0 }}>
            <Button 
              onClick={() => setForgotPasswordModal(false)} 
              color="inherit"
              variant="text"
              sx={{ 
                textTransform: "none",
                borderRadius: "8px"
              }}
            >
              Cancel
            </Button>
            <Button 
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleForgotPassword} 
              color="primary"
              variant="contained"
              sx={{ 
                textTransform: "none",
                borderRadius: "8px",
                fontWeight: "medium"
              }}
            >
              Send Reset Link
            </Button>
          </DialogActions>
        </motion.div>
      </Dialog>
    </Box>
  );
};

export default LoginPage;