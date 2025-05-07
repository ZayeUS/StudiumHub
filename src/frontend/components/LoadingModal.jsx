import React from 'react';
import {
  Dialog,
  DialogContent,
  CircularProgress,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useUserStore } from '../store/userStore';

export const LoadingModal = ({ message = "Loading..." }) => {
  const loading = useUserStore(state => state.loading);
  const theme = useTheme();

  return (
    <Dialog
      open={loading}
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          borderRadius: 3,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          p: 4,
          minWidth: 280,
          minHeight: 280,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
      disableEscapeKeyDown
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
        },
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
          animation: 'fadeIn 1s ease-out both',
        }}
      >
        <CircularProgress
          thickness={5}
          size={80}
          sx={{
            color: theme.palette.primary.main,
            animation: 'spinnerFade 1.2s ease-out both',
          }}
        />

        <Typography
          variant="h6"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: 2,
            fontWeight: 500,
            fontSize: '1rem',
            color: theme.palette.text.primary,
            opacity: 0,
            animation: 'slideFadeIn 1s ease-out 0.3s forwards',
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }

          @keyframes spinnerFade {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }

          @keyframes slideFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </Dialog>
  );
};
