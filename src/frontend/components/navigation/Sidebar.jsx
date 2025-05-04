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
  useTheme,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, User, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";

const SidebarItem = ({ icon, label, path, isActive, onClick, isExpanded }) => {
  const theme = useTheme();

  return (
    <motion.div whileHover="hover" whileTap={{ scale: 0.97 }} onClick={onClick}>
      <Tooltip title={!isExpanded ? label : ""} placement="right" arrow>
        <ListItem
          sx={{
            borderRadius: 2,
            mb: 1,
            px: isExpanded ? 2.5 : 1.5,
            py: 1.5,
            cursor: "pointer",
            backgroundColor: isActive
              ? theme.palette.primary.main
              : "transparent",
            color: isActive
              ? theme.palette.common.white
              : theme.palette.text.secondary,
            "&:hover": {
              backgroundColor: isActive
                ? theme.palette.primary.dark
                : theme.palette.action.hover,
            },
            transition: "all 0.3s ease",
            justifyContent: isExpanded ? "flex-start" : "center",
          }}
        >
          <Box
            sx={{
              transition: "color 0.3s ease",
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </Box>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isActive ? 700 : 500,
                    ml: 2,
                    letterSpacing: 0.5,
                    color: isActive
                      ? theme.palette.common.white
                      : theme.palette.text.primary,
                  }}
                >
                  {label}
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        </ListItem>
      </Tooltip>
    </motion.div>
  );
};

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
      navigate("/");
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

  const menuItems = [
    { label: "Home", path: "/dashboard", icon: <Home size={22} strokeWidth={2} /> },
    { label: "Profile", path: "/user-profile", icon: <User size={22} strokeWidth={2} /> },
  ];

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open
      onClose={isMobile ? onClose : undefined}
      sx={{
        width: isExpanded ? 240 : 80,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isExpanded ? 240 : 80,
          background: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          borderRight: "none",
          boxShadow: "4px 0 12px rgba(0,0,0,0.05)",
          transition: "width 0.4s cubic-bezier(.25,.8,.25,1)",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Logo / App Name */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent={isExpanded ? "space-between" : "center"}
          px={isExpanded ? 3 : 2}
          py={3}
        >
          {isExpanded && (
            <Typography variant="h6" fontWeight="bold" color="primary" noWrap>
              Cofoundless
            </Typography>
          )}
          <IconButton
            onClick={toggleSidebar}
            size="small"
            sx={{
              backgroundColor: theme.palette.background.default,
              borderRadius: 2,
              "&:hover": { backgroundColor: theme.palette.action.hover },
            }}
          >
            {isExpanded ? (
              <ChevronLeft size={20} color={theme.palette.text.primary} />
            ) : (
              <ChevronRight size={20} color={theme.palette.text.primary} />
            )}
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Menu Items */}
        <Box flexGrow={1} overflow="auto">
          <List sx={{ px: isExpanded ? 2 : 1 }}>
            {menuItems.map((item) => (
              <SidebarItem
                key={item.label}
                {...item}
                isActive={pathname.includes(item.path.slice(1))}
                onClick={() => handleNavigation(item.path)}
                isExpanded={isExpanded}
              />
            ))}
          </List>
        </Box>

        {/* Logout */}
        <Box px={isExpanded ? 2.5 : 1} pb={4}>
          <Tooltip title={!isExpanded ? "Logout" : ""} placement="right" arrow>
            <ListItem
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                py: 1.5,
                cursor: "pointer",
                backgroundColor: "transparent",
                color: theme.palette.error.main,
                "&:hover": {
                  backgroundColor: "rgba(244,67,54,0.1)",
                },
                justifyContent: isExpanded ? "flex-start" : "center",
                transition: "all 0.3s ease",
              }}
            >
              <Box>
                <LogOut size={22} strokeWidth={2} />
              </Box>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        ml: 2,
                        letterSpacing: 0.5,
                      }}
                    >
                      Logout
                    </Typography>
                  </motion.div>
                )}
              </AnimatePresence>
            </ListItem>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
