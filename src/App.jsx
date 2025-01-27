import React, { useEffect } from 'react';
import { CssBaseline, Box, useMediaQuery, useTheme } from '@mui/material';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './frontend/pages/LandingPage';
import LoginPage from './frontend/pages/LoginPage';
import SignUpPage from './frontend/pages/SignUpPage';
import AdminDashboard from './frontend/pages/AdminDashboard';
import UserDashboard from './frontend/pages/UserDashboard';
import NavBar from './frontend/components/navigation/NavBar';
import Sidebar from './frontend/components/navigation/Sidebar';
import MobileBottomNavigation from './frontend/components/navigation/MobileBottomNavigation';
import { useUserStore } from './frontend/store/userStore'; // Ensure correct import
import ProtectedRoute from './frontend/components/ProtectedRoute';

const App = () => {
  const { isLoggedIn, roleId, setUser, listenAuthState } = useUserStore(); // Ensure setUser is available from Zustand store
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // Firebase listener setup to detect login state
  useEffect(() => {
    listenAuthState();  // This will listen to Firebase changes and set user state
  }, [listenAuthState]);

  // Check if user is logged in using localStorage when app loads
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser.user_id, parsedUser.email, parsedUser.role, parsedUser.roleId); // Set user in Zustand store
    }
  }, [setUser]);

  // Redirect to appropriate dashboard if user is logged in
  useEffect(() => {

    if (isLoggedIn && roleId) {
      if (roleId === 1) {
        navigate('/admin-dashboard');
      } else if (roleId === 2) {
        navigate('/user-dashboard');
      }
    }
  }, [isLoggedIn, roleId, navigate]);
  

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* Render Sidebar only when logged in and on desktop */}
        {isLoggedIn && !isMobile && <Sidebar isMobile={false} onClose={() => {}} />}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            padding: 3,
            marginLeft: isLoggedIn && !isMobile ? '60px' : '0',
            transition: 'margin-left 0.3s ease-in-out',
          }}
        >
          {/* Conditionally render NavBar only on non-protected routes when not logged in */}
          {!isLoggedIn && <NavBar />}

          {/* Define routes */}
          <Routes>
            {/* Redirect to the appropriate dashboard if user is logged in */}
            <Route
              path="/"
              element={isLoggedIn ? (
                roleId === '1' ? (
                  <Navigate to="/admin-dashboard" replace />
                ) : (
                  <Navigate to="/user-dashboard" replace />
                )
              ) : (
                <LandingPage />
              )}
            />
            
            <Route
              path="/login"
              element={isLoggedIn ? (
                roleId === '1' ? (
                  <Navigate to="/admin-dashboard" replace />
                ) : (
                  <Navigate to="/user-dashboard" replace />
                )
              ) : (
                <LoginPage />
              )}
            />
            <Route
              path="/signup"
              element={isLoggedIn ? (
                roleId === '1' ? (
                  <Navigate to="/admin-dashboard" replace />
                ) : (
                  <Navigate to="/user-dashboard" replace />
                )
              ) : (
                <SignUpPage />
              )}
            />

            {/* Redirect to appropriate dashboard */}
            <Route
              path="/dashboard"
              element={
                isLoggedIn ? (
                  roleId === '1' ? (
                    <Navigate to="/admin-dashboard" replace />
                  ) : roleId === '2' ? (
                    <Navigate to="/user-dashboard" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Admin dashboard route - protected route */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute roleId="1">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* User dashboard route - protected route */}
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute roleId="2">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>

        {/* Render Mobile Bottom Navigation only when logged in and on mobile */}
        {isLoggedIn && isMobile && <MobileBottomNavigation />}
      </Box>
    </>
  );
};

export default App;
