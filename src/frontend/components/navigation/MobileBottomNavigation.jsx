// File: src/frontend/components/navigation/MobileBottomNavigation.jsx
import React, { useState } from "react";
import { 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  IconButton, 
  Switch,
  useTheme, 
  BottomNavigation, 
  BottomNavigationAction, 
  Drawer, 
  List, ListItemButton, ListItemIcon, ListItemText, 
  alpha 
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Menu, 
  LogOut, 
  UserCircle, 
  Moon, 
  Sun, 
  CreditCard // Used for Subscription/Billing in drawer
} from "lucide-react"; 
import { useUserStore } from "../../store/userStore";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";

export const MobileBottomNavigation = ({ isDarkMode, toggleTheme }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  // We use a state value for BottomNavigation to handle its internal selection indicator.
  // The actual navigation is handled by onClick, ensuring the correct route is pushed.
  const [value, setValue] = useState(0); 
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { isLoggedIn, roleId, clearUser, userSubscriptionStatus } = useUserStore(); 

  // Function to determine the currently active BottomNavigationAction based on route
  const getCurrentPathValue = () => {
    // If on Dashboard or Admin/User Dashboard paths
    if (location.pathname === "/admin-dashboard" || location.pathname === "/user-dashboard" || location.pathname === "/dashboard") {
      return 0; // Index for Home/Dashboard
    }
    // Add logic for other fixed bottom nav items if they are added
    return 0; // Default to Home if no match
  };

  // Effect to update the BottomNavigation's selected value when the route changes
  React.useEffect(() => {
    setValue(getCurrentPathValue());
  }, [location.pathname]);

  // Unified navigation handler for both main nav and drawer items
  const handleNavigation = (path) => {
    setDrawerOpen(false); // Always close drawer on navigation
    if (!isLoggedIn) {
        navigate("/login"); // Redirect to login if not authenticated
        return;
    }

    if (path === "/dashboard") { 
      // Redirect to specific dashboard based on role and subscription status
      if (roleId === 1) { 
        navigate("/admin-dashboard");
      } else { 
        // For regular users, check subscription status
        if (userSubscriptionStatus === null || userSubscriptionStatus === 'unsubscribed' || userSubscriptionStatus === 'inactive') {
          navigate("/subscription-selection"); // Guide to subscription selection
        } else {
          navigate("/user-dashboard"); // Go to user dashboard if subscribed/free
        }
      }
    } else {
      navigate(path); // Navigate to any other specified path directly
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearUser();
      navigate("/"); // Redirect to landing page after logout
      setDrawerOpen(false); // Close drawer
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Menu items for the expandable drawer (dynamic based on subscription status)
  const drawerMenuItems = [
    { label: "Profile", icon: <UserCircle size={20} />, path: "/user-profile" }  ];

  // Add "Subscription" link if user is not active, trialing, or free
  

  return (
    <>
      {/* Main Persistent Bottom Navigation Bar */}
      <Paper
        sx={{
          display: { xs: "block", sm: "none" }, // Only visible on extra small screens
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.appBar + 1, // Ensures it's above most content
          borderRadius: "16px 16px 0 0", // Rounded top corners for a modern feel
          overflow: 'hidden', // Ensures content respects the border radius
          boxShadow: theme.shadows[8], // Prominent shadow for depth
          backgroundColor: theme.palette.background.paper, // Uses theme's paper background
          borderTop: `1px solid ${theme.palette.divider}`, // Subtle separation from content
        }}
        elevation={6} // Consistent elevation
      >
        <BottomNavigation
          showLabels // Always show labels for clarity on mobile
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue); // Update internal state for selected tab visual
          }}
          sx={{
            height: 64, // Standard height for mobile bottom nav
            bgcolor: 'transparent', // Let Paper component handle background
            '& .MuiBottomNavigationAction-root': {
              color: theme.palette.text.secondary, // Default color for unselected items
              // Enhanced contrast and visual feedback for selected items
              '&.Mui-selected': {
                color: theme.palette.mode === 'dark' ? "whitesmoke" : theme.palette.primary.main, // Conditional color
                fontWeight: theme.typography.fontWeightBold, // Make text bold
                transform: 'scale(1.05)', // Subtle scale animation on selection
                transition: 'transform 0.2s ease-out',
              },
              // Touch feedback for mobile for all items
              '&:active': {
                  transform: 'scale(0.95)', // Slight press effect
                  transition: 'transform 0.1s ease-out',
              },
              minWidth: 0, // Allow items to shrink
              maxWidth: 'none', // Allow items to expand
              flex: 1, // Distribute space evenly
              padding: '8px 4px', // Adjusted padding
            },
            '& .MuiSvgIcon-root': { // Style Lucide icons wrapped in MuiSvgIcon
                fontSize: 24, // Ensure consistent icon size
            }
          }}
        >
          <BottomNavigationAction
            label="Home"
            icon={<Home size={24} />} // Lucide icon with explicit size
            onClick={() => handleNavigation("/dashboard")}
          />
          {/* Removed "Billing" from main bottom navigation as requested */}
          <BottomNavigationAction
            label="Menu"
            icon={<Menu size={24} />} // Lucide icon with explicit size
            onClick={() => setDrawerOpen(true)} // Opens the bottom drawer
          />
        </BottomNavigation>
      </Paper>

      {/* Expandable Menu Drawer (from bottom) */}
      <Drawer
        anchor="bottom" // Anchors the drawer to the bottom of the screen
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }} // Keeps children mounted for smoother transitions
        PaperProps={{
          sx: {
            borderRadius: "16px 16px 0 0", // Matches bottom nav bar corners
            bgcolor: theme.palette.background.drawerPaper || theme.palette.background.paper, // Use theme's drawerPaper
            backdropFilter: 'blur(8px)', // Strong blur effect for modern UI
            pb: theme.spacing(2), // Padding bottom (adjusts for bottom nav bar overlap if needed)
            maxHeight: '80vh', // Prevents drawer from taking full screen height
            overflowY: 'auto', // Allows scrolling if menu content is long
          },
        }}
      >
        {/* Close button at the top-right of the drawer */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            p: 1.5 
          }}
        >
          <IconButton onClick={() => setDrawerOpen(false)} size="medium">
            <Menu size={24} /> {/* Use menu icon to close for consistent iconography */}
          </IconButton>
        </Box>
        <List sx={{ px: 1 }}> {/* Slight horizontal padding for list items */}
          {drawerMenuItems.map((item) => (
            <ListItemButton 
              key={item.path} // Using path as key for stability
              onClick={() => handleNavigation(item.path)}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: theme.shape.borderRadius, // Rounded corners for list items
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                },
                // Conditional highlight: white in dark mode, blue in light mode
                color: location.pathname.startsWith(item.path) 
                  ? (theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.primary.main)
                  : theme.palette.text.primary,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}> {/* Inherit color from parent */}
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontWeight: location.pathname.startsWith(item.path) ? 600 : 500, // Bolder text for active item
                  color: 'inherit' 
                }} 
              />
            </ListItemButton>
          ))}
          
          <Divider sx={{ my: 1 }} />
          
          {/* Theme Toggle (Light/Dark Mode) */}
          <ListItemButton
            onClick={toggleTheme}
            sx={{
              py: 1.5,
              px: 2,
              justifyContent: 'space-between',
              borderRadius: theme.shape.borderRadius,
              '&:hover': {
                bgcolor: theme.palette.action.hover,
              }
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ListItemIcon sx={{ minWidth: 40, color: theme.palette.text.secondary }}>
                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              </ListItemIcon>
              <ListItemText 
                primary={isDarkMode ? "Dark Mode" : "Light Mode"} 
                primaryTypographyProps={{ 
                  fontWeight: 500, 
                  color: theme.palette.text.primary 
                }} 
              />
            </Box>
           
          </ListItemButton>

          <Divider sx={{ my: 1 }} />
          
          {/* Logout Button */}
          <ListItemButton
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 2,
              color: theme.palette.error.main, // Error color for logout
              borderRadius: theme.shape.borderRadius,
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.08), // Subtle hover effect
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <LogOut size={20} />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ 
                fontWeight: 500, 
                color: 'inherit' 
              }} 
            />
          </ListItemButton>
        </List>
      </Drawer>
    </>
  );
};