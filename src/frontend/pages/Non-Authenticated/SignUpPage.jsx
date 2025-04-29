import React, { useState, useEffect, useRef } from "react";
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
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ChevronRight, UserPlus } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { signUp as firebaseSignUp, login as firebaseLogin, checkEmailExists } from "../../../firebase";
import { getData, postData } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";
import LoadingModal from "../../components/LoadingModal";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm: z.string().min(1, "Confirm your password"),
  role: z.string().min(1, "Please select a role"),
}).refine((data) => data.password === data.confirm, {
  message: "Passwords must match",
  path: ["confirm"],
});

export default function SignUpPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const borderRadius = theme.shape.borderRadius;
  const navigate = useNavigate();
  const { setUser, isLoggedIn, roleId } = useUserStore();
  const { loading } = useUserStore();

  const [roles, setRoles] = useState([]);
  const [signupError, setSignupError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const emailInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirm: "", role: "" },
  });

  useEffect(() => {
    if (isLoggedIn) {
      navigate(roleId === 1 ? "/admin-dashboard" : "/dashboard");
    }
  }, [isLoggedIn, roleId, navigate]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getData("/roles");
        setRoles(data);
      } catch (error) {
        setSnack({
          open: true,
          msg: "Failed to load roles. Please refresh and try again.",
          sev: "error"
        });
      }
    };
    fetchRoles();
  }, []);

  // Clear email error when user types in email field
  const watchEmail = watch("email");
  useEffect(() => {
    if (emailError && watchEmail) {
      setEmailError("");
    }
  }, [watchEmail, emailError]);

  const onSignupSubmit = async (data) => {
    // Reset error states
    setSignupError("");
    setEmailError("");

    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(data.email);
      if (emailExists) {
        setEmailError("Email already in use");
        if (emailInputRef.current) emailInputRef.current.focus();
        return;
      }

      // Set loading state
      useUserStore.setState({ loading: true });

      // Create Firebase account
      const user = await firebaseSignUp(data.email, data.password);
      
      // Sign in the user
      await firebaseLogin(data.email, data.password);

      // Find role ID
      const selectedRole = roles.find(r => r.role_name === data.role);
      if (!selectedRole) {
        throw new Error("Invalid role selected");
      }

      // Create backend user
      const backendUser = await postData("/users", {
        firebase_uid: user.uid,
        email: user.email,
        role_id: selectedRole.role_id,
      });

      // Update user store
      const { user_id } = backendUser.user;
      setUser(user.uid, selectedRole.role_id, user_id);

      // Show success message
      setSnack({
        open: true,
        msg: "Account created successfully! Redirecting...",
        sev: "success"
      });

      // Navigate to dashboard
      setTimeout(() => {
        navigate(selectedRole.role_id === 1 ? "/admin-dashboard" : "/dashboard");
      }, 1000);
    } catch (err) {
      console.error(err);
      setSignupError(err.message || "Sign-up failed. Please try again.");
      setSnack({
        open: true,
        msg: err.message || "Sign-up failed. Please try again.",
        sev: "error"
      });
    } finally {
      useUserStore.setState({ loading: false });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: theme.palette.background.default,
        p: { xs: 2, md: 6 },
      }}
    >
      <LoadingModal open={loading} />

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snack.sev}>{snack.msg}</Alert>
      </Snackbar>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ width: "100%" }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Paper
              elevation={0}
              sx={{
                borderRadius,
                background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
                boxShadow: theme.shadows[10],
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <Box sx={{ bgcolor: theme.palette.primary.main, p: 3, textAlign: "center" }}>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <UserPlus size={40} color={theme.palette.common.white} />
                  <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mt: 1 }}>
                    Create Account
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                    Join our platform and get started
                  </Typography>
                </motion.div>
              </Box>

              {/* Form */}
              <Box sx={{ p: 3 }}>
                <form onSubmit={handleSubmit(onSignupSubmit)} noValidate>
                  {/* Email */}
                  <TextField
                    {...register("email")}
                    inputRef={emailInputRef}
                    type="email"
                    label="Email Address"
                    fullWidth
                    margin="normal"
                    error={!!errors.email || !!emailError}
                    helperText={emailError || errors.email?.message}
                    disabled={isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail color={theme.palette.primary.main} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius,
                        backgroundColor: "rgba(255,255,255,0.04)",
                      },
                    }}
                  />

                  {/* Password */}
                  <TextField
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
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
                          <IconButton size="small" onClick={() => setShowPassword((v) => !v)} edge="end">
                            {showPassword ? <EyeOff color={theme.palette.primary.main} /> : <Eye color={theme.palette.primary.main} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius,
                        backgroundColor: "rgba(255,255,255,0.04)",
                      },
                    }}
                  />

                  {/* Confirm Password */}
                  <TextField
                    {...register("confirm")}
                    type={showConfirm ? "text" : "password"}
                    label="Confirm Password"
                    fullWidth
                    margin="normal"
                    error={!!errors.confirm}
                    helperText={errors.confirm?.message}
                    disabled={isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color={theme.palette.primary.main} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowConfirm((v) => !v)} edge="end">
                            {showConfirm ? <EyeOff color={theme.palette.primary.main} /> : <Eye color={theme.palette.primary.main} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius,
                        backgroundColor: "rgba(255,255,255,0.04)",
                      },
                    }}
                  />

                  {/* Role */}
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <FormControl 
                        fullWidth 
                        margin="normal" 
                        error={!!errors.role}
                        sx={{ 
                          "& .MuiOutlinedInput-root": {
                            borderRadius,
                            backgroundColor: "rgba(255,255,255,0.04)",
                          },
                        }}
                      >
                        <InputLabel>Role</InputLabel>
                        <Select
                          {...field}
                          label="Role"
                          value={field.value || ""}
                          disabled={isSubmitting}
                        >
                          {roles.length ? (
                            roles.map(r => (
                              <MenuItem key={r.role_id} value={r.role_name}>
                                {r.role_name}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem value="">Loading roles...</MenuItem>
                          )}
                        </Select>
                        {errors.role && (
                          <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                            {errors.role.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />

                  {/* General Error Message */}
                  {signupError && (
                    <Typography variant="body2" color="error" sx={{ mt: 1, mb: 1, fontWeight: 500 }}>
                      {signupError}
                    </Typography>
                  )}

                  {/* Submit Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    type="submit"
                    disabled={isSubmitting}
                    endIcon={isSubmitting ? null : <ChevronRight />}
                    sx={{
                      mt: 3,
                      py: 1.5,
                      borderRadius,
                      textTransform: "none",
                      fontWeight: "bold",
                      transition: theme.transitions.create(["transform", "box-shadow"], {
                        duration: theme.transitions.duration.short,
                      }),
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: theme.shadows[6],
                      },
                    }}
                  >
                    {isSubmitting ? "Creating Account..." : "Sign Up"}
                  </Button>
                </form>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                {/* Login Link */}
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Already have an account?
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/login")}
                    sx={{
                      py: 1,
                      px: isMobile ? 2 : 3,
                      borderRadius,
                      textTransform: "none",
                      transition: theme.transitions.create(["transform", "box-shadow"], {
                        duration: theme.transitions.duration.short,
                      }),
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: theme.shadows[6],
                      },
                    }}
                  >
                    Log In
                  </Button>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </motion.div>
    </Box>
  );
}