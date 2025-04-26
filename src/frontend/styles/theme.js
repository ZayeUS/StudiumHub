import { createTheme } from '@mui/material/styles';

// Configuration for dynamic client-based customization
const config = {
  primary: '#2ECC71', // Emerald Green (Tech-savvy and fresh)
  secondary: '#FF7043', // Bright Orange for accents (Eye-catching, modern)
  background: '#FFFFFF', // Clean White Background (classic modern feel)
  paperBackground: '#F5F5F5', // Light gray for paper/cards (adds some depth)
  titleColor: '#333333', // Dark text for titles and headers (contrast on white background)
  appBarBackground: '#F5F5F5', // Light gray AppBar for consistency
  ctaColor: '#FF6F61', // CTA color (Coral Red)
  ctaHoverColor: '#E05D4D', // Darker Coral Red on hover (emphasis)
  fontFamily: "'Roboto', sans-serif", // Modern, clean font
  borderRadius: 4, // Sharp borders for a sleek, modern design
};

const theme = createTheme({
  palette: {
    primary: {
      main: config.primary,
      light: '#5FF78B', // Light green for subtle accents
      dark: '#28B45A', // Darker green for hover effects
    },
    secondary: {
      main: config.secondary,
      light: '#FF8A65', // Lighter orange for softer accents
      dark: '#E64A19', // Darker orange for hover effects
    },
    background: {
      default: config.background,
      paper: config.paperBackground,
    },
    text: {
      primary: config.titleColor, // Dark text for better readability
      secondary: '#757575', // Slightly lighter secondary text for contrast
    },
    success: {
      main: '#2E7D32', // Fresh green for success actions
    },
    warning: {
      main: '#FF9800', // Orange for warning actions
    },
    action: {
      hover: 'rgba(46, 204, 113, 0.08)', // Light hover effect for buttons
      selected: '#28B45A', // Darker green for active selections
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
      color: '#333333', // Dark text for readability
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      color: '#757575', // Dimmed secondary text
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
        containedPrimary: {
          backgroundColor: config.primary,
          '&:hover': {
            backgroundColor: '#28B45A', // Darker green on hover
          },
        },
        containedSecondary: {
          backgroundColor: config.secondary,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#E64A19', // Darker orange on hover
          },
        },
        outlinedPrimary: {
          borderColor: config.primary,
          color: config.primary,
          '&:hover': {
            backgroundColor: 'rgba(46, 204, 113, 0.08)', // Light green on hover
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
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Light shadow for depth
          borderRadius: config.borderRadius,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: config.appBarBackground,
          color: '#333333',
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
