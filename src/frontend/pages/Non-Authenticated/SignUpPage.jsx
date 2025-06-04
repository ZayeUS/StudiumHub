import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  useTheme,
  Paper,
  InputAdornment,
  IconButton,
  alpha,
  Grid,
  Hidden,
  LinearProgress,
  Tooltip,
  Fade,
  Zoom,
  Divider
} from "@mui/material";
import { 
  MailOutline, 
  LockOutlined, 
  Visibility, 
  VisibilityOff, 
  ArrowForward, 
  // PersonOutline, // Not used, can be removed
  CheckCircleOutline,
  ErrorOutline,
  Login, // Added Login icon
  RocketLaunch // Added for graphic
} from "@mui/icons-material";
import { signUp as firebaseSignUp, checkEmailExists } from "../../../firebase";
import { postData } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";
import { useNavigate } from "react-router-dom";

// Abstract graphic component (can be reused or customized)
const AuthGraphic = () => {
  const theme = useTheme();
  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          // Using secondary color as base, with a subtle gradient overlay
          bgcolor: theme.palette.secondary.main, 
          p: { xs: 4, md: 7 },
          color: theme.palette.common.white,
          textAlign: 'center',
          borderTopRightRadius: { md: theme.shape.borderRadiusLG }, 
          borderBottomRightRadius: { md: theme.shape.borderRadiusLG },
          borderTopLeftRadius: { xs: theme.shape.borderRadiusLG, md: 0 }, 
          borderBottomLeftRadius: { xs: theme.shape.borderRadiusLG, md: 0 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': { // Subtle overlay gradient for texture
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, transparent 0%, ${alpha(theme.palette.secondary.dark, 0.3)} 100%)`,
            pointerEvents: 'none',
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Zoom in timeout={500}>
                 <Box sx={{ mb: 3 }}>
                    <RocketLaunch sx={{ fontSize: {xs: '3.5rem', md: '4.5rem'}, mb: 2, opacity: 0.9, color: theme.palette.common.white }} />
                    <Typography variant="h2" fontWeight="bold" component="div" sx={{ mb: 1, letterSpacing: '-1px' }}>
                        Cofoundless
                    </Typography>
                 </Box>
            </Zoom>
            <Fade in timeout={700} style={{ transitionDelay: '200ms' }}>
            <Typography variant="h5" sx={{ opacity: 0.95, mb: 2, fontWeight: 500 }}>
                Build the Future, Together.
            </Typography>
            </Fade>
            <Fade in timeout={700} style={{ transitionDelay: '400ms' }}>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.85, maxWidth: 400, mx: 'auto', lineHeight: 1.75, mb: 5 }}>
                Join thousands of creators, innovators, and entrepreneurs. Your journey to success starts now.
            </Typography>
            </Fade>
            <Fade in timeout={700} style={{ transitionDelay: '600ms' }}>
                <Box sx={{ 
                display: 'flex', 
                gap: 1.5, 
                justifyContent: 'center',
                opacity: 0.8,
                fontSize: '0.8rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
                }}>
                <span>Dream</span>
                <span>•</span>
                <span>Build</span>
                <span>•</span>
                <span>Launch</span>
                </Box>
          </Fade>
        </Box>
      </Box>
    </Fade>
  );
};

const PasswordStrengthIndicator = ({ strength, color, checks }) => {
  const theme = useTheme();
  const criteria = [
    { label: "8+ characters", met: checks.length },
    { label: "Uppercase", met: checks.uppercase },
    { label: "Lowercase", met: checks.lowercase },
    { label: "Number", met: checks.number },
    { label: "Special char", met: checks.special },
  ];

  return (
    <Box sx={{ mt: 1.5, mb: 2 }}>
      <LinearProgress
        variant="determinate"
        value={strength}
        color={strength >= 80 ? "success" : (strength >=60 ? "warning" : "error")}
        sx={{
          height: 6,
          borderRadius: theme.shape.borderRadius,
          mb: 1,
          backgroundColor: alpha(theme.palette.grey[500], 0.3),
        }}
      />
      <Grid container spacing={1} sx={{mt: 0.5}}>
        {criteria.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.label}> {/* Adjusted grid for better layout */}
            <Typography
              variant="caption"
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: item.met ? theme.palette.success.main : theme.palette.text.secondary,
                opacity: item.met ? 1 : 0.6,
                fontSize: '0.75rem', // Slightly larger caption
                transition: 'color 0.3s ease, opacity 0.3s ease'
              }}
            >
              {item.met ? 
                <CheckCircleOutline sx={{ fontSize: 16, mr: 0.5, color: theme.palette.success.main }} /> : 
                <ErrorOutline sx={{ fontSize: 16, mr: 0.5 }} />
              }
              {item.label}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(""); 
  const [fieldErrors, setFieldErrors] = useState({});

  const theme = useTheme();
  const navigate = useNavigate();
  const { isLoggedIn, setUser, profile, authLoading, authHydrated } = useUserStore();

  useEffect(() => {
    if (authHydrated && isLoggedIn && profile) {
      navigate(profile.is_new_user ? "/profile-onboarding" : "/dashboard");
    } else if (authHydrated && isLoggedIn && !profile) {
      navigate("/profile-onboarding");
    }
  }, [isLoggedIn, profile, navigate, authHydrated]);

  const calculatePasswordStrength = (pwd) => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    const passed = Object.values(checks).filter(Boolean).length;
    const strength = Math.round((passed / Object.keys(checks).length) * 100);

    let color = theme.palette.error.main;
    if (strength >= 80) color = theme.palette.success.main;
    else if (strength >= 60) color = theme.palette.warning.main;
    
    return { strength, color, checks };
  };

  const validateForm = () => {
    const errors = {};
    const pwdStrength = calculatePasswordStrength(password);

    if (!email) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Please enter a valid email address.";

    if (!password) errors.password = "Password is required.";
    else if (!pwdStrength.checks.length) errors.password = "Password must be at least 8 characters.";
    else if (!pwdStrength.checks.uppercase) errors.password = "Include at least one uppercase letter.";
    else if (!pwdStrength.checks.lowercase) errors.password = "Include at least one lowercase letter.";
    else if (!pwdStrength.checks.number) errors.password = "Include at least one number.";
    else if (!pwdStrength.checks.special) errors.password = "Include at least one special character.";
    
    if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(""); 
    setFieldErrors({});

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setFieldErrors(prev => ({ ...prev, email: "An account with this email already exists. Please log in." }));
        setIsSubmitting(false);
        return;
      }

      const user = await firebaseSignUp(email, password);
      const { user: backendUser } = await postData("/users", {
        firebase_uid: user.uid,
        email: user.email,
        role_id: 1 
      });

      setUser(user.uid, 1, backendUser.user_id); 
      navigate("/profile-onboarding"); 

    } catch (err) {
      const messages = {
        "auth/email-already-in-use": "This email is already registered. Please log in.",
        "auth/invalid-email": "The email address is not valid.",
        "auth/operation-not-allowed": "Sign up is currently disabled. Please try again later.",
        "auth/weak-password": "Password is too weak. Please choose a stronger password."
      };
      const specificError = messages[err.code];
      if (specificError) {
        if (err.code === 'auth/weak-password') {
          setFieldErrors(prev => ({ ...prev, password: specificError }));
        } else if (err.code === 'auth/invalid-email' || err.code === 'auth/email-already-in-use') {
          setFieldErrors(prev => ({ ...prev, email: specificError }));
        } else {
          setError(specificError);
        }
      } else {
        setError("Failed to create account. Please try again.");
      }
      console.error("Sign up error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (setter, fieldName, value) => {
    setter(value);
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => ({ ...prev, [fieldName]: null }));
    }
    if(error) setError("");
  };

  const passwordStrength = calculatePasswordStrength(password);

  if (authLoading || (!authHydrated && !isLoggedIn)) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: theme.palette.background.default }}>
        <CircularProgress size={60} color="primary"/>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(160deg, ${alpha(theme.palette.background.default, 1)} 30%, ${alpha(theme.palette.secondary.dark, 0.15)} 100%)`
          : `linear-gradient(160deg, ${alpha(theme.palette.grey[100], 1)} 30%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="xl" sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper
          elevation={8}
          sx={{
            display: 'flex',
            width: '100%',
            maxWidth: {xs: '100%', md: '1000px', lg: '1100px'},
            minHeight: {xs: 'auto', md: '700px'},
            overflow: 'hidden',
            m: {xs: 0, sm: 2, md:3}
          }}
        >
          <Grid item xs={12} md={6.5} container alignItems="center" justifyContent="center" order={{ xs: 2, md: 1 }}>
            <Box sx={{ p: { xs: 3, sm: 4, md: 6 }, width: '100%', maxWidth: 480, mx: 'auto' }}>
              <Fade in timeout={600}>
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: theme.palette.text.primary, letterSpacing: '-0.5px' }}>
                    Create Your Account
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Join Cofoundless and start your journey today.
                  </Typography>
                </Box>
              </Fade>

              <Box component="form" onSubmit={handleSignUp} noValidate>
                <Fade in timeout={700} style={{ transitionDelay: '100ms' }}>
                  <Box>
                    {error && (
                      <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                        {error}
                      </Alert>
                    )}
                    <TextField
                      label="Email Address"
                      type="email"
                      fullWidth
                      value={email}
                      onChange={(e) => handleFieldChange(setEmail, "email", e.target.value)}
                      error={!!fieldErrors.email}
                      helperText={fieldErrors.email}
                      margin="normal"
                      required
                      autoComplete="email"
                      autoFocus
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><MailOutline sx={{ color: theme.palette.text.secondary }} /></InputAdornment>,
                      }}
                      sx={{ mb: 1.5 }}
                    />
                    <TextField
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      fullWidth
                      value={password}
                      onChange={(e) => handleFieldChange(setPassword, "password", e.target.value)}
                      error={!!fieldErrors.password}
                      helperText={fieldErrors.password}
                      margin="normal"
                      required
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: theme.palette.text.secondary }} /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              onMouseDown={(e) => e.preventDefault()}
                              edge="end" size="small"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: password ? 0 : 1.5 }}
                    />
                    {password && (
                      <PasswordStrengthIndicator strength={passwordStrength.strength} color={passwordStrength.color} checks={passwordStrength.checks} />
                    )}
                    <TextField
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      fullWidth
                      value={confirmPassword}
                      onChange={(e) => handleFieldChange(setConfirmPassword, "confirmPassword", e.target.value)}
                      error={!!fieldErrors.confirmPassword}
                      helperText={fieldErrors.confirmPassword}
                      margin="normal"
                      required
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: theme.palette.text.secondary }} /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              onMouseDown={(e) => e.preventDefault()}
                              edge="end" size="small"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2.5 }}
                    />
                  </Box>
                </Fade>
                <Fade in timeout={700} style={{ transitionDelay: '200ms' }}>
                  <Box>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={isSubmitting}
                      endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                      sx={{ py: 1.5 }}
                    >
                      {isSubmitting ? "Creating Account..." : "Sign Up"}
                    </Button>
                    <Divider sx={{ my: 3, fontSize: '0.8rem', fontWeight: 500, color: theme.palette.text.secondary }}>
                      OR
                    </Divider>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      size="large"
                      onClick={() => navigate("/login")}
                      disabled={isSubmitting}
                      startIcon={<Login />}
                      sx={{ py: 1.5 }}
                    >
                      Sign In Instead
                    </Button>
                  </Box>
                </Fade>
              </Box>
              <Fade in timeout={700} style={{ transitionDelay: '300ms' }}>
                <Box sx={{ mt: 4, textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary">
                    By creating an account, you agree to our <br/>
                    <Link href="/terms" target="_blank" rel="noopener noreferrer" sx={{color: theme.palette.primary.main, textDecoration: 'none', '&:hover': {textDecoration: 'underline'}}}>Terms of Service</Link> & <Link href="/privacy" target="_blank" rel="noopener noreferrer" sx={{color: theme.palette.primary.main, textDecoration: 'none', '&:hover': {textDecoration: 'underline'}}}>Privacy Policy</Link>.
                  </Typography>
                </Box>
              </Fade>
            </Box>
          </Grid>
          <Hidden mdDown>
            <Grid item md={5.5} sx={{ position: 'relative' }} order={{ xs: 1, md: 2 }}>
              <AuthGraphic />
            </Grid>
          </Hidden>
        </Paper>
      </Container>
    </Box>
  );
}
