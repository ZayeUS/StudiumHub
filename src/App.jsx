import React, { useEffect } from "react";
import { CssBaseline, Box, useMediaQuery, useTheme } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./frontend/pages/Non-Authenticated/LandingPage";
import LoginPage from "./frontend/pages/Non-Authenticated/LoginPage";
import SignUpPage from "./frontend/pages/Non-Authenticated/SignUpPage";
import AdminDashboard from "./frontend/pages/Authenticated/AdminDashboard";
import UserDashboard from "./frontend/pages/Authenticated/UserDashboard";
import NavBar from "./frontend/components/navigation/NavBar";
import Sidebar from "./frontend/components/navigation/Sidebar";
import MobileBottomNavigation from "./frontend/components/navigation/MobileBottomNavigation";
import { useUserStore } from "./frontend/store/userStore";
import ProtectedRoute from "./frontend/components/ProtectedRoute";

const App = () => {
  const { isLoggedIn, listenAuthState } = useUserStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Setup Firebase auth listener with cleanup
  useEffect(() => {
    const unsubscribe = listenAuthState();
    return () => unsubscribe();
  }, [listenAuthState]);

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        {isLoggedIn && !isMobile && <Sidebar isMobile={false} onClose={() => {}} />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "background.default",
            padding: 3,
            marginLeft: isLoggedIn && !isMobile ? "60px" : "0",
            transition: "margin-left 0.3s ease-in-out",
          }}
        >
          {!isLoggedIn && <NavBar />}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute roleId={1}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute roleId={2}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
        {isLoggedIn && isMobile && <MobileBottomNavigation />}
      </Box>
    </>
  );
};

export default App;
