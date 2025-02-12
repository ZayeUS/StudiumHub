// src/pages/AdminDashboard.jsx
import React from 'react';
import { Typography, Container } from '@mui/material';
import { useUserStore } from '../../store/userStore';
import LoadingModal from "../../components/LoadingModal";

const AdminDashboard = () => {
  const userId = useUserStore(state => state.userId);
  const isLoggedIn = useUserStore(state => state.isLoggedIn);

  return (
    <>
      <LoadingModal />
      <Container maxWidth="sm" sx={{ paddingTop: 8 }}>
        <Typography variant="h3" color="primary" align="center" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="h6" align="center">
          {isLoggedIn 
            ? `Welcome, Admin with ID: ${userId}. You have full access to all features.` 
            : "Please log in to access the admin features."}
        </Typography>
      </Container>
    </>
  );
};

export default AdminDashboard;
