// src/frontend/pages/Non-Authenticated/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Moon, Key, AlertCircle, Loader2, Sun, ArrowLeft, Mail } from "lucide-react";
import { login, resetPassword } from "../../../firebase";
import { useUserStore } from "../../store/userStore";
import { useToast } from "@/components/ui/use-toast";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Animation Variants
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
  out: { opacity: 0, transition: { duration: 0.3 } },
};
const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
};
const formItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } },
};
const shakeVariants = {
  shake: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.5 } },
};

// Reset Password Modal Component
const ResetPasswordModal = ({ open, onOpenChange }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { toast } = useToast();

    const handleReset = async () => {
        if (!email) {
            setError('Please enter your email address.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await resetPassword(email);
            toast({
                title: "Check Your Email",
                description: `A password reset link has been sent to ${email}.`,
            });
            onOpenChange(false); // Close modal on success
        } catch (err) {
            setError('Failed to send reset email. Please check the address and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!open) {
            setEmail('');
            setError('');
            setIsLoading(false);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Forgot Password</DialogTitle>
                    <DialogDescription>
                        No problem. Enter your email address and we'll send you a link to reset it.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                    <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="reset-email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isLoading}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleReset} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Reset Link
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isResetModalOpen, setResetModalOpen] = useState(false);

  const navigate = useNavigate();
  const { isLoggedIn, profile, authHydrated, isDarkMode, toggleTheme } = useUserStore();

  useEffect(() => {
    document.body.classList.add("auth-page-gradient");
    return () => {
      document.body.classList.remove("auth-page-gradient");
    };
  }, []);

  useEffect(() => {
    if (authHydrated && isLoggedIn) {
      navigate(profile?.fully_onboarded ? "/dashboard" : "/profile-onboarding");
    }
  }, [isLoggedIn, profile, navigate, authHydrated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter an email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      const messages = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-credential": "Incorrect email or password.",
      };
      setError(messages[err.code] || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authHydrated) {
    return null;
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4 overflow-hidden"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link to="/" className="absolute top-4 left-4">
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.2 }}>
                             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    </Link>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Back to Home</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

      <div className="absolute top-4 right-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, type: "spring" }}
              >
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isDarkMode ? "moon" : "sun"}
                      initial={{ y: -20, opacity: 0, rotate: -30 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: 20, opacity: 0, rotate: 30 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </motion.div>
                  </AnimatePresence>
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Switch to {isDarkMode ? 'Light' : 'Dark'} Mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <motion.div
        className="w-full max-w-md"
        variants={formContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card>
            <CardHeader className="text-center">
                 <motion.div variants={formItemVariants} className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Key className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
                    <CardDescription>Sign in to your organization's workspace.</CardDescription>
                </motion.div>
            </CardHeader>
            <CardContent>
                <AnimatePresence>
                    {error && (
                        <motion.div variants={shakeVariants} animate="shake">
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Login Failed</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleLogin} className="space-y-4">
                    <motion.div variants={formItemVariants}>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} className="pl-9" />
                            </div>
                        </div>
                    </motion.div>
                    <motion.div variants={formItemVariants}>
                        <div className="space-y-2 relative">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password">Password</Label>
                                <Button type="button" variant="link" className="text-xs h-auto p-0 text-muted-foreground" onClick={() => setResetModalOpen(true)}>Forgot?</Button>
                            </div>
                            <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} />
                            <button type="button" className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </motion.div>
                    
                    <motion.div variants={formItemVariants}>
                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Sign In'}
                        </Button>
                    </motion.div>

                    <motion.p variants={formItemVariants} className="text-center text-sm text-muted-foreground pt-4">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-semibold text-primary hover:underline underline-offset-4">
                                Sign Up
                            </Link>
                        </motion.p>
                </form>
            </CardContent>
        </Card>
      </motion.div>
      <ResetPasswordModal open={isResetModalOpen} onOpenChange={setResetModalOpen} />
    </motion.div>
  );
}