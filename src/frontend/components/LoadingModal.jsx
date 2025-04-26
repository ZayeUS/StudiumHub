import React from 'react';
import { Dialog, DialogContent, Typography } from '@mui/material';
import { useUserStore } from '../store/userStore';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

const LoadingModal = ({ message = "Loading..." }) => {
  const loading = useUserStore(state => state.loading);
  const theme = useTheme();

  const LogoLoader = () => (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {/* Central glowing core */}
      <motion.circle
        cx="70"
        cy="70"
        r="15"
        fill={theme.palette.primary.main}
        filter="url(#glow)"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [1, 0.85, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.8,
          ease: 'easeInOut',
        }}
      />
      {/* Interconnected nodes */}
      <motion.path
        d="M70 55 L85 70 M70 85 L85 70 M55 70 L70 55 M55 70 L70 85"
        stroke={theme.palette.primary.light}
        strokeWidth="2"
        fill="none"
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: 'easeInOut',
        }}
      />
      {/* Orbiting particles with trails */}
      <motion.g
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          repeat: Infinity,
          duration: 12,
          ease: 'linear',
        }}
      >
        <motion.circle
          cx="90"
          cy="70"
          r="4"
          fill={theme.palette.secondary.main}
          filter="url(#glow)"
          animate={{
            cx: [90, 95, 90],
            cy: [70, 75, 70],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut',
          }}
        />
        <motion.circle
          cx="50"
          cy="70"
          r="3"
          fill={theme.palette.secondary.light}
          filter="url(#glow)"
          animate={{
            cx: [50, 45, 50],
            cy: [70, 65, 70],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.3,
            ease: 'easeInOut',
            delay: 0.4,
          }}
        />
        <motion.circle
          cx="70"
          cy="90"
          r="3"
          fill={theme.palette.primary.light}
          filter="url(#glow)"
          animate={{
            cx: [70, 75, 70],
            cy: [90, 95, 90],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.1,
            ease: 'easeInOut',
            delay: 0.8,
          }}
        />
      </motion.g>
      {/* Outer orbital ring with subtle pulse */}
      <motion.path
        d="M70 40 A30 30 0 0 1 100 70 A30 30 0 0 1 70 100 A30 30 0 0 1 40 70 A30 30 0 0 1 70 40"
        fill="none"
        stroke={theme.palette.primary.main}
        strokeWidth="1.5"
        strokeOpacity="0.5"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: 'easeInOut',
        }}
      />
      {/* Secondary orbital ring (counter-rotation) */}
      <motion.path
        d="M70 35 A35 35 0 0 1 105 70 A35 35 0 0 1 70 105 A35 35 0 0 1 35 70 A35 35 0 0 1 70 35"
        fill="none"
        stroke={theme.palette.secondary.main}
        strokeWidth="1"
        strokeOpacity="0.3"
        animate={{
          rotate: [0, -360],
        }}
        transition={{
          repeat: Infinity,
          duration: 15,
          ease: 'linear',
        }}
      />
      {/* Glow filter for enhanced effect */}
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );

  return (
    <Dialog
      open={loading}
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          borderRadius: 3,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
        },
      }}
      disableEscapeKeyDown
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(6px)',
        },
      }}
    >
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          minWidth: 240,
          minHeight: 240,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <LogoLoader />
        </motion.div>
        <motion.div
          animate={{
            opacity: [1, 0.6, 1],
            y: [0, -2, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            ease: 'easeInOut',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 600,
              mt: 3,
              letterSpacing: 1,
              textTransform: 'uppercase',
              fontSize: '1.1rem',
            }}
          >
            Loading
          </Typography>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingModal;