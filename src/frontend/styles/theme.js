import { createTheme } from '@mui/material/styles';

const config = {
  primary: '#3B4252',
  secondary: '#5E81AC',
  background: '#ECEFF4',
  paper: '#FFFFFF',
  text: '#2E3440',
  fontFamily: "'Inter', sans-serif",
  borderRadius: 6,
};

const theme = createTheme({
  palette: {
    primary: { main: config.primary },
    secondary: { main: config.secondary },
    background: {
      default: config.background,
      paper: config.paper,
    },
    text: {
      primary: config.text,
      secondary: '#6C7A96',
    },
  },
  typography: {
    fontFamily: config.fontFamily,
    h1: { fontWeight: 800, fontSize: '3rem' },
    h2: { fontWeight: 700, fontSize: '2.5rem' },
    h3: { fontWeight: 600, fontSize: '2rem' },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.9rem', color: '#6C7A96' },
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
