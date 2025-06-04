import React, { useEffect, useState } from "react";
import {
  Typography,
  Container,
  Paper,
  CircularProgress,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Avatar,
  Divider
} from "@mui/material";
import { 
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
   MoreVertical as MoreVert,
  RefreshCwIcon as Refresh,
  Download,
  Settings,
  Database,
  Shield,
  Mail
} from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { LoadingModal } from "../../components/LoadingModal";
import { getData } from "../../utils/BackendRequestHelper";

// Mock data for demonstration
const mockDashboardData = {
  stats: {
    totalUsers: 1247,
    activeUsers: 892,
    newUsersToday: 23,
    systemUptime: "99.8%"
  },
  userGrowth: {
    thisMonth: 15.3,
    lastMonth: 12.1
  },
  recentActivity: [
    { id: 1, user: "john.doe@email.com", action: "User Registration", time: "2 minutes ago", type: "success" },
    { id: 2, user: "admin@cofoundless.com", action: "System Update", time: "15 minutes ago", type: "info" },
    { id: 3, user: "jane.smith@email.com", action: "Profile Updated", time: "1 hour ago", type: "info" },
    { id: 4, user: "system", action: "Backup Completed", time: "2 hours ago", type: "success" },
    { id: 5, user: "mike.wilson@email.com", action: "Failed Login", time: "3 hours ago", type: "warning" }
  ],
  systemHealth: {
    database: "healthy",
    api: "healthy", 
    storage: "warning",
    email: "healthy"
  },
  quickActions: [
    { label: "Manage Users", icon: <Users size={20} />, action: "users" },
    { label: "System Settings", icon: <Settings size={20} />, action: "settings" },
    { label: "Backup Data", icon: <Database size={20} />, action: "backup" },
    { label: "Security Logs", icon: <Shield size={20} />, action: "security" }
  ]
};

const StatCard = ({ title, value, subtitle, trend, icon, color = "primary" }) => {
  const theme = useTheme();
  const isPositive = trend > 0;
  
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {isPositive ? (
                  <TrendingUp size={16} color={theme.palette.success.main} />
                ) : (
                  <TrendingDown size={16} color={theme.palette.error.main} />
                )}
                <Typography 
                  variant="body2" 
                  color={isPositive ? "success.main" : "error.main"}
                  sx={{ ml: 0.5 }}
                >
                  {Math.abs(trend)}% from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Box 
            sx={{ 
              p: 1.5, 
              borderRadius: theme.shape.borderRadius,
              bgcolor: `${theme.palette[color].main}15`,
              color: theme.palette[color].main
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const SystemHealthCard = ({ systems }) => {
  const theme = useTheme();
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      case 'error': return <AlertTriangle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const systemItems = [
    { key: 'database', label: 'Database', icon: <Database size={18} /> },
    { key: 'api', label: 'API Server', icon: <Activity size={18} /> },
    { key: 'storage', label: 'File Storage', icon: <Database size={18} /> },
    { key: 'email', label: 'Email Service', icon: <Mail size={18} /> }
  ];

  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            System Health
          </Typography>
          <IconButton size="small">
            <Refresh size={18} />
          </IconButton>
        </Box>
        
        <List disablePadding>
          {systemItems.map((item, index) => (
            <React.Fragment key={item.key}>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: getStatusColor(systems[item.key]) }}>
                    {getStatusIcon(systems[item.key])}
                  </Box>
                  <Chip 
                    label={systems[item.key]} 
                    size="small"
                    color={systems[item.key] === 'healthy' ? 'success' : systems[item.key] === 'warning' ? 'warning' : 'error'}
                    variant="outlined"
                  />
                </Box>
              </ListItem>
              {index < systemItems.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

const RecentActivityCard = ({ activities }) => {
  const theme = useTheme();
  
  const getActivityColor = (type) => {
    switch (type) {
      case 'success': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.info.main;
    }
  };

  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Recent Activity
          </Typography>
          <Button size="small" endIcon={<MoreVert size={16} />}>
            View All
          </Button>
        </Box>
        
        <List disablePadding>
          {activities.slice(0, 5).map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem disablePadding sx={{ py: 1.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Avatar 
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      bgcolor: getActivityColor(activity.type),
                      fontSize: '0.75rem'
                    }}
                  >
                    {activity.user.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemIcon>
                <ListItemText 
                  primary={activity.action}
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {activity.user}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        • {activity.time}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < activities.length - 1 && index < 4 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

const QuickActionsCard = ({ actions }) => {
  const handleAction = (action) => {
    console.log(`Executing action: ${action}`);
    // Handle navigation or action execution
  };

  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        
        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid item xs={6} key={index}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={action.icon}
                onClick={() => handleAction(action.action)}
                sx={{ 
                  py: 1.5,
                  justifyContent: 'flex-start',
                  textAlign: 'left'
                }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export const AdminDashboard = () => {
  const { userId, isLoggedIn, loading } = useUserStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    if (!isLoggedIn) return;
    try {
      setLoadingData(true);
      setError(null);
      // Simulate API call - replace with real endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDashboardData(mockDashboardData);
    } catch (err) {
      setError("Unable to load dashboard data. Please try again later.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isLoggedIn]);

  if (loading) return <LoadingModal message="Loading admin dashboard..." />;

  if (!isLoggedIn) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h4" color="error" gutterBottom>
          Access Restricted
        </Typography>
        <Typography variant="body1">
          You must be logged in as an administrator to view this page.
        </Typography>
      </Container>
    );
  }

  if (loadingData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Dashboard
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button variant="contained" onClick={fetchDashboardData}>
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        py: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh Data">
                <IconButton onClick={fetchDashboardData}>
                  <Refresh size={20} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Report">
                <IconButton>
                  <Download size={20} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary">
            System overview and management tools
          </Typography>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={dashboardData.stats.totalUsers.toLocaleString()}
              icon={<Users size={24} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Users"
              value={dashboardData.stats.activeUsers.toLocaleString()}
              subtitle="Currently online"
              icon={<Activity size={24} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="New Users Today"
              value={dashboardData.stats.newUsersToday}
              trend={dashboardData.userGrowth.thisMonth}
              icon={<TrendingUp size={24} />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="System Uptime"
              value={dashboardData.stats.systemUptime}
              subtitle="Last 30 days"
              icon={<CheckCircle size={24} />}
              color="success"
            />
          </Grid>
        </Grid>

        {/* Main Dashboard Content */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <SystemHealthCard systems={dashboardData.systemHealth} />
          </Grid>
          <Grid item xs={12} lg={6}>
            <QuickActionsCard actions={dashboardData.quickActions} />
          </Grid>
          <Grid item xs={12}>
            <RecentActivityCard activities={dashboardData.recentActivity} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};