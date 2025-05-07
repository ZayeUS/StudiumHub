import { createTheme } from '@mui/material/styles';

const config = {
  primary: '#BFA181',
  secondary: '#3C3C3B',
  background: '#1E1E1E',
  paper: '#2A2A2A',
  text: '#F5F5F5',
  fontFamily: "'Inter', sans-serif",
  borderRadius: 12,
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: config.primary },
    secondary: { main: config.secondary },
    background: {
      default: config.background,
      paper: config.paper,
    },
    text: {
      primary: config.text,
      secondary: '#AAAAAA',
    },
  },
  typography: {
    fontFamily: config.fontFamily,
    h1: { fontWeight: 800, fontSize: '3rem' },
    h2: { fontWeight: 700, fontSize: '2.5rem' },
    h3: { fontWeight: 600, fontSize: '2rem' },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.9rem', color: '#AAAAAA' },
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
  },
  shape: {
    borderRadius: config.borderRadius,
  },
});

export default theme;
