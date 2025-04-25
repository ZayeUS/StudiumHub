import { createTheme } from '@mui/material/styles';

// Configuration for dynamic client-based customization
const config = {
  primary: '#0052CC', // Default Deep Blue
  secondary: '#FF6F61', // Default Coral-Pink (accent color)
  background: '#F4F6F8', // Default Light Gray Background
  titleColor: '#2D3748', // Charcoal for title
  appBarBackground: '#FFFFFF', // Default AppBar White
  ctaColor: '#FF6F61', // Default CTA color (Coral-Pink)
  ctaHoverColor: '#E05D4D', // Darker Coral-Pink on hover
  fontFamily: "'Poppins', sans-serif", // Default font
  borderRadius: 4, // Default Border Radius (can be customized per client)
};

const theme = createTheme({
  palette: {
    primary: {
      main: config.primary,
      light: '#4E7AC7',
      dark: '#003D99',
    },
    secondary: {
      main: config.secondary,
      light: '#FF8C73',
      dark: '#E05D4D',
    },
    background: {
      default: config.background,
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D3748',
      secondary: '#4A5568',
    },
    success: {
      main: '#38B2AC', // Fresh Green for success states
      dark: '#2C9189',
    },
    warning: {
      main: '#F6A800', // Bold Orange for warning messages
      dark: '#C77400',
    },
    action: {
      hover: 'rgba(0, 82, 204, 0.08)', // Light blue hover effect for buttons
      selected: '#003D99', // Darker blue for active states
    },
  },
  typography: {
    fontFamily: config.fontFamily,
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      color: config.titleColor,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: config.titleColor,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: config.titleColor,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      color: '#2D3748',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      color: '#2D3748',
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
            backgroundColor: '#003D99', // Darker blue on hover
          },
        },
        containedSecondary: {
          backgroundColor: config.secondary,
          color: '#2D3748',
          '&:hover': {
            backgroundColor: '#E05D4D',
          },
        },
        outlinedPrimary: {
          borderColor: config.primary,
          color: config.primary,
          '&:hover': {
            backgroundColor: 'rgba(0, 82, 204, 0.08)',
          },
        },
        containedRocket: {
          backgroundColor: config.ctaColor,
          color: '#2D3748',
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
          boxShadow: '0 2px 8px rgba(45, 55, 72, 0.05)',
          borderRadius: config.borderRadius, // Customizable border radius
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: config.appBarBackground,
          color: '#2D3748',
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
    MuiTimeline: {
      styleOverrides: {
        root: {
          padding: '16px 0',
        },
      },
    },
    MuiTimelineConnector: {
      styleOverrides: {
        root: {
          backgroundColor: config.primary,
        },
      },
    },
    MuiTimelineDot: {
      styleOverrides: {
        root: {
          backgroundColor: config.primary,
          boxShadow: 'none',
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
          color: '#2D3748',
        },
      },
    },
  },
  shape: {
    borderRadius: config.borderRadius, // Set default border radius from config
  },
  spacing: 8,
});

export default theme;
