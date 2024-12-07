// src/styles/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#293241", 
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#FFD700", // Safety Yellow
    },
    error: {
      main: "#B22222", // Brick Red
    },
    success: {
      main: "#32CD32", // Green
    },
    background: {
      default: "#F8F9FA", // Light Gray
      paper: "#FFFFFF",  // White for containers
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif", // Set Roboto font globally
    fontWeight: 500, // Set font weight to 500 globally
    h1: { fontSize: "2rem", fontWeight: 500 },
    h2: { fontSize: "1.75rem", fontWeight: 500 },
    h3: { fontWeight: 500 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    body1: { fontSize: "1rem", fontWeight: 500 },
    button: { 
      textTransform: "none", 
      fontWeight: 500, // Apply font weight of 500 to buttons
      fontSize: "1rem", // Increase font size for buttons
    },
  },
});

export default theme;
