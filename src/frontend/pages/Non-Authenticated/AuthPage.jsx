import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Moon, AlertCircle, Loader2, CheckCircle, Sun, Building, Mail, Zap } from "lucide-react";

// Firebase & Store
import { signUp, checkEmailExists, signInWithGoogle, login, resetPassword } from "../../../firebase";
import { useUserStore } from "../../store/userStore";
import { postData, getData } from "../../utils/BackendRequestHelper";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// --- Framer Motion Variants ---
const titleVariants = {
  hidden: { opacity: 0, y: -15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: 15, transition: { duration: 0.2, ease: "easeIn" } },
};

const fieldVariants = {
    initial: { opacity: 0, height: 0, y: 10 },
    animate: { opacity: 1, height: "auto", y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, height: 0, y: -10, transition: { duration: 0.3, ease: "easeOut" } },
};

// --- Reusable Components ---
const GoogleIcon = (props) => (
  <svg role="img" viewBox="0 0 24 24" {...props}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
);

const PasswordStrengthIndicator = ({ strength, checks }) => {
  const list = [
    { label: "8+ characters", met: checks.length }, { label: "Uppercase", met: checks.uppercase },
    { label: "Lowercase", met: checks.lowercase }, { label: "Number", met: checks.number },
    { label: "Symbol", met: checks.special },
  ];
  return (
    <motion.div className="space-y-2 pt-2" aria-live="polite" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
      <Progress value={strength} className="h-1.5 transition-all" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
        {list.map((item) => (
          <div key={item.label} className={cn("flex items-center text-xs transition-colors", item.met ? "text-green-500" : "text-muted-foreground")}>
            <CheckCircle className={cn("h-3.5 w-3.5 mr-1.5", item.met ? "opacity-100" : "opacity-50")} />{item.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const ResetPasswordModal = ({ open, onOpenChange }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const handleReset = async () => { if (!email) { setError("Please enter your email address."); return; } setIsLoading(true); setError(""); try { await resetPassword(email); toast({ title: "Check your email", description: `A password reset link was sent to ${email}.` }); onOpenChange(false); } catch { setError("Failed to send reset email. Please verify the address and try again."); } finally { setIsLoading(false); } };
  useEffect(() => { if (!open) { setEmail(""); setError(""); setIsLoading(false); } }, [open]);
  return ( <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Forgot password</DialogTitle><DialogDescription>Enter your email and we'll send you a link to reset it.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><AnimatePresence>{error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><Alert variant="destructive" role="alert"><AlertDescription>{error}</AlertDescription></Alert></motion.div>}</AnimatePresence><div className="space-y-2"><Label htmlFor="reset-email">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="reset-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" autoComplete="email"/></div></div></div><DialogFooter><DialogClose asChild><Button variant="outline" disabled={isLoading}>Cancel</Button></DialogClose><Button onClick={handleReset} disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send reset link</Button></DialogFooter></DialogContent></Dialog> );
};

const AuthLayout = ({ children }) => {
  const { toggleTheme } = useUserStore();
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="relative flex items-center justify-center py-12 lg:py-0 overflow-hidden">
        {children}
      </div>
      <div className="hidden bg-muted lg:flex flex-col items-center justify-center text-center p-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}>
          <Zap className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold tracking-tight">Launch your vision, faster.</h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">Our production-ready boilerplate handles the essentials, so you can focus on building what makes your product unique.</p>
        </motion.div>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" /><Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </div>
  );
};

export function AuthPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isResetModalOpen, setResetModalOpen] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser, fetchUserSession } = useUserStore();
  const invitation_token = searchParams.get('token');

  useEffect(() => { const mode = location.pathname.includes('signup') || invitation_token ? 'signup' : 'login'; setAuthMode(mode); }, [location.pathname, invitation_token]);
  useEffect(() => { const verifyToken = async () => { if (invitation_token) { try { const data = await getData(`/invitations/${invitation_token}`); setEmail(data.email); setOrganizationName(data.organization_name); toast({ title: "Invitation Found", description: `Welcome! Please create an account to join ${data.organization_name}.` }); } catch { setError("This invitation is invalid or has expired."); } } }; verifyToken(); }, [invitation_token, toast]);

  const clearFormState = () => { setError(''); setPassword(''); setConfirmPassword(''); };
  const toggleAuthMode = () => { clearFormState(); const newMode = authMode === 'login' ? 'signup' : 'login'; setAuthMode(newMode); navigate(`/${newMode}`, { replace: true }); };
  const calculatePasswordStrength = (pwd) => { const checks = { length: pwd.length >= 8, uppercase: /[A-Z]/.test(pwd), lowercase: /[a-z]/.test(pwd), number: /\d/.test(pwd), special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }; return { strength: (Object.values(checks).filter(Boolean).length / 5) * 100, checks }; };
  const handleLogin = async () => { if (!email || !password) { setError("Please enter both email and password."); return; } setIsSubmitting(true); try { await login(email, password); } catch (err) { const messages = { "auth/invalid-credential": "Incorrect email or password." }; setError(messages[err?.code] || "Login failed. Please check your credentials."); setIsSubmitting(false); } };
  const handleSignUp = async () => { if (!organizationName.trim() || !email.trim() || password.length < 8 || password !== confirmPassword) { setError("Please fill out all fields correctly."); return; } setIsSubmitting(true); try { const emailExists = await checkEmailExists(email); if (emailExists) throw { code: "auth/email-already-in-use" }; const userCredential = await signUp(email, password); const firebaseUser = userCredential.user; const payload = { firebase_uid: firebaseUser.uid, email: firebaseUser.email, invitation_token: invitation_token || undefined, organization_name: organizationName }; const backendResponse = await postData("/users", payload, false); setUser(firebaseUser.uid, backendResponse.user.user_id); await fetchUserSession(); } catch (err) { const messages = { "auth/email-already-in-use": "An account with this email already exists.", "auth/weak-password": "Password is too weak." }; setError(messages[err?.code] || "Sign up failed. Please try again."); setIsSubmitting(false); } };
  const handleGoogleSignIn = async () => { setIsSubmitting(true); setError(""); try { const result = await signInWithGoogle(); const firebaseUser = result.user; try { await getData(`/users/${firebaseUser.uid}`); } catch (err) { if (err?.message === "User not found" || err?.response?.status === 404) { const payload = { firebase_uid: firebaseUser.uid, email: firebaseUser.email, organization_name: `${firebaseUser.displayName || 'My'}'s Organization` }; await postData("/users", payload, false); } else { throw err; } } } catch (err) { setError(err.message || "Failed to sign in with Google."); setIsSubmitting(false); } };
  const handleSubmit = (e) => { e.preventDefault(); clearFormState(); authMode === 'login' ? handleLogin() : handleSignUp(); };

  const passwordStrength = calculatePasswordStrength(password);
  const isLogin = authMode === 'login';

  return (
    <AuthLayout>
      <div className="relative mx-auto grid w-full max-w-sm gap-6 px-4">
        <AnimatePresence>
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-10 grid place-content-center rounded-lg bg-background/80 backdrop-blur-sm"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div layout transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.7 }}>
          <div className="relative h-24 text-center">
            <AnimatePresence mode="wait">
              <motion.div key={authMode} variants={titleVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0 grid place-content-center gap-2">
                <h1 className="text-3xl font-bold">{isLogin ? "Welcome Back" : "Create an Account"}</h1>
                <p className="text-balance text-muted-foreground">{isLogin ? "Enter your credentials to access your account." : (invitation_token ? `You're invited to join ${organizationName}.` : "Let's get you started.")}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

          <form onSubmit={handleSubmit} className="grid gap-4">
            <AnimatePresence>
              {!isLogin && (
                <motion.div variants={fieldVariants} initial="initial" animate="animate" exit="exit" className="grid gap-2 overflow-hidden">
                  <Label htmlFor="organizationName">Organization name</Label>
                  <div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="organizationName" placeholder="Your Company LLC" required value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} disabled={isSubmitting || !!invitation_token} className="pl-9" autoComplete="organization" /></div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting || !!invitation_token} className="pl-9" autoComplete="email" /></div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center"><Label htmlFor="password">Password</Label>
                <AnimatePresence>
                  {isLogin && <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}><Button type="button" variant="link" className="ml-auto h-auto p-0 text-sm" onClick={() => setResetModalOpen(true)}>Forgot password?</Button></motion.div>}
                </AnimatePresence>
              </div>
              <div className="relative"><Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} autoComplete={isLogin ? "current-password" : "new-password"} /><button type="button" className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(s => !s)}>{showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</button></div>
            </div>
            <AnimatePresence>
              {!isLogin && (
                <motion.div variants={fieldVariants} initial="initial" animate="animate" exit="exit" className="grid gap-2 overflow-hidden">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative"><Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSubmitting} autoComplete="new-password" /><button type="button" className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(s => !s)}>{showConfirmPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</button></div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {!isLogin && password && <PasswordStrengthIndicator strength={passwordStrength.strength} checks={passwordStrength.checks} />}
            </AnimatePresence>
            <div className="space-y-3 mt-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? "Login" : "Create an account"}
              </Button>
              <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={toggleAuthMode} className="font-semibold text-primary underline-offset-4 hover:underline">
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </div>
        </motion.div>
      </div>
      <ResetPasswordModal open={isResetModalOpen} onOpenChange={setResetModalOpen} />
    </AuthLayout>
  );
}