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
  Alert,Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ChevronRight, LogIn,KeyRound } from 'lucide-react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import LoadingModal from '../../components/LoadingModal';
import { login as firebaseLogin } from '../../../firebase';
import { useUserStore } from '../../store/userStore';
import { useNavigate } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
};
const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };
const btnSx = { mt: 3, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' };

export default function LoginPage() {
  const { setUser, setLoading } = useUserStore();
  const [showPwd, setShowPwd] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Define isMobile here
  const navigate = useNavigate();

  // Handler for Login
  const handleLogin = async ({ email, password }, { setSubmitting }) => {
    setSubmitting(true);
    setLoading(true); // Set loading to true immediately
  
    try {
      const user = await firebaseLogin(email, password);
      const token = await user.getIdToken();
      const { role_id, user_id } = await getData(`/users/${user.uid}`, token);
  
      // Add a delay to ensure loading spinner stays visible for at least 1 second
      setTimeout(() => {
        setUser(user.uid, role_id, user_id);
        setSnack({ open: true, msg: 'Logged in!', sev: 'success' });
        navigate(role_id === 1 ? '/admin-dashboard' : '/user-dashboard');
      }, 1000); // Delay for 1 second
  
    } catch (e) {
      setSnack({ open: true, msg: e.message || 'Login failed', sev: 'error' });
    } finally {
      setSubmitting(false);
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
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }} elevation={3}>
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
                <Button variant="text" startIcon={<KeyRound />} onClick={() => setSnack({ open: true, msg: 'Forgot Password clicked', sev: 'info' })} sx={{ textTransform: 'none' }}>
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
                    borderRadius: 2,
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
    </Box>
  );
}
