// src/frontend/pages/Non-Authenticated/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Moon, Key, AlertCircle, Loader2, Sun, ArrowLeft, Mail } from "lucide-react";
import { login, resetPassword, signInWithGoogle } from "../../../firebase";
import { useUserStore } from "../../store/userStore";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1, transition: { duration: 0.3, delay: 0.1 } },
  out: { opacity: 0, transition: { duration: 0.2 } },
};
const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
const formItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } },
};
const shakeVariants = {
  shake: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.45 } },
};

const ResetPasswordModal = ({ open, onOpenChange }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleReset = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await resetPassword(email);
      toast({
        title: "Check your email",
        description: `A password reset link was sent to ${email}.`,
      });
      onOpenChange(false);
    } catch {
      setError("Failed to send reset email. Please verify the address and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setEmail("");
      setError("");
      setIsLoading(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Forgot password</DialogTitle>
          <DialogDescription>
            Enter your email and we’ll send you a link to reset it.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                autoComplete="email"
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
            Send reset link
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
    return () => document.body.classList.remove("auth-page-gradient");
  }, []);

  useEffect(() => {
    // Don't do anything until auth is hydrated and we have a profile value
    if (!authHydrated || profile === undefined) return;
  
    if (isLoggedIn && profile) {
      // Navigate only after both auth and profile are loaded
      navigate(profile.fully_onboarded ? "/dashboard" : "/profile-onboarding");
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
      setError(messages[err?.code] || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      // onAuthStateChanged will handle navigation
    } catch (err) {
      if (err?.code === "auth/account-exists-with-different-credential") {
        setError("An account already exists with this email. Please sign in with your password instead.");
      } else if (err?.code === "auth/popup-closed-by-user") {
        // silent cancel
      } else {
        setError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authHydrated) return null;

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4 overflow-hidden"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      {/* Back to home */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/" className="absolute top-4 left-4">
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" aria-label="Back to home">
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

      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.8, type: "spring" }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isDarkMode ? "moon" : "sun"}
                      initial={{ y: -16, opacity: 0, rotate: -20 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: 16, opacity: 0, rotate: 20 }}
                      transition={{ duration: 0.18 }}
                    >
                      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </motion.div>
                  </AnimatePresence>
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Switch to {isDarkMode ? "Light" : "Dark"} Mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <motion.div className="w-full max-w-md" variants={formContainerVariants} initial="hidden" animate="visible">
        <Card>
          <CardHeader className="text-center">
            <motion.div variants={formItemVariants} className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
              <CardDescription>Sign in to your organization’s workspace.</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            {/* Live region for errors */}
            <div aria-live="polite" aria-atomic="true">
              <AnimatePresence>
                {error && (
                  <motion.div variants={shakeVariants} animate="shake">
                    <Alert variant="destructive" className="mb-4" role="alert">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Login failed</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div variants={formItemVariants} className="space-y-4">
              <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting} aria-label="Continue with Google">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
            </motion.div>

            <form onSubmit={handleLogin} className="space-y-4 mt-4" noValidate>
              <motion.div variants={formItemVariants}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="pl-9"
                      autoComplete="email"
                      inputMode="email"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={formItemVariants}>
                <div className="space-y-2 relative">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Button
                      type="button"
                      variant="link"
                      className="text-xs h-auto p-0 text-muted-foreground"
                      onClick={() => setResetModalOpen(true)}
                    >
                      Forgot?
                    </Button>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-pressed={showPassword}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={formItemVariants}>
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting} aria-disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
              </motion.div>

              <motion.p variants={formItemVariants} className="text-center text-sm text-muted-foreground pt-4">
                Don’t have an account?{" "}
                <Link to="/signup" className="font-semibold text-primary hover:underline underline-offset-4">
                  Sign up
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
