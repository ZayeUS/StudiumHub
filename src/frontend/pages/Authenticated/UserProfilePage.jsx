import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Alert,
  Paper, Divider, useTheme, CircularProgress
} from "@mui/material";
import { useUserStore } from "../../store/userStore";
import { putData } from "../../utils/BackendRequestHelper";

const UserProfilePage = () => {
  const [formData, setFormData] = useState({ first_name: "", last_name: "", date_of_birth: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const profile = useUserStore(state => state.profile);
  const setProfile = useUserStore(state => state.setProfile);
  const loading = useUserStore(state => state.loading);
  const setLoading = useUserStore(state => state.setLoading);

  const theme = useTheme();

  useEffect(() => {
    if (profile) {
      const date = profile.date_of_birth
        ? new Date(profile.date_of_birth).toISOString().split("T")[0]
        : "";
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        date_of_birth: date
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
    if (apiError) setApiError("");
  };

  const validateForm = () => {
    const { first_name, last_name, date_of_birth } = formData;
    const newErrors = {};

    if (!first_name.trim()) newErrors.first_name = "Required";
    if (!last_name.trim()) newErrors.last_name = "Required";

    if (date_of_birth) {
      const dob = new Date(date_of_birth);
      const today = new Date();
      if (dob > today) newErrors.date_of_birth = "Cannot be in the future";
    } else {
      newErrors.date_of_birth = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await putData(`/profile`, formData);
      if (response?.profile) {
        setProfile(response.profile);
        setIsEditing(false);
      } else {
        setApiError("Update failed");
      }
    } catch (err) {
      setApiError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "first_name", label: "First Name" },
    { name: "last_name", label: "Last Name" },
    {
      name: "date_of_birth",
      label: "Date of Birth",
      type: "date",
      format: (val) => val ? new Date(val).toLocaleDateString() : "—"
    }
  ];

  if (!profile) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        {isEditing ? "Edit Profile" : "Your Profile"}
      </Typography>

      <Paper
        elevation={4}
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          transition: "transform 0.3s ease",
          "&:hover": { transform: "translateY(-5px)" }
        }}
      >
        {apiError && <Alert severity="error" sx={{ mb: 3 }}>{apiError}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {fields.map((field) => (
            <Box key={field.name} mb={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {field.label}
              </Typography>

              {isEditing ? (
                <TextField
                  name={field.name}
                  type={field.type || "text"}
                  value={formData[field.name]}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors[field.name]}
                  helperText={errors[field.name]}
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                />
              ) : (
                <Typography variant="body1" fontWeight="500">
                  {field.format
                    ? field.format(profile[field.name])
                    : profile[field.name] || "—"}
                </Typography>
              )}
            </Box>
          ))}

          <Divider sx={{ my: 3 }} />

          <Box display="flex" justifyContent="center" gap={2}>
            {isEditing ? (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserProfilePage;
