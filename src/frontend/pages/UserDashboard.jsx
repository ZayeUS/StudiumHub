import React from 'react';
import { Typography, Container } from '@mui/material';
import { useUserStore } from '../store/userStore';  // Import the Zustand store

const UserDashboard = () => {
  // Directly access the values from the Zustand store
  const userId = useUserStore(state => state.userId);
  const isLoggedIn = useUserStore(state => state.isLoggedIn);

  return (
    <Container maxWidth="sm" sx={{ paddingTop: 8 }}>
      <Typography variant="h3" color="primary" align="center" gutterBottom>
        User Dashboard
      </Typography>
      <Typography variant="h6" align="center">
        {isLoggedIn ? `Welcome, user with ID: ${userId}` : "Please log in to view your information."}
      </Typography>
    </Container>
  );
};

export default UserDashboard;
