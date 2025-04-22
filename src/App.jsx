import React, { useEffect } from 'react';
import { CssBaseline, Box, useMediaQuery, useTheme } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './frontend/pages/Non-Authenticated/LandingPage';
import LoginPage from './frontend/pages/Non-Authenticated/LoginPage';
import SignUpPage from './frontend/pages/Non-Authenticated/SignUpPage';
import AdminDashboard from './frontend/pages/Authenticated/AdminDashboard';
import UserDashboard from './frontend/pages/Authenticated/UserDashboard';
import NavBar from './frontend/components/navigation/NavBar';
import Sidebar from './frontend/components/navigation/Sidebar';
import MobileBottomNavigation from './frontend/components/navigation/MobileBottomNavigation';
import ProtectedRoute from './frontend/components/ProtectedRoute';
import { useUserStore } from './frontend/store/userStore';
import LoadingModal from './frontend/components/LoadingModal'; // Import the loading modal

const drawerWidth = 60;

const App = () => {
  const { isLoggedIn, loading, listenAuthState } = useUserStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const unsubscribe = listenAuthState();
    return unsubscribe;
  }, [listenAuthState]);

  // If still loading, show the loading screen
  if (loading) return <LoadingModal open={loading} />;

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {isLoggedIn && !isMobile && <Sidebar />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            p: 3,
            ml: isLoggedIn && !isMobile ? `${drawerWidth}px` : 0,
            transition: theme.transitions.create('margin-left', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            })
          }}
        >
          {!isLoggedIn && <NavBar />}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={isLoggedIn ? <Navigate to="/user-dashboard" /> : <LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRole={1}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute allowedRole={2}>
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
