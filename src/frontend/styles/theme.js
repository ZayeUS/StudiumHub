import { createTheme } from '@mui/material/styles';

// Cool Tech Slate Configuration
const config = {
  primary: '#3B4252',         // Deep Slate
  secondary: '#5E81AC',       // Cool Indigo
  background: '#ECEFF4',      // Frost White
  paperBackground: '#FFFFFF', // Standard Paper
  titleColor: '#2E3440',      // Charcoal Black
  textPrimary: '#4C566A',     // Soft Slate
  appBarBackground: '#3B4252',
  ctaColor: '#81A1C1',        // Sky Steel
  ctaHoverColor: '#5E81AC',   // Indigo Deep
  fontFamily: "'Inter', sans-serif",
  borderRadius: 6
};

const theme = createTheme({
  palette: {
    primary: {
      main: config.primary,
      light: '#4C566A',
      dark: '#2E3440',
    },
    secondary: {
      main: config.secondary,
      light: '#81A1C1',
      dark: '#434C5E',
    },
    background: {
      default: config.background,
      paper: config.paperBackground,
    },
    text: {
      primary: config.titleColor,
      secondary: '#6C7A96',
    },
    success: { main: '#A3BE8C' }, // Soft green
    warning: { main: '#EBCB8B' }, // Muted amber
    action: {
      hover: 'rgba(94, 129, 172, 0.08)',
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
      color: '#6C7A96',
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
          transition: 'all 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
          borderRadius: config.borderRadius,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(59, 66, 82, 0.25)',
          },
        },
        containedPrimary: {
          backgroundColor: config.primary,
          '&:hover': {
            backgroundColor: '#2E3440',
          },
        },
        containedSecondary: {
          backgroundColor: config.secondary,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#434C5E',
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
          background: 'linear-gradient(145deg, #3B4252, #2E3440)',
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
          backgroundImage: 'none',
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
