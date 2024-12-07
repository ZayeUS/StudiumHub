import React, { useState } from "react";
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  MenuItem,
  Popper,
  Fade,
  useTheme,
} from "@mui/material";
import { Home, Settings, ExitToApp } from "@mui/icons-material"; // Icons for navigation
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/userStore"; // Zustand store to check if the user is logged in
import { logout } from "../../../firebase"; // Import the logout function

const MobileBottomNavigation = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null); // State to handle the settings menu
  const { isLoggedIn, userRole, clearUser } = useUserStore(); // Get the login state, role, and clearUser function from Zustand store

  // Handle navigation
  const handleNavigation = (path) => {
    if (isLoggedIn) {
      if (userRole === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } else {
      navigate("/login"); // Navigate to login if not logged in
    }
  };

  // Open and close the settings menu
  const handleSettingsClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleLogout = async () => {
    try {
      await logout(); // Log the user out from Firebase
      clearUser(); // Clear user data in Zustand store
      navigate("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <Box
      sx={{
        display: { xs: "block", sm: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        zIndex: 1200,
      }}
    >
      <BottomNavigation
        showLabels
        sx={{
          backgroundColor: theme.palette.primary.main, // Always use primary.main background
          color: "white", // Always set text and icons to white
          boxShadow: 2,
        }}
      >
        <BottomNavigationAction
          label="Home"
          icon={<Home sx={{ color: "white" }} />}
          onClick={() => handleNavigation("/dashboard")}
          sx={{
            fontWeight: 600, // Set fontWeight to 600
            color: "white", // Ensure the label text color is white
          }}
        />
        <BottomNavigationAction
          label="Settings"
          icon={<Settings sx={{ color: "white" }} />}
          onClick={handleSettingsClick}
          sx={{
            fontWeight: 600, // Set fontWeight to 600
            color: "white", // Ensure the label text color is white
          }}
        />
      </BottomNavigation>

      {/* Settings menu - Popper used for smooth display */}
      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        transition
        placement="top"
        sx={{
          zIndex: 1300,
          marginTop: 1,
          width: "100%",
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={300}>
            <Box
              sx={{
                backgroundColor: theme.palette.primary.main, // Match the background color
                borderRadius: 1,
                boxShadow: 3,
                padding: 2,
                position: "relative",
                zIndex: 1300,
              }}
            >
              <MenuItem onClick={handleLogout} sx={{ fontWeight: 600, color: "white" }}>
                <ExitToApp sx={{ marginRight: 2, color: "white" }} />
                Logout
              </MenuItem>
            </Box>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};

export default MobileBottomNavigation;
