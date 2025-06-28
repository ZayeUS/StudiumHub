import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Menu, LogOut, UserCircle, Moon, Sun } from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import { cn } from "@/lib/utils";

// Shadcn UI Components for the drawer
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const MobileBottomNavigation = ({ isDarkMode, toggleTheme }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { clearUser } = useUserStore();

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearUser();
      navigate("/");
      setDrawerOpen(false);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navItems = [
    { label: "Home", path: "/dashboard", icon: <Home className="h-6 w-6" /> },
    { label: "Menu", action: () => setDrawerOpen(true), icon: <Menu className="h-6 w-6" /> },
  ];
  
  const drawerMenuItems = [
    { label: "Profile", icon: <UserCircle className="h-5 w-5" />, path: "/user-profile" }
  ];

  return (
    <>
      {/* Main Persistent Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-background border-t">
        <div className="grid h-full grid-cols-2 mx-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action || (() => handleNavigation(item.path))}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 hover:bg-muted font-medium",
                pathname === item.path ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Expandable Menu Drawer (from bottom) */}
      <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="bottom" className="rounded-t-lg">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <nav className="flex flex-col space-y-1">
              {drawerMenuItems.map((item) => (
                <Button
                  key={item.label}
                  variant={pathname === item.path ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>
              ))}
              <Separator className="my-2" />
               <Button variant="ghost" className="justify-start" onClick={toggleTheme}>
                  {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <span className="ml-2">{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
               </Button>
              <Separator className="my-2" />
              <Button variant="ghost" className="justify-start text-destructive hover:text-destructive" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="ml-2">Logout</span>
              </Button>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};