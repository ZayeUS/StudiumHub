import React, { useState } from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, IconButton } from "@mui/material";
import { Home, Logout, Menu } from "@mui/icons-material"; // Icons for navigation
import { useNavigate, useLocation } from "react-router-dom";
import { useUserStore } from "../../store/userStore"; // Zustand store for user
import { signOut } from "firebase/auth"; // Import signOut from Firebase
import { auth } from "../../../firebase"; // Firebase auth
import { motion } from "framer-motion"; // Import Framer Motion for animation

const Sidebar = ({ isMobile, onClose }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, userRole, clearUser } = useUserStore(); // Get user data from Zustand store
  const [isOpen, setIsOpen] = useState(true);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Log the user out from Firebase
      clearUser(); // Clear user data in Zustand store
      navigate("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Toggle Sidebar visibility
  const toggleSidebar = () => setIsOpen(!isOpen);

  // Define menu items based on user role
  const menuItems = isLoggedIn
    ? [
        { label: "Dashboard", path: userRole === "admin" ? "/admin-dashboard" : "/user-dashboard", icon: <Home /> },
      ]
    : [
        { label: "Dashboard", path: "/dashboard", icon: <Home /> },
      ];

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? isOpen : true}
      onClose={isMobile ? onClose : undefined}
      sx={{
        width: isOpen ? 240 : 60,
        "& .MuiDrawer-paper": {
          width: isOpen ? 240 : 60,
          boxSizing: "border-box",
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          transition: "width 0.3s ease-in-out",
        },
      }}
      ModalProps={{
        keepMounted: true, // Improves performance on mobile
      }}
    >
      {/* Fade-in animation for the sidebar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" p={1.5}>
          {isOpen && (
            <Typography variant="h6" fontWeight="bold" color="primary.contrastText">
              YourApp
            </Typography>
          )}
          <IconButton onClick={toggleSidebar} sx={{ color: "primary.contrastText" }}>
            <Menu />
          </IconButton>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.label}
              onClick={() => navigate(item.path)} // Navigate to the corresponding dashboard
              sx={{
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
                cursor: "pointer",
                backgroundColor: pathname === item.path ? "secondary" : "inherit",
              }}
            >
              <ListItemIcon sx={{ color: "primary.contrastText" }}>
                {item.icon}
              </ListItemIcon>
              {isOpen && (
                <ListItemText
                  primary={item.label}
                  sx={{
                    fontWeight: 600, // Set font weight to 600
                    fontSize: "1rem", // Set font size
                    color: "primary.contrastText", // Set text color to match the sidebar
                  }}
                />
              )}
            </ListItem>
          ))}
        </List>
        {/* Move logout button slightly up */}
        <Box position="absolute" bottom="90px" width="100%">
          <List>
            <ListItem
              onClick={handleLogout}
              sx={{
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
                cursor: "pointer",
              }}
            >
              <ListItemIcon sx={{ color: "primary.contrastText" }}>
                <Logout />
              </ListItemIcon>
              {isOpen && (
                <ListItemText
                  primary="Logout"
                  sx={{
                    fontWeight: 600, // Set font weight to 600
                    fontSize: "1rem", // Set font size
                    color: "primary.contrastText", // Set text color to match the sidebar
                  }}
                />
              )}
            </ListItem>
          </List>
        </Box>
      </motion.div>
    </Drawer>
  );
};

export default Sidebar;
