import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUserStore } from './frontend/store/userStore';
import { AppRouter } from './frontend/components/Router';
import { Sidebar } from './frontend/components/navigation/Sidebar';
import { MobileBottomNavigation } from './frontend/components/navigation/MobileBottomNavigation';
import { CommandPalette } from './frontend/components/CommandPalette';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export const App = () => {
  const {
    isLoggedIn,
    listenAuthState,
    isDarkMode,
    toggleTheme, // Pass this to Sidebar
    isSidebarExpanded,
    toggleCommandPalette,
  } = useUserStore();
  const location = useLocation();

  // Your useEffect hooks remain the same
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = listenAuthState();
    return () => unsubscribe();
  }, [listenAuthState]);

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommandPalette(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggleCommandPalette]);

  const showSidebar = isLoggedIn && !location.pathname.startsWith('/profile-onboarding');
  const showBottomNav = isLoggedIn && !location.pathname.startsWith('/profile-onboarding');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isLoggedIn && <CommandPalette />}
      
      <div className="flex flex-col md:flex-row flex-grow min-h-screen">
        {/* RENDER SIDEBAR PERSISTENTLY OUTSIDE THE ANIMATION */}
        {showSidebar && <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
        
        <main
          className={cn(
            'flex-grow transition-all duration-300 ease-in-out w-full', // Added w-full
            showSidebar && (isSidebarExpanded ? 'md:pl-64' : 'md:pl-[72px]'),
            showBottomNav ? 'pb-16 md:pb-0' : '',
          )}
        >
          {/* ANIMATE ONLY THE PAGE CONTENT INSIDE <main> */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname} // The key now only affects the page content
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <AppRouter />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* The bottom nav can stay here as it's for mobile only */}
        {showBottomNav && (
          <nav className="fixed bottom-0 left-0 right-0 md:hidden">
            <MobileBottomNavigation isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          </nav>
        )}
      </div>
    </div>
  );
};