// src/frontend/pages/Non-Authenticated/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Moon, AlertCircle, Loader2, Sun, Mail, Zap } from "lucide-react";
import { login, resetPassword, signInWithGoogle } from "../../../firebase";
import { useUserStore } from "../../store/userStore";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// --- Framer Motion Variants ---
const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15, duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const STAGGER_CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Slightly faster stagger
    },
  },
};

// --- Reusable Motion Components ---
const MotionButton = motion(Button);
const MotionAlert = motion(Alert);
const MotionLink = motion(Link);

const GoogleIcon = (props) => (
  <svg role="img" viewBox="0 0 24 24" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const ResetPasswordModal = ({ open, onOpenChange }) => {
  // ... (Modal code remains the same, it's already well-contained)
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleReset = async () => {
    if (!email) { setError("Please enter your email address."); return; }
    setIsLoading(true); setError("");
    try {
      await resetPassword(email);
      toast({ title: "Check your email", description: `A password reset link was sent to ${email}.` });
      onOpenChange(false);
    } catch {
      setError("Failed to send reset email. Please verify the address and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (!open) { setEmail(""); setError(""); setIsLoading(false); } }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>Forgot password</DialogTitle><DialogDescription>Enter your email and we'll send you a link to reset it.</DialogDescription></DialogHeader>
        <div className="py-4 space-y-4">
          <AnimatePresence>
            {error && (
              <MotionAlert variant="destructive" role="alert" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <AlertDescription>{error}</AlertDescription>
              </MotionAlert>
            )}
          </AnimatePresence>
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="reset-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" autoComplete="email" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
          <Button onClick={handleReset} disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send reset link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AuthLayout = ({ children }) => {
  const { toggleTheme } = useUserStore();
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* KEY FIX #1: Wrap children in AnimatePresence for clean mount/unmount */}
      <div className="relative flex items-center justify-center py-12 lg:py-0">
          <AnimatePresence mode="wait">
              {children}
          </AnimatePresence>
      </div>
      <div className="hidden bg-muted lg:flex flex-col items-center justify-center text-center p-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}>
          <Zap className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold tracking-tight">Launch your vision, faster.</h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">Our production-ready boilerplate handles the essentials, so you can focus on building what makes your product unique.</p>
        </motion.div>
      </div>
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </div>
  );
};

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isResetModalOpen, setResetModalOpen] = useState(false);

  const navigate = useNavigate();
  const { isLoggedIn, profile } = useUserStore();
  
  useEffect(() => {
    if (isLoggedIn) {
      const redirectTo = profile?.fully_onboarded ? "/dashboard" : "/profile-onboarding";
      navigate(redirectTo, { replace: true });
    }
  }, [isLoggedIn, profile, navigate]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const errors = {};
    if (!email) errors.email = "Email is required.";
    if (!password) errors.password = "Password is required.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      const messages = { "auth/user-not-found": "No account found with this email.", "auth/wrong-password": "Incorrect password. Please try again.", "auth/invalid-credential": "Incorrect email or password." };
      setError(messages[err?.code] || "Login failed. Please check your credentials.");
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => { /* ... (logic unchanged) ... */ };

  return (
    <AuthLayout>
      <motion.div
        key="login-form" // KEY FIX #2: Add a unique key
        className="mx-auto grid w-[350px] gap-6"
        variants={STAGGER_CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div variants={FADE_UP_VARIANTS} className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-balance text-muted-foreground">Enter your email below to login to your account</p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <MotionAlert variants={FADE_UP_VARIANTS} variant="destructive" role="alert">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </MotionAlert>
          )}
        </AnimatePresence>

        {/* KEY FIX #3: Use a regular <form> and animate its children */}
        <form onSubmit={handleLogin} className="grid gap-4">
          <motion.div variants={FADE_UP_VARIANTS} className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} className={cn("pl-9", fieldErrors.email && "border-destructive")} autoComplete="email"/>
            </div>
          </motion.div>
          <motion.div variants={FADE_UP_VARIANTS} className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Button type="button" variant="link" className="ml-auto inline-block h-auto p-0 text-sm underline" onClick={() => setResetModalOpen(true)}>Forgot your password?</Button>
            </div>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} className={cn(fieldErrors.password && "border-destructive")} autoComplete="current-password"/>
              <button type="button" className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
          <motion.div variants={FADE_UP_VARIANTS}>
            <MotionButton type="submit" className="w-full" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Signing In...' : 'Login'}
            </MotionButton>
          </motion.div>
          <motion.div variants={FADE_UP_VARIANTS}>
            <MotionButton variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
              Login with Google
            </MotionButton>
          </motion.div>
        </form>
        
        <motion.div variants={FADE_UP_VARIANTS} className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <MotionLink to="/signup" className="underline hover:no-underline transition-all" whileHover={{ letterSpacing: "0.2px" }}>
            Sign up
          </MotionLink>
        </motion.div>
      </motion.div>
      <ResetPasswordModal open={isResetModalOpen} onOpenChange={setResetModalOpen} />
    </AuthLayout>
  );
}