import React, { useState, useEffect } from "react";
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Stack,
  Chip,
  useTheme
} from "@mui/material";
import { 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  CreditCard
} from "lucide-react";
import { getData, postData } from "../../utils/BackendRequestHelper";

export const StripeDashboard = () => {
  const theme = useTheme();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [planName, setPlanName] = useState(""); // Store the plan name
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [noPaymentRecord, setNoPaymentRecord] = useState(false);

  // Direct Stripe payment link
  const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_eVa4iD40dggh7xm144";

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      const sessionId = new URLSearchParams(window.location.search).get('session_id');
      
      try {
        setLoading(true);
        
        // Process payment if we have a session ID
        if (sessionId) {
          try {
            await postData("/stripe/complete-payment", { sessionId });
          } catch (err) {
            console.error("Error processing payment:", err);
            // Continue anyway to show the dashboard
          }
        }
        
        // Get user data
        try {
          const userData = await getData("/profile");
          setUserName(userData?.name || "User");
        } catch (err) {
          console.error("Error fetching user profile:", err);
          // Continue anyway to get payment status
        }
        
        // Get payment status
        try {
          const paymentData = await getData("/stripe/payment-status");
          setPaymentStatus(paymentData?.status || "inactive");
          
          // Set the plan name
          if (paymentData?.plan) {
            setPlanName(paymentData.plan);
          }
        } catch (err) {
          console.error("Error fetching payment status:", err);
          
          // Check if error is 404 - No payment record
          if (err.response && err.response.status === 404) {
            setNoPaymentRecord(true);
          } else if (err.message === "No payment record found for user.") {
            setNoPaymentRecord(true);
          } else {
            setError("There was a problem loading your payment status.");
          }
        }
      } catch (err) {
        console.error("Error in dashboard:", err);
        setError("There was a problem loading the dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, []);

  if (loading) {
    return (
      <Box 
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          gap: 2
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="h6" color="text.secondary">
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }

  // Handle case where payment record doesn't exist but shouldn't be treated as an error
  if (noPaymentRecord) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 4 }, mt: 2 }}>
        <Card 
          elevation={3} 
          sx={{ 
            borderRadius: 2, 
            overflow: "hidden",
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box 
            sx={{ 
              bgcolor: "primary.main", 
              color: "primary.contrastText",
              p: 3
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Stripe Dashboard
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              Welcome, {userName}
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 3 }}>
            <Alert 
              icon={<AlertTriangle size={24} />}
              severity="warning" 
              sx={{ mb: 3 }}
            >
              <Stack spacing={2}>
                <Typography variant="body1" fontWeight={500}>
                  No Active Subscription Found
                </Typography>
                <Typography variant="body2">
                  You don't have an active subscription yet. Subscribe to our "MVP" plan now to access all premium features!
                </Typography>
                
                <Button 
                  variant="contained"
                  color="warning"
                  href={STRIPE_PAYMENT_LINK}
                  target="_blank"
                  rel="noopener"
                  startIcon={<CreditCard />}
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 'bold',
                    bgcolor: theme.palette.warning.main,
                    '&:hover': {
                      bgcolor: theme.palette.warning.dark,
                    },
                    alignSelf: 'flex-start'
                  }}
                >
                  Subscribe Now - Free Trial (NO Credit Card Needed!)
                </Button>
              </Stack>
            </Alert>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Free features section */}
           
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 8, p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Need to subscribe or renew your plan?
          </Typography>
          
          <Button 
            variant="contained"
            color="primary"
            href={STRIPE_PAYMENT_LINK}
            target="_blank"
            rel="noopener"
            startIcon={<CreditCard />}
          >
            Subscribe Now
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 4 }, mt: 2 }}>
      <Card 
        elevation={3} 
        sx={{ 
          borderRadius: 2, 
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box 
          sx={{ 
            bgcolor: "primary.main", 
            color: "primary.contrastText",
            p: 3
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
            Welcome back, {userName}
          </Typography>
        </Box>
        
        <CardContent sx={{ p: 3 }}>
          {/* Payment Status Alert */}
          {paymentStatus === "active" || paymentStatus === "trialing" ? (
            <Alert 
              icon={<CheckCircle size={24} />}
              severity="success" 
              sx={{ mb: 3 }}
            >
              <Stack spacing={1}>
                <Typography variant="body1" fontWeight={500}>
                  {paymentStatus === "trialing" ? "Subscription Active (Trial)" : "Subscription Active"}
                </Typography>
                <Typography variant="body2">
                  {paymentStatus === "trialing" 
                    ? "Your free trial is active. You have access to all premium features for the next 30 days."
                    : "Your payment has been processed successfully. You have access to all premium features."}
                </Typography>
                
                {/* Display plan name and price */}
                <Box mt={1}>
                  <Chip 
                    label={`${planName || "MVP"} Plan`} 
                    color="success" 
                    variant="outlined" 
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label="$0.50/month" 
                    color="primary" 
                    variant="outlined" 
                    size="small" 
                  />
                </Box>
              </Stack>
            </Alert>
          ) : (
            <Alert 
              icon={<AlertTriangle size={24} />}
              severity="warning" 
              sx={{ mb: 3 }}
            >
              <Typography variant="body1" fontWeight={500}>
                Subscription Inactive
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Please subscribe to our MVP plan to unlock all features.
              </Typography>
              
              <Button 
                variant="contained"
                color="warning"
                size="medium"
                href={STRIPE_PAYMENT_LINK}
                target="_blank"
                rel="noopener"
                startIcon={<CreditCard />}
                sx={{ 
                  textTransform: 'none', 
                  fontWeight: 'bold',
                  bgcolor: 'warning.main',
                  '&:hover': {
                    bgcolor: 'warning.dark',
                  }
                }}
              >
                Subscribe Now - $0.50/month
              </Button>
            </Alert>
          )}
          
          {(paymentStatus === "active" || paymentStatus === "trialing") && (
            <>
              <Divider sx={{ my: 3 }} />
              
              {/* Premium Dashboard Content */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  Your Premium Dashboard
                  <Chip 
                    label={planName || "MVP"} 
                    color="primary" 
                    size="small" 
                    sx={{ ml: 2 }}
                  />
                </Typography>
                
                <Box sx={{ 
                  bgcolor: 'background.paper', 
                  p: 3, 
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  mt: 2
                }}>
                  <Typography variant="body1">
                    Welcome to your premium {planName || "MVP"} dashboard. You now have access to all premium features.
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    mt: 3
                  }}>
                    {/* Premium feature cards would go here */}
                    <Card sx={{ 
                      minWidth: 200, 
                      flex: '1 1 200px', 
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText'
                    }}>
                      <CardContent>
                        <Typography variant="h6">Analytics</Typography>
                        <Typography variant="body2">Advanced data insights</Typography>
                      </CardContent>
                    </Card>
                    
                    <Card sx={{ 
                      minWidth: 200, 
                      flex: '1 1 200px',
                      bgcolor: 'secondary.light',
                      color: 'secondary.contrastText'
                    }}>
                      <CardContent>
                        <Typography variant="h6">Templates</Typography>
                        <Typography variant="body2">Premium design templates</Typography>
                      </CardContent>
                    </Card>
                    
                    <Card sx={{ 
                      minWidth: 200, 
                      flex: '1 1 200px',
                      bgcolor: 'success.light',
                      color: 'success.contrastText'
                    }}>
                      <CardContent>
                        <Typography variant="h6">Support</Typography>
                        <Typography variant="body2">Priority customer support</Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </Box>
            </>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          {/* Actions Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
              <Button 
                variant="contained" 
                size="large"
                fullWidth
                href="/dashboard"
              >
                Go to Dashboard
              </Button>
              
              <Button 
                variant="outlined" 
                size="large"
                fullWidth
                href="/settings"
              >
                Account Settings
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};