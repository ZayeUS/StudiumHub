import { createTheme, alpha } from '@mui/material/styles';

// Base configuration for "Confident Simplicity"
const baseConfig = {
  primary: '#E82127',     // Tesla's vibrant red for bold accents
  secondary: '#3C3C3C',   // Deep metallic gray for sophistication
  success: '#00A896',     // Crisp teal-green for positive feedback
  error: '#FF4C4C',       // Bright red for errors, aligned with Tesla's warning tones
  fontFamily: "'Inter', sans-serif",
  borderRadius: 4,
  borderRadiusLG: 8,
};

const modeSpecificConfig = (mode) => ({
  ...(mode === 'dark' ? {
    background: '#1A1A1A',   // Lighter, premium black inspired by Tesla's dark UI
    paper: '#242424',       // Slightly lighter gray for depth and contrast
    text: '#F5F5F5',        // Near-white for high readability
    textSecondary: '#B0B0B0', // Light gray for secondary text, ensuring contrast
    divider: 'rgba(255, 255, 255, 0.12)', // Subtle divider for clean separation
  } : {
    background: '#F9FAFB',   // Clean, near-white background for a minimalist look
    paper: '#FFFFFF',       // Pure white for cards and surfaces
    text: '#121212',        // Deep black for maximum contrast
    textSecondary: '#5A5A5A', // Softer gray for secondary text
    divider: 'rgba(0, 0, 0, 0.08)', // Light divider for subtle separation
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