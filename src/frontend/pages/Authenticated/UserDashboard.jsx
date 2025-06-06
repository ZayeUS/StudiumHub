// File: src/frontend/pages/Authenticated/UserDashboard.jsx
import React from 'react';
import { 
  Typography, 
  Container, 
  Box, 
  Button, 
  Paper, 
  Grid, 
  useTheme, 
  alpha,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
} from '@mui/material'; 
import { useUserStore } from '../../store/userStore';
import { LoadingModal } from '../../components/LoadingModal';
import { useNavigate } from 'react-router-dom';
import { Award, Zap, Lock, BarChart2, Briefcase, MessageSquare, Cloud, ChevronRight, User as UserIcon, Rocket, Star } from 'lucide-react';

export function UserDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userId, loading, userSubscriptionStatus, profile } = useUserStore();

  const isPaidUser = userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing';
  const isFreeUser = userSubscriptionStatus === 'free_active';

  const userName = profile?.first_name || 'Valued';

  if (loading) return <LoadingModal message="Loading your dashboard..." />;

  const coreFeatures = [
    { name: 'My Projects', icon: <Briefcase size={20} />, action: () => console.log('Go to Projects') },
    { name: 'Profile Settings', icon: <UserIcon size={20} />, action: () => navigate('/user-profile') },
  ];

  const proFeatures = [
    { 
      name: 'Advanced Analytics', 
      icon: <BarChart2 size={24} />, 
      description: 'Deep insights into your data with comprehensive reports and visualizations.',
      badge: 'Popular'
    },
    { 
      name: 'Priority Support', 
      icon: <MessageSquare size={24} />, 
      description: 'Get direct access to our expert support team with 24/7 availability.',
      badge: 'Essential'
    },
    { 
      name: 'Unlimited Storage', 
      icon: <Cloud size={24} />, 
      description: 'Store all your data without limits or worrying about space.',
      badge: 'Pro'
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      {/* Modern Header with Status Badge */}
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography 
              variant="h3" 
              fontWeight={800} 
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', md: '3rem' },
                letterSpacing: '-0.02em',
                mb: 1
              }}
            >
              Welcome back, {userName}!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Ready to build something amazing today?
            </Typography>
          </Box>
          <Chip
            icon={isPaidUser ? <Star size={16} /> : <Rocket size={16} />}
            label={isPaidUser ? 'MVP Member' : 'Free Tier'}
            color={isPaidUser ? 'secondary' : 'default'}
            variant={isPaidUser ? 'filled' : 'outlined'}
            sx={{ 
              fontWeight: 600,
              px: 1,
              '& .MuiChip-icon': {
                color: 'inherit'
              }
            }}
          />
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Actions - Redesigned */}
        <Grid item xs={12}>
          <Paper 
            elevation={2}
            sx={{ 
              p: { xs: 3, md: 4 },
              borderRadius: theme.shape.borderRadiusLG,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Zap size={24} color={theme.palette.secondary.main} style={{ marginRight: theme.spacing(1) }} />
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Quick Actions
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {coreFeatures.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={feature.icon}
                    onClick={feature.action}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      borderRadius: theme.shape.borderRadius,
                      borderColor: theme.palette.divider,
                      color: theme.palette.text.primary,
                      backgroundColor: theme.palette.background.paper,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        color: theme.palette.primary.main,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {feature.name}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Feature Section - Completely Redesigned */}
        <Grid item xs={12}>
          {isPaidUser ? (
            // Premium User Experience
            <Paper 
              elevation={8}
              sx={{ 
                p: { xs: 3, md: 5 },
                borderRadius: theme.shape.borderRadiusLG,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative background element */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
                  zIndex: 0
                }}
              />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Award size={32} color={theme.palette.secondary.main} style={{ marginRight: theme.spacing(2) }} />
                  <Box>
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      Your Pro Features
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Exclusive tools to supercharge your productivity
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  {proFeatures.map((feature, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          borderRadius: theme.shape.borderRadiusLG,
                          border: `1px solid ${theme.palette.divider}`,
                          backgroundColor: theme.palette.background.paper,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                            borderColor: theme.palette.primary.main,
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ color: theme.palette.secondary.main }}>
                              {feature.icon}
                            </Box>
                            <Chip 
                              label={feature.badge} 
                              size="small" 
                              variant="outlined"
                              color="secondary"
                              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                            />
                          </Box>
                          <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
                            {feature.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {feature.description}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ p: 3, pt: 0 }}>
                          <Button 
                            size="small" 
                            endIcon={<ChevronRight size={16} />}
                            sx={{ 
                              color: theme.palette.primary.main,
                              fontWeight: 600,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.05)
                              }
                            }}
                          >
                            Explore
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Paper>
          ) : (
            // Free User Upgrade CTA - Redesigned
            <Paper 
              elevation={6}
              sx={{ 
                p: { xs: 4, md: 6 },
                borderRadius: theme.shape.borderRadiusLG,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                border: `1px dashed ${alpha(theme.palette.secondary.main, 0.3)}`,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 20,
                  right: 20,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                }}
              />

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Lock size={48} color={theme.palette.secondary.main} style={{ marginBottom: theme.spacing(2) }} />
                <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ mb: 2 }}>
                  Unlock Your Potential
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}>
                  Transform your workflow with our <strong>MVP Tier</strong>. Get advanced analytics, priority support, and unlimited storage for just <strong>$0.50/month</strong>.
                </Typography>

                {/* Feature preview */}
                <Grid container spacing={2} sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                  {proFeatures.slice(0, 3).map((feature, index) => (
                    <Grid item xs={4} key={index}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: theme.shape.borderRadius,
                        backgroundColor: alpha(theme.palette.background.default, 0.5),
                        border: `1px solid ${theme.palette.divider}`
                      }}>
                        <Box sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                          {React.cloneElement(feature.icon, { size: 20 })}
                        </Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {feature.name}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large" 
                  onClick={() => navigate('/subscription-selection')}
                  endIcon={<Rocket size={20} />}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontWeight: 700,
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.3)}`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 32px ${alpha(theme.palette.secondary.main, 0.4)}`,
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Upgrade to MVP Tier
                </Button>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                  Start your 7-day free trial • Cancel anytime
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}