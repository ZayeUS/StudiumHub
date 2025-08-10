// src/frontend/components/navigation/Sidebar.jsx
import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, LogOut, Sun, Moon, ChevronLeft, ChevronRight, Settings, Building
} from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../../../firebase';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// shadcn components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

// Animation Variants
const sidebarVariants = {
  expanded: { width: '16rem' },
  collapsed: { width: '4.5rem' }
};
const navItemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: { opacity: 1, x: 0 }
};
const getInitials = (name = '') => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

const NavItem = ({ to, icon: Icon, label, isExpanded }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <TooltipProvider delayDuration={isExpanded ? 500 : 0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink to={to} end>
            <motion.div
              whileTap={{ scale: 0.97 }}
              className={cn(
                'relative flex items-center h-10 rounded-lg text-muted-foreground transition-colors w-full font-medium overflow-hidden',
                'hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-primary/10 text-primary',
                isExpanded ? 'px-3 justify-start' : 'px-3 justify-center'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r"
                />
              )}
              <Icon className="w-5 h-5 z-10" />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    variants={navItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="ml-3 truncate z-10"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </NavLink>
        </TooltipTrigger>
        {!isExpanded && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
};

export const Sidebar = ({ isDarkMode, toggleTheme }) => {
  const { profile, organization, clearUser, role, isSidebarExpanded, setIsSidebarExpanded } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // *** THE FIX IS HERE ***
    // 1. Navigate to the login page first.
    navigate('/login'); 
    
    // 2. Then, sign out from Firebase and clear the user state.
    await firebaseSignOut(auth);
    clearUser();
  };

  const navItems = [{ label: 'Dashboard', to: '/dashboard', icon: Home }];
  if (role === 'admin') {
    navItems.push({ label: 'Organization', to: '/organization', icon: Building });
  }

  return (
    <motion.aside
      initial={false}
      animate={isSidebarExpanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      className="hidden md:flex fixed top-0 left-0 h-full flex-col bg-card border-r z-50 p-2"
    >
      {/* Top */}
      <div className="flex flex-col justify-between h-full">
        <div>
          {/* Workspace */}
          <div className="flex items-center h-14 mb-2">
            <div className="flex items-center w-full">
              <div className="flex items-center p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                    {getInitials(organization?.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <AnimatePresence>
                {isSidebarExpanded && (
                  <motion.div
                    variants={navItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="font-bold text-md ml-2 truncate"
                  >
                    {organization?.name || 'Your Workspace'}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <motion.nav
            layout
            className="flex flex-col space-y-1"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.05, delayChildren: 0.3 }}
          >
            {navItems.map((item) => (
              <NavItem key={item.to} {...item} isExpanded={isSidebarExpanded} />
            ))}
          </motion.nav>
        </div>

        {/* Bottom */}
        <div className="flex flex-col space-y-1">
          <Separator className="my-2" />
          {/* Profile */}
          <TooltipProvider delayDuration={isSidebarExpanded ? 500 : 0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/user-profile">
                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center h-14 rounded-lg hover:bg-accent w-full p-2"
                  >
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback>{profile?.first_name?.[0] ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <AnimatePresence>
                      {isSidebarExpanded && (
                        <motion.div
                          variants={navItemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          transition={{ duration: 0.2, delay: 0.1 }}
                          className="ml-3 text-left overflow-hidden"
                        >
                          <p className="text-sm font-semibold truncate">{profile?.first_name} {profile?.last_name}</p>
                          <p className="text-xs text-muted-foreground">View Profile</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              </TooltipTrigger>
              {!isSidebarExpanded && <TooltipContent side="right">Profile</TooltipContent>}
            </Tooltip>
          </TooltipProvider>

          {/* Theme & Logout */}
          <div className="flex items-center justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={toggleTheme}>
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <AnimatePresence>
              {isSidebarExpanded && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Separator orientation="vertical" className="h-6" />
                </motion.div>
              )}
            </AnimatePresence>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Logout</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Collapse Button */}
      <div className="absolute top-1/2 -right-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isSidebarExpanded ? 'left' : 'right'}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isSidebarExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </motion.div>
                  </AnimatePresence>
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>{isSidebarExpanded ? 'Collapse' : 'Expand'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.aside>
  );
};
