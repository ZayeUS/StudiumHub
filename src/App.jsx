import React, { useEffect } from 'react';
import { useUserStore } from './frontend/store/userStore';
import { AppRouter } from './frontend/components/Router'; // <-- This is our main router now
import { Sidebar } from './frontend/components/navigation/Sidebar';
import { MobileBottomNavigation } from './frontend/components/navigation/MobileBottomNavigation';
import { CommandPalette } from './frontend/components/CommandPalette';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

export const App = () => {
  const {
    isLoggedIn,
    listenAuthState,
    isDarkMode,
    toggleTheme,
    isSidebarExpanded,
    toggleCommandPalette,
  } = useUserStore();
  const location = useLocation();

  // All your existing useEffect hooks stay the same...
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
        {showSidebar && <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
        
        <main
          className={cn(
            'flex-grow transition-all duration-300 ease-in-out w-full',
            showSidebar && (isSidebarExpanded ? 'md:pl-64' : 'md:pl-[72px]'),
            showBottomNav ? 'pb-16 md:pb-0' : '',
          )}
        >
          {/* We only render the AppRouter here. No animations. */}
          <AppRouter />
        </main>

        {showBottomNav && (
          <nav className="fixed bottom-0 left-0 right-0 md:hidden">
            <MobileBottomNavigation isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          </nav>
        )}
      </div>
    </div>
  );
};