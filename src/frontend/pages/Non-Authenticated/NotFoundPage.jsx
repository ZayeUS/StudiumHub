import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  useTheme,
  alpha
} from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, FileWarning } from 'lucide-react';

const NotFoundPage = () => {
  const theme = useTheme();

  const gradientText = {
    fontSize: { xs: '6rem', md: '10rem' },
    fontWeight: 800,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    mb: 2,
    mt: 2
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          py: 8
        }}
      >
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <FileWarning size={120} color={theme.palette.primary.main} opacity={0.8} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <Typography variant="h1" sx={gradientText}>
            404
          </Typography>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <Typography variant="h4" fontWeight={600} mb={2}>
            Page Not Found
          </Typography>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 4 }}>
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </Typography>
        </motion.div>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <Button
              component={Link}
              to="/"
              variant="contained"
              startIcon={<Home size={18} />}
              sx={{
                borderRadius: 2,
                py: 1.2,
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
              }}
            >
              Back to Home
            </Button>
          </motion.div>

         
        </Box>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
