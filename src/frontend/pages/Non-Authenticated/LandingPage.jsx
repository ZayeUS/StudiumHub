import React from 'react';
import { 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Box, 
  useTheme, 
  Card, 
  CardContent,
  Divider,
  useMediaQuery,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, 
  CheckCircle, 
  Users, 
  Workflow,  
  ArrowRight,
  Star,
  Shield,
  Rocket,
  ChevronRight
} from 'lucide-react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Correct import


const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <Box sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.03), overflowX: 'hidden' }}>
      {/* Hero Section */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, px: 2, overflow: 'hidden', background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.background.paper, 1)})` }}>
        <Container maxWidth="lg">
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ background: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, px: 2, py: 0.5, borderRadius: 20, mb: 2 }}>
                      <Zap size={16} style={{ marginRight: 8 }} />
                      <Typography variant="body2" fontWeight={600}>Introducing SaaSify</Typography>
                    </Box>
                  </Box>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' }, background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Streamline Your Workflow & Boost Productivity
                  </Typography>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Typography variant="h6" color="textSecondary" sx={{ mb: 4, fontWeight: 400, maxWidth: '90%', lineHeight: 1.6 }}>
                    Take your business to the next level with our powerful, intuitive SaaS platform that adapts to your needs.
                  </Typography>
                </motion.div>
                <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="contained" color="primary" size="large" component={Link} to="/signup" disableElevation endIcon={<ArrowRight size={18} />} sx={{ borderRadius: 2, px: 4, py: 1.5, textTransform: 'none', fontWeight: 600, fontSize: '1rem' }}>
                    Get Started Free
                  </Button>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                    <CheckCircle size={16} color={theme.palette.success.main} style={{ marginRight: 8 }} />
                    <Typography variant="body2" color="textSecondary">No credit card required · 14-day free trial</Typography>
                  </Box>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} md={5} sx={{ position: 'relative' }}>
                <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
                  <Box sx={{ 
                    width: '100%', 
                    height: 250, 
                    borderRadius: 4, 
                    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.2)}`,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridGap: '16px',
                    padding: '16px',
                    backgroundColor: theme.palette.background.paper
                  }}>
                    {/* Dashboard Design Representation */}
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600}>Dashboard Overview</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" color="textSecondary">Key metrics and stats appear here.</Typography>
                      </CardContent>
                    </Card>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600}>Recent Activity</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" color="textSecondary">Latest actions and updates shown here.</Typography>
                      </CardContent>
                    </Card>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600}>Notifications</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" color="textSecondary">Important alerts and messages displayed here.</Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, background: theme.palette.background.paper }}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Box textAlign="center" mb={8}>
              <Typography variant="h3" component="h2" fontWeight={700} gutterBottom sx={{ color: theme.palette.text.primary, fontSize: { xs: '2rem', md: '2.5rem' } }}>Key Features</Typography>
              <Typography variant="h6" color="textSecondary" sx={{ maxWidth: 600, mx: 'auto', mb: 2, fontWeight: 400 }}>Everything you need to transform your workflow and boost team productivity</Typography>
            </Box>
          </motion.div>

          <Grid container spacing={4}>
            {[
              { title: "Intuitive Interface", description: "High-quality, responsive interface that adapts to your needs and works on any device.", icon: <Rocket size={24} />, color: theme.palette.primary.main },
              { title: "Real-time Collaboration", description: "Work seamlessly with your team members from anywhere in the world, in real-time.", icon: <Users size={24} />, color: theme.palette.secondary.main },
              { title: "Automated Workflows", description: "Set up custom workflows to automate repetitive tasks and reduce human error.", icon: <Workflow size={24} />, color: theme.palette.success.main },
              { title: "AI-Powered Insights", description: "Leverage machine learning to uncover valuable insights and make data-driven decisions.", icon: <Star size={24} />, color: theme.palette.warning.main },
              { title: "Enterprise Security", description: "Bank-level encryption and security measures to keep your data safe and compliant.", icon: <Shield size={24} />, color: theme.palette.error.main },
              { title: "Seamless Integrations", description: "Connect with your favorite tools and services through our extensive API and integrations.", icon: <Zap size={24} />, color: theme.palette.info.main }
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div custom={index} variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover={{ y: -10, transition: { duration: 0.3 } }}>
                  <Card elevation={0} sx={{ height: '100%', borderRadius: 4, p: 2, transition: 'all 0.3s ease', border: `1px solid ${alpha(theme.palette.divider, 0.8)}`, '&:hover': { borderColor: feature.color, boxShadow: `0 10px 30px ${alpha(feature.color, 0.15)}` } }}>
                    <CardContent>
                      <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: 2, mb: 2, backgroundColor: alpha(feature.color, 0.1), color: feature.color }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h5" component="h3" fontWeight={600} gutterBottom sx={{ color: theme.palette.text.primary }}>{feature.title}</Typography>
                      <Typography variant="body1" color="textSecondary">{feature.description}</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, background: theme.palette.background.paper }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" component="h2" fontWeight={700} gutterBottom sx={{ color: theme.palette.text.primary }}>Choose Your Plan</Typography>
            <Typography variant="h6" color="textSecondary" sx={{ maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
              Simple, transparent pricing that grows with your business.
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {[
              {
                name: "Basic",
                price: "$19",
                period: "/month",
                description: "Perfect for small teams and startups",
                features: [
                  "Up to 5 team members",
                  "3GB storage",
                  "Basic analytics",
                  "24/7 email support"
                ],
                buttonText: "Start Free Trial",
                popular: false
              },
              {
                name: "Pro",
                price: "$49",
                period: "/month",
                description: "Advanced features for growing businesses",
                features: [
                  "Up to 20 team members",
                  "25GB storage",
                  "Advanced analytics & reporting",
                  "Priority support"
                ],
                buttonText: "Start Free Trial",
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                description: "Custom solutions for large organizations",
                features: [
                  "Unlimited team members",
                  "Unlimited storage",
                  "Advanced security features",
                  "Dedicated account manager"
                ],
                buttonText: "Contact Sales",
                popular: false
              }
            ].map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ borderRadius: 4, padding: 4, boxShadow: plan.popular ? `0 12px 30px ${alpha(theme.palette.primary.main, 0.2)}` : `0 8px 20px ${alpha(theme.palette.common.black, 0.05)}` }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight={700} gutterBottom color={plan.popular ? 'primary' : 'textPrimary'}>{plan.name}</Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>{plan.description}</Typography>
                    <Typography variant="h3" component="span" fontWeight={800} color={plan.popular ? 'primary' : 'textPrimary'}>{plan.price}</Typography>
                    <Typography variant="body1" color="textSecondary" component="span" ml={0.5}>{plan.period}</Typography>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ mb: 4 }}>
                      {plan.features.map((feature, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <CheckCircle size={18} style={{ marginRight: 10 }} color={plan.popular ? theme.palette.primary.main : theme.palette.success.main} />
                          <Typography variant="body2" color="textSecondary">{feature}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Button fullWidth variant={plan.popular ? "contained" : "outlined"} color={plan.popular ? "primary" : "primary"} component={Link} to="/signup" disableElevation endIcon={<ChevronRight size={18} />}>
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, backgroundColor: alpha(theme.palette.primary.main, 0.03) }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" fontWeight={700} textAlign="center" gutterBottom sx={{ color: theme.palette.text.primary }}>Frequently Asked Questions</Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">What is SaaSify?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="textSecondary">SaaSify is a powerful platform designed to streamline workflows and boost productivity by offering intuitive tools and seamless integrations.</Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
            <Grid item xs={12} md={6}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">How can I start using SaaSify?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="textSecondary">Simply sign up for a free trial to get started! No credit card required. Start exploring the platform immediately.</Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
            <Grid item xs={12} md={6}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Are there any setup fees?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="textSecondary">No, there are no setup fees. You can start using the platform right away with no upfront costs.</Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
            <Grid item xs={12} md={6}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">What is included in the free trial?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="textSecondary">Our free trial includes full access to all features for 14 days, so you can experience the full potential of SaaSify.</Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer Section */}
      <Box component="footer" sx={{ py: 4, backgroundColor: theme.palette.background.paper, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
                SaaSify
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Empowering businesses to streamline operations and drive success with our intuitive SaaS platform.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
                Quick Links
              </Typography>
              <Box>
                <Typography variant="body2" color="textSecondary" component={Link} to="/" sx={{ textDecoration: 'none', display: 'block', mb: 1 }}>
                  Home
                </Typography>
                <Typography variant="body2" color="textSecondary" component={Link} to="/features" sx={{ textDecoration: 'none', display: 'block', mb: 1 }}>
                  Features
                </Typography>
                <Typography variant="body2" color="textSecondary" component={Link} to="/pricing" sx={{ textDecoration: 'none', display: 'block', mb: 1 }}>
                  Pricing
                </Typography>
                <Typography variant="body2" color="textSecondary" component={Link} to="/contact" sx={{ textDecoration: 'none', display: 'block' }}>
                  Contact
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
                Follow Us
              </Typography>

            </Grid>
          </Grid>
          <Box mt={4} textAlign="center">
            <Typography variant="body2" color="textSecondary">
              © {new Date().getFullYear()} SaaSify. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default LandingPage;
