import React, { useState } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Stack,ListItemIcon
} from '@mui/material';
import { 
    ArrowRight, CheckCircle, Zap, Users, Shield, ArrowDown, Menu, Home, LogIn, ChevronRight, X 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// --- NAVIGATION BAR COMPONENT (NOW INSIDE LANDING PAGE) ---
const NavBar = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navItems = [
    { text: "Features", icon: <Zap size={18} />, path: "#features" },
    { text: "Pricing", icon: <ChevronRight size={18} />, path: "#pricing" },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1 }}>
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'text.primary'
            }}
          >
            <Zap size={24} style={{ marginRight: 8, color: theme.palette.primary.main }} />
            SoftwareTemplate
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navItems.map((item) => (
                <Button key={item.text} href={item.path} color="inherit" sx={{ fontWeight: 500, textTransform: 'none' }}>
                  {item.text}
                </Button>
              ))}
              <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5 }} />
              <Button component={Link} to="/login" color="inherit" sx={{ fontWeight: 500 }}>
                Login
              </Button>
              <Button component={Link} to="/signup" variant="contained" color="primary" disableElevation sx={{ borderRadius: 2 }}>
                Get Started
              </Button>
            </Box>
          )}

          {isMobile && (
            <IconButton edge="end" color="inherit" onClick={() => setOpenDrawer(true)}>
              <Menu />
            </IconButton>
          )}

          <Drawer anchor="right" open={openDrawer} onClose={() => setOpenDrawer(false)}>
            <Box sx={{ width: 250, p: 2 }}>
              <List>
                {navItems.map((item) => (
                  <ListItem key={item.text} component="a" href={item.path} onClick={() => setOpenDrawer(false)}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                  </ListItem>
                ))}
                <Divider sx={{ my: 2 }} />
                <Button component={Link} to="/login" fullWidth variant="outlined" sx={{ mb: 1 }}>Login</Button>
                <Button component={Link} to="/signup" fullWidth variant="contained">Get Started</Button>
              </List>
            </Box>
          </Drawer>
        </Toolbar>
      </Container>
    </AppBar>
  );
};


// A reusable component for section animations
const MotionBox = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    { 
      title: "Launch Faster", 
      description: "Pre-built authentication, billing, and database integration lets you focus on your core features.", 
      icon: <Zap size={24} color={theme.palette.secondary.main} />
    },
    { 
      title: "Scale Confidently", 
      description: "Built on a modern, robust stack (React, Node, Postgres) ready to handle growth from day one.", 
      icon: <Users size={24} color={theme.palette.secondary.main} />
    },
    { 
      title: "Secure by Default", 
      description: "Best practices for security, including soft deletes, audit logs, and secure authentication.", 
      icon: <Shield size={24} color={theme.palette.secondary.main} />
    },
  ];

  // --- UPDATED PRICING ---
  const plans = [
    {
      name: "MVP Tier",
      price: "$500",
      period: "/ one-time",
      features: [
        "Full Source Code Access",
        "Stripe Billing Integration",
        "Priority Email Support (3 Months)"
      ],
      isPopular: true
    },
  ];

  const faqItems = [
    {
      question: "What do I get when I purchase the template?",
      answer: "You receive the complete source code for the entire project, including the React frontend, Node.js backend, and all database setup files. You also get access to our documentation."
    },
    {
      question: "Is this a one-time payment?",
      answer: "Yes! The purchase of the SoftwareTemplate is a one-time payment that grants you a license to use the code in unlimited projects. There are no recurring fees to us."
    },
    {
      question: "What kind of support is included?",
      answer: "The MVP Tier comes with priority email support for 3 months to help you with setup, configuration, and understanding the codebase."
    }
  ];

  return (
    <Box sx={{ bgcolor: theme.palette.background.default }}>
      <NavBar />
      
      {/* Hero Section */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 12 },
          overflow: 'hidden',
          position: 'relative',
          background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`
        }}
      >
        <Container maxWidth="md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Chip label="Launch your SaaS in days, not months" color="primary" variant="outlined" sx={{ mb: 3 }}/>
              <Typography 
                variant="h1" 
                component="h1" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 3,
                  fontSize: isMobile ? '2.8rem' : '4rem',
                  letterSpacing: '-1.5px',
                  lineHeight: 1.1,
                }}
              >
                The Modern Foundation
                <br />
                for Your Next <Box component="span" sx={{
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>SaaS Product</Box>
              </Typography>
              
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ mb: 4, maxWidth: '650px', mx: 'auto', fontWeight: 400 }}
              >
                A production-ready boilerplate with authentication, subscriptions and a modern tech stack. Skip the setup and start building your core features today.
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button 
                  href="#pricing"
                  variant="contained" 
                  color="primary"
                  size="large"
                  disableElevation 
                  endIcon={<ArrowRight size={18} />} 
                  sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: 600 }}
                >
                  Purchase Now
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit"
                  size="large"
                  sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: 600 }}
                >
                  View Demo
                </Button>
              </Stack>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }} id="features">
        <Container maxWidth="lg">
          <MotionBox>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h3" component="h2" fontWeight={700}>
                Everything You Need to Launch
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '700px', mx: 'auto' }}>
                This template is packed with the essential features that every SaaS product needs, saving you hundreds of hours of development time.
              </Typography>
            </Box>
          </MotionBox>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card sx={{ 
                    height: '100%', 
                    borderRadius: theme.shape.borderRadiusLG,
                    border: 'none',
                    bgcolor: 'background.paper',
                    p: 2
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', bgcolor: alpha(theme.palette.secondary.main, 0.1), mb: 2 }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h5" component="h3" fontWeight={600} gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: alpha(theme.palette.primary.main, 0.05) }} id="pricing">
        <Container maxWidth="sm">
          <MotionBox>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h3" component="h2" fontWeight={700}>
                One Price, All Features
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '700px', mx: 'auto' }}>
                A simple one-time payment grants you lifetime access to the full source code and all future updates. No hidden fees, no subscriptions.
              </Typography>
            </Box>
          </MotionBox>
          
          <Grid container spacing={4} justifyContent="center">
            {plans.map((plan, index) => (
              <Grid item xs={12} md={8} key={index}>
                <motion.div whileHover={{ y: -8 }} style={{ height: '100%' }}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: theme.shape.borderRadiusLG,
                    p: 4,
                    border: `2px solid ${theme.palette.secondary.main}`,
                    position: 'relative'
                  }}>
                    {plan.isPopular && (
                      <Chip label="Full Access" color="secondary" sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold' }}/>
                    )}
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 0 }}>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        {plan.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', my: 2 }}>
                        <Typography variant="h3" component="span" fontWeight={800}>
                          {plan.price}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" component="span" ml={1}>
                          {plan.period}
                        </Typography>
                      </Box>
                      <Stack spacing={1.5} sx={{ my: 3, flexGrow: 1 }}>
                        {plan.features.map((feature) => (
                          <Box key={feature} sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircle size={18} style={{ marginRight: 12 }} color={theme.palette.secondary.main} />
                            <Typography variant="body2">{feature}</Typography>
                          </Box>
                        ))}
                      </Stack>
                      <Button 
                        fullWidth 
                        variant="contained"
                        color="secondary"
                        size="large"
                        sx={{ py: 1.5, borderRadius: 2 }}
                      >
                        Purchase Now
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <MotionBox>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h3" component="h2" fontWeight={700}>
                Frequently Asked Questions
              </Typography>
            </Box>
          </MotionBox>
          
          <Box>
            {faqItems.map((faq, index) => (
              <Accordion key={index} sx={{ 
                bgcolor: 'transparent', 
                boxShadow: 'none',
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&:before': { display: 'none' },
                '&.Mui-expanded': { margin: 0 }
              }}>
                <AccordionSummary
                  expandIcon={<ArrowDown />}
                  sx={{ py: 2, '& .MuiAccordionSummary-content': { margin: '0 !important' } }}
                >
                  <Typography variant="h6" fontWeight={600}>{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: 'background.paper' }}>
        <Container>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} SoftwareTemplate. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;