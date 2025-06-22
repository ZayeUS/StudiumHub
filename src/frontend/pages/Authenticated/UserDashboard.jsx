import React, { useState, useEffect } from 'react';
import {
  Typography, Container, Box, Button, Paper, Grid, alpha,
  Card, CardContent, CardActions, Chip, Stack, CircularProgress
} from '@mui/material';
import { useUserStore } from '../../store/userStore';
import { RocketLaunch, Add, ChevronRight } from '@mui/icons-material';
import { motion } from 'framer-motion'; // <-- THE MISSING IMPORT IS ADDED HERE

// This is a placeholder for your real project data.
const MOCK_PROJECTS = [
    { id: 1, name: 'SaaS Boilerplate', status: 'Active', lastUpdated: '2 hours ago' },
    { id: 2, name: 'Client Portal', status: 'In Progress', lastUpdated: '1 day ago' },
    { id: 3, name: 'AI Writing Tool', status: 'On Hold', lastUpdated: '3 days ago' },
];

const EmptyState = () => (
  <Paper sx={{ textAlign: 'center', p: { xs: 4, sm: 8 }, mt: 4, bgcolor: theme => alpha(theme.palette.primary.main, 0.05), border: theme => `1px dashed ${theme.palette.divider}` }}>
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}>
      <RocketLaunch sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
      <Typography variant="h5" fontWeight={700} gutterBottom>Welcome to Your Dashboard!</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>You haven't created any projects yet. Let's get started by creating your very first one.</Typography>
      <Button variant="contained" size="large" startIcon={<Add />}>Create Your First Project</Button>
    </motion.div>
  </Paper>
);

const ActiveDashboard = ({ projects, profile }) => {
    const getStatusChip = (status) => {
        const color = status === 'Active' ? 'success' : status === 'On Hold' ? 'warning' : 'info';
        return <Chip label={status} color={color} size="small" />;
    };

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
                <Typography variant="h4" fontWeight={700}>Welcome, {profile?.first_name || 'User'}</Typography>
                <Typography color="text.secondary">Here's a look at your projects.</Typography>
            </Box>
            <Button variant="contained" startIcon={<Add />}>New Project</Button>
        </Box>
        <Grid container spacing={3}>
            {projects.map(project => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h6" fontWeight={600}>{project.name}</Typography>
                                    {getStatusChip(project.status)}
                                </Box>
                                <Typography variant="body2" color="text.secondary">Last updated: {project.lastUpdated}</Typography>
                            </CardContent>
                            <CardActions sx={{ px: 2, pb: 2 }}>
                                <Button size="small" endIcon={<ChevronRight />}>View Project</Button>
                            </CardActions>
                        </Card>
                    </motion.div>
                </Grid>
            ))}
        </Grid>
      </Box>
    );
};

export function UserDashboard() {
  const { profile } = useUserStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects(MOCK_PROJECTS);
      // setProjects([]); // <-- Uncomment this line to see the empty state in action
      setLoading(false);
    }, 1000); 
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      {projects.length === 0 ? <EmptyState /> : <ActiveDashboard projects={projects} profile={profile} />}
    </Container>
  );
}