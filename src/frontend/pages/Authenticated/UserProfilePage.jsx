import React, { useState } from "react";
import {
  Box, Typography, TextField, Button, Alert, Paper,
  useTheme, CircularProgress, Avatar, Snackbar, Container,
  Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Grid,
  InputAdornment, IconButton
} from "@mui/material";
import { Edit, Save, Cancel, Person, Lock, Delete, Visibility, VisibilityOff } from "@mui/icons-material";
import { useUserStore } from "../../store/userStore";
import { putData, deleteData } from "../../utils/BackendRequestHelper";
import { updateUserPassword, reauthenticateUser, deleteFirebaseUser } from "../../../firebase";

// A reusable confirmation dialog for the deletion flow
const ConfirmationDialog = ({ open, onClose, onConfirm, title, message, loading }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle fontWeight="bold">{title}</DialogTitle>
        <DialogContent><DialogContentText>{message}</DialogContentText></DialogContent>
        <DialogActions>
            <Button onClick={onClose} disabled={loading}>Cancel</Button>
            <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Delete"}
            </Button>
        </DialogActions>
    </Dialog>
);

// A dialog for re-authentication before a sensitive action
const ReauthDialog = ({ open, onClose, onConfirm, title, loading }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle fontWeight="bold">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>For your security, please enter your password to continue.</DialogContentText>
                <TextField 
                    autoFocus 
                    type={showPassword ? 'text' : 'password'} 
                    label="Current Password" 
                    fullWidth 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={() => onConfirm(password)} variant="contained" color="primary" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Confirm"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// A dedicated component for the Change Password modal for cleanliness
const ChangePasswordDialog = ({ open, onClose, onSave, loading, apiError, setApiError }) => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false });
    const [error, setError] = useState('');

    const handleSave = () => {
        setError('');
        setApiError('');
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            setError("All fields are required.");
            return;
        }
        if (passwords.new.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }
        if (passwords.new !== passwords.confirm) {
            setError("New passwords do not match.");
            return;
        }
        onSave(passwords.current, passwords.new);
    };

    const toggleShowPassword = (field) => {
        setShowPasswords(prev => ({...prev, [field]: !prev[field]}));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle fontWeight="bold">Change Password</DialogTitle>
            <DialogContent>
                {error && <Alert severity="warning" sx={{mb: 2}}>{error}</Alert>}
                {apiError && <Alert severity="error" sx={{mb: 2}}>{apiError}</Alert>}
                <TextField autoFocus margin="dense" label="Current Password" type={showPasswords.current ? 'text' : 'password'} fullWidth value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} InputProps={{endAdornment: (<InputAdornment position="end"><IconButton onClick={() => toggleShowPassword('current')}>{showPasswords.current ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>)}}/>
                <TextField margin="dense" label="New Password" type={showPasswords.new ? 'text' : 'password'} fullWidth value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} InputProps={{endAdornment: (<InputAdornment position="end"><IconButton onClick={() => toggleShowPassword('new')}>{showPasswords.new ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>)}}/>
                <TextField margin="dense" label="Confirm New Password" type="password" fullWidth value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Save Password"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};


export function UserProfilePage() {
  const { profile, setProfile, clearUser, setLoading, loading } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ first_name: profile?.first_name || "", last_name: profile?.last_name || "" });
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [dialogOpen, setDialogOpen] = useState({ changePass: false, deleteConfirm: false, reauthDelete: false });
  const [apiError, setApiError] = useState('');

  const showNotification = (message, severity = "success") => setNotification({ open: true, message, severity });

  const handleProfileSave = async () => {
    if (!formData.first_name || !formData.last_name) return;
    setLoading(true);
    try {
      const response = await putData('/profile', formData);
      setProfile(response.profile);
      showNotification("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      showNotification(err.message || "Failed to update profile.", "error");
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setApiError('');
    try {
        await reauthenticateUser(currentPassword);
        await updateUserPassword(newPassword);
        showNotification("Password updated successfully!");
        setDialogOpen(prev => ({ ...prev, changePass: false }));
    } catch (error) {
        console.error("Change Password Error:", error);
        if (error.code === 'auth/wrong-password') {
            setApiError("The current password you entered is incorrect.");
        } else {
            setApiError("An error occurred. Please try again.");
        }
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteAccount = async (password) => {
      setLoading(true);
      try {
        await reauthenticateUser(password);
        await deleteData('/users/me');
        await deleteFirebaseUser();
        clearUser();
      } catch (error) {
        console.error("Account deletion failed:", error);
        
        let message = "An unexpected error occurred. Please try again later.";
        if (error.code === 'auth/wrong-password') {
            message = "The password you entered is incorrect. Account not deleted.";
        } else if (error.code === 'auth/too-many-requests') {
            message = "Access temporarily disabled due to too many failed attempts. Please try again later.";
        }
        showNotification(message, "error");

      } finally {
        setLoading(false);
        setDialogOpen({ changePass: false, deleteConfirm: false, reauthDelete: false });
      }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: 'background.default', py: { xs: 3, sm: 5 } }}>
      {/* --- THIS IS THE FIX --- */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={notification.severity} onClose={() => setNotification(prev => ({...prev, open: false}))}>{notification.message}</Alert>
      </Snackbar>

      <Container maxWidth="md">
        <Typography variant="h4" fontWeight={700} gutterBottom>My Profile</Typography>

        <Paper elevation={4} sx={{ p: 4, mt: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 3 }}>
                <Avatar 
                    src={profile?.avatar_url} 
                    sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                >
                    <Person sx={{fontSize: 40}}/>
                </Avatar>
                <Box>
                    <Typography variant="h5" fontWeight={600}>
                        {profile ? `${profile.first_name} ${profile.last_name}` : "User Profile"}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {profile?.email || "Manage your account details and security settings."}
                    </Typography>
                </Box>
            </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>Personal Details</Typography>
            {!isEditing && <Button variant="outlined" startIcon={<Edit />} onClick={() => setIsEditing(true)}>Edit</Button>}
          </Box>
          <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                {isEditing ? <TextField label="First Name" fullWidth value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} /> : <><Typography color="text.secondary" variant="body2">First Name</Typography><Typography>{profile?.first_name}</Typography></>}
              </Grid>
              <Grid item xs={12} sm={6}>
                {isEditing ? <TextField label="Last Name" fullWidth value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} /> : <><Typography color="text.secondary" variant="body2">Last Name</Typography><Typography>{profile?.last_name}</Typography></>}
              </Grid>
          </Grid>
          {isEditing && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button variant="text" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button variant="contained" startIcon={loading ? <CircularProgress size={20}/> : <Save/>} onClick={handleProfileSave} disabled={loading}>Save Changes</Button>
            </Box>
          )}
        </Paper>

        <Paper elevation={4} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Security Settings</Typography>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, flexWrap: 'wrap', gap: 2 }}>
                <Box><Typography fontWeight="medium">Change Password</Typography><Typography variant="body2" color="text.secondary">Update your password to keep your account secure.</Typography></Box>
                <Button variant="outlined" startIcon={<Lock/>} onClick={() => setDialogOpen(prev => ({...prev, changePass: true}))}>Change</Button>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, flexWrap: 'wrap', gap: 2 }}>
                <Box><Typography fontWeight="medium" color="error">Delete Account</Typography><Typography variant="body2" color="text.secondary">Permanently delete your account and all of your data.</Typography></Box>
                <Button variant="contained" color="error" startIcon={<Delete/>} onClick={() => setDialogOpen(prev => ({...prev, deleteConfirm: true}))}>Delete</Button>
            </Box>
        </Paper>
      </Container>
      
      <ChangePasswordDialog open={dialogOpen.changePass} onClose={() => setDialogOpen(prev => ({...prev, changePass: false}))} onSave={handleChangePassword} loading={loading} apiError={apiError} setApiError={setApiError}/>
      <ConfirmationDialog open={dialogOpen.deleteConfirm} onClose={() => setDialogOpen(prev => ({...prev, deleteConfirm: false}))} onConfirm={() => {setDialogOpen({deleteConfirm: false, reauthDelete: true})}} title="Delete Account?" message="This action is permanent and cannot be undone. Are you sure you want to delete your account?" />
      <ReauthDialog open={dialogOpen.reauthDelete} onClose={() => setDialogOpen(prev => ({...prev, reauthDelete: false}))} onConfirm={handleDeleteAccount} title="Confirm Account Deletion" loading={loading} />
    </Box>
  );
}