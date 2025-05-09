import { createTheme } from '@mui/material/styles';

const baseConfig = {
  primary: '#7C3AED',         // Vibrant purple (violet-600) for a fresh look
  secondary: '#F43F5E',       // Vibrant rose (rose-500) for strong CTAs
  fontFamily: "'Inter', sans-serif",
  borderRadius: 6,            // Slightly increased for modern feel
};

const darkConfig = {
  ...baseConfig,
  mode: 'dark',
  background: '#0F172A',      // Slate-900 for rich dark background
  paper: '#1E293B',           // Slate-800 for elevated surfaces
  text: '#F1F5F9',            // Slate-100 for crisp text
  textSecondary: '#94A3B8',   // Slate-400 for secondary text
};

const lightConfig = {
  ...baseConfig,
  mode: 'light',
  background: '#F8FAFC',      // Slate-50 for subtle off-white background
  paper: '#FFFFFF',           // Pure white for cards
  text: '#0F172A',            // Slate-900 for strong readable text
  textSecondary: '#475569',   // Slate-600 for secondary content
};

const createAppTheme = (mode = 'dark') => {
  const config = mode === 'dark' ? darkConfig : lightConfig;

  return createTheme({
    palette: {
      mode: config.mode,
      primary: { main: config.primary },
      secondary: { main: config.secondary },
      background: {
        default: config.background,
        paper: config.paper,
      },
      text: {
        primary: config.text,
        secondary: config.textSecondary,
      },
      error: {
        main: mode === 'dark' ? '#F87171' : '#EF4444', // Adjusted error colors
      },
      success: {
        main: mode === 'dark' ? '#6EE7B7' : '#10B981', // Adjusted success colors
      },
    },
    typography: {
      fontFamily: config.fontFamily,
      h1: { fontWeight: 800, fontSize: '3rem', letterSpacing: '-0.025em' },
      h2: { fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.025em' },
      h3: { fontWeight: 600, fontSize: '2rem', letterSpacing: '-0.025em' },
      body1: { fontSize: '1rem', lineHeight: 1.5 },
      body2: { fontSize: '0.9rem', color: config.textSecondary, lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: config.borderRadius,
            boxShadow: mode === 'dark' ? '0 4px 6px -1px rgba(0, 0, 0, 0.4)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          },
          contained: {
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: mode === 'dark' ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: config.borderRadius,
            boxShadow: mode === 'dark' 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 60,
            height: 34,
            padding: 7,
            '& .MuiSwitch-switchBase': {
              margin: 1,
              padding: 0,
              transform: 'translateX(6px)',
              '&.Mui-checked': {
                color: '#fff',
                transform: 'translateX(22px)',
                '& + .MuiSwitch-track': {
                  opacity: 1,
                  backgroundColor: mode === 'dark' ? '#A78BFA' : '#C4B5FD',
                },
              },
            },
            '& .MuiSwitch-thumb': {
              backgroundColor: config.primary,
              width: 32,
              height: 32,
              '&:before': {
                content: "''",
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              },
            },
            '& .MuiSwitch-track': {
              opacity: 1,
              backgroundColor: mode === 'dark' ? '#1E293B' : '#E2E8F0',
              borderRadius: 20 / 2,
            },
          },
        },
      },
    },
    shape: {
      borderRadius: config.borderRadius,
    },
  });
};

const theme = createAppTheme('dark');
export { createAppTheme };
export default theme;