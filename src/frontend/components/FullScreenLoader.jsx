import React from 'react';
import { Box, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// This component assumes 'textLogo.svg' is in your `/public` directory.
// Vite will automatically handle serving it from the root.
const logoUrl = '/textLogo.svg';

export const FullScreenLoader = ({ isLoading }) => {
  const theme = useTheme();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.background.default,
            zIndex: 9999, // Ensure it's on top of all other content
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.6,
              ease: "easeInOut",
            }}
          >
            {/* The animated logo */}
            <motion.img
              src={logoUrl}
              alt="Cofoundless Logo"
              style={{
                width: '150px', // Adjust size as needed
                height: 'auto',
              }}
              animate={{
                // Creates a subtle "breathing" or "pulsing" effect
                scale: [1, 1.05, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};