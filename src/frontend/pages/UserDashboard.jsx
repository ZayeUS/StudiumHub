import React from 'react';
import { Typography, Container } from '@mui/material';

const UserDashboard = () => {
  return (
    <Container maxWidth="sm" sx={{ paddingTop: 8 }}>
      <Typography variant="h3" color="primary" align="center" gutterBottom>
        User Dashboard
      </Typography>
      <Typography variant="h6" align="center">
        Welcome, User! Here you can view your information.
      </Typography>
    </Container>
  );
};

export default UserDashboard;
