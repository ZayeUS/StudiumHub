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
  useMediaQuery,
  Alert
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

// Define the validation schema with Zod
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm: z.string().min(1, 'Confirm your password'),
  role: z.string().min(1, 'Please select a role')
}).refine((data) => data.password === data.confirm, {
  message: 'Passwords must match',
  path: ['confirm']
});

const SignUpPage = () => {
  const { setUser, isLoggedIn, roleId } = useUserStore();
  const [roles, setRoles] = useState([]);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false); 
  const [error, setError] = useState('');
  const emailInputRef = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const borderRadius = theme.shape.borderRadius;

  // Form setup with React Hook Form + Zod
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError: setFieldError,
    clearErrors
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirm: '',
      role: ''
    }
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate(roleId === 1 ? '/admin-dashboard' : '/dashboard');
    }
  }, [isLoggedIn, roleId, navigate]);

  // Fetch roles once
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getData('/roles');
        setRoles(rolesData);
        setRolesLoaded(true);
      } catch (err) {
        console.error("Error fetching roles:", err);
        setError("Could not load roles. Please try again later.");
      }
    };
    
    fetchRoles();
  }, []);

  const onSignupSubmit = async (data) => {
    clearErrors();
    setError('');
    setFormSubmitted(true);
  
    try {
      // Check if email already exists
      const emailAvailable = await checkEmailExists(data.email)
        .then(exists => !exists)
        .catch(() => false);
      
      if (!emailAvailable) {
        setFieldError('email', { type: 'manual', message: 'Email already in use' });
        if (emailInputRef.current) emailInputRef.current.focus();
        setFormSubmitted(false);
        return;
      }
  
      useUserStore.setState({ loading: true });
      
      // Sign up user with Firebase
      const user = await firebaseSignUp(data.email, data.password);
  
      // Automatically log in
      await firebaseLogin(data.email, data.password);
  
      // Get role ID
      const selectedRole = roles.find(r => r.role_name === data.role);
      if (!selectedRole) {
        throw new Error("Invalid role selected");
      }
      
      const role_id = selectedRole.role_id;
  
      // Create user in backend
      const backendUserResponse = await postData('/users', {
        firebase_uid: user.uid,
        email: user.email,
        role_id
      });
  
      const { user_id } = backendUserResponse.user;
      
      // Update global state
      setUser(user.uid, role_id, user_id);
  
      // Add delay for better UX
      setTimeout(() => {
        navigate(role_id === 1 ? '/admin-dashboard' : '/dashboard');
      }, 1000);
  
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Sign-up failed. Please try again.');
      setFormSubmitted(false);
    } finally {
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
          <Paper elevation={3} sx={{ borderRadius, overflow: 'hidden' }}>
            <Box
              sx={{
                bgcolor: theme.palette.primary.main,
                p: 3,
                textAlign: 'center'
              }}
            >
              <motion.div variants={containerVariants}>
                <UserPlus size={40} color={theme.palette.common.white} style={{ marginBottom: 8 }} />
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mb: 1 }}>
                  Create Account
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Join our platform and get started.
                </Typography>
              </motion.div>
            </Box>

            <Box sx={{ p: 3 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <form onSubmit={handleSubmit(onSignupSubmit)} noValidate>
                <motion.div variants={containerVariants}>
                  {/* Email Field */}
                  <TextField
                    {...register('email')}
                    inputRef={emailInputRef}
                    type="email"
                    label="Email"
                    fullWidth
                    margin="normal"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={isSubmitting || formSubmitted}
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
                </motion.div>

                <motion.div variants={containerVariants}>
                  {/* Password Field */}
                  <TextField
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    fullWidth
                    margin="normal"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={isSubmitting || formSubmitted}
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
                            onClick={() => setShowPassword(prev => !prev)}
                            edge="end"
                            disabled={isSubmitting || formSubmitted}
                          >
                            {showPassword ? <EyeOff color={theme.palette.primary.main} /> : <Eye color={theme.palette.primary.main} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius }
                    }}
                  />
                </motion.div>

                <motion.div variants={containerVariants}>
                  {/* Confirm Password Field */}
                  <TextField
                    {...register('confirm')}
                    type={showConfirm ? 'text' : 'password'}
                    label="Confirm Password"
                    fullWidth
                    margin="normal"
                    error={!!errors.confirm}
                    helperText={errors.confirm?.message}
                    disabled={isSubmitting || formSubmitted}
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
                            onClick={() => setShowConfirm(prev => !prev)}
                            edge="end"
                            disabled={isSubmitting || formSubmitted}
                          >
                            {showConfirm ? <EyeOff color={theme.palette.primary.main} /> : <Eye color={theme.palette.primary.main} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius }
                    }}
                  />
                </motion.div>

                <motion.div variants={containerVariants}>
                  {/* Role Selection - Using Controller for proper MUI integration */}
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <FormControl
                        fullWidth
                        margin="normal"
                        error={!!errors.role}
                        disabled={isSubmitting || formSubmitted || !rolesLoaded}
                        sx={{
                          '& .MuiOutlinedInput-root': { borderRadius }
                        }}
                      >
                        <InputLabel>Role</InputLabel>
                        <Select
                          {...field}
                          label="Role"
                          startAdornment={
                            <InputAdornment position="start">
                              <Briefcase color={theme.palette.primary.main} />
                            </InputAdornment>
                          }
                          value={field.value || ''}
                        >
                          {rolesLoaded ? (
                            roles.map((r) => (
                              <MenuItem key={r.role_id} value={r.role_name}>
                                {r.role_name}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem value="">Loading roles...</MenuItem>
                          )}
                        </Select>
                        {errors.role && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                            {errors.role.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </motion.div>

                <motion.div variants={containerVariants}>
                  {/* Submit Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    type="submit"
                    disabled={isSubmitting || formSubmitted || !rolesLoaded}
                    endIcon={isSubmitting || formSubmitted ? <CircularProgress size={24} /> : <ChevronRight />}
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
              </form>

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
