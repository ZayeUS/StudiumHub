import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  useTheme,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Menu,
  LogOut,
  UserCircle,
} from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";

const NavigationButton = ({ icon, label, onClick, active }) => {
  const theme = useTheme();
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 1,
        cursor: "pointer",
        color: active ? theme.palette.primary.main : theme.palette.text.secondary,
        transition: "all 0.3s ease",
      }}
    >
      {icon}
      <Typography variant="caption" fontWeight={active ? 700 : 500} mt={0.5}>
        {label}
      </Typography>
    </Box>
  );
};

export const MobileBottomNavigation = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const { isLoggedIn, userRole, clearUser } = useUserStore();

  const handleNavigation = (path) => {
    setShowMenu(false);
    const finalPath = path === "/dashboard"
      ? userRole === "admin" ? "/admin-dashboard" : "/user-dashboard"
      : path;
    navigate(isLoggedIn ? finalPath : "/");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearUser();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      {/* Bottom Nav */}
      <Box
        sx={{
          display: { xs: "block", sm: "none" },
          position: "fixed",
          bottom: 0,
          width: "100%",
          zIndex: 1300,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            borderRadius: "16px 16px 0 0",
            px: 4,
            py: 1,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
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
        </Paper>
      </Box>

      {/* Expandable Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <Box
            onClick={() => setShowMenu(false)}
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              bgcolor: "rgba(0,0,0,0.5)",
              zIndex: 1299,
            }}
          />
          <Box
            sx={{
              position: "fixed",
              bottom: 80,
              left: 0,
              width: "100%",
              px: 2,
              zIndex: 1301,
              transition: "transform 0.3s ease, opacity 0.3s ease",
            }}
          >
            <Paper
              elevation={8}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                backdropFilter: "blur(6px)",
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 2,
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "action.hover" },
                }}
                onClick={() => handleNavigation("/user-profile")}
              >
                <UserCircle size={20} />
                <Typography variant="body2" fontWeight={500} ml={2}>
                  Profile
                </Typography>
              </Box>
              <Divider />
              <Box
                sx={{
                  px: 2,
                  py: 2,
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  color: theme.palette.error.main,
                  "&:hover": { bgcolor: "rgba(244,67,54,0.08)" },
                }}
                onClick={handleLogout}
              >
                <LogOut size={20} />
                <Typography variant="body2" fontWeight={500} ml={2}>
                  Logout
                </Typography>
              </Box>
            </Paper>
          </Box>
        </>
      )}
    </>
  );
};
