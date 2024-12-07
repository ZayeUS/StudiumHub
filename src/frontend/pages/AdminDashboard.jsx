import React from 'react';
import { Typography, Container } from '@mui/material';

const AdminDashboard = () => {
  return (
    <Container maxWidth="sm" sx={{ paddingTop: 8 }}>
      <Typography variant="h3" color="primary" align="center" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="h6" align="center">
        Welcome, Admin! You have full access to all features.
      </Typography>
    </Container>
  );
};

export default AdminDashboard;
