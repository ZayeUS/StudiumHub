import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { postData } from "../../utils/BackendRequestHelper";
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress,
  Avatar,
  Chip,
  Container,
  Grid
} from "@mui/material";
import { 
  CheckCircle, 
  Cancel as XCircle, 
  Refresh as RefreshIcon, 
  ArrowForward 
} from "@mui/icons-material";

export const PaymentSuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [planName, setPlanName] = useState("MVP"); // Default plan name
  const [isTrial, setIsTrial] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get("session_id");

      if (!sessionId) {
        setError("No payment session found. Please try again or contact support.");
        setLoading(false);
        return;
      }

      try {
        const response = await postData("/stripe/complete-payment", { sessionId });
        
        if (response && response.message) {
          setPaymentStatus("Payment Successful!");
          
          // Check if it's a trial
          if (response.status === "trialing") {
            setIsTrial(true);
          }
          
          // Set plan name if available
          if (response.plan) {
            setPlanName(response.plan);
          }
          
          // Start countdown for redirect
          const timer = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate("/dashboard");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          return () => clearInterval(timer);
        } else {
          setError("There was an error processing your payment.");
        }
      } catch (err) {
        console.error("Error during payment process:", err);
        setError("Something went wrong. Please try again or contact support.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [location.search, navigate]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    const fetchAgain = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get("session_id");
      
      try {
        const response = await postData("/stripe/complete-payment", { sessionId });
        
        if (response && response.message) {
          setPaymentStatus("Payment Successful!");
          setTimeout(() => navigate("/dashboard"), 2000);
        } else {
          setError("There was an error processing your payment.");
        }
      } catch (err) {
        setError("Something went wrong. Please try again or contact support.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgain();
  };

  const handleManualRedirect = () => {
    navigate("/dashboard");
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Paper elevation={5} sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
        {/* Header */}
        <Box 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText', 
            p: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            Payment Status
          </Typography>
        </Box>
        
        {/* Content */}
        <Box sx={{ p: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CircularProgress size={64} thickness={4} />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
                Processing your payment...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              {paymentStatus ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: 'success.light',
                      mb: 2
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />
                  </Avatar>
                  
                  <Typography variant="h4" color="success.main" fontWeight={700} gutterBottom>
                    {paymentStatus}
                  </Typography>
                  
                  <Chip 
                    label={isTrial ? "Free Trial Active" : "Subscription Active"}
                    color="success"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    {isTrial 
                      ? "Your free trial for the MVP plan has started. You'll have full access to all premium features for the next 30 days."
                      : "Thank you for your payment. Your subscription is now active."}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Plan: <strong>{planName}</strong> - $0.50/month
                  </Typography>
                  
                  <Chip 
                    label={`Redirecting in ${countdown} seconds`}
                    color="default"
                    variant="outlined"
                    icon={<RefreshIcon className="animate-spin" />}
                    sx={{ py: 1.5, px: 1 }}
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleManualRedirect}
                    endIcon={<ArrowForward />}
                    sx={{ mt: 4, px: 3, py: 1 }}
                  >
                    Go to Dashboard Now
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: 'error.light',
                      mb: 2
                    }}
                  >
                    <XCircle sx={{ fontSize: 48, color: 'error.main' }} />
                  </Avatar>
                  
                  <Typography variant="h5" color="error.main" fontWeight={700} gutterBottom>
                    Payment Error
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    {error}
                  </Typography>
                  
                  <Grid container spacing={2} justifyContent="center">
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleRetry}
                        startIcon={<RefreshIcon />}
                      >
                        Retry
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => navigate("/pricing")}
                      >
                        Back to Pricing
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};