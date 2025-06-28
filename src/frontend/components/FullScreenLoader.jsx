import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const logoUrl = '/textLogo.svg';

export const FullScreenLoader = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-background z-[9999]"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.6,
              ease: "easeInOut",
            }}
          >
            <motion.img
              src={logoUrl}
              alt="Cofoundless Logo"
              className="w-[150px] h-auto"
              animate={{
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