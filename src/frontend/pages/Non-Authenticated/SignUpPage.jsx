// src/frontend/pages/Non-Authenticated/SignUpPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Moon, UserPlus, AlertCircle, Loader2, CheckCircle, Sun, Building, Mail, Zap } from "lucide-react";
import { signUp, checkEmailExists, signInWithGoogle } from "../../../firebase";
import { postData, getData } from "../../utils/BackendRequestHelper";
import { useUserStore } from "../../store/userStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// A reusable Google Icon component
const GoogleIcon = (props) => (
  <svg role="img" viewBox="0 0 24 24" {...props}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

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

const AuthLayout = ({ children }) => {
  const { isDarkMode, toggleTheme } = useUserStore();
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="relative flex items-center justify-center py-12 lg:py-0">{children}</div>
      <div className="hidden bg-muted lg:flex flex-col items-center justify-center text-center p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <Zap className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold tracking-tight">Launch your vision, faster.</h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            Our production-ready boilerplate handles the essentials, so you can focus on building what makes your product unique.
          </p>
        </motion.div>
      </div>
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
          aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
        >
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

  const navigate = useNavigate();
  const { isLoggedIn, profile, authHydrated, setUser } = useUserStore();

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

  const hydrateUserImmediately = async (firebaseUser) => {
    try {
      const userData = await getData(`/users/${firebaseUser.uid}`);
      if (userData?.user_id) {
        setUser(firebaseUser.uid, userData.user_id);
      }
    } catch (err) {
      console.error("Failed to hydrate user after signup:", err);
    }
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
      await hydrateUserImmediately(userCredential.user);
      navigate("/profile-onboarding");
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
      await hydrateUserImmediately(userCredential.user);
      navigate("/profile-onboarding");
    } catch (err) {
      if (err?.code === "auth/account-exists-with-different-credential") {
        setError("An account with this email already exists. Please log in with your original method.");
      } else if (err?.code !== "auth/popup-closed-by-user") {
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
    <AuthLayout>
      <motion.div
        className="mx-auto grid w-[350px] gap-6"
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
      >
        <motion.div variants={formItemVariants} className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-balance text-muted-foreground">
            {invitation_token ? `You're invited to join ${organizationName}.` : "Enter your details below to get started."}
          </p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert variant="destructive" role="alert">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sign Up Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form onSubmit={handleSignUp} variants={formItemVariants} className="grid gap-4">
          <div className="grid gap-2">
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
                className={cn("pl-9", fieldErrors.organizationName && "border-destructive focus-visible:ring-destructive")}
                autoComplete="organization"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
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
                className={cn("pl-9", fieldErrors.email && "border-destructive focus-visible:ring-destructive")}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className={cn(fieldErrors.password && "border-destructive focus-visible:ring-destructive")}
                autoComplete="new-password"
              />
              <button type="button" className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword((s) => !s)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                className={cn(fieldErrors.confirmPassword && "border-destructive focus-visible:ring-destructive")}
                autoComplete="new-password"
              />
              <button type="button" className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword((s) => !s)}>
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {password && (
            <PasswordStrengthIndicator
              strength={passwordStrength.strength}
              checks={passwordStrength.checks}
            />
          )}
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create an account
          </Button>
          <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isSubmitting}>
            <GoogleIcon className="mr-2 h-4 w-4" />
            Sign up with Google
          </Button>
        </motion.form>
        <motion.div variants={formItemVariants} className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="underline">
            Sign in
          </Link>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
}
