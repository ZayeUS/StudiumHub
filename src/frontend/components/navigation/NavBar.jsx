import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NavBar = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const theme = useTheme();

  // Toggle Drawer (Hamburger menu)
  const toggleDrawer = () => setOpenDrawer(!openDrawer);

  return (
    <AppBar position="sticky" sx={{ backgroundColor: theme.palette.primary.main }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Your Logo
        </Typography>

        {/* Hamburger Menu Icon for mobile */}
        {isMobile ? (
          <>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={toggleDrawer}
              aria-label="menu"
              sx={{
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Drawer for mobile */}
            <Drawer anchor="right" open={openDrawer} onClose={toggleDrawer}>
              <List sx={{ width: 250 }} role="presentation">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ListItem  onClick={toggleDrawer}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <ListItemText primary="Home" sx={{ fontWeight: 600 }} />
                    </Link>
                  </ListItem>
                  <ListItem  onClick={toggleDrawer}>
                    <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <ListItemText primary="Login" sx={{ fontWeight: 600 }} />
                    </Link>
                  </ListItem>
                </motion.div>
              </List>
            </Drawer>
          </>
        ) : (
          // Desktop View
          <>
            <Button color="inherit" sx={{ fontWeight: 600 }}>
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                Home
              </Link>
            </Button>
            <Button variant="contained" color="secondary"sx={{ fontWeight: 600 }}>
              <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                
                  Login
              
              </Link>
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
