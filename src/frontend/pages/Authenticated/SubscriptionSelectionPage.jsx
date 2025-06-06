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
import { CheckCircle, Crown, Sparkles, Rocket } from 'lucide-react'; // Added Rocket for visual flair
import { useUserStore } from '../../store/userStore';
import { postData } from '../../utils/BackendRequestHelper'; // Import postData

const STRIPE_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK; // Get from .env

export const SubscriptionSelectionPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { profile, loading, setLoading, userSubscriptionStatus, markFreeTierSelected } = useUserStore(); // Destructure setLoading

    // Ensure user has completed profile before showing this page
    if (!profile) {
        // This should theoretically be caught by ProtectedRoute or App.jsx redirect,
        // but it's a good defensive check.
        return <CircularProgress />;
    }

    const handleFreeTierSelection = async () => {
        setLoading(true); // Start loading
        try {
            const response = await postData('/stripe/select-free-tier', {}); // Call new backend endpoint
            if (response.status === 'free_active' || response.message === 'User is already on the free tier.' || response.message === 'Free tier already recorded for this user.') {
                markFreeTierSelected(); // Mark that free tier has been selected in store
                navigate('/dashboard'); // Then navigate to dashboard
            } else {
                console.error("Unexpected response from free tier selection:", response);
                // Optionally show an error message
            }
        } catch (error) {
            console.error("Failed to select free tier:", error);
            // Optionally show an error message to the user
        } finally {
            setLoading(false); // End loading
        }
    };

    const handlePaidTierSelection = () => {
        window.location.href = STRIPE_PAYPEnt_LINK;
    };

    // Show a loading spinner if the userStore is loading (e.g., during auth hydration or initial data fetch)
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    // Redirect if user already has an active subscription (including if they just came from payment success)
    // Now also includes 'free_active' as a status that bypasses this page
    if (userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing' || userSubscriptionStatus === 'free_active') {
      navigate('/dashboard');
      return null; 
    }

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
            <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 8 } }}>
                <Rocket size={60} color={theme.palette.secondary.main} style={{ marginBottom: theme.spacing(2) }} />
                <Typography 
                    variant="h2" // Changed to h2 for more impact
                    component="h1" 
                    fontWeight={800} // Bolder font weight
                    sx={{ 
                        mb: 2,
                        // Use theme colors for gradient, ensuring contrast
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '2.5rem', md: '3.5rem' }, // Responsive font size
                    }}
                >
                    Launch Your Vision
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}> {/* Increased max width and line height */}
                    Select the ideal plan to power your project. From basic exploration to a full-fledged MVP, we have you covered.
                </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center" alignItems="stretch">
                {/* Free Tier Card */}
                <Grid item xs={12} sm={6} md={5}>
                    <Paper 
                        elevation={8} // Higher elevation for a more premium feel
                        sx={{ 
                            p: { xs: 3, md: 5 }, // Increased padding for more breathing room
                            borderRadius: theme.shape.borderRadiusLG, 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            border: `1px solid ${theme.palette.divider}`, // Subtle border from theme
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            bgcolor: theme.palette.background.paper, // Use paper background from theme
                            '&:hover': {
                                transform: 'translateY(-8px)', // More pronounced lift on hover
                                boxShadow: theme.palette.mode === 'dark' 
                                    ? `0 15px 45px ${alpha(theme.palette.primary.main, 0.25)}` // Stronger shadow in dark mode
                                    : `0 15px 45px ${alpha(theme.palette.primary.main, 0.15)}`, // Subtle shadow in light mode
                            }
                        }}
                    >
                        <Chip 
                            label="Explore & Learn" 
                            color="info" // Uses theme info color
                            size="small" 
                            sx={{ alignSelf: 'flex-start', mb: 2 }} 
                        />
                        <Typography variant="h4" fontWeight={700} gutterBottom> {/* Larger heading */}
                            Free Tier
                        </Typography>
                        <Typography variant="h3" fontWeight={800} color="primary.main" sx={{ mb: 3 }}> {/* Larger price */}
                            $0<Typography component="span" variant="h6" color="text.secondary">/month</Typography>
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, flexGrow: 1, lineHeight: 1.7 }}> {/* Increased line height */}
                            Ideal for personal projects, testing concepts, or getting started with the platform's core functionalities.
                        </Typography>
                        
                        <Stack spacing={1.5} sx={{ mb: 4 }}> {/* Increased spacing */}
                            {[
                                "Basic User Authentication",
                                "Limited Data Storage (100MB)",
                                "Community Support Access",
                                "Essential Analytics"
                            ].map((feature, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CheckCircle size={20} color={theme.palette.success.main} style={{ marginRight: 12 }} /> {/* Larger margin */}
                                    <Typography variant="body1" color="text.primary">{feature}</Typography> {/* Use primary text color */}
                                </Box>
                            ))}
                        </Stack>

                        <Button 
                            variant="contained" // Retained as contained per your request
                            fullWidth 
                            size="large"
                            onClick={handleFreeTierSelection}
                            endIcon={<Sparkles size={20} />}
                            sx={{
                                py: 1.5, 
                                fontWeight: 600, 
                                // Custom styles for contained button, ensuring theme-based contrast
                                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[100], // Use a light background color from theme
                                color: theme.palette.text.primary, // Primary text color for contrast
                                border: `1px solid ${theme.palette.divider}`, // Subtle border
                                boxShadow: theme.shadows[1], // Subtle shadow
                                '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.8) : theme.palette.grey[200], // Slightly darker on hover
                                    borderColor: theme.palette.primary.main, // Primary border on hover
                                    boxShadow: theme.shadows[2], // Slightly more pronounced shadow on hover
                                    transform: 'translateY(-1px)',
                                }
                            }}
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
                            p: { xs: 3, md: 5 }, // Increased padding
                            borderRadius: theme.shape.borderRadiusLG, 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            border: `2px solid ${theme.palette.secondary.main}`, // Stronger border
                            position: 'relative',
                            overflow: 'visible',
                            bgcolor: theme.palette.background.paper, // Use paper background
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-8px)', // More pronounced lift
                                boxShadow: theme.palette.mode === 'dark'
                                    ? `0 15px 45px ${alpha(theme.palette.secondary.main, 0.25)}` // Stronger shadow in dark mode
                                    : `0 15px 45px ${alpha(theme.palette.secondary.main, 0.15)}`, // Subtle shadow in light mode
                            }
                        }}
                    >
                        <Chip 
                            label="Recommended" 
                            color="secondary" // Uses theme secondary color
                            size="small" 
                            sx={{ alignSelf: 'flex-start', mb: 2 }} 
                        />
                        <Typography variant="h4" fontWeight={700} gutterBottom> {/* Larger heading */}
                            MVP Tier
                        </Typography>
                        <Typography variant="h3" fontWeight={800} color="secondary.main" sx={{ mb: 3 }}> {/* Larger price */}
                            $0.50<Typography component="span" variant="h6" color="text.secondary">/month</Typography>
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, flexGrow: 1, lineHeight: 1.7 }}>
                            Perfect for launching your Minimum Viable Product with robust, scalable infrastructure and essential features.
                        </Typography>

                        <Stack spacing={1.5} sx={{ mb: 4 }}>
                            {[
                                "**All Free Tier Features**",
                                "Firebase Authentication Integration",
                                "Role-Based Access Control (RBAC)",
                                "PostgreSQL Database (Neon)",
                                "Stripe Payment Gateway Integration",
                                "Cloudinary for File Uploads (5GB storage)",
                                "Priority Email Support"
                            ].map((feature, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CheckCircle size={20} color={theme.palette.success.main} style={{ marginRight: 12 }} />
                                    <Typography variant="body1" color="text.primary">{feature}</Typography>
                                </Box>
                            ))}
                        </Stack>

                        <Button 
                            variant="contained" 
                            color="secondary" 
                            fullWidth 
                            size="large"
                            onClick={handlePaidTierSelection}
                            endIcon={<Crown size={20} />}
                            sx={{
                                py: 1.5, // Taller button
                                fontWeight: 600, // Bolder text
                                boxShadow: `0 6px 12px ${alpha(theme.palette.secondary.main, 0.35)}`, // Consistent shadow
                                '&:hover': {
                                    boxShadow: `0 8px 16px ${alpha(theme.palette.secondary.main, 0.45)}`, // Stronger hover shadow
                                }
                            }}
                        >
                            Go to Checkout
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
            
            <Divider sx={{ my: { xs: 6, md: 8 } }} /> 
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary"> 
                Need custom solutions or have specific requirements? <br/>
                <Button 
                    variant="text" 
                    color="primary" 
                    onClick={() => console.log('Contact Us Clicked')} 
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    Contact us for Enterprise plans.
                </Button>
              </Typography>
            </Box>
        </Container>
    );
};