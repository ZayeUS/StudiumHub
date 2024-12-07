import React, { useEffect } from 'react';
import { CssBaseline, Box, useMediaQuery, useTheme } from '@mui/material';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './frontend/pages/LandingPage'; // Import LandingPage component
import LoginPage from './frontend/pages/LoginPage'; // Import LoginPage component
import SignUpPage from './frontend/pages/SignUpPage'; // Import SignUpPage component
import AdminDashboard from './frontend/pages/AdminDashboard'; // Import AdminDashboard component
import UserDashboard from './frontend/pages/UserDashboard'; // Import UserDashboard component
import NavBar from './frontend/components/navigation/NavBar'; // Import NavBar component
import Sidebar from './frontend/components/navigation/Sidebar'; // Import Sidebar component
import MobileBottomNavigation from './frontend/components/navigation/MobileBottomNavigation'; // Import Mobile Bottom Navigation
import { useUserStore } from './frontend/store/userStore'; // Zustand store to track login state
import ProtectedRoute from './frontend/components/ProtectedRoute'; // Import ProtectedRoute component

const App = () => {
  const { isLoggedIn, userRole, setUser } = useUserStore(); // Get the login state and user role from Zustand store
  const theme = useTheme(); // Get Material UI theme
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detect if screen size is mobile
  const navigate = useNavigate(); // useNavigate hook for navigation

  useEffect(() => {
    // Check if the user is logged in using localStorage when the app loads
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser.uid, parsedUser.email, parsedUser.role_id); // Set the user in the store
    }
  }, [setUser]);

  useEffect(() => {
    if (isLoggedIn && !userRole) {
      // If logged in but no role, redirect to login page
      navigate('/login');
    }
  }, [isLoggedIn, userRole, navigate]);

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* Render Sidebar only when logged in (protected route) and for desktop view */}
        {isLoggedIn && !isMobile && <Sidebar isMobile={false} onClose={() => {}} />}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            padding: 3,
            marginLeft: isLoggedIn && !isMobile ? '60px' : '0', // Make space for sidebar on desktop
            transition: 'margin-left 0.3s ease-in-out', // Smooth transition for margin
          }}
        >
          {/* Conditionally render NavBar only on non-protected routes when not logged in */}
          {!isLoggedIn && <NavBar />}

          {/* Define routes */}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Protect the Dashboard routes based on the user's role */}
            <Route
              path="/dashboard"
              element={
                isLoggedIn ? (
                  userRole === 'admin' ? (
                    <AdminDashboard />
                  ) : userRole === 'user' ? (
                    <UserDashboard />
                  ) : (
                    <Navigate to="/login" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            {/* Admin dashboard route - protected route */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            {/* User dashboard route - protected route */}
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute role="user">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Box>

        {/* Render Mobile Bottom Navigation only when logged in and on mobile */}
        {isLoggedIn && isMobile && <MobileBottomNavigation />}
      </Box>
    </>
  );
};

export default App;
