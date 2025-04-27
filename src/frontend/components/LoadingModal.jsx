import React from 'react';
import { Dialog, DialogContent, CircularProgress, Typography } from '@mui/material';
import { useUserStore } from '../store/userStore';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

const LoadingModal = ({ message = "Loading..." }) => {
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
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <CircularProgress
            thickness={5}
            size={80}
            sx={{
              color: theme.palette.primary.main,
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        >
          <Typography
            variant="h6"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: 2,
              fontWeight: 500,
              fontSize: '1rem',
              color: theme.palette.text.primary,
            }}
          >
            {message}
          </Typography>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingModal;
