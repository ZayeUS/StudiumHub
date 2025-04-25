import React, { useState } from "react";
import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton, 
  List, 
  ListItem, 
  Tooltip, 
  Divider,
  useTheme
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";

const Sidebar = ({ isMobile, onClose }) => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, userRole, clearUser } = useUserStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearUser();
      navigate("/login");
      if (isMobile) onClose();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  const handleNavigation = (path) => {
    if (isLoggedIn) {
      if (path === "/dashboard") {
        navigate(userRole === "admin" ? "/admin-dashboard" : "/user-dashboard");
      } else {
        navigate(path);
      }
    } else {
      navigate("/login");
    }
    if (isMobile) onClose();
  };

  const sidebarVariants = {
    expanded: { width: 240 },
    collapsed: { width: 80 }
  };

  const textVariants = {
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.2, delay: 0.1 } 
    },
    hidden: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2 } 
    }
  };

  const iconHoverVariants = {
    hover: { 
      scale: 1.1,
      transition: { duration: 0.2 }
    }
  };

  const menuItems = [
    { 
      label: "Home", 
      path: "/dashboard", 
      icon: <Home size={22} strokeWidth={2} />,
      color: pathname.includes("dashboard") ? theme.palette.primary.main : theme.palette.text.secondary
    },
    {
      label: "Settings",
      path: "/settings",
      icon: <Settings size={22} strokeWidth={2} />,
      color: pathname.includes("settings") ? theme.palette.primary.main : theme.palette.text.secondary
    }
  ];

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? true : true}
      onClose={isMobile ? onClose : undefined}
      sx={{
        width: isExpanded ? 240 : 80,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRight: `1px solid ${theme.palette.divider}`,
          overflowX: "hidden",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        },
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <motion.div
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, type: "tween" }}
      >
        {/* App Logo and Toggle */}
        <Box display="flex" alignItems="center" justifyContent={isExpanded ? "space-between" : "center"} py={2.5} px={isExpanded ? 3 : 2}>
          {isExpanded && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={textVariants}
            >
              <Typography variant="h6" fontWeight="bold" color="primary">
                YourApp
              </Typography>
            </motion.div>
          )}
          <motion.div whileTap={{ scale: 0.95 }}>
            <IconButton 
              onClick={toggleSidebar} 
              size="small"
              sx={{ 
                backgroundColor: theme.palette.background.default, 
                borderRadius: 1.5,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                }
              }}
            >
              {isExpanded ? 
                <ChevronLeft size={18} color={theme.palette.text.primary} /> : 
                <ChevronRight size={18} color={theme.palette.text.primary} />}
            </IconButton>
          </motion.div>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Navigation Menu */}
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => (
            <motion.div key={item.label} whileHover="hover" whileTap={{ scale: 0.95 }}>
              <Tooltip title={!isExpanded ? item.label : ""} placement="right" arrow>
                <ListItem
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 1.5,
                    mb: 1,
                    py: 1.2,
                    px: isExpanded ? 2 : 1.5,
                    cursor: "pointer",
                    backgroundColor: pathname.includes(item.path.slice(1)) ? theme.palette.action.selected : "transparent",
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                    justifyContent: isExpanded ? "flex-start" : "center",
                  }}
                >
                  <motion.div variants={iconHoverVariants}>
                    <Box color={pathname.includes(item.path.slice(1)) ? '#fff' : item.color}> {/* Update icon color to white if active */}
                      {item.icon}
                    </Box>
                  </motion.div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial="hidden" animate="visible" exit="hidden" variants={textVariants}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: pathname.includes(item.path.slice(1)) ? 600 : 500,
                            color: pathname.includes(item.path.slice(1)) ? '#fff' : item.color,  // Change text color to white when active
                            ml: 1.5, 
                          }}
                        >
                          {item.label}
                        </Typography>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ListItem>
              </Tooltip>
            </motion.div>
          ))}
        </List>

        {/* Logout Button */}
        <Box position="absolute" bottom="20px" width="100%" px={2}>
          <Divider sx={{ mb: 2 }} />
          <motion.div whileHover="hover" whileTap={{ scale: 0.95 }}>
            <Tooltip title={!isExpanded ? "Logout" : ""} placement="right" arrow>
              <ListItem
                onClick={handleLogout}
                sx={{
                  borderRadius: 1.5,
                  py: 1.2,
                  px: isExpanded ? 2 : 1.5,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                  justifyContent: isExpanded ? "flex-start" : "center",
                  mb:10
                }}
              >
                <motion.div variants={iconHoverVariants}>
                  <Box color={theme.palette.error.main}>
                    <LogOut size={22} strokeWidth={2} />
                  </Box>
                </motion.div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div  initial="hidden" animate="visible" exit="hidden" variants={textVariants} >
                      <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.error.main, ml: 1.5 }}>
                        Logout
                      </Typography>
                    </motion.div>
                  )}
                </AnimatePresence>
              </ListItem>
            </Tooltip>
          </motion.div>
        </Box>
      </motion.div>
    </Drawer>
  );
};

export default Sidebar;
