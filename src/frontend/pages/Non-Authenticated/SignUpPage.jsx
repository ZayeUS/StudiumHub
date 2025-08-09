// src/frontend/pages/Non-Authenticated/SignUpPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Moon, UserPlus, AlertCircle, Loader2, CheckCircle, Sun, Building, Mail } from "lucide-react";
import { signUp, checkEmailExists, signInWithGoogle } from "../../../firebase";
import { postData, getData } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

const PasswordStrengthIndicator = ({ strength, checks }) => {
  const color = strength >= 80 ? "bg-green-500" : strength >= 60 ? "bg-yellow-500" : "bg-red-500";
  const list = [
    { label: "8+ characters", met: checks.length },
    { label: "Uppercase", met: checks.uppercase },
    { label: "Lowercase", met: checks.lowercase },
    { label: "Number", met: checks.number },
    { label: "Symbol", met: checks.special },
  ];
  return (
    <motion.div variants={formItemVariants} className="space-y-2 pt-2" aria-live="polite">
      <Progress value={strength} className={`h-1.5 [&>div]:${color}`} />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
        {list.map((item) => (
          <div
            key={item.label}
            className={`flex items-center text-xs transition-colors ${item.met ? "text-green-500" : "text-muted-foreground"}`}
          >
            <CheckCircle className={`h-3.5 w-3.5 mr-1.5 transition-all ${item.met ? "opacity-100" : "opacity-50"}`} />
            {item.label}
          </div>
        ))}
      </div>
    </motion.div>
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

  const navigate = useNavigate();
  const { isLoggedIn, profile, authHydrated, isDarkMode, toggleTheme } = useUserStore();

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
      setIsVerifyingToken(false);
    };
    verifyToken();
  }, [invitation_token, setSearchParams]);

  useEffect(() => {
    document.body.classList.add("auth-page-gradient");
    return () => document.body.classList.remove("auth-page-gradient");
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
    if (!organizationName.trim()) errors.organizationName = "Organization name is required.";
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
      if (!invitation_token && (await checkEmailExists(email))) {
        setFieldErrors({ email: "An account with this email already exists." });
        setIsSubmitting(false);
        return;
      }
      const userCredential = await signUp(email, password);
      await postData("/users", {
        firebase_uid: userCredential.user.uid,
        email: userCredential.user.email,
        invitation_token: invitation_token,
        organization_name: organizationName,
      });
      // onAuthStateChanged handles navigation/user state
    } catch (err) {
      setError(err?.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!organizationName.trim() && !invitation_token) {
      setFieldErrors({ organizationName: "Organization name is required to sign up." });
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithGoogle();
      await postData("/users", {
        firebase_uid: userCredential.user.uid,
        email: userCredential.user.email,
        invitation_token: invitation_token,
        organization_name: organizationName,
      });
    } catch (err) {
      if (err?.code === "auth/account-exists-with-different-credential") {
        setError("An account with this email already exists. Please log in with your original method.");
      } else if (err?.code === "auth/popup-closed-by-user") {
        // silent cancel
      } else {
        setError(err?.message || "Failed to sign up with Google. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(password);

  if (!authHydrated || isVerifyingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4 overflow-hidden"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
    >
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
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
              <CardDescription>
                {invitation_token ? `Joining ${organizationName}` : "Start your journey with us today."}
              </CardDescription>
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
                      <AlertTitle>Sign up failed</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div variants={formItemVariants} className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                aria-label="Continue with Google"
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Continue with Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
            </motion.div>

            <form onSubmit={handleSignUp} className="space-y-4 mt-4" noValidate>
              <motion.div variants={formItemVariants}>
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="organizationName"
                      placeholder="Your Company LLC"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      disabled={isSubmitting || !!invitation_token}
                      className="pl-9"
                      autoComplete="organization"
                    />
                  </div>
                  {fieldErrors.organizationName && (
                    <p className="text-xs text-destructive mt-1" role="alert">
                      {fieldErrors.organizationName}
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div variants={formItemVariants}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting || !!invitation_token}
                      className="pl-9"
                      autoComplete="email"
                      inputMode="email"
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive mt-1" role="alert">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div variants={formItemVariants}>
                <div className="space-y-2 relative">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="new-password"
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
                  {fieldErrors.password && (
                    <p className="text-xs text-destructive mt-1" role="alert">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div variants={formItemVariants}>
                <div className="space-y-2 relative">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    aria-pressed={showConfirmPassword}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1" role="alert">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </motion.div>

              {password && (
                <PasswordStrengthIndicator
                  strength={passwordStrength.strength}
                  checks={passwordStrength.checks}
                />
              )}

              <motion.div variants={formItemVariants}>
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting} aria-disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
              </motion.div>

              <motion.p variants={formItemVariants} className="text-center text-sm text-muted-foreground pt-4">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-primary hover:underline underline-offset-4">
                  Sign in
                </Link>
              </motion.p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
