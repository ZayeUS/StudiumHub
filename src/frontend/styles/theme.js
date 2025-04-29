// src/frontend/theme.js
import { createTheme } from '@mui/material/styles';

// Luxury Base Configuration
const config = {
  primary: '#634832',        // Mocha Mousse (Pantone Color of 2025)
  secondary: '#A67F5D',      // Caramel Latte (warm complementary)
  background: '#F8F6F2',     // Warm Cream Linen
  paperBackground: '#FFFFFF', // True White (cards, modal surfaces)
  titleColor: '#2D2A26',      // Rich Charcoal (for high-contrast headings)
  textPrimary: '#3F3A36',     // Deep Charcoal (comfortable for body text)
  appBarBackground: '#634832', // Match primary (strong and grounded)
  ctaColor: '#B7791F',        // Rich Amber (CTAs pop with warmth)
  ctaHoverColor: '#9A6417',   // Darker Amber for hover (bold but serious)
  fontFamily: "'Poppins', sans-serif", // Keep it clean and professional
  borderRadius:4
};




const theme = createTheme({
  palette: {
    primary: {
      main: config.primary,
      light: '#8B6E53',      // Lighter mocha
      dark: '#4A3526',       // Deeper brown
    },
    secondary: {
      main: config.secondary,
      light: '#C2A588',      // Lighter caramel
      dark: '#7E5F44',       // Deeper caramel
    },
    background: {
      default: config.background,
      paper: config.paperBackground,
    },
    text: {
      primary: config.titleColor,
      secondary: '#6E655B', // Warm Grey
    },
    success: { main: '#3E6B45' },  // Rich forest green
    warning: { main: '#D28B31' },  // Warm amber
    action: {
      hover: 'rgba(166, 127, 93, 0.08)', // Subtle caramel hover
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
      color: '#6E655B',
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
            boxShadow: '0 8px 20px rgba(99, 72, 50, 0.25)', // Mocha shadow
          },
        },
        containedPrimary: {
          backgroundColor: config.primary,
          '&:hover': {
            backgroundColor: '#4A3526',
          },
        },
        containedSecondary: {
          backgroundColor: config.secondary,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#7E5F44',
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
          background: 'linear-gradient(145deg, #634832, #4A3526)', // Mocha gradient
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