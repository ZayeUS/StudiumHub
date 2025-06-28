import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  User,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../../../firebase';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// shadcn components
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

// Animation Variants
const sidebarVariants = {
  expanded: { width: '15rem' }, // 240px
  collapsed: { width: '5rem' }  // 80px
};

const navItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

const NavItem = ({ to, icon: Icon, label, isExpanded }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink to={to} end>
            <motion.div
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex items-center h-10 rounded-md text-muted-foreground transition-colors w-full',
                'hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
                isExpanded ? 'px-3 justify-start' : 'px-3 justify-center'
              )}
            >
              <Icon className="w-5 h-5" />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    variants={navItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="ml-4 truncate"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </NavLink>
        </TooltipTrigger>
        {!isExpanded && (
          <TooltipContent side="right" sideOffset={8}>
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export const Sidebar = ({ isDarkMode, toggleTheme }) => {
  const { profile, clearUser } = useUserStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await firebaseSignOut(auth);
    clearUser();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: Home },
    // Add more items here as your app grows
  ];

  const bottomItems = [
    {
      label: 'Theme',
      icon: isDarkMode ? Sun : Moon,
      onClick: toggleTheme,
      tooltip: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'
    },
    {
      label: 'Log out',
      icon: LogOut,
      onClick: handleLogout,
      tooltip: 'Log out',
      isDestructive: true
    }
  ]

  return (
    <motion.aside
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      className="hidden md:flex fixed top-0 left-0 h-full flex-col bg-card border-r z-50"
    >
      {/* Sidebar Content */}
      <div className="flex flex-col justify-between h-full p-2">
        {/* Top Section */}
        <div>
          {/* Header */}
          <div className="flex items-center h-14 mb-2">
            <motion.div
              className="flex items-center w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Link to="/dashboard" className="flex items-center p-2">
                <Zap className="w-8 h-8 text-primary" />
              </Link>
              <AnimatePresence>
                 {isExpanded && (
                    <motion.span 
                      variants={navItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="font-bold text-lg ml-2"
                    >SaaSify</motion.span>
                 )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Main Navigation Links */}
          <motion.nav
            layout
            className="flex flex-col space-y-1"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.05, delayChildren: 0.3 }}
          >
            {navItems.map((item) => (
              <NavItem key={item.to} {...item} isExpanded={isExpanded} />
            ))}
          </motion.nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col space-y-1">
          <Separator className="my-2" />
          
          {/* Profile Link */}
          <TooltipProvider delayDuration={0}>
              <Tooltip>
                  <TooltipTrigger asChild>
                       <Link to="/user-profile" className="w-full">
                          <motion.div
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center h-14 rounded-md hover:bg-accent w-full p-2"
                          >
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={profile?.avatar_url} />
                              <AvatarFallback>{profile?.first_name?.[0] ?? 'U'}</AvatarFallback>
                            </Avatar>
                             <AnimatePresence>
                                {isExpanded && (
                                <motion.div 
                                    variants={navItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    transition={{ duration: 0.2, delay: 0.1 }}
                                    className="ml-3 text-left"
                                >
                                    <p className="text-sm font-semibold truncate">{profile?.first_name} {profile?.last_name}</p>
                                    <p className="text-xs text-muted-foreground">View Profile</p>
                                </motion.div>
                                )}
                            </AnimatePresence>
                          </motion.div>
                       </Link>
                  </TooltipTrigger>
                   {!isExpanded && (
                        <TooltipContent side="right" sideOffset={8}>
                            Profile
                        </TooltipContent>
                    )}
              </Tooltip>
          </TooltipProvider>

          {/* Bottom Actions */}
          {bottomItems.map(item => (
            <TooltipProvider key={item.label} delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                            <Button 
                                variant="ghost" 
                                className={cn(
                                    "w-full justify-start h-10",
                                    item.isDestructive && "text-destructive hover:text-destructive hover:bg-destructive/10",
                                    !isExpanded && "justify-center w-10 px-0"
                                )}
                                onClick={item.onClick}
                            >
                                <item.icon className="w-5 h-5" />
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.span 
                                      variants={navItemVariants}
                                      initial="hidden"
                                      animate="visible"
                                      exit="hidden"
                                      transition={{ duration: 0.2, delay: 0.1 }}
                                      className="ml-4 truncate"
                                    >
                                      {item.label}
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                            </Button>
                        </motion.div>
                    </TooltipTrigger>
                    {!isExpanded && (
                        <TooltipContent side="right" sideOffset={8}>
                            {item.tooltip}
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
          ))}
          
        </div>
      </div>

       {/* Expander/Collapser Button */}
      <div className="absolute top-1/2 -right-4">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
                <motion.div whileTap={{ scale: 0.9 }} >
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={isExpanded ? 'left' : 'right'}
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </motion.div>
                        </AnimatePresence>
                    </Button>
                </motion.div>
            </TooltipTrigger>
             <TooltipContent side="right" sideOffset={5}>
                {isExpanded ? 'Collapse' : 'Expand'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

    </motion.aside>
  );
};
