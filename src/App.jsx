import React, { useEffect } from "react";
import { CssBaseline, Box, useMediaQuery, useTheme } from "@mui/material";
import { useLocation } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import Sidebar from "./frontend/components/navigation/Sidebar";
import MobileBottomNavigation from "./frontend/components/navigation/MobileBottomNavigation";
import LoadingModal from "./frontend/components/LoadingModal";
import { useUserStore } from "./frontend/store/userStore";

const drawerWidth = 60;

const App = () => {
  const {
    isLoggedIn,
    listenAuthState,
    authHydrated,
    authLoading,
    loading,
  } = useUserStore();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const isOnboarding = location.pathname === "/profile-onboarding";

  useEffect(() => {
    const unsubscribe = listenAuthState();
    return () => unsubscribe();
  }, [listenAuthState]);

  // Show auth loading until Firebase is ready
  if (!authHydrated || authLoading) {
    return <LoadingModal message="Waking up the dragon..." />;
  }

  // Determine which nav components to show - NavBar has been removed
  const showSidebar = isLoggedIn && !isMobile && !isOnboarding;
  const showMobileNav = isLoggedIn && isMobile && !isOnboarding;

  return (
    <>
      <CssBaseline />
      {loading && <LoadingModal message="Just a moment..." />}

      <Box sx={{ display: "flex" }}>
        {showSidebar && <Sidebar />}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "background.default",
            ml: showSidebar ? `${drawerWidth}px` : 0,
            pb: showMobileNav ? 10 : 0,
            transition: theme.transitions.create(["margin-left", "padding-bottom"]),
          }}
        >
          <AppRoutes />
        </Box>

        {showMobileNav && <MobileBottomNavigation />}
      </Box>
    </>
  );
};

export default App;