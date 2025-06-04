import { createTheme, alpha } from '@mui/material/styles';

// Base configuration
const baseConfig = {
  primary: '#7C3AED',
  secondary: '#F43F5E',
  fontFamily: "'Inter', sans-serif",
  borderRadius: 6,
  borderRadiusLG: 14,
};

// Mode-specific configurations
const modeSpecificConfig = (mode) => ({
  ...(mode === 'dark' ? {
    background: '#0F172A',
    paper: '#1E293B',
    text: '#FFFFFF', // Changed to pure white for better readability
    textSecondary: '#CBD5E1', // Changed to much lighter gray
    divider: alpha('#CBD5E1', 0.2), // Lighter divider
  } : {
    background: '#F8FAFC',
    paper: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#475569',
    divider: alpha('#475569', 0.15),
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
      primary: { main: config.primary, light: alpha(config.primary, 0.85), dark: alpha(config.primary, 0.7) },
      secondary: { main: config.secondary, light: alpha(config.secondary, 0.85), dark: alpha(config.secondary, 0.7) },
      background: { default: config.background, paper: config.paper },
      text: { primary: config.text, secondary: config.textSecondary, disabled: alpha(config.textSecondary, 0.5) },
      error: { main: mode === 'dark' ? '#F87171' : '#EF4444' },
      success: { main: mode === 'dark' ? '#34D399' : '#10B981' },
      warning: { main: mode === 'dark' ? '#FBBF24' : '#F59E0B' },
      info: { main: mode === 'dark' ? '#60A5FA' : '#3B82F6' },
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
      h1: { fontWeight: 800, fontSize: '2.75rem', letterSpacing: '-0.025em', lineHeight: 1.2 },
      h2: { fontWeight: 700, fontSize: '2.25rem', letterSpacing: '-0.025em', lineHeight: 1.2 },
      h3: { fontWeight: 700, fontSize: '1.875rem', letterSpacing: '-0.020em', lineHeight: 1.3 },
      h4: { fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.015em', lineHeight: 1.3 },
      h5: { fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.01em', lineHeight: 1.4 },
      h6: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
      body1: { fontSize: '1rem', lineHeight: 1.65 },
      body2: { fontSize: '0.875rem', color: config.textSecondary, lineHeight: 1.6 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.025em', fontSize: '0.9375rem' },
      caption: { fontSize: '0.75rem', color: config.textSecondary, lineHeight: 1.5 },
    },
    shape: {
      borderRadius: config.borderRadius, 
      borderRadiusLG: config.borderRadiusLG, 
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: config.borderRadius, 
            boxShadow: 'none', 
            padding: '10px 22px',
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease',
            '&:hover': { transform: 'translateY(-1px)' }
          },
          containedPrimary: {
            color: config.mode === 'dark' ? config.text : config.paper,
            background: `linear-gradient(45deg, ${config.primary} 30%, ${alpha(config.primary, 0.75)} 90%)`,
            '&:hover': {
              background: `linear-gradient(45deg, ${alpha(config.primary, 0.9)} 30%, ${alpha(config.primary, 0.65)} 90%)`,
              boxShadow: `0 6px 12px ${alpha(config.primary, 0.35)}`,
            },
          },
          containedSecondary: {
            color: config.mode === 'dark' ? config.text : config.paper,
            background: `linear-gradient(45deg, ${config.secondary} 30%, ${alpha(config.secondary, 0.75)} 90%)`,
            '&:hover': {
              background: `linear-gradient(45deg, ${alpha(config.secondary, 0.9)} 30%, ${alpha(config.secondary, 0.65)} 90%)`,
              boxShadow: `0 6px 12px ${alpha(config.secondary, 0.35)}`,
            },
          },
          outlinedPrimary: {
            borderWidth: '1.5px', borderColor: config.primary, color: config.primary,
            '&:hover': { backgroundColor: alpha(config.primary, 0.08), borderColor: alpha(config.primary, 0.7) },
          },
        },
      },
      MuiPaper: { 
        styleOverrides: {
          root: { backgroundColor: config.paper },
          elevation8: { 
             borderRadius: config.borderRadiusLG,
             boxShadow: mode === 'dark'
              ? `0px 16px 24px -8px ${alpha(config.background, 0.5)}, 0px 8px 12px -8px ${alpha(config.background, 0.7)}`
              : `0px 16px 32px -8px ${alpha(config.text, 0.08)}, 0px 8px 16px -8px ${alpha(config.text, 0.06)}`,
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
              '&:hover fieldset': { borderColor: config.primary },
              '&.Mui-focused fieldset': { borderColor: config.primary, borderWidth: '1.5px' },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: config.primary },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
            root: { borderRadius: config.borderRadius, borderWidth: '1px', borderStyle: 'solid', padding: '10px 16px' },
            standardSuccess: { 
                backgroundColor: alpha(config.palette?.success?.main || '#10B981', 0.1), 
                color: config.palette?.success?.dark || config.palette?.success?.main, 
                borderColor: alpha(config.palette?.success?.main || '#10B981', 0.3),
                '& .MuiAlert-icon': { color: config.palette?.success?.main }
            },
            standardError: { 
                backgroundColor: alpha(config.palette?.error?.main || '#EF4444', 0.1), 
                color: config.palette?.error?.dark || config.palette?.error?.main, 
                borderColor: alpha(config.palette?.error?.main || '#EF4444', 0.3),
                '& .MuiAlert-icon': { color: config.palette?.error?.main }
            },
        }
      },
      MuiTooltip: {
        styleOverrides: {
            tooltip: {
                backgroundColor: alpha(config.mode === 'dark' ? '#111111' : '#333333', 0.95), 
                backdropFilter: 'blur(3px)',
                borderRadius: config.borderRadius,
                fontSize: '0.75rem', 
                padding: '4px 10px', 
            },
            arrow: {
                color: alpha(config.mode === 'dark' ? '#111111' : '#333333', 0.95),
            }
        }
      }
    },
  });
};

const theme = createAppTheme('dark'); 
export { createAppTheme, theme as default };