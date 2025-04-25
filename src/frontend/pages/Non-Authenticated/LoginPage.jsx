import React, { useState } from 'react';
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
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import LoadingModal from '../../components/LoadingModal';
import { login as firebaseLogin, resetPassword } from '../../../firebase';  // Import resetPassword function
import { useUserStore } from '../../store/userStore';
import { useNavigate } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
};

export default function LoginPage() {
  const { setUser, setLoading } = useUserStore();
  const [showPwd, setShowPwd] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' });
  const [openModal, setOpenModal] = useState(false); // Modal state for forgot password
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // Fetch border radius from theme
  const borderRadius = theme.shape.borderRadius;

  const fieldSx = {
    '& .MuiOutlinedInput-root': { borderRadius }
  };

  const btnSx = {
    mt: 3,
    py: 1.5,
    borderRadius,
    textTransform: 'none',
    fontWeight: 'bold'
  };

  const handleLogin = async ({ email, password }, { setSubmitting }) => {
    setSubmitting(true);
    setLoading(true);
  
    try {
      const user = await firebaseLogin(email, password);
      const token = await user.getIdToken();
      const { role_id, user_id } = await getData(`/users/${user.uid}`, token);
  
      setTimeout(() => {
        setUser(user.uid, role_id, user_id);
        setSnack({ open: true, msg: 'Logged in!', sev: 'success' });
        navigate(role_id === 1 ? '/admin-dashboard' : '/user-dashboard');
      }, 1000);
  
    } catch (e) {
      setSnack({ open: true, msg: e.message || 'Login failed', sev: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle forgot password (send reset email)
  const handleForgotPassword = async (email) => {
    try {
      await resetPassword(email);
      setSnack({ open: true, msg: 'Password reset email sent. Check your inbox!', sev: 'success' });
      setOpenModal(false); // Close modal on success
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
              <LogIn size={40} color="#fff" />
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mt: 1 }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Sign in to your account
              </Typography>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={Yup.object({
                  email: Yup.string().email('Invalid email').required('Required'),
                  password: Yup.string().min(6, 'At least 6 chars').required('Required')
                })}
                onSubmit={handleLogin}
              >
                {({ errors, touched, isSubmitting, values, handleChange, handleBlur }) => (
                  <Form>
                    {['email', 'password'].map((field) => (
                      <Field name={field} key={field}>
                        {({ field: f, meta }) => (
                          <TextField
                            {...f}
                            type={field === 'password' ? (showPwd ? 'text' : 'password') : 'email'}
                            label={field === 'email' ? 'Email Address' : 'Password'}
                            fullWidth
                            margin="normal"
                            error={Boolean(meta.touched && meta.error)}
                            helperText={meta.touched && meta.error}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  {field === 'email' ? <Mail /> : <Lock />}
                                </InputAdornment>
                              ),
                              ...(field === 'password' && {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setShowPwd((v) => !v)}>
                                      {showPwd ? <EyeOff /> : <Eye />}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              })
                            }}
                            sx={fieldSx}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values[field]}
                          />
                        )}
                      </Field>
                    ))}

                    <Button
                      variant="contained"
                      fullWidth
                      type="submit"
                      disabled={isSubmitting}
                      endIcon={<ChevronRight />}
                      sx={btnSx}
                    >
                      {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </Form>
                )}
              </Formik>

              <Box textAlign="center" mt={2}>
                {/* Trigger Modal for Forgot Password */}
                <Button
                  variant="text"
                  startIcon={<KeyRound />}
                  onClick={() => setOpenModal(true)} // Open the modal
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
            <Formik
              initialValues={{ email: '' }}
              validationSchema={Yup.object({
                email: Yup.string().email('Invalid email address').required('Required')
              })}
              onSubmit={(values) => handleForgotPassword(values.email)}
            >
              {({ isSubmitting, handleChange, handleBlur, values }) => (
                <Form>
                  <TextField
                    label="Email Address"
                    name="email"
                    type="email"
                    fullWidth
                    margin="normal"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius } }}
                  />
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      type="submit"
                      disabled={isSubmitting}
                      sx={{ borderRadius }}
                    >
                      Send Reset Email
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
