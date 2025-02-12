// src/pages/UserDashboard.jsx
import React from 'react';
import { Typography, Container } from '@mui/material';
import { useUserStore } from '../../store/userStore';  // Import Zustand store
import LoadingModal from "../../components/LoadingModal";  // Import LoadingModal

const UserDashboard = () => {

    const userId = useUserStore(state => state.userId);
    const isLoggedIn = useUserStore(state => state.isLoggedIn);
  


  return (
    <>
      <LoadingModal />  {/* Modal handles the loading state */}
      <Container maxWidth="sm" sx={{ paddingTop: 8 }}>
        <Typography variant="h3" color="primary" align="center" gutterBottom>
          User Dashboard
        </Typography>
        <Typography variant="h6" align="center">
          {isLoggedIn
            ? `Welcome, user with ID: ${userId}`
            : "Please log in to view your information."}
        </Typography>
      </Container>
    </>
  );
};

export default UserDashboard;
