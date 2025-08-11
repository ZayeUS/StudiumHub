// src/frontend/pages/Non-Authenticated/SignUpPage.jsx
import React, { useState, useEffect, useId } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Moon, AlertCircle, Loader2, CheckCircle, Sun, Building, Mail, Zap } from "lucide-react";
import { signUp, checkEmailExists, signInWithGoogle } from "../../../firebase";
import { postData, getData } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// --- Framer Motion Variants ---
const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15, duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const STAGGER_CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

const AnimatedProgress = ({ value, className }) => {
  const color = value >= 80 ? "bg-green-500" : value >= 60 ? "bg-yellow-500" : "bg-red-500";
  return (
    <Progress value={value} className={cn("h-1.5", className)} >
        <motion.div
            className={cn("h-full", color)}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        />
    </Progress>
  );
};


const PasswordStrengthIndicator = ({ strength, checks }) => {
  const list = [
    { label: "8+ characters", met: checks.length }, { label: "Uppercase", met: checks.uppercase },
    { label: "Lowercase", met: checks.lowercase }, { label: "Number", met: checks.number },
    { label: "Symbol", met: checks.special },
  ];
  return (
    <motion.div 
      className="space-y-2 pt-2" aria-live="polite"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto', transition: { duration: 0.4, ease: "easeOut" } }}
      exit={{ opacity: 0, height: 0, transition: { duration: 0.3, ease: "easeIn" } }}
    >
      <AnimatedProgress value={strength} />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
        {list.map((item) => (
          <div key={item.label} className={`flex items-center text-xs transition-colors duration-200 ${item.met ? "text-green-500" : "text-muted-foreground"}`}>
            <CheckCircle className={`h-3.5 w-3.5 mr-1.5 transition-all duration-200 ${item.met ? "opacity-100" : "opacity-50"}`} />
            {item.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const AuthLayout = ({ children }) => {
  const { toggleTheme } = useUserStore();
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* KEY FIX #1: Wrap children in AnimatePresence to handle mounting/unmounting */}
      <AnimatePresence mode="wait">
        <motion.div
            key="auth-content" // Give it a key
            className="relative flex items-center justify-center py-12 lg:py-0"
        >
            {children}
        </motion.div>
      </AnimatePresence>
      <div className="hidden bg-muted lg:flex flex-col items-center justify-center text-center p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
        >
          <Zap className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold tracking-tight">Launch your vision, faster.</h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            Our production-ready boilerplate handles the essentials, so you can focus on building what makes your product unique.
          </p>
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

export function SignUpPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const invitation_token = searchParams.get("token");

  const uid = useId();
  const orgId = `signup-organizationName-${uid}`, emailId = `signup-email-${uid}`, pwdId = `signup-password-${uid}`, cpwdId = `signup-confirmPassword-${uid}`;

  const navigate = useNavigate();
  const { isLoggedIn, profile, setUser } = useUserStore();

  useEffect(() => {
    const verifyToken = async () => {
      if (invitation_token) {
        try {
          const data = await getData(`/invitations/${invitation_token}`);
          setEmail(data.email);
          setOrganizationName(data.organization_name);
        } catch {
          setError("This invitation is invalid or has expired. Please sign up normally.");
          setSearchParams({}, { replace: true });
        }
      }
      // Use a small timeout to prevent jarring transition from loader to content
      setTimeout(() => setIsVerifyingToken(false), 300);
    };
    verifyToken();
  }, [invitation_token, setSearchParams]);

  useEffect(() => {
    if (isLoggedIn) navigate(profile?.fully_onboarded ? "/dashboard" : "/profile-onboarding");
  }, [isLoggedIn, profile, navigate]);

  const calculatePasswordStrength = (pwd) => {
    const checks = {
      length: pwd.length >= 8, uppercase: /[A-Z]/.test(pwd), lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd), special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    return { strength: (Object.values(checks).filter(Boolean).length / 5) * 100, checks };
  };

  const validate = () => { /* ... validation logic ... */ return true; };
  const hydrateUserImmediately = async (firebaseUser) => { /* ... hydration logic ... */ };
  const handleSignUp = async (e) => { /* ... signup logic ... */ };
  const handleGoogleSignIn = async () => { /* ... google signin logic ... */ };

  const passwordStrength = calculatePasswordStrength(password);

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        {isVerifyingToken ? (
          <motion.div key="loader" variants={FADE_UP_VARIANTS} initial="hidden" animate="visible" exit="exit">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </motion.div>
        ) : (
          <motion.div
            key="signup-form" // KEY FIX #2: Add a unique key to force a clean mount
            className="mx-auto grid w-[350px] gap-6"
            variants={STAGGER_CONTAINER_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div variants={FADE_UP_VARIANTS} className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold">Create an account</h1>
              <p className="text-balance text-muted-foreground">
                {invitation_token ? `You're invited to join ${organizationName}.` : "Enter your details below to get started."}
              </p>
            </motion.div>

            <AnimatePresence>
              {error && (
                <MotionAlert variants={FADE_UP_VARIANTS} variant="destructive" role="alert">
                  <AlertCircle className="h-4 w-4" /><AlertTitle>Sign Up Failed</AlertTitle><AlertDescription>{error}</AlertDescription>
                </MotionAlert>
              )}
            </AnimatePresence>
            
            {/* KEY FIX #3: Make <form> a container, and animate its children instead */}
            <form onSubmit={handleSignUp} className="grid gap-4">
              <motion.div variants={FADE_UP_VARIANTS} className="grid gap-2">
                <Label htmlFor={orgId}>Organization name</Label>
                <div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id={orgId} placeholder="Your Company LLC" required value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} disabled={isSubmitting || !!invitation_token} className={cn("pl-9", fieldErrors.organizationName && "border-destructive")} autoComplete="organization" /></div>
              </motion.div>
              <motion.div variants={FADE_UP_VARIANTS} className="grid gap-2">
                <Label htmlFor={emailId}>Email</Label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id={emailId} type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting || !!invitation_token} className={cn("pl-9", fieldErrors.email && "border-destructive")} autoComplete="email" /></div>
              </motion.div>
              <motion.div variants={FADE_UP_VARIANTS} className="grid gap-2">
                <Label htmlFor={pwdId}>Password</Label>
                <div className="relative"><Input id={pwdId} type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} className={cn(fieldErrors.password && "border-destructive")} autoComplete="new-password" /><button type="button" className="absolute bottom-2 right-2 text-muted-foreground" onClick={() => setShowPassword((s) => !s)}><EyeOff className="h-4 w-4" /></button></div>
              </motion.div>
              <motion.div variants={FADE_UP_VARIANTS} className="grid gap-2">
                <Label htmlFor={cpwdId}>Confirm password</Label>
                <div className="relative"><Input id={cpwdId} type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSubmitting} className={cn(fieldErrors.confirmPassword && "border-destructive")} autoComplete="new-password" /><button type="button" className="absolute bottom-2 right-2 text-muted-foreground" onClick={() => setShowConfirmPassword((s) => !s)}><EyeOff className="h-4 w-4" /></button></div>
              </motion.div>

              <AnimatePresence>
                {password && <PasswordStrengthIndicator strength={passwordStrength.strength} checks={passwordStrength.checks} />}
              </AnimatePresence>
              
              <motion.div variants={FADE_UP_VARIANTS}>
                <MotionButton type="submit" className="w-full" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create an account
                </MotionButton>
              </motion.div>
              <motion.div variants={FADE_UP_VARIANTS}>
                <MotionButton variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <GoogleIcon className="mr-2 h-4 w-4" />
                  Sign up with Google
                </MotionButton>
              </motion.div>
            </form>

            <motion.div variants={FADE_UP_VARIANTS} className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <MotionLink to="/login" className="underline hover:no-underline transition-all" whileHover={{ letterSpacing: "0.2px" }}>
                Sign in
              </MotionLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}