import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import theme from './frontend/styles/theme'; // Import the theme

const root = ReactDOM.createRoot(document.getElementById('root'));

// Wrap the app with BrowserRouter and ThemeProvider, then render
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Router> {/* Wrap App in BrowserRouter */}
        <App />
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);
//das