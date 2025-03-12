import React, { useState } from "react";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Settings, LogOut, Bell, UserCircle } from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { logout } from "../../../firebase";

const MobileBottomNavigation = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const { isLoggedIn, userRole, clearUser } = useUserStore();
  
  // Updated navigation handler with role-based routing
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
  };

  const handleLogout = async () => {
    try {
      await logout();
      clearUser();
      setShowMenu(false);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Animation variants
  const menuVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    },
    exit: { 
      opacity: 0, 
      y: 50, 
      transition: { 
        duration: 0.2 
      } 
    }
  };

  // Button press animation
  const buttonVariants = {
    rest: { scale: 1 },
    pressed: { scale: 0.95 }
  };

  return (
    <>
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
        <Paper
          elevation={6}
          sx={{
            borderRadius: "16px 16px 0 0",
            backgroundColor: theme.palette.background.paper,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              padding: "12px 8px",
            }}
          >
            <motion.div
              variants={buttonVariants}
              initial="rest"
              whileTap="pressed"
              onClick={() => handleNavigation("/dashboard")}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <Home
                  size={24}
                  color={theme.palette.primary.main}
                  strokeWidth={2}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    mt: 0.5,
                  }}
                >
                  Home
                </Typography>
              </Box>
            </motion.div>

            <motion.div
              variants={buttonVariants}
              initial="rest"
              whileTap="pressed"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <Settings
                  size={24}
                  color={showMenu ? theme.palette.primary.main : theme.palette.text.secondary}
                  strokeWidth={2}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: showMenu ? 600 : 500,
                    color: showMenu ? theme.palette.primary.main : theme.palette.text.secondary,
                    mt: 0.5,
                  }}
                >
                  Settings
                </Typography>
              </Box>
            </motion.div>
          </Box>
        </Paper>
      </Box>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            style={{
              position: "fixed",
              bottom: "80px",
              left: 0,
              width: "100%",
              zIndex: 1100,
              display: { xs: "block", sm: "none" },
              padding: "0 16px",
            }}
          >
            <Paper
              elevation={8}
              sx={{
                borderRadius: "12px",
                overflow: "hidden",
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <motion.div
                whileHover={{ backgroundColor: theme.palette.action.hover }}
                onClick={() => {
                  handleNavigation("/settings");
                  setShowMenu(false);
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    padding: "16px",
                    cursor: "pointer",
                  }}
                >
                  <Settings
                    size={20}
                    color={theme.palette.text.primary}
                    strokeWidth={2}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      ml: 2,
                    }}
                  >
                    Account Settings
                  </Typography>
                </Box>
              </motion.div>
              
              <Box sx={{ height: "1px", backgroundColor: theme.palette.divider }} />
              
              <motion.div
                whileHover={{ backgroundColor: theme.palette.action.hover }}
                onClick={handleLogout}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    padding: "16px",
                    cursor: "pointer",
                  }}
                >
                  <LogOut
                    size={20}
                    color={theme.palette.error.main}
                    strokeWidth={2}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: theme.palette.error.main,
                      ml: 2,
                    }}
                  >
                    Logout
                  </Typography>
                </Box>
              </motion.div>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for closing the menu when clicking outside */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowMenu(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            zIndex: 1050,
          }}
        />
      )}
    </>
  );
};

export default MobileBottomNavigation;