import React from 'react';
import { Typography, Container } from '@mui/material';
import { useUserStore } from '../store/userStore';  // Import the Zustand store

const AdminDashboard = () => {
  // Directly access the values from the Zustand store
  const userId = useUserStore(state => state.userId);
  const isLoggedIn = useUserStore(state => state.isLoggedIn);

  return (
    <Container maxWidth="sm" sx={{ paddingTop: 8 }}>
      <Typography variant="h3" color="primary" align="center" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="h6" align="center">
        {isLoggedIn ? `Welcome, Admin with ID: ${userId}. You have full access to all features.` : "Please log in to access the admin features."}
      </Typography>
    </Container>
  );
};

export default AdminDashboard;
