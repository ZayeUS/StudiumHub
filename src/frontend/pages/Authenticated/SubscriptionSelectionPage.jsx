// File: src/frontend/pages/Authenticated/SubscriptionSelectionPage.jsx
import React from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Paper, 
    Container, 
    useTheme, 
    alpha, 
    Grid,
    CircularProgress,
    Chip,
    Stack,
    Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, DollarSign, Zap, Crown, Sparkles } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import {ProtectedRoute} from '../../components/ProtectedRoute'; // Import ProtectedRoute

const STRIPE_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK; // Get from .env

export const SubscriptionSelectionPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { profile, loading, userSubscriptionStatus, markFreeTierSelected } = useUserStore(); // Destructure markFreeTierSelected

    // Ensure user has completed profile before showing this page
    if (!profile) {
        // This should theoretically be caught by ProtectedRoute or App.jsx redirect,
        // but it's a good defensive check.
        return <CircularProgress />;
    }

    const handleFreeTierSelection = () => {
        // IMPORTANT: Update the userSubscriptionStatus in the store
        markFreeTierSelected(); // Mark that free tier has been selected
        navigate('/dashboard'); // Then navigate to dashboard
    };

    const handlePaidTierSelection = () => {
        window.location.href = STRIPE_PAYMENT_LINK;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    // Redirect if user already has an active subscription (including if they just came from payment success)
    if (userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing') {
      navigate('/dashboard');
      return null; // Don't render anything while redirecting
    }

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography 
                    variant="h3" 
                    component="h1" 
                    fontWeight={700} 
                    sx={{ 
                        mb: 2,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Choose Your Path
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
                    Unlock features that power your growth. Select the plan that fits your vision.
                </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center" alignItems="stretch">
                {/* Free Tier Card */}
                <Grid item xs={12} sm={6} md={5}>
                    <Paper 
                        elevation={8} 
                        sx={{ 
                            p: { xs: 3, md: 4 }, 
                            borderRadius: theme.shape.borderRadiusLG, 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            border: `1px solid ${theme.palette.divider}`,
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`
                            }
                        }}
                    >
                        <Chip 
                            label="Start Small" 
                            color="info" 
                            size="small" 
                            sx={{ alignSelf: 'flex-start', mb: 2 }} 
                        />
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            Free Tier
                        </Typography>
                        <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mb: 2 }}>
                            $0<Typography component="span" variant="body1" color="text.secondary">/month</Typography>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                            Perfect for personal projects or getting started with core features.
                        </Typography>
                        
                        <Stack spacing={1} sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <CheckCircle size={20} color={theme.palette.success.main} style={{ marginRight: 8 }} />
                                <Typography variant="body2">Basic User Management</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <CheckCircle size={20} color={theme.palette.success.main} style={{ marginRight: 8 }} />
                                <Typography variant="body2">Limited Data Storage</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <CheckCircle size={20} color={theme.palette.success.main} style={{ marginRight: 8 }} />
                                <Typography variant="body2">Community Support</Typography>
                            </Box>
                        </Stack>

                        <Button 
                            variant="outlined" 
                            color="primary" 
                            fullWidth 
                            size="large"
                            onClick={handleFreeTierSelection}
                            endIcon={<Sparkles size={20} />}
                        >
                            Get Started for Free
                        </Button>
                    </Paper>
                </Grid>

                {/* Paid Tier Card */}
                <Grid item xs={12} sm={6} md={5}>
                    <Paper 
                        elevation={8} 
                        sx={{ 
                            p: { xs: 3, md: 4 }, 
                            borderRadius: theme.shape.borderRadiusLG, 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            border: `2px solid ${theme.palette.secondary.main}`,
                            position: 'relative',
                            overflow: 'visible',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: `0 12px 40px ${alpha(theme.palette.secondary.main, 0.15)}`
                            }
                        }}
                    >
                        <Chip 
                            label="Recommended" 
                            color="secondary" 
                            size="small" 
                            sx={{ alignSelf: 'flex-start', mb: 2 }} 
                        />
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            MVP Tier
                        </Typography>
                        <Typography variant="h4" fontWeight={800} color="secondary.main" sx={{ mb: 2 }}>
                            $0.50<Typography component="span" variant="body1" color="text.secondary">/month</Typography>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                            Launch your Minimum Viable Product with robust infrastructure.
                        </Typography>

                        <Stack spacing={1} sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <CheckCircle size={20} color={theme.palette.success.main} style={{ marginRight: 8 }} />
                                <Typography variant="body2">**All Free Tier Features**</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <CheckCircle size={20} color={theme.palette.success.main} style={{ marginRight: 8 }} />
                                <Typography variant="body2">Firebase Authentication</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <CheckCircle size={20} color={theme.palette.success.main} style={{ marginRight: 8 }} />
                                <Typography variant="body2">Role-Based Access Control</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <CheckCircle size={20} color={theme.palette.success.main} style={{ marginRight: 8 }} />
                                <Typography variant="body2">PostgreSQL Database</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <CheckCircle size={20} color={theme.palette.success.main} style={{ marginRight: 8 }} />
                                <Typography variant="body2">Stripe Payment Integration</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <CheckCircle size={20} color={theme.palette.success.main} style={{ marginRight: 8 }} />
                                <Typography variant="body2">Cloudinary for File Uploads</Typography>
                            </Box>
                        </Stack>

                        <Button 
                            variant="contained" 
                            color="secondary" 
                            fullWidth 
                            size="large"
                            onClick={handlePaidTierSelection}
                            endIcon={<Crown size={20} />}
                        >
                            Go to Checkout
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
            
            <Divider sx={{ my: 6 }} />
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Need more? Contact us for custom enterprise solutions.
              </Typography>
            </Box>
        </Container>
    );
};