import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Briefcase,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import LoadingModal from '../../components/LoadingModal';
import {
  signUp as firebaseSignUp,
  login as firebaseLogin,
  checkEmailExists
} from '../../../firebase';
import { getData, postData } from '../../utils/BackendRequestHelper';
import { useUserStore } from '../../store/userStore';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, when: 'beforeChildren', staggerChildren: 0.1 }
  }
};

const PasswordField = ({ name, label, show, setShow, borderRadius }) => (
  <Field name={name}>
    {({ field, meta }) => (
      <TextField
        {...field}
        type={show ? 'text' : 'password'}
        label={label}
        fullWidth
        margin="normal"
        error={Boolean(meta.touched && meta.error)}
        helperText={meta.touched && meta.error}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() =>
                  setShow((s) => ({
                    ...s,
                    [name]: !s[name]
                  }))
                }
              >
                {show ? <EyeOff /> : <Eye />}
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{
          '& .MuiOutlinedInput-root': { borderRadius }
        }}
      />
    )}
  </Field>
);

const SignUpPage = () => {
  const { setUser, isLoggedIn, roleId } = useUserStore();
  const [roles, setRoles] = useState([]);
  const [show, setShow] = useState({ password: false, confirm: false });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const emailInputRef = useRef(null); // For focusing on email input if error
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const borderRadius = theme.shape.borderRadius; // Pulling border radius from theme

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate(roleId === 1 ? '/admin-dashboard' : '/user-dashboard');
    }
  }, [isLoggedIn, roleId, navigate]);

  // Fetch roles once
  useEffect(() => {
    getData('/roles').then(setRoles).catch(console.error);
  }, []);

  const validationSchema = Yup.object({
    email: Yup.string().email().required('Required'),
    password: Yup.string().min(6, 'Min 6 chars').required('Required'),
    confirm: Yup.string()
      .oneOf([Yup.ref('password')], 'Must match')
      .required('Required'),
    role: Yup.string().required('Required')
  });

  const handleSubmit = async (vals, { setSubmitting, setFieldError }) => {
    setFormSubmitted(true);
  
    // Quick email check
    if (!(await checkEmailExists(vals.email).then(exists => !exists).catch(() => false))) {
      setFieldError('email', 'Already in use');
      setFormSubmitted(false);
      emailInputRef.current.focus(); // Focus on email input if error
      return setSubmitting(false);
    }
  
    useUserStore.setState({ loading: true });
    try {
      // Sign up user with Firebase
      const user = await firebaseSignUp(vals.email, vals.password);
  
      // Automatically log in the user after sign-up
      await firebaseLogin(vals.email, vals.password);
  
      // Create user record in the backend after Firebase login
      const token = await user.getIdToken();
      const { role_id } = roles.find(r => r.role_name === vals.role) || {};
  
      // Create user in the backend with Firebase UID and role_id
      const backendUserResponse = await postData('/users', {
        firebase_uid: user.uid,
        email: user.email,
        role_id
      });
  
      const { user_id } = backendUserResponse.user;  // Get the user_id from backend response
  
      // Now update Zustand store with the new user data
      setUser(user.uid, role_id, user_id);
  
      // Add delay to make sure the spinner is visible before redirecting
      setTimeout(() => {
        navigate(role_id === 1 ? '/admin-dashboard' : '/user-dashboard');
      }, 1000);
  
    } catch (err) {
      console.error(err);
      setFieldError('general', err.message || 'Sign‑up failed');
      setFormSubmitted(false);
    } finally {
      setSubmitting(false);
      useUserStore.setState({ loading: false });
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

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ width: '100%' }}
      >
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ borderRadius: borderRadius, overflow: 'hidden' }}>
            <Box
              sx={{
                bgcolor: theme.palette.primary.main,
                p: 3,
                textAlign: 'center'
              }}
            >
              <motion.div variants={containerVariants}>
                <UserPlus size={40} color="#fff" style={{ marginBottom: 8 }} />
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mb: 1 }}>
                  Create Account
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Join our platform and get started.
                </Typography>
              </motion.div>
            </Box>

            <Box sx={{ p: 3 }}>
              <Formik
                initialValues={{ email: '', password: '', confirm: '', role: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, isSubmitting, values, handleChange, handleBlur }) => (
                  <Form>
                    {['email', 'password', 'confirm'].map((name) => (
                      <motion.div key={name} variants={containerVariants}>
                        <Field name={name}>
                          {({ field, meta }) => (
                            <TextField
                              {...field}
                              type={
                                name === 'email'
                                  ? 'email'
                                  : show[name === 'confirm' ? 'confirm' : 'password']
                                  ? 'text'
                                  : 'password'
                              }
                              label={
                                name === 'confirm' ? 'Confirm Password' : name.charAt(0).toUpperCase() + name.slice(1)
                              }
                              fullWidth
                              margin="normal"
                              error={Boolean(meta.touched && (meta.error || errors.general))}
                              helperText={meta.touched && (meta.error || errors.general)}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    {name === 'email' ? <Mail /> : <Lock />}
                                  </InputAdornment>
                                ),
                                ...(name !== 'email' && {
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          setShow((s) => ({
                                            ...s,
                                            [name === 'confirm' ? 'confirm' : 'password']:
                                              !s[name === 'confirm' ? 'confirm' : 'password']
                                          }))
                                        }
                                      >
                                        {show[name === 'confirm' ? 'confirm' : 'password'] ? (
                                          <EyeOff />
                                        ) : (
                                          <Eye />
                                        )}
                                      </IconButton>
                                    </InputAdornment>
                                  )
                                })
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': { borderRadius }
                              }}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values[name]}
                              inputRef={name === 'email' ? emailInputRef : null} // Focus on email input if error
                            />
                          )}
                        </Field>
                      </motion.div>
                    ))}

                    <motion.div variants={containerVariants}>
                      <FormControl
                        fullWidth
                        margin="normal"
                        error={Boolean(touched.role && errors.role)}
                        sx={{
                          '& .MuiOutlinedInput-root': { borderRadius }
                        }}
                      >
                        <InputLabel>Role</InputLabel>
                        <Field
                          name="role"
                          as={Select}
                          startAdornment={
                            <InputAdornment position="start">
                              <Briefcase />
                            </InputAdornment>
                          }
                          value={values.role}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        >
                          {roles.map((r) => (
                            <MenuItem key={r.role_id} value={r.role_name}>
                              {r.role_name}
                            </MenuItem>
                          ))}
                        </Field>
                      </FormControl>
                    </motion.div>

                    <motion.div variants={containerVariants}>
                      <Button
                        variant="contained"
                        fullWidth
                        type="submit"
                        disabled={isSubmitting || formSubmitted}
                        endIcon={isSubmitting ? <CircularProgress size={24} /> : <ChevronRight />}
                        sx={{
                          mt: 3,
                          py: 1.5,
                          borderRadius,
                          textTransform: 'none',
                          fontWeight: 'bold',
                        }}
                      >
                        {isSubmitting || formSubmitted ? 'Creating...' : 'Sign Up'}
                      </Button>
                    </motion.div>
                  </Form>
                )}
              </Formik>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Already have an account?
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{
                    mt: 1,
                    py: 1,
                    px: isMobile ? 2 : 3,
                    borderRadius,
                    textTransform: 'none'
                  }}
                >
                  Log In
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </motion.div>
    </Box>
  );
};

export default SignUpPage;
