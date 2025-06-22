// File: src/frontend/styles/theme.js
import { createTheme, alpha } from '@mui/material/styles';

// Base configuration for "Confident Simplicity"
const baseConfig = {
  primary: '#667eea',     // Crisp blue-purple from your logo
  secondary: '#2A9D8F',   // Muted teal
  success: '#3FCF8E',
  error: '#F25F5C',
  fontFamily: "'Inter', sans-serif",
  borderRadius: 4,
  borderRadiusLG: 8,
};

const modeSpecificConfig = (mode) => ({
  ...(mode === 'dark' ? {
    background: '#1E1E2F',
    paper: '#28293E',
    text: '#F3F4F6',
    textSecondary: '#9CA3AF',
    divider: 'rgba(255, 255, 255, 0.08)',
  } : {
    background: '#F7FAFC',
    paper: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    divider: 'rgba(0,0,0,0.06)',
  }),
  ...baseConfig,
  mode,
});

// Function to create the theme
const createAppTheme = (mode = 'dark') => {
  const config = modeSpecificConfig(mode);

  return createTheme({
    palette: {
      mode: config.mode,
      primary: { main: config.primary },
      secondary: { main: config.secondary },
      success: { main: config.success },
      error: { main: config.error },
      background: { default: config.background, paper: config.paper },
      text: { primary: config.text, secondary: config.textSecondary, disabled: alpha(config.textSecondary, 0.5) },
      divider: config.divider,
      action: {
        hover: alpha(config.primary, config.mode === 'dark' ? 0.08 : 0.04),
        selected: alpha(config.primary, config.mode === 'dark' ? 0.16 : 0.08),
        disabledBackground: alpha(config.textSecondary, 0.12),
        focus: alpha(config.primary, 0.12),
      },
    },
    typography: {
      fontFamily: config.fontFamily,
      h1: { fontWeight: 800, fontSize: '2.75rem', letterSpacing: '-0.5px' },
      h2: { fontWeight: 700, fontSize: '2.25rem' },
      h3: { fontWeight: 700, fontSize: '1.875rem' },
      h4: { fontWeight: 600, fontSize: '1.5rem' },
      h5: { fontWeight: 600, fontSize: '1.25rem' },
      h6: { fontWeight: 600, fontSize: '1.125rem' },
      body1: { fontSize: '1rem', lineHeight: 1.65 },
      body2: { fontSize: '0.875rem', color: config.textSecondary, lineHeight: 1.6 },
      button: { textTransform: 'none', fontWeight: 600, fontSize: '0.9375rem' },
      caption: { fontSize: '0.75rem', color: config.textSecondary, lineHeight: 1.5 },
    },
    shape: {
      borderRadius: config.borderRadius, 
      borderRadiusLG: config.borderRadiusLG, 
    },
    // --- UPDATED & ENHANCED COMPONENTS SECTION ---
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: config.borderRadius,
            boxShadow: 'none',
            padding: '10px 22px',
            transition: 'background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out',
            '&:hover': {
              boxShadow: 'none',
              transform: 'translateY(-2px)', // Enhanced lift effect
            }
          },
          containedPrimary: {
            '&:hover': {
              boxShadow: `0 8px 16px ${alpha(config.primary, 0.25)}`,
            },
          },
          containedSecondary: {
            color: '#FFFFFF',
            '&:hover': {
              boxShadow: `0 8px 16px ${alpha(config.secondary, 0.3)}`,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            // Add a global transition to all Paper components
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          },
          // Add a default hover state for outlined cards
          outlined: {
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: mode === 'dark' 
                ? `0 10px 20px -5px ${alpha('#000000', 0.2)}`
                : `0 10px 20px -5px ${alpha(config.text, 0.08)}`,
            }
          },
        }
      },
      MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: config.borderRadiusLG, // Use the larger border radius for all cards
                border: `1px solid ${config.divider}`,
            }
        }
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: config.borderRadius,
              '& fieldset': { borderColor: config.divider },
              '&:hover fieldset': { borderColor: alpha(config.primary, 0.7) },
              '&.Mui-focused fieldset': { borderColor: config.primary, borderWidth: '1.5px' },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: config.primary },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
            tooltip: {
                backgroundColor: alpha(config.mode === 'dark' ? '#2D3748' : '#333333', 0.95), 
                backdropFilter: 'blur(3px)',
                borderRadius: config.borderRadius,
                fontSize: '0.8rem',
                padding: '6px 12px',
            },
            arrow: {
                color: alpha(config.mode === 'dark' ? '#2D3748' : '#333333', 0.95),
            }
        }
      }
    },
  });
};

const theme = createAppTheme('dark'); 
export { createAppTheme, theme as default };