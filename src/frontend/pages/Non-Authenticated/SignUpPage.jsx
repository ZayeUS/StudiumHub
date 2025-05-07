import React, { useState, useEffect } from "react";
import {
  Box, Container, Paper, TextField, Button, InputAdornment, IconButton,
  Typography, FormControl, InputLabel, Select, MenuItem, Divider,
  Snackbar, Alert, useTheme, useMediaQuery
} from "@mui/material";
import { Eye, EyeOff, Mail, Lock, ChevronRight, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signUp, login, checkEmailExists } from "../../../firebase";
import { getData, postData } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";

export function SignUpPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const loading = useUserStore(state => state.loading);
  const setLoading = useUserStore(state => state.setLoading);
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  const roleId = useUserStore(state => state.roleId);
  const setUser = useUserStore(state => state.setUser);

  const [form, setForm] = useState({ email: "", password: "", confirm: "", role: "" });
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [visibility, setVisibility] = useState({ password: false, confirm: false });
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (isLoggedIn) {
      navigate(roleId === 1 ? "/admin-dashboard" : "/dashboard");
    }
  }, [isLoggedIn, roleId]);

  useEffect(() => {
    getData("/roles")
      .then(setRoles)
      .catch(() => showNotification("Failed to load roles", "error"));
  }, []);

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const { email, password, confirm, role } = form;
    const errs = {};
    if (!email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Invalid email";

    if (!password) errs.password = "Password required";
    else if (password.length < 6) errs.password = "Minimum 6 characters";

    if (!confirm) errs.confirm = "Confirm password";
    else if (confirm !== password) errs.confirm = "Passwords must match";

    if (!role) errs.role = "Select a role";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (await checkEmailExists(form.email)) {
        setErrors(prev => ({ ...prev, email: "Email already in use" }));
        return;
      }

      const user = await signUp(form.email, form.password);
      await login(form.email, form.password);

      const role = roles.find(r => r.role_name === form.role);
      if (!role) throw new Error("Invalid role");

      const backendUser = await postData("/users", {
        firebase_uid: user.uid,
        email: user.email,
        role_id: role.role_id,
      });

      setUser(user.uid, role.role_id, backendUser.user.user_id);
      showNotification("Account created!");
      setTimeout(() => {
        navigate(role.role_id === 1 ? "/admin-dashboard" : "/dashboard");
      }, 1000);
    } catch (err) {
      showNotification(err.message || "Signup failed", "error");
      setErrors(prev => ({ ...prev, general: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordField = (name, label, visible) => (
    <TextField
      name={name}
      label={label}
      type={visible ? "text" : "password"}
      value={form[name]}
      onChange={handleChange}
      error={!!errors[name]}
      helperText={errors[name]}
      disabled={loading}
      fullWidth
      margin="normal"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Lock color={theme.palette.primary.main} size={20} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() =>
              setVisibility(prev => ({ ...prev, [name]: !visible }))
            } edge="end" size="small">
              {visible
                ? <EyeOff color={theme.palette.primary.main} size={20} />
                : <Eye color={theme.palette.primary.main} size={20} />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "background.default",
      p: 2,
    }}>
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={notification.severity}>{notification.message}</Alert>
      </Snackbar>

      <Container maxWidth="sm">
        <Paper elevation={8} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Box sx={{
            bgcolor: "primary.main",
            p: 3,
            textAlign: "center",
            color: "white"
          }}>
            <UserPlus size={36} />
            <Typography variant="h5" fontWeight={700} mt={1}>Create Account</Typography>
            <Typography variant="body2">Join us and get started</Typography>
          </Box>

          <Box component="form" onSubmit={handleSignUp} sx={{ p: 3 }}>
            <TextField
              name="email"
              label="Email"
              value={form.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={20} color={theme.palette.primary.main} />
                  </InputAdornment>
                ),
              }}
            />

            {renderPasswordField("password", "Password", visibility.password)}
            {renderPasswordField("confirm", "Confirm Password", visibility.confirm)}

            <FormControl fullWidth margin="normal" error={!!errors.role}>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={form.role}
                onChange={handleChange}
                label="Role"
                disabled={loading || !roles.length}
              >
                {roles.map(r => (
                  <MenuItem key={r.role_id} value={r.role_name}>{r.role_name}</MenuItem>
                ))}
              </Select>
              {errors.role && (
                <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                  {errors.role}
                </Typography>
              )}
            </FormControl>

            {errors.general && (
              <Typography variant="body2" color="error" mt={1}>
                {errors.general}
              </Typography>
            )}

            <Button
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading}
              endIcon={!loading && <ChevronRight size={18} />}
              sx={{ mt: 3 }}
            >
              {loading ? "Creating..." : "Sign Up"}
            </Button>

            <Divider sx={{ my: 3 }} />

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">Already have an account?</Typography>
              <Button variant="outlined" sx={{ mt: 1 }} onClick={() => navigate("/login")}>
                Log In
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
