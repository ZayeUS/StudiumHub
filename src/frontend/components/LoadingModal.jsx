import React from 'react';
import {
  Dialog,
  DialogContent,
  CircularProgress,
  Typography,
  Box, // Added Box for better layout control
  Fade, // Added Fade for smoother transition
  useTheme,
  alpha
} from '@mui/material';
import { useUserStore } from '../store/userStore'; // Adjusted path

export const LoadingModal = ({ message = "Loading..." }) => {
  // Get loading state from Zustand store.
  // The modal's visibility is controlled by this 'loading' state.
  const loading = useUserStore(state => state.loading); 
  const theme = useTheme();

  return (
    <Fade in={loading} timeout={300}>
      <Dialog
        open={loading} // Controlled by the Zustand store's loading state
        aria-labelledby="loading-dialog-title"
        aria-describedby="loading-dialog-description"
        PaperProps={{
          // Styling for the Dialog's paper container
          sx: {
            backgroundColor: alpha(theme.palette.background.paper, 0.95), // Slightly transparent paper
            borderRadius: theme.shape.borderRadiusLG, // Use large border radius from theme
            boxShadow: theme.shadows[20], // Use a more prominent shadow for modals
            overflow: 'hidden', // Prevent content overflow
            p: { xs: 3, sm: 4 }, // Responsive padding
            minWidth: { xs: 260, sm: 320 }, // Responsive minimum width
            minHeight: { xs: 200, sm: 240 }, // Responsive minimum height
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${theme.palette.divider}`, // Subtle border
            backdropFilter: 'blur(5px)', // Apply blur to the paper itself if desired (works with transparency)
          },
        }}
        BackdropProps={{
          // Styling for the backdrop overlay
          sx: {
            backgroundColor: alpha(theme.palette.common.black, 0.6), // Darker, more focused backdrop
            backdropFilter: 'blur(8px)', // Stronger blur for the backdrop
          },
        }}
        disableEscapeKeyDown // Prevent closing with Escape key while loading
      >
        <DialogContent
          // Styling for the content area within the dialog
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 3, // Spacing between elements
          }}
        >
          {/* Animated Circular Progress Indicator */}
          <CircularProgress
            variant="indeterminate" // Indeterminate for continuous loading
            thickness={4} // Thickness of the spinner
            size={60} // Size of the spinner
            color="primary" // Use primary theme color
            sx={{
              animation: '$spin 1.2s linear infinite', // Custom spin animation (optional)
            }}
          />
          {/* Loading message text */}
          <Typography
            variant="h6" // Use h6 for a slightly larger, more prominent message
            id="loading-dialog-description"
            sx={{
              fontWeight: 500,
              color: theme.palette.text.primary, // Use primary text color from theme
              letterSpacing: 0.5, // Slight letter spacing for readability
            }}
          >
            {message}
          </Typography>
        </DialogContent>
        {/* Optional: Define custom keyframe animation for the spinner if needed */}
        {/* <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style> */}
      </Dialog>
    </Fade>
  );
};