// src/frontend/theme.js
import { createTheme } from '@mui/material/styles';

// Luxury Base Configuration
const config = {
  primary: '#0A2540',        // Deep Navy (primary brand color, serious and secure)
  secondary: '#3C5A80',      // Muted Indigo (for secondary actions, calm and corporate)
  background: '#F5F7FA',     // Very Light Gray-Blue (for main background)
  paperBackground: '#FFFFFF', // Pure White (cards and elevated surfaces)
  titleColor: '#0A2540',      // Deep Navy again for titles (consistent, serious)
  appBarBackground: '#0A2540', // Match primary for App Bar (strong and clean)
  ctaColor: '#1D72B8',        // Bold Blue (clear CTA action button color)
  ctaHoverColor: '#155D8B',   // Slightly darker blue for hover (UX expectation)
  fontFamily: "'Poppins', sans-serif", // Modern sans-serif (good choice, stick with it)
  borderRadius: 6,            // Slight rounding (enough for softness but still "sharp" for SaaS)
};



const theme = createTheme({
  palette: {
    primary: {
      main: config.primary,
      light: '#5ABEFF',
      dark: '#0066CC',
    },
    secondary: {
      main: config.secondary,
      light: '#5CF0D8',
      dark: '#009e8f',
    },
    background: {
      default: config.background,
      paper: config.paperBackground,
    },
    text: {
      primary: config.titleColor,
      secondary: '#A5B4FC', // Soft Indigo
    },
    success: { main: '#2E7D32' },
    warning: { main: '#FF9800' },
    action: {
      hover: 'rgba(255, 255, 255, 0.05)', // ✅ Subtle hover glow
      selected: config.primary,
    },
  },
  typography: {
    fontFamily: config.fontFamily,
    h1: {
      fontSize: '3rem',
      fontWeight: 800,
      color: config.titleColor,
      letterSpacing: '-0.5px',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: config.titleColor,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      color: config.titleColor,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      color: config.titleColor,
    },
    body2: {
      fontSize: '0.9rem',
      fontWeight: 400,
      color: '#B0BEC5',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.5px',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.35s cubic-bezier(0.23, 1, 0.32, 1)', // ✅ Springy luxury easing
          borderRadius: config.borderRadius,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(10, 132, 255, 0.35)', // Subtle blue glow
          },
        },
        containedPrimary: {
          backgroundColor: config.primary,
          '&:hover': {
            backgroundColor: '#0066CC',
          },
        },
        containedSecondary: {
          backgroundColor: config.secondary,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#009e8f',
          },
        },
        containedRocket: {
          backgroundColor: config.ctaColor,
          color: '#FFFFFF',
          fontWeight: 700,
          '&:hover': {
            backgroundColor: config.ctaHoverColor,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: config.borderRadius,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.4s ease',
          background: 'linear-gradient(145deg, #1B263B, #0D1B2A)', // ✅ Soft luxurious card background
          '&:hover': {
            transform: 'scale(1.015)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: config.appBarBackground,
          color: config.titleColor,
          boxShadow: 'none',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 32,
          paddingRight: 32,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 600,
          fontSize: '0.8rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // ✅ Kill default ugly MUI paper background
        },
      },
    },
  },
  shape: {
    borderRadius: config.borderRadius,
  },
  spacing: 8,
});

export default theme;
