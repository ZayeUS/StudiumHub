// File: src/frontend/components/LoadingModal.jsx
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import {
  Dialog,
  DialogContent,
  CircularProgress,
  Typography,
  Box,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import { useUserStore } from '../store/userStore';

export const LoadingModal = ({ message = "Loading..." }) => {
  const globalLoading = useUserStore(state => state.loading); 
  const theme = useTheme();

  // Internal state to control Dialog open/close, allowing Fade transition to complete
  const [open, setOpen] = useState(globalLoading);

  useEffect(() => {
    if (globalLoading) {
      setOpen(true); // Open dialog immediately when globalLoading is true
    }
    // No 'else' here, let onExited handle closing
  }, [globalLoading]);

  const handleExited = () => {
    // This is called when the Fade transition finishes its 'exit' animation
    if (!globalLoading) { // Only close dialog if globalLoading is false
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open} // Controlled by internal 'open' state
      aria-labelledby="loading-dialog-title"
      aria-describedby="loading-dialog-description"
      PaperProps={{
        sx: {
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          borderRadius: theme.shape.borderRadiusLG,
          boxShadow: theme.shadows[20],
          overflow: 'hidden',
          p: { xs: 3, sm: 4 },
          minWidth: { xs: 260, sm: 320 },
          minHeight: { xs: 200, sm: 240 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(5px)',
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: alpha(theme.palette.common.black, 0.6),
          backdropFilter: 'blur(8px)',
        },
      }}
      disableEscapeKeyDown
      TransitionComponent={Fade} // Explicitly set Fade as the transition component
      transitionDuration={{ enter: 300, exit: 300 }} // Control transition duration
      onClose={() => {}} // Prevent closing from outside
      TransitionProps={{
        onExited: handleExited // Call our handler when fade-out transition finishes
      }}
    >
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <CircularProgress
          variant="indeterminate"
          thickness={4}
          size={60}
          color="primary"
          sx={{
            animation: '$spin 1.2s linear infinite',
          }}
        />
        <Typography
          variant="h6"
          id="loading-dialog-description"
          sx={{
            fontWeight: 500,
            color: theme.palette.text.primary,
            letterSpacing: 0.5,
          }}
        >
          {message}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};