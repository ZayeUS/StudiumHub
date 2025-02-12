// src/components/LoadingModal.js
import React from 'react';
import { Dialog, DialogContent, CircularProgress, Typography, Box } from '@mui/material';
import { useUserStore } from '../store/userStore';
import { useTheme } from '@mui/material/styles'; // Import useTheme for accessing the theme

const LoadingModal = () => {
  const loading = useUserStore(state => state.loading);
  const theme = useTheme(); // Access theme from MUI

  return (
    <Dialog
      open={loading}
      PaperProps={{
        sx: {
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '300px',
          backgroundColor: theme.palette.background.paper,  // White background from theme
        },
      }}
      disableEscapeKeyDown
      disableBackdropClick
      aria-labelledby="loading-modal-title"
      aria-describedby="loading-modal-description"
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark backdrop color
        },
      }}
    >
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
          <Typography
            id="loading-modal-description"
            variant="h6"
            sx={{
              marginTop: 2,
              color: theme.palette.primary.main, // Use primary color for text
              textAlign: 'center',
            }}
          >
            Loading...
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingModal;
