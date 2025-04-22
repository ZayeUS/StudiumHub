// src/components/LoadingModal.js
import React from 'react';
import { Dialog, DialogContent, Typography, Box } from '@mui/material';
import { useUserStore } from '../store/userStore';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';

const LoadingModal = ({ message = "Loading..." }) => {
  const loading = useUserStore(state => state.loading);
  const theme = useTheme();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { 
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const loaderVariants = {
    animate: { 
      rotate: 360,
      transition: { 
        repeat: Infinity, 
        duration: 1.5, 
        ease: "linear"
      }
    }
  };

  // Custom loader with Lucide icon and Framer Motion
  const CustomLoader = () => (
    <Box sx={{ position: 'relative', width: 60, height: 60 }}>
      {/* Outer spinning circle */}
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: `3px solid ${theme.palette.background.paper}`,
          borderTopColor: theme.palette.primary.main,
          position: 'absolute'
        }}
        animate={loaderVariants.animate}
      />
      
      {/* Center dot with brand accent color */}
      <Box 
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: theme.palette.secondary.main,
          boxShadow: `0 0 12px ${theme.palette.secondary.light}`
        }}
      />
    </Box>
  );

  return (
    <Dialog
      open={loading}
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          overflow: 'hidden'
        },
      }}
      disableEscapeKeyDown
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(45, 55, 72, 0.7)',
          backdropFilter: 'blur(3px)'
        },
      }}
    >
      <DialogContent 
        sx={{ 
          padding: 0,
          overflow: 'hidden'
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Box
            sx={{
              padding: theme.spacing(4),
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: theme.palette.background.paper,
              borderRadius: theme.shape.borderRadius,
              minWidth: '240px',
              maxWidth: '300px',
              boxShadow: '0 8px 32px rgba(45, 55, 72, 0.12)',
              border: `1px solid ${theme.palette.primary.light}20`
            }}
          >
            <CustomLoader />
            
            <Typography
              variant="h3"
              sx={{
                marginTop: theme.spacing(3),
                color: theme.palette.text.primary,
                fontWeight: 600,
                textAlign: 'center',
                fontSize: '1.25rem'
              }}
            >
              {message}
            </Typography>
          </Box>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingModal;