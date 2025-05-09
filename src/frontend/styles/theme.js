import { createTheme } from '@mui/material/styles';

const baseConfig = {
  primary: '#6366F1',         // Indigo 500 – confident, premium
  secondary: '#F472B6',       // Pink 400 – soft CTA
  fontFamily: "'Inter', sans-serif",
  borderRadius: 4,
};

const darkConfig = {
  ...baseConfig,
  mode: 'dark',
  background: '#1E1E2F',      // Deep indigo-gray
  paper: '#2A2A3C',           // Card background
  text: '#E0E7FF',            // Indigo-100
  textSecondary: '#A5B4FC',   // Indigo-300
};

const lightConfig = {
  ...baseConfig,
  mode: 'light',
  background: '#F9FAFB',      // Very light gray
  paper: '#FFFFFF',
  text: '#111827',            // Slate-900
  textSecondary: '#6B7280',   // Slate-500
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
    },
    typography: {
      fontFamily: config.fontFamily,
      h1: { fontWeight: 800, fontSize: '3rem' },
      h2: { fontWeight: 700, fontSize: '2.5rem' },
      h3: { fontWeight: 600, fontSize: '2rem' },
      body1: { fontSize: '1rem' },
      body2: { fontSize: '0.9rem', color: config.textSecondary },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: config.borderRadius,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: config.borderRadius,
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
                  backgroundColor: mode === 'dark' ? '#A5B4FC' : '#E0E7FF',
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
              backgroundColor: mode === 'dark' ? '#3F3F46' : '#CBD5E1',
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
