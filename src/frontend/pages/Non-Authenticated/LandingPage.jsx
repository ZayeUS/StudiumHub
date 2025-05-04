import React from 'react';
import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  useTheme, 
  Card, 
  CardContent,
  Grid,
  useMediaQuery,
  alpha,
} from '@mui/material';
import { ArrowRight, CheckCircle, Zap, Users, Shield } from 'lucide-react';

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Feature data
  const features = [
    { 
      title: "Streamlined Workflow", 
      description: "Reduce operational overhead by 35% with our intuitive automation tools.", 
      icon: <Zap size={24} color={theme.palette.secondary.main} />
    },
    { 
      title: "Team Collaboration", 
      description: "Enable real-time collaboration that increases team productivity by 42%.", 
      icon: <Users size={24} color={theme.palette.secondary.main} />
    },
    { 
      title: "Enterprise Security", 
      description: "Bank-level encryption protecting your sensitive business data 24/7.", 
      icon: <Shield size={24} color={theme.palette.secondary.main} />
    },
  ];

  // Pricing plans
  const plans = [
    {
      name: "Starter",
      price: "$49",
      period: "/month",
      features: [
        "Up to 5 team members",
        "10GB storage",
        "Basic analytics",
        "24/7 email support"
      ],
      isPopular: false
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      features: [
        "Up to 20 team members",
        "50GB storage",
        "Advanced analytics",
        "Priority support"
      ],
      isPopular: true
    },
    {
      name: "Enterprise",
      price: "Contact us",
      period: "",
      features: [
        "Unlimited team members",
        "Unlimited storage",
        "Custom integrations",
        "Dedicated account manager"
      ],
      isPopular: false
    }
  ];

  // FAQ items
  const faqItems = [
    {
      question: "How quickly can I get started?",
      answer: "You can be up and running in less than 5 minutes. Our streamlined onboarding process ensures immediate productivity with no technical setup required."
    },
    {
      question: "Is my data secure?",
      answer: "We implement bank-level 256-bit encryption and comply with GDPR, HIPAA, and SOC2 standards to ensure your business data remains completely secure."
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes, you can easily change your plan at any time. We'll prorate your billing so you only pay for what you use."
    }
  ];

  return (
    <Box sx={{ bgcolor: theme.palette.background.default }}>
      {/* Hero Section - Single Column Header */}
      <Box 
        sx={{ 
          py: { xs: 6, md: 10 },
          background: `linear-gradient(145deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.background.paper, 1)})`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Container maxWidth="md">
          <Box 
            sx={{ 
              textAlign: 'center',
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            <Box 
              sx={{ 
                display: 'inline-flex', 
                bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                color: theme.palette.secondary.main,
                px: 2, 
                py: 0.5, 
                borderRadius: 2,
                mb: 2,
                alignItems: 'center'
              }}
            >
              <Zap size={16} style={{ marginRight: 8 }} />
              <Typography variant="body2" fontWeight={600}>Boost Your Business Productivity</Typography>
            </Box>
            
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontWeight: 800, 
                mb: 3,
                background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: isMobile ? '2.5rem' : '3.5rem',
              }}
            >
              Transform Your Workflow & Increase Revenue
            </Typography>
            
            <Typography 
              variant="h6" 
              color="textSecondary" 
              sx={{ 
                mb: 4, 
                maxWidth: '700px', 
                mx: 'auto',
                fontWeight: 400,
                lineHeight: 1.6
              }}
            >
              Our proven SaaS platform helps businesses like yours increase operational efficiency by 47% while reducing costs. Join over 10,000 companies already transforming their workflow.
            </Typography>
            
            <Button 
              variant="contained" 
              color="secondary"
              size="large"
              disableElevation 
              endIcon={<ArrowRight size={18} />} 
              sx={{ 
                borderRadius: 2, 
                px: 4, 
                py: 1.5, 
                textTransform: 'none', 
                fontWeight: 600, 
                fontSize: '1rem',
                boxShadow: `0 8px 20px ${alpha(theme.palette.secondary.main, 0.3)}`,
                mb: 3
              }}
            >
              Start Free Trial
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
              <CheckCircle size={16} color={theme.palette.success.main} style={{ marginRight: 8 }} />
              <Typography variant="body2" color="textSecondary">No credit card required • 14-day free trial • Cancel anytime</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Social Proof */}
      <Box sx={{ py: 4, bgcolor: theme.palette.background.paper }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              TRUSTED BY FORWARD-THINKING COMPANIES
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 4
            }}>
              {/* You would add your client logos here */}
              {['Logo 1', 'Logo 2', 'Logo 3', 'Logo 4', 'Logo 5'].map((logo, index) => (
                <Box key={index} sx={{ 
                  height: '30px', 
                  width: isMobile ? '30%' : '15%', 
                  bgcolor: alpha(theme.palette.text.secondary, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1
                }}>
                  <Typography variant="body2" color="textSecondary">{logo}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" fontWeight={700}>
              How We Solve Your Business Challenges
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 2, maxWidth: '700px', mx: 'auto' }}>
              Our platform addresses the three biggest challenges facing modern businesses
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: `0 8px 30px ${alpha(theme.palette.common.black, 0.1)}`,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 12px 40px ${alpha(theme.palette.secondary.main, 0.15)}`
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call To Action */}
      <Box sx={{ 
        py: { xs: 6, md: 8 }, 
        bgcolor: theme.palette.secondary.main,
        color: '#fff'
      }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h2" fontWeight={700} color="inherit" gutterBottom>
              Ready to Transform Your Business?
            </Typography>
            <Typography variant="body1" color="inherit" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of companies that have already boosted their productivity by 47%.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              disableElevation 
              sx={{ 
                borderRadius: 2, 
                px: 4, 
                py: 1.5, 
                textTransform: 'none', 
                fontWeight: 600, 
                fontSize: '1rem',
                bgcolor: '#fff',
                color: theme.palette.secondary.main,
                '&:hover': {
                  bgcolor: alpha('#fff', 0.9)
                }
              }}
            >
              Start Free Trial
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: theme.palette.background.paper }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" fontWeight={700}>
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 2, maxWidth: '700px', mx: 'auto' }}>
              No hidden fees. No long-term contracts. Scale as your business grows.
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            {plans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: plan.isPopular 
                    ? `0 12px 40px ${alpha(theme.palette.secondary.main, 0.2)}` 
                    : `0 8px 30px ${alpha(theme.palette.common.black, 0.1)}`,
                  border: plan.isPopular ? `2px solid ${theme.palette.secondary.main}` : 'none',
                  position: 'relative',
                  overflow: 'visible'
                }}>
                  {plan.isPopular && (
                    <Box sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: theme.palette.secondary.main,
                      color: '#fff',
                      py: 0.5,
                      px: 2,
                      borderRadius: 1,
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}>
                      MOST POPULAR
                    </Box>
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      {plan.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                      <Typography variant="h3" component="span" fontWeight={800}>
                        {plan.price}
                      </Typography>
                      <Typography variant="body1" color="textSecondary" component="span" ml={0.5}>
                        {plan.period}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      {plan.features.map((feature, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <CheckCircle size={18} style={{ marginRight: 10 }} color={theme.palette.secondary.main} />
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Button 
                      fullWidth 
                      variant={plan.isPopular ? "contained" : "outlined"} 
                      color="secondary"
                      sx={{ 
                        py: 1.5,
                        borderRadius: theme.shape.borderRadius
                      }}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" fontWeight={700}>
              Frequently Asked Questions
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {faqItems.map((faq, index) => (
              <Grid item xs={12} key={index}>
                <Card sx={{ 
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" component="h3" fontWeight={600} gutterBottom>
                      {faq.question}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {faq.answer}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Final CTA + Footer */}
      <Box sx={{ 
        py: { xs: 6, md: 8 }, 
        bgcolor: theme.palette.background.paper,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h2" fontWeight={700} gutterBottom>
              Start Your Free Trial Today
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              Join over 10,000 satisfied businesses already using our platform.
            </Typography>
            <Button 
              variant="contained" 
              color="secondary"
              size="large"
              disableElevation 
              sx={{ 
                borderRadius: 2, 
                px: 4, 
                py: 1.5, 
                textTransform: 'none', 
                fontWeight: 600
              }}
            >
              Get Started Now
            </Button>
          </Box>
          
          <Box sx={{ 
            mt: 6,
            pt: 4,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            textAlign: 'center'
          }}>
            <Typography variant="body2" color="textSecondary">
              © {new Date().getFullYear()} Your Company. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;