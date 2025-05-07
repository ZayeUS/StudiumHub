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
import { Home, User, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";

const SidebarItem = ({ icon, label, path, isActive, onClick, isExpanded }) => {
  const theme = useTheme();

  return (
    <Tooltip title={!isExpanded ? label : ""} placement="right" arrow>
      <ListItem
        onClick={onClick}
        sx={{
          borderRadius: 2,
          mb: 1,
          px: isExpanded ? 2.5 : 1.5,
          py: 1.5,
          cursor: "pointer",
          backgroundColor: isActive ? theme.palette.primary.main : "transparent",
          color: isActive ? theme.palette.common.white : theme.palette.text.secondary,
          "&:hover": {
            backgroundColor: isActive
              ? theme.palette.primary.dark
              : theme.palette.action.hover,
          },
          justifyContent: isExpanded ? "flex-start" : "center",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
        }}
      >
        {icon}
        {isExpanded && (
          <Typography
            variant="body2"
            sx={{
              fontWeight: isActive ? 700 : 500,
              ml: 2,
              letterSpacing: 0.5,
              color: isActive ? theme.palette.common.white : theme.palette.text.primary,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </Typography>
        )}
      </ListItem>
    </Tooltip>
  );
};

export const Sidebar = ({ isMobile, onClose }) => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, roleId, clearUser } = useUserStore();
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

  const toggleSidebar = () => setIsExpanded(prev => !prev);

  const handleNavigation = (path) => {
    if (isLoggedIn) {
      if (path === "/dashboard") {
        navigate(roleId === 1 ? "/admin-dashboard" : "/user-dashboard");
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
          transition: "width 0.3s ease",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
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
            {isExpanded
              ? <ChevronLeft size={20} color={theme.palette.text.primary} />
              : <ChevronRight size={20} color={theme.palette.text.primary} />}
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Menu */}
        <Box flexGrow={1} overflow="auto">
          <List sx={{ px: isExpanded ? 2 : 1 }}>
            {menuItems.map(item => (
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
                color: theme.palette.error.main,
                "&:hover": {
                  backgroundColor: "rgba(244,67,54,0.1)",
                },
                justifyContent: isExpanded ? "flex-start" : "center",
                transition: "all 0.3s ease",
              }}
            >
              <LogOut size={22} strokeWidth={2} />
              {isExpanded && (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    ml: 2,
                    letterSpacing: 0.5,
                    whiteSpace: "nowrap",
                  }}
                >
                  Logout
                </Typography>
              )}
            </ListItem>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
};
