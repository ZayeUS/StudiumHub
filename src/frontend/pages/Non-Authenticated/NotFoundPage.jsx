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
import { Home, FileWarning } from 'lucide-react';

export default function NotFoundPage() {
  const theme = useTheme();

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
        <FileWarning size={100} color={theme.palette.primary.main} opacity={0.8} />

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '6rem', md: '10rem' },
            fontWeight: 800,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            my: 2,
          }}
        >
          404
        </Typography>

        <Typography variant="h4" fontWeight={600} mb={2}>
          Page Not Found
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 500, mb: 4 }}
        >
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </Typography>

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
      </Box>
    </Container>
  );
}
