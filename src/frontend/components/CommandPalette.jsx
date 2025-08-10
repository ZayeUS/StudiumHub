// src/frontend/components/CommandPalette.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { Home, User, Building, LogOut, Moon, Sun } from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export function CommandPalette() {
  const navigate = useNavigate();
  const { 
    isCommandPaletteOpen, 
    toggleCommandPalette,
    role,
    isDarkMode,
    toggleTheme,
    clearUser
  } = useUserStore();

  const runCommand = (command) => {
    command();
    toggleCommandPalette(false);
  };

  const handleLogout = async () => {
    // *** THE FIX IS HERE ***
    // 1. Navigate to the login page first.
    navigate('/login');

    // 2. Then, sign out from Firebase and clear the user state.
    await signOut(auth);
    clearUser();
  };

  const isAdmin = role === 'admin';

  return (
    <CommandDialog open={isCommandPaletteOpen} onOpenChange={toggleCommandPalette}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard'))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Go to Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/user-profile'))}>
            <User className="mr-2 h-4 w-4" />
            <span>Go to Profile</span>
          </CommandItem>
          {isAdmin && (
            <CommandItem onSelect={() => runCommand(() => navigate('/organization'))}>
              <Building className="mr-2 h-4 w-4" />
              <span>Go to Organization</span>
            </CommandItem>
          )}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(toggleTheme)}>
            {isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>Toggle Theme</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(handleLogout)}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
