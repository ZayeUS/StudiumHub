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
  Divider,
  Fade,
  Zoom
} from "@mui/material";
import { MailOutline, LockOutlined, Visibility, VisibilityOff, ArrowForward, PersonAddOutlined, RestartAlt, TrendingUp } from "@mui/icons-material";
import { login as firebaseLogin, resetPassword } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/userStore";

// AuthGraphic: Uses primary theme color with a subtle overlay
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
          bgcolor: theme.palette.primary.main, // Use solid primary color
          p: { xs: 4, md: 7 },
          color: theme.palette.primary.contrastText, // Ensure text is readable
          textAlign: 'center',
          borderTopLeftRadius: { md: theme.shape.borderRadiusLG },
          borderBottomLeftRadius: { md: theme.shape.borderRadiusLG },
          borderTopRightRadius: { xs: theme.shape.borderRadiusLG, md: 0 },
          borderBottomRightRadius: { xs: theme.shape.borderRadiusLG, md: 0 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': { // Subtle darker overlay for depth
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${alpha(theme.palette.common.black, 0)} 0%, ${alpha(theme.palette.common.black, 0.2)} 100%)`,
            pointerEvents: 'none',
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Zoom in timeout={500}>
            <Box sx={{ mb: 3 }}> {/* Adjusted margin */}
              <TrendingUp sx={{ fontSize: {xs: '3.5rem', md:'4rem'}, mb: 2, opacity: 0.9 }} />
              <Typography variant="h2" fontWeight="bold" component="div" sx={{ mb: 1, letterSpacing: '-1px' }}>
                Cofoundless
              </Typography>
            </Box>
          </Zoom>
          
          <Fade in timeout={700} style={{ transitionDelay: '200ms' }}>
            <Typography variant="h5" sx={{ opacity: 0.95, mb: 2.5, fontWeight: 500 }}> {/* Adjusted margin and font weight */}
              Unlock Your Potential
            </Typography>
          </Fade>
          
          <Fade in timeout={700} style={{ transitionDelay: '400ms' }}>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 380, mx: 'auto', lineHeight: 1.75, mb: 5 }}> {/* Adjusted opacity and margin */}
              Join a dynamic community of innovators, builders, and dreamers. Your next groundbreaking venture starts here.
            </Typography>
          </Fade>
          
          <Fade in timeout={700} style={{ transitionDelay: '600ms' }}>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center',
              opacity: 0.8, // Slightly increased opacity
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              <span>Innovate</span>
              <span>•</span>
              <span>Connect</span>
              <span>•</span>
              <span>Scale</span>
            </Box>
          </Fade>
        </Box>
      </Box>
    </Fade>
  );
};

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const theme = useTheme();
  const navigate = useNavigate();
  const { isLoggedIn, profile, authLoading, authHydrated } = useUserStore();

  useEffect(() => {
    if (authHydrated && isLoggedIn && profile) {
      navigate(profile.is_new_user ? "/profile-onboarding" : "/dashboard");
    } else if (authHydrated && isLoggedIn && !profile) {
      navigate("/profile-onboarding");
    }
  }, [isLoggedIn, profile, navigate, authHydrated]);
  
  const validateEmail = (emailToValidate) => emailToValidate && /\S+@\S+\.\S+/.test(emailToValidate);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await firebaseLogin(email, password);
    } catch (err) {
      const messages = {
        "auth/user-not-found": "No account found with this email. Would you like to sign up?",
        "auth/wrong-password": "Incorrect password. Please try again or reset it.",
        "auth/invalid-credential": "Incorrect email or password. Please try again.",
        "auth/too-many-requests": "Access temporarily disabled. Please reset your password or try again later.",
        "auth/network-request-failed": "Network error. Please check your connection."
      };
      setError(messages[err.code] || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setResetSuccess(false);
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address to reset your password.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setResetSuccess(true);
    } catch (err) {
      setError("Failed to send reset email. Please ensure the email is correct or try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (!authHydrated && !isLoggedIn)) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: theme.palette.background.default }}>
        <CircularProgress size={50} color="primary" /> {/* Adjusted size */}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center", // Center vertically on the page
        justifyContent: "center",
        bgcolor: theme.palette.background.default,
        p: { xs: 1, sm: 2 } // Padding around the main container
      }}
    >
      <Container maxWidth="lg" sx={{ p: 0 }}> {/* Changed to lg for better control with Grid */}
        <Paper
          elevation={8} // Uses theme.components.MuiPaper.styleOverrides.elevation8
          sx={{
            display: 'flex',
            width: '100%',
            maxWidth: { xs: '100%', sm: 500, md: '1000px' }, // Max width for the paper, sm for single column
            minHeight: { xs: 'auto', md: '600px' },
            mx: 'auto',
            overflow: 'hidden',
            // borderRadius is handled by elevation8 style in theme
          }}
        >
          <Hidden mdDown>
            <Grid item md={5.5} sx={{width: '45%'}}> {/* Give specific width for graphic panel */}
              <AuthGraphic />
            </Grid>
          </Hidden>
          
          <Grid item xs={12} md={6.5} container alignItems="center" justifyContent="center" sx={{width: {md: '55%'}, bgcolor: theme.palette.background.paper}}> {/* Form panel takes remaining width */}
            <Box sx={{ p: { xs: 3, sm: 4, md: 5 }, width: '100%', maxWidth: 420, mx: 'auto' }}> {/* Reduced maxWidth for form content */}
              <Fade in timeout={600}>
                <Box sx={{ textAlign: "center", mb: 4 }}> {/* Reduced margin */}
                  <Typography 
                    variant="h4" 
                    fontWeight={700}
                    gutterBottom
                    sx={{ color: theme.palette.text.primary, mb: 0.5 }}
                  >
                    {resetMode ? "Reset Password" : "Welcome Back"}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                    {resetMode 
                      ? "Enter your email address below." 
                      : "Sign in to continue building the future."
                    }
                  </Typography>
                </Box>
              </Fade>
              
              <Box component="form" onSubmit={resetMode ? handlePasswordReset : handleLogin} noValidate>
                <Fade in timeout={700} style={{ transitionDelay: '100ms' }}>
                  <Box sx={{ mb: 2.5 }}> {/* Reduced margin */}
                    {error && (
                      <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError("")}>
                        {error}
                      </Alert>
                    )}
                    {resetSuccess && (
                      <Alert severity="success" sx={{ mb: 2.5 }}>
                        Password reset email sent! Check your inbox and spam folder.
                      </Alert>
                    )}
                    
                    <TextField
                      label="Email Address"
                      type="email"
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      autoFocus={!resetMode} // autoFocus only if not in reset mode
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MailOutline color="action" sx={{color: theme.palette.text.secondary}}/>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2.5 }} // Consistent margin
                    />
                    
                    {!resetMode && (
                      <TextField
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlined color="action" sx={{color: theme.palette.text.secondary}} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                size="small"
                                disabled={isSubmitting}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Box>
                </Fade>
                
                <Fade in timeout={700} style={{ transitionDelay: '200ms' }}>
                  <Box>
                    {!resetMode && (
                      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2.5, mt: 0.5 }}>
                        <Link
                          component="button"
                          type="button"
                          variant="body2"
                          onClick={() => { 
                            setResetMode(true); 
                            setError(""); 
                            setResetSuccess(false); 
                          }}
                          disabled={isSubmitting}
                          sx={{ 
                            fontWeight: 500,
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': { color: theme.palette.primary.dark }
                          }}
                        >
                          Forgot password?
                        </Link>
                      </Box>
                    )}
                    
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary" // This will use the solid color from the theme
                      size="large"
                      disabled={isSubmitting}
                      endIcon={
                        isSubmitting ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          resetMode ? <RestartAlt /> : <ArrowForward />
                        )
                      }
                      sx={{ py: 1.5, mb: resetMode ? 0 : 2.5 }} // Adjusted margin
                    >
                      {isSubmitting ? "Processing..." : (resetMode ? "Send Reset Link" : "Sign In")}
                    </Button>

                    {!resetMode && (
                      <>
                        <Divider sx={{ my: 2.5 }}> {/* Adjusted margin */}
                          <Typography variant="body2" color="text.secondary" sx={{ px: 1.5 }}> {/* Adjusted padding */}
                            OR
                          </Typography>
                        </Divider>

                        <Button
                          fullWidth
                          variant="outlined"
                          color="primary" // This will use the outlined style from the theme
                          size="large"
                          onClick={() => navigate("/signup")}
                          disabled={isSubmitting}
                          startIcon={<PersonAddOutlined />}
                          sx={{ py: 1.5 }}
                        >
                          Create New Account
                        </Button>
                      </>
                    )}

                    {resetMode && (
                      <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Link
                          component="button"
                          type="button"
                          variant="body2"
                          onClick={() => { 
                            setResetMode(false); 
                            setError(""); 
                            setResetSuccess(false); 
                          }}
                          sx={{ 
                            fontWeight: 500,
                            color: theme.palette.text.secondary,
                            textDecoration: 'none',
                            '&:hover': { color: theme.palette.text.primary }
                          }}
                        >
                          ← Back to Sign In
                        </Link>
                      </Box>
                    )}
                  </Box>
                </Fade>
              </Box>
              
              <Fade in timeout={700} style={{ transitionDelay: '300ms' }}>
                <Box sx={{ mt: 4, textAlign: "center" }}> {/* Adjusted margin */}
                  <Typography variant="caption" color="text.secondary">
                    © {new Date().getFullYear()} Cofoundless. All rights reserved.
                  </Typography>
                </Box>
              </Fade>
            </Box>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
