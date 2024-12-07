import React from 'react';
import { Button, Container, Grid, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom'; // Use Link for routing

const LandingPage = () => {
  return (
    <div style={{ backgroundColor: "#F8F9FA" }}>  {/* Use the background color from the theme */}
      
      {/* Hero Section */}
      <section style={{ padding: '80px 0', textAlign: 'center' }}>
        <Container>
          <Typography variant="h1" color="primary" gutterBottom>
            Your Logo Here
          </Typography>
          <Typography variant="h5" color="textSecondary" paragraph>
            Streamline your workflow and boost productivity with our powerful SaaS solution. Try it now!
          </Typography>
          <Button variant="contained" color="primary" size="large" component={Link} to="/signup">
            Get Started
          </Button>
        </Container>
      </section>

      {/* Features Section */}
      <section style={{ padding: '60px 0', backgroundColor: "#FFFFFF", borderRadius: '8px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
        <Container>
          <Typography variant="h4" align="center" color="primary" gutterBottom>
            Key Features
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary" gutterBottom>
                  Feature 1
                </Typography>
                <Typography color="textSecondary">
                  High-quality, responsive interface that adapts to your needs.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary" gutterBottom>
                  Feature 2
                </Typography>
                <Typography color="textSecondary">
                  Real-time collaboration with your team, anywhere, anytime.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary" gutterBottom>
                  Feature 3
                </Typography>
                <Typography color="textSecondary">
                  Automated workflows to save you time and reduce errors.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '60px 0', backgroundColor: "#F8F9FA" }}>
        <Container>
          <Typography variant="h4" align="center" color="primary" gutterBottom>
            What Our Customers Say
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <Box textAlign="center" boxShadow={3} padding={3} borderRadius={2}>
                <Typography variant="body1" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  "This product has changed the way our team works. We’re saving hours each week!"
                </Typography>
                <Typography variant="h6" color="primary">John Doe</Typography>
                <Typography color="textSecondary">CEO, Company X</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box textAlign="center" boxShadow={3} padding={3} borderRadius={2}>
                <Typography variant="body1" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  "Amazing tool! The features are intuitive, and the team is always ready to help."
                </Typography>
                <Typography variant="h6" color="primary">Jane Smith</Typography>
                <Typography color="textSecondary">Marketing Manager, Company Y</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '60px 0', backgroundColor: "#FFFFFF", borderRadius: '8px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
        <Container>
          <Typography variant="h4" align="center" color="primary" gutterBottom>
            Choose Your Plan
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Box textAlign="center" boxShadow={3} padding={3} borderRadius={2}>
                <Typography variant="h5" color="primary">Basic Plan</Typography>
                <Typography variant="h6" color="textSecondary">$19/month</Typography>
                <Typography color="textSecondary">Basic features for small teams.</Typography>
                <Button variant="contained" color="primary" size="small" component={Link} to="/signup" style={{ marginTop: '20px' }}>
                  Start Free Trial
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center" boxShadow={3} padding={3} borderRadius={2}>
                <Typography variant="h5" color="primary">Pro Plan</Typography>
                <Typography variant="h6" color="textSecondary">$49/month</Typography>
                <Typography color="textSecondary">Advanced features for growing businesses.</Typography>
                <Button variant="contained" color="primary" size="small" component={Link} to="/signup" style={{ marginTop: '20px' }}>
                  Start Free Trial
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center" boxShadow={3} padding={3} borderRadius={2}>
                <Typography variant="h5" color="primary">Enterprise Plan</Typography>
                <Typography variant="h6" color="textSecondary">Contact us</Typography>
                <Typography color="textSecondary">Custom solutions for large organizations.</Typography>
                <Button variant="contained" color="primary" size="small" component={Link} to="/signup" style={{ marginTop: '20px' }}>
                  Contact Sales
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '60px 0', textAlign: 'center', backgroundColor: "#F8F9FA" }}>
        <Container>
          <Typography variant="h4" color="primary" gutterBottom>
            Ready to get started?
          </Typography>
          <Button variant="contained" color="primary" size="large" component={Link} to="/signup">
            Sign Up Now
          </Button>
        </Container>
      </section>

      {/* Footer */}
      <footer style={{ padding: '20px 0', backgroundColor: "#FFFFFF", textAlign: 'center' }}>
        <Typography color="textSecondary">
          &copy; 2024 Your SaaS Company. All rights reserved.
        </Typography>
        <Typography color="textSecondary">
          <a href="#terms" style={{ color: "#777" }}>Terms of Service</a> | <a href="#privacy" style={{ color: "#777" }}>Privacy Policy</a>
        </Typography>
      </footer>
    </div>
  );
};

export default LandingPage;
