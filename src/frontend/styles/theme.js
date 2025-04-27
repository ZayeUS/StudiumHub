import { createTheme } from '@mui/material/styles';

// Base configuration for colors, typography, spacing
const config = {
  primary: '#14532d', // Deep Green (luxury feel)
  secondary: '#B87333', // Muted Copper (rich, not playful)
  background: '#FAFAFA', // Soft white
  paperBackground: '#FFFFFF', // Clean white for cards
  titleColor: '#222222', // Near-black for sharp readability
  appBarBackground: '#FFFFFF', // Clean for app bar
  ctaColor: '#B87333', // Copper CTA
  ctaHoverColor: '#94542b', // Darker copper on hover
  fontFamily: "'Inter', sans-serif", // Professional, premium font
  borderRadius: 3, // Sharper for luxury feel
};

const theme = createTheme({
  palette: {
    primary: {
      main: config.primary,
      light: '#2e7d32', // Soft green for hover accents
      dark: '#0e4421', // Even darker green if needed
    },
    secondary: {
      main: config.secondary,
      light: '#d1884f', // Lighter copper
      dark: '#80461b', // Darker copper
    },
    background: {
      default: config.background,
      paper: config.paperBackground,
    },
    text: {
      primary: config.titleColor,
      secondary: '#757575',
    },
    success: { main: '#2E7D32' },
    warning: { main: '#FF9800' },
    action: {
      hover: 'rgba(20, 83, 45, 0.08)', // Light green hover background
      selected: config.primary,
    },
  },
  typography: {
    fontFamily: config.fontFamily,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: config.titleColor,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: config.titleColor,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: config.titleColor,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      color: config.titleColor,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      color: '#757575',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      color: '#FFFFFF',
    },
    monospace: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          borderRadius: config.borderRadius,
          '&:hover': {
            transform: 'scale(1.02)',
          },
        },
        containedPrimary: {
          backgroundColor: config.primary,
          '&:hover': {
            backgroundColor: '#0e4421',
          },
        },
        containedSecondary: {
          backgroundColor: config.secondary,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#80461b',
          },
        },
        outlinedPrimary: {
          borderColor: config.primary,
          color: config.primary,
          '&:hover': {
            backgroundColor: 'rgba(20, 83, 45, 0.08)',
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
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)', // Deeper, luxury shadow
          borderRadius: config.borderRadius,
          '&:hover': {
            transform: 'scale(1.02)',
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
          paddingLeft: 24,
          paddingRight: 24,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: config.borderRadius,
          fontWeight: 600,
        },
        colorPrimary: {
          backgroundColor: config.primary,
        },
        colorSecondary: {
          backgroundColor: config.secondary,
          color: '#FFFFFF',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: config.titleColor,
        },
        h2: {
          fontSize: '2rem',
          fontWeight: 'bold',
          color: config.titleColor,
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
