import React, { useState, useEffect } from "react";
import {
  Box, Container, TextField, Button, Typography, Link, Alert,
  CircularProgress, useTheme, Paper, InputAdornment, IconButton,
  LinearProgress, Grid, Tooltip
} from "@mui/material";
import { 
  MailOutline, LockOutlined, Visibility, VisibilityOff, ArrowForward, 
  CheckCircleOutline, ErrorOutline, LightMode, DarkMode, PersonAdd
} from "@mui/icons-material";
import { motion, AnimatePresence } from 'framer-motion';
import { signUp, checkEmailExists } from "../../../firebase";
import { postData } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";
import { useNavigate } from "react-router-dom";

// Reusable Password Strength Indicator component
const PasswordStrengthIndicator = ({ strength, checks }) => {
  const theme = useTheme();
  const getStrengthColor = () => {
    if (strength >= 80) return 'success';
    if (strength >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ mt: 1.5, height: 80 }}>
      <LinearProgress variant="determinate" value={strength} color={getStrengthColor()} sx={{ height: 6, borderRadius: 3, mb: 1 }} />
      <Grid container spacing={1} sx={{ mt: 0.5 }}>
        {[
          { label: "8+ characters", met: checks.length },
          { label: "Uppercase", met: checks.uppercase },
          { label: "Lowercase", met: checks.lowercase },
          { label: "Number", met: checks.number },
          { label: "Symbol", met: checks.special },
        ].map(item => (
          <Grid item xs={6} sm={4} key={item.label}>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: item.met ? 'success.main' : 'text.secondary' }}>
              {item.met ? <CheckCircleOutline sx={{ fontSize: 14, mr: 0.5 }} /> : <ErrorOutline sx={{ fontSize: 14, mr: 0.5 }} />}
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const theme = useTheme();
  const navigate = useNavigate();
  const { isLoggedIn, setUser, profile, authHydrated, isDarkMode, toggleTheme } = useUserStore();

  useEffect(() => {
    if (authHydrated && isLoggedIn) {
      navigate(profile?.is_new_user ? "/profile-onboarding" : "/dashboard");
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
    return { strength: (passed / 5) * 100, checks };
  };
  
  const validate = () => {
    const errors = {};
    const pwdStrength = calculatePasswordStrength(password);
    if (!email) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Please enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    else if (pwdStrength.strength < 80) errors.password = "Please create a stronger password.";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (await checkEmailExists(email)) {
        setFieldErrors({ email: "An account with this email already exists." });
        setIsSubmitting(false);
        return;
      }
      const userCredential = await signUp(email, password);
      const backendUser = await postData("/users", {
        firebase_uid: userCredential.user.uid,
        email: userCredential.user.email,
        role_id: 2,
      });
      setUser(userCredential.user.uid, backendUser.user.role_id, backendUser.user.user_id);
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(password);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default", p: 2 }}>
      <Tooltip title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}>
        <IconButton onClick={toggleTheme} sx={{ position: 'absolute', top: 16, right: 16 }}>
          {isDarkMode ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Tooltip>
      <Container maxWidth="sm">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Paper elevation={12} sx={{ p: { xs: 3, sm: 5 }, borderRadius: theme.shape.borderRadiusLG, mt: -4 }}>
            <motion.div variants={itemVariants}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <PersonAdd sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
                <Typography component="h1" variant="h4" fontWeight="bold">Create an Account</Typography>
                <Typography variant="body2" color="text.secondary">Start your journey with us today.</Typography>
              </Box>
            </motion.div>

            <AnimatePresence>{error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert></motion.div>}</AnimatePresence>
            
            <Box component="form" onSubmit={handleSignUp} noValidate>
                <motion.div variants={itemVariants}><TextField margin="normal" required fullWidth label="Email Address" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={!!fieldErrors.email} helperText={fieldErrors.email} disabled={isSubmitting}/></motion.div>
                <motion.div variants={itemVariants}><TextField margin="normal" required fullWidth name="password" label="Password" type={showPassword ? "text" : "password"} error={!!fieldErrors.password} helperText={fieldErrors.password} value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>)}}/></motion.div>
                <motion.div variants={itemVariants}><TextField margin="normal" required fullWidth name="confirmPassword" label="Confirm Password" type="password" error={!!fieldErrors.confirmPassword} helperText={fieldErrors.confirmPassword} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSubmitting}/></motion.div>
                <motion.div variants={itemVariants}>{password && <PasswordStrengthIndicator strength={passwordStrength.strength} checks={passwordStrength.checks} />}</motion.div>
                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" fullWidth variant="contained" size="large" disabled={isSubmitting} sx={{ mt: 3, mb: 2, py: 1.5 }}>
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                    </Button>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Typography variant="body2" align="center" color="text.secondary">
                        Already have an account?{' '}
                        <Link component="button" variant="body2" onClick={() => navigate("/login")} fontWeight="bold">Sign In</Link>
                    </Typography>
                </motion.div>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}