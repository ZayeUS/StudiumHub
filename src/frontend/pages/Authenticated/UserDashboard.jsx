import React from 'react';
import { Typography, Container, Box } from '@mui/material';
import { useUserStore } from '../../store/userStore';
import {LoadingModal} from '../../components/LoadingModal';

export function UserDashboard() {
  const userId = useUserStore(state => state.userId);
  const loading = useUserStore(state => state.loading);

  if (loading) return <LoadingModal message="Loading your dashboard..." />;

  return (
    <Container maxWidth="md">
      <Box sx={{ pt: 8, textAlign: 'center' }}>
        <Typography variant="h3" color="primary" gutterBottom>
          User Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome, user with ID: {userId}
        </Typography>
      </Box>
    </Container>
  );
}
