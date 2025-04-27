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
  CircularProgress,
  useTheme,
  useMediaQuery,
  Alert
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Briefcase, ChevronRight, UserPlus } from "lucide-react";
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

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
};

const SignUpPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const borderRadius = theme.shape.borderRadius;
  const navigate = useNavigate();
  const { setUser, isLoggedIn, roleId } = useUserStore();

  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const emailInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError: setFieldError,
    clearErrors,
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
      } catch {
        setError("Failed to load roles.");
      }
    };
    fetchRoles();
  }, []);

  const onSignupSubmit = async (data) => {
    clearErrors();
    setError("");
    setFormSubmitted(true);

    try {
      const emailAvailable = await checkEmailExists(data.email).then(exists => !exists);
      if (!emailAvailable) {
        setFieldError("email", { type: "manual", message: "Email already in use" });
        if (emailInputRef.current) emailInputRef.current.focus();
        setFormSubmitted(false);
        return;
      }

      useUserStore.setState({ loading: true });

      const user = await firebaseSignUp(data.email, data.password);
      await firebaseLogin(data.email, data.password);

      const selectedRole = roles.find(r => r.role_name === data.role);
      if (!selectedRole) throw new Error("Invalid role selected");

      const backendUser = await postData("/users", {
        firebase_uid: user.uid,
        email: user.email,
        role_id: selectedRole.role_id,
      });

      const { user_id } = backendUser.user;
      setUser(user.uid, selectedRole.role_id, user_id);

      setTimeout(() => {
        navigate(selectedRole.role_id === 1 ? "/admin-dashboard" : "/dashboard");
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err.message || "Sign-up failed. Please try again.");
      setFormSubmitted(false);
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
      <LoadingModal />

      <motion.div initial="hidden" animate="visible" variants={containerVariants} style={{ width: "100%" }}>
        <Container maxWidth="sm">
          <Paper
            elevation={4}
            sx={{
              borderRadius: 4,
              background: "linear-gradient(145deg, #1B263B, #0D1B2A)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            <Box sx={{ bgcolor: theme.palette.primary.main, p: 3, textAlign: "center" }}>
              <UserPlus size={40} color={theme.palette.common.white} style={{ marginBottom: 8 }} />
              <Typography variant="h4" sx={{ color: "#fff", fontWeight: "bold", mb: 1 }}>
                Create Account
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.8)" }}>
                Join our platform and get started.
              </Typography>
            </Box>

            <Box sx={{ p: 4 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSignupSubmit)} noValidate>
                {/* Email */}
                <TextField
                  {...register("email")}
                  inputRef={emailInputRef}
                  label="Email Address"
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
                    ),
                    sx: { borderRadius, backgroundColor: "rgba(255,255,255,0.04)" },
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
                  disabled={isSubmitting || formSubmitted}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color={theme.palette.primary.main} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(prev => !prev)} edge="end">
                          {showPassword ? <EyeOff /> : <Eye />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius, backgroundColor: "rgba(255,255,255,0.04)" },
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
                  disabled={isSubmitting || formSubmitted}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color={theme.palette.primary.main} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm(prev => !prev)} edge="end">
                          {showConfirm ? <EyeOff /> : <Eye />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius, backgroundColor: "rgba(255,255,255,0.04)" },
                  }}
                />

                {/* Role */}
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth margin="normal" error={!!errors.role}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        {...field}
                        label="Role"
                        value={field.value || ""}
                        sx={{ borderRadius }}
                      >
                        {roles.length ? (
                          roles.map(r => (
                            <MenuItem key={r.role_id} value={r.role_name}>
                              {r.role_name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="">Loading...</MenuItem>
                        )}
                      </Select>
                      {errors.role && (
                        <Typography variant="caption" color="error">
                          {errors.role.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />

                {/* Submit Button */}
                <Button
                  variant="contained"
                  fullWidth
                  type="submit"
                  disabled={isSubmitting || formSubmitted}
                  endIcon={<ChevronRight />}
                  sx={{
                    mt: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 600,
                    textTransform: "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 18px rgba(10,132,255,0.3)",
                    },
                  }}
                >
                  {isSubmitting || formSubmitted ? "Creating..." : "Sign Up"}
                </Button>
              </form>

              <Divider sx={{ my: 4 }}>
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
                  onClick={() => navigate("/login")}
                  sx={{
                    mt: 1,
                    py: 1,
                    px: isMobile ? 2 : 3,
                    borderRadius,
                    textTransform: "none",
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
