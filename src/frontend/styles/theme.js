import { createTheme } from '@mui/material/styles';

// Create theme based on Cofoundless brand kit (Option 3: Minimalist Speed)
const theme = createTheme({
  palette: {
    primary: {
      main: '#6C63FF', // Velocity Purple - main brand color
      light: '#8F88FF', // Lighter shade for hover states
      dark: '#4D45E6', // Darker shade for active states
    },
    secondary: {
      main: '#FFD60A', // Bright Yellow - accent color
      light: '#FFE14D', // Lighter yellow shade
      dark: '#E6C100', // Darker yellow shade
    },
    background: {
      default: '#EDF2F7', // Light Silver for background
      paper: '#FFFFFF', // White for cards and sections
    },
    text: {
      primary: '#2D3748', // Charcoal for body text
      secondary: '#4A5568', // Lighter charcoal for secondary text
    },
    success: {
      main: '#38B2AC', // Success Teal for success states
      dark: '#2C9189',
    },
    action: {
      hover: 'rgba(108, 99, 255, 0.08)', // Transparent purple hover effect
      selected: '#4D45E6', // Darker purple for active states
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif", // Change to Poppins font
    h1: {
      fontSize: '3rem',
      fontWeight: 700, // Bold
      color: '#2D3748', // Charcoal
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600, // Semibold
      color: '#2D3748',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600, // Semibold
      color: '#2D3748',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400, // Regular
      color: '#2D3748',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400, // Regular
      color: '#2D3748',
    },
    button: {
      textTransform: 'none', // No uppercase transformation
      fontWeight: 600, // Semibold
      color: '#FFFFFF',
    },
    // Add a monospace font style for technical specifications or code examples
    monospace: {
      fontFamily: "'JetBrains Mono', monospace", // Secondary font from brand kit
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#6C63FF', // Velocity Purple for primary buttons
          '&:hover': {
            backgroundColor: '#4D45E6', // Darker purple on hover
          },
        },
        containedSecondary: {
          backgroundColor: '#FFD60A', // Bright Yellow for secondary/action buttons
          color: '#2D3748', // Charcoal text for contrast on yellow
          '&:hover': {
            backgroundColor: '#E6C100', // Darker yellow on hover
          },
        },
        outlinedPrimary: {
          borderColor: '#6C63FF',
          color: '#6C63FF',
          '&:hover': {
            backgroundColor: 'rgba(108, 99, 255, 0.08)',
          },
        },
        // Adding a "rocket" variant for CTAs highlighting the 72-hour turnaround
        containedRocket: {
          backgroundColor: '#FFD60A',
          color: '#2D3748',
          fontWeight: 700,
          '&:hover': {
            backgroundColor: '#E6C100',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(45, 55, 72, 0.05)', // Subtle shadow with charcoal tint
          borderRadius: 4, // Sharper corners for minimalist feel
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: '#FFFFFF', // White app bar
          color: '#2D3748', // Charcoal text color
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
    // Adding a timeline component styling for the "How It Works" section
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
          backgroundColor: '#6C63FF', // Velocity Purple
        },
      },
    },
    MuiTimelineDot: {
      styleOverrides: {
        root: {
          backgroundColor: '#6C63FF', // Velocity Purple
          boxShadow: 'none',
        },
      },
    },
    // Adding chip styling for pricing tiers
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 600,
        },
        colorPrimary: {
          backgroundColor: '#6C63FF', // Velocity Purple
        },
        colorSecondary: {
          backgroundColor: '#FFD60A', // Bright Yellow
          color: '#2D3748', // Charcoal text for contrast
        },
      },
    },
  },
  shape: {
    borderRadius: 4, // 4px border radius from brand kit
  },
  spacing: 8, // Base spacing unit of 8px
});

export default theme;