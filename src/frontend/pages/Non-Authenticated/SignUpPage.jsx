import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Moon, UserPlus, AlertCircle, Loader2, CheckCircle, Sun } from "lucide-react";
import { signUp, checkEmailExists } from "../../../firebase";
import { postData } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Main container animation variants
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
  out: { opacity: 0, transition: { duration: 0.3 } },
};

// Staggered list variants for the form elements
const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.4,
    },
  },
};

// Animation for each form item
const formItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

// Shake animation for the error alert
const shakeVariants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  },
};

const PasswordStrengthIndicator = ({ strength, checks }) => {
  const getStrengthColor = () => {
    if (strength >= 80) return 'bg-green-500';
    if (strength >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const strengthChecks = [
      { label: "8+ characters", met: checks.length },
      { label: "Uppercase", met: checks.uppercase },
      { label: "Lowercase", met: checks.lowercase },
      { label: "Number", met: checks.number },
      { label: "Symbol", met: checks.special },
  ];

  return (
    <motion.div variants={formItemVariants} className="space-y-2 pt-2">
      <Progress value={strength} className={`h-1.5 [&>div]:${getStrengthColor()}`} />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
        {strengthChecks.map(item => (
          <div key={item.label} className={`flex items-center text-xs transition-colors ${item.met ? 'text-green-500' : 'text-muted-foreground'}`}>
            <CheckCircle className={`h-3.5 w-3.5 mr-1.5 transition-all ${item.met ? 'opacity-100' : 'opacity-50'}`} />
            {item.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();
  const { isLoggedIn, setUser, profile, authHydrated, isDarkMode, toggleTheme } = useUserStore();
  
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

  const calculatePasswordStrength = (pwd) => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    const passed = Object.values(checks).filter(Boolean).length;
    return { strength: (passed / 5) * 100, checks };
  };
  
  const validate = () => {
    const errors = {};
    const pwdStrength = calculatePasswordStrength(password);
    if (!email) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Please enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    else if (pwdStrength.strength < 80) errors.password = "Please create a stronger password.";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (await checkEmailExists(email)) {
        setFieldErrors({ email: "An account with this email already exists." });
        setIsSubmitting(false);
        return;
      }
      const userCredential = await signUp(email, password);
      const backendUser = await postData("/users", {
        firebase_uid: userCredential.user.uid,
        email: userCredential.user.email,
      });
      setUser(userCredential.user.uid, backendUser.user.user_id);
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const passwordStrength = calculatePasswordStrength(password);

  if (!authHydrated) return null;

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4 overflow-hidden"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
    >
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
        className="w-full max-w-sm"
        variants={formContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card>
            <CardHeader className="text-center">
                 <motion.div variants={formItemVariants} className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
                    <CardDescription>Join the future of AI-powered SaaS.</CardDescription>
                </motion.div>
            </CardHeader>
            <CardContent>
                <AnimatePresence>
                {error && (
                    <motion.div variants={shakeVariants} animate="shake">
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Sign Up Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    </motion.div>
                )}
                </AnimatePresence>
                
                <form onSubmit={handleSignUp} className="space-y-4">
                <motion.div variants={formItemVariants}>
                    <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
                    {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
                    </div>
                </motion.div>

                <motion.div variants={formItemVariants}>
                    <div className="space-y-2 relative">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} />
                    <button type="button" className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {fieldErrors.password && <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>}
                    </div>
                </motion.div>

                <motion.div variants={formItemVariants}>
                    <div className="space-y-2 relative">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSubmitting}/>
                         <button type="button" className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        {fieldErrors.confirmPassword && <p className="text-xs text-destructive mt-1">{fieldErrors.confirmPassword}</p>}
                    </div>
                </motion.div>

                {password && <PasswordStrengthIndicator strength={passwordStrength.strength} checks={passwordStrength.checks} />}

                <motion.div variants={formItemVariants}>
                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Create Account'}
                    </Button>
                </motion.div>

                <motion.p variants={formItemVariants} className="text-center text-sm text-muted-foreground pt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-primary hover:underline underline-offset-4">
                    Sign In
                    </Link>
                </motion.p>
                </form>
            </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}