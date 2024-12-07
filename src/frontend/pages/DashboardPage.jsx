import React from 'react';
import { Container, Typography, Box, IconButton, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore'; // Zustand store to manage user data
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase'; // Firebase authentication import
import { motion } from 'framer-motion'; // Framer Motion for custom animations

const DashboardPage = () => {
  const navigate = useNavigate();
  const { firebaseId, userEmail, clearUser, isLoggedIn } = useUserStore(); // Get user data from Zustand
  const [loading, setLoading] = React.useState(false);

  // Handle logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth); // Sign out from Firebase
      clearUser(); // Clear user data from Zustand store
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setLoading(false);
    }
  };

  // If the user is not logged in, redirect to login page
  if (!isLoggedIn || !firebaseId || !userEmail) {
    navigate('/login');
    return null; // Prevent rendering the dashboard while redirecting
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar will be handled in App.jsx based on isLoggedIn */}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Title and Text with Motion Animation */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Typography variant="h4" color="primary" gutterBottom>
            Welcome to Your Dashboard
          </Typography>
        </motion.div>

        {/* User Information Section with motion */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            User Information:
          </Typography>
          <Typography variant="body1" color="textSecondary">
            <strong>Email:</strong> {userEmail}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            <strong>Firebase UID:</strong> {firebaseId}
          </Typography>
        </motion.div>

        {/* Conditional Loading State with CircularProgress */}
        {loading ? (
          <Box sx={{ textAlign: 'center', marginTop: 4 }}>
            <CircularProgress color="primary" />
            <Typography variant="h6" color="primary" sx={{ marginTop: 2 }}>
              Logging out, please wait...
            </Typography>
          </Box>
        ) : (
          // Logout Button when not loading
          <Box sx={{ textAlign: 'center', marginTop: 4 }}>
            <IconButton
              onClick={handleLogout}
              color="primary"
              variant="contained"
            >
              Logout
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DashboardPage;
