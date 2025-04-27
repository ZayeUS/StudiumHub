import React, { useState } from "react";
import { Box, Paper, Typography, useTheme, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, UserCircle, LogOut, ChevronRight,Menu } from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";

// Reusable Button Component
const NavigationButton = ({ icon, label, onClick, active }) => {
  const theme = useTheme();
  return (
    <motion.div whileTap={{ scale: 0.95 }} onClick={onClick}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          py: 1,
          transition: "all 0.3s ease",
          color: active ? theme.palette.primary.main : theme.palette.text.secondary,
        }}
      >
        {icon}
        <Typography
          variant="caption"
          sx={{
            fontWeight: active ? 700 : 500,
            mt: 0.5,
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Typography>
      </Box>
    </motion.div>
  );
};

const MobileBottomNavigation = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const { isLoggedIn, userRole, clearUser } = useUserStore();

  const handleNavigation = (path) => {
    setShowMenu(false);
    if (isLoggedIn) {
      navigate(path === "/dashboard" ? (userRole === "admin" ? "/admin-dashboard" : "/user-dashboard") : path);
    } else {
      navigate("/login");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearUser();
      setShowMenu(false);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const menuVariants = {
    hidden: { opacity: 0, y: 80 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 160, damping: 20 } },
    exit: { opacity: 0, y: 80, transition: { duration: 0.2 } },
  };

  return (
    <>
      {/* Bottom Bar */}
      <Box
        sx={{
          display: { xs: "block", sm: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          zIndex: 1300,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            borderRadius: "16px 16px 0 0",
            background: theme.palette.background.paper,
            boxShadow: "0px -2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              padding: "10px 16px",
            }}
          >
            <NavigationButton
              icon={<Home size={24} />}
              label="Home"
              onClick={() => handleNavigation("/dashboard")}
              active={false}
            />
            <NavigationButton
              icon={<Menu size={24} />}
              label="Menu"
              onClick={() => setShowMenu(!showMenu)}
              active={showMenu}
            />
          </Box>
        </Paper>
      </Box>

      {/* Expandable Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Dark backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 1200,
              }}
              onClick={() => setShowMenu(false)}
            />

            {/* Floating Menu */}
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
                padding: "0 16px",
                zIndex: 1301,
              }}
            >
              <Paper
                elevation={12}
                sx={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: "0px 6px 24px rgba(0,0,0,0.15)",
                }}
              >
                <motion.div whileHover={{ backgroundColor: theme.palette.action.hover }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: 2,
                      cursor: "pointer",
                    }}
                    onClick={() => handleNavigation("/user-profile")}
                  >
                    <UserCircle size={22} color={theme.palette.text.primary} />
                    <Typography variant="body2" sx={{ fontWeight: 500, ml: 2 }}>
                      Profile
                    </Typography>
                  </Box>
                </motion.div>

                <Divider />

                <motion.div whileHover={{ backgroundColor: theme.palette.action.hover }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: 2,
                      cursor: "pointer",
                    }}
                    onClick={handleLogout}
                  >
                    <LogOut size={22} color={theme.palette.error.main} />
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
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileBottomNavigation;
