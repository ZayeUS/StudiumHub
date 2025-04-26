import React, { useState, useRef } from "react";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Typography,
  Snackbar,
  Alert,
  Divider,
  Modal,
  Fade,
  Backdrop
} from '@mui/material';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ChevronRight, LogIn, KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import LoadingModal from '../../components/LoadingModal';
import { login as firebaseLogin, resetPassword } from '../../../firebase';
import { useUserStore } from '../../store/userStore';
import { useNavigate } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import { getData } from '../../utils/BackendRequestHelper';

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
};

// Define validation schema with Zod
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Define schema for password reset
const resetSchema = z.object({
  email: z.string().email('Invalid email address')
});

export default function LoginPage() {
  const { setUser, setLoading } = useUserStore();
  const [showPwd, setShowPwd] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' });
  const [openModal, setOpenModal] = useState(false);
  const errorRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const borderRadius = theme.shape.borderRadius;

  // React Hook Form setup for login
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // React Hook Form setup for password reset
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors, isSubmitting: isResetting }
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: ''
    }
  });

  // Show error without causing re-render
  const showLoginError = (message) => {
    if (errorRef.current) {
      errorRef.current.textContent = message;
      errorRef.current.style.display = 'block';
      
      setTimeout(() => {
        if (errorRef.current) {
          errorRef.current.style.display = 'none';
        }
      }, 30000);
    }
  };

  // Hide login error
  const hideLoginError = () => {
    if (errorRef.current) {
      errorRef.current.style.display = 'none';
    }
  };

  // Handle login form submission
  const onLoginSubmit = async (data) => {
    setLoading(true);
    hideLoginError();
  
    try {
      // Attempt login
      const user = await firebaseLogin(data.email, data.password);
      const token = await user.getIdToken();
      const { role_id, user_id } = await getData(`/users/${user.uid}`, token);
  
      setTimeout(() => {
        setUser(user.uid, role_id, user_id);
        setSnack({ open: true, msg: 'Logged in!', sev: 'success' });
        navigate(role_id === 1 ? '/admin-dashboard' : '/dashboard');
      }, 1000);
  
    } catch (e) {
      console.error("Login error:", e);
      const errorMessage = e.message || 'Incorrect Email or Password';
      showLoginError(errorMessage);
      setSnack({ open: true, msg: errorMessage, sev: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset submission
  const onResetSubmit = async (data) => {
    try {
      await resetPassword(data.email);
      setSnack({ open: true, msg: 'Password reset email sent. Check your inbox!', sev: 'success' });
      setOpenModal(false);
    } catch (e) {
      setSnack({ open: true, msg: e.message || 'Failed to send reset email', sev: 'error' });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: theme.palette.background.default,
        p: 2
      }}
    >
      <LoadingModal />
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snack.sev}>{snack.msg}</Alert>
      </Snackbar>

      <motion.div initial="hidden" animate="visible" variants={variants} style={{ width: '100%' }}>
        <Container maxWidth="sm">
          <Paper sx={{ borderRadius, overflow: 'hidden' }} elevation={3}>
            <Box sx={{ bgcolor: theme.palette.primary.main, p: 3, textAlign: 'center' }}>
              <LogIn size={40} color={theme.palette.common.white} />
              <Typography variant="h4" sx={{ color: theme.palette.common.white, fontWeight: 'bold', mt: 1 }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Sign in to your account
              </Typography>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <form onSubmit={handleSubmit(onLoginSubmit)} noValidate>
                {/* Email Field */}
                <TextField
                  {...register('email')}
                  type="email"
                  label="Email Address"
                  fullWidth
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={isSubmitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail color={theme.palette.primary.main} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius }
                  }}
                />

                {/* Password Field */}
                <TextField
                  {...register('password')}
                  type={showPwd ? 'text' : 'password'}
                  label="Password"
                  fullWidth
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={isSubmitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color={theme.palette.primary.main} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={() => setShowPwd((v) => !v)}
                          edge="end"
                        >
                          {showPwd ? <EyeOff color={theme.palette.primary.main} /> : <Eye color={theme.palette.primary.main} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius }
                  }}
                />
                
                {/* Error message element manipulated via DOM */}
                <div 
                  ref={errorRef}
                  style={{
                    color: theme.palette.error.main,
                    marginTop: '8px',
                    marginBottom: '8px',
                    fontWeight: 500,
                    display: 'none'
                  }}
                >
                  Incorrect Email or Password
                </div>

                <Button
                  variant="contained"
                  fullWidth
                  type="submit"
                  disabled={isSubmitting}
                  endIcon={<ChevronRight />}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    borderRadius,
                    textTransform: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <Box textAlign="center" mt={2}>
                <Button
                  variant="text"
                  startIcon={<KeyRound />}
                  onClick={() => setOpenModal(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Forgot your password?
                </Button>
              </Box>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Don't have an account?
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/signup')}
                  sx={{
                    py: 1,
                    px: isMobile ? 2 : 3,
                    borderRadius,
                    textTransform: 'none'
                  }}
                >
                  Create Account
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </motion.div>

      {/* Modal for Forgot Password */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={openModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              p: 4,
              borderRadius: 2,
              boxShadow: 24,
              minWidth: 300
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>Reset Your Password</Typography>
            <form onSubmit={handleSubmitReset(onResetSubmit)} noValidate>
              <TextField
                {...registerReset('email')}
                label="Email Address"
                type="email"
                fullWidth
                margin="normal"
                error={!!resetErrors.email}
                helperText={resetErrors.email?.message}
                disabled={isResetting}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius } }}
              />
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  type="submit"
                  disabled={isResetting}
                  sx={{ borderRadius }}
                >
                  {isResetting ? 'Sending...' : 'Send Reset Email'}
                </Button>
              </Box>
            </form>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
