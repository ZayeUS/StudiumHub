import React, { useEffect, useState } from "react";
import {
  Typography,
  Container,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Box,
  Chip,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery,
  Fade,
  Button
} from "@mui/material";
import { 
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon 
} from "@mui/icons-material";
import { useUserStore } from "../../store/userStore";
import { LoadingModal } from "../../components/LoadingModal";
import { getData } from "../../utils/BackendRequestHelper";

// Helpers
const formatTimestamp = (isoTimestamp) => {
  if (!isoTimestamp) return "—";
  try {
    const date = new Date(isoTimestamp);
    if (isNaN(date.getTime())) return "Invalid date";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }).format(date);
  } catch {
    return "Format error";
  }
};

const formatMetadata = (metadata) => {
  if (!metadata) return "—";
  try {
    const data = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
    if (!data || Object.keys(data).length === 0) return "No data";
    return Object.entries(data)
      .map(([key, value]) => {
        const displayValue =
          typeof value === "object"
            ? "[Object]"
            : typeof value === "string" && value.length > 15
            ? value.substring(0, 12) + "..."
            : String(value);
        return `${key}: ${displayValue}`;
      })
      .join(", ");
  } catch {
    return "Invalid format";
  }
};

const getActionColor = (action) => {
  if (!action) return "default";
  const map = {
    create: "success",
    update: "info",
    delete: "error",
    login: "primary",
    logout: "default",
  };
  const key = Object.keys(map).find((k) => action.toLowerCase().includes(k));
  return key ? map[key] : "secondary";
};

const formatUuid = (uuid) => (uuid ? uuid.substring(0, 8) + "..." : "—");

export const AdminDashboard = () => {
  const { userId, isLoggedIn, loading } = useUserStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    if (!isLoggedIn) return;
    try {
      setLoadingAudit(true);
      setError(null);
      const data = await getData("/audit");
      setAuditLogs(data);
    } catch {
      setError("Unable to load audit logs. Please try again later.");
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [isLoggedIn]);

  if (loading) return <LoadingModal message="Loading admin panel..." />;

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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark'
            ? `radial-gradient(circle at 20% 80%, ${theme.palette.primary.dark}20 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, ${theme.palette.secondary.dark}15 0%, transparent 50%)`
            : `radial-gradient(circle at 20% 80%, ${theme.palette.primary.light}20 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, ${theme.palette.secondary.light}15 0%, transparent 50%)`,
          animation: "drift 20s ease-in-out infinite",
          zIndex: 0,
        },
        "@keyframes drift": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(-20px, -20px)" },
        }
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 4, pb: 6, position: "relative", zIndex: 1 }}>
        <Fade in timeout={500}>
          <Box>
            <Typography 
              variant="h4" 
              fontWeight="bold"
              sx={{
                mb: 1,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                textFillColor: "transparent",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Admin Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 5 }}>
              System Activity Logs
            </Typography>
          </Box>
        </Fade>

      

        {loadingAudit ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Fade in timeout={800}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                bgcolor: theme.palette.error.main + '20',
                color: theme.palette.error.main,
                borderRadius: 3, 
                textAlign: "center",
                border: `1px solid ${theme.palette.error.main}40`
              }}
            >
              <Typography>{error}</Typography>
            </Paper>
          </Fade>
        ) : auditLogs.length === 0 ? (
          <Fade in timeout={800}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderRadius: 3, 
                textAlign: "center",
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography color="text.secondary">No audit logs found</Typography>
            </Paper>
          </Fade>
        ) : (
          <Fade in timeout={800}>
            <Paper 
              elevation={0} 
              sx={{ 
                overflowX: "auto", 
                borderRadius: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      fontWeight: 600 
                    }}>
                      User
                    </TableCell>
                    <TableCell sx={{ 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      fontWeight: 600 
                    }}>
                      Action
                    </TableCell>
                    {!isMobile && (
                      <TableCell sx={{ 
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        fontWeight: 600 
                      }}>
                        Table
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell sx={{ 
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        fontWeight: 600 
                      }}>
                        Record ID
                      </TableCell>
                    )}
                    <TableCell sx={{ 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      fontWeight: 600 
                    }}>
                      {isMobile ? "Meta" : "Metadata"}
                    </TableCell>
                    <TableCell sx={{ 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      fontWeight: 600 
                    }}>
                      Timestamp
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow
                      key={log.log_id}
                      hover
                      sx={{ 
                        "&:nth-of-type(odd)": { 
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
                        },
                        "&:hover": {
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                        }
                      }}
                    >
                      <TableCell>{log.email || "System"}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.action}
                          size="small"
                          color={getActionColor(log.action)}
                          sx={{ 
                            fontWeight: 500,
                            borderRadius: 2
                          }}
                        />
                      </TableCell>
                      {!isMobile && <TableCell>{log.table_name || "—"}</TableCell>}
                      {!isMobile && (
                        <TableCell>
                          <Tooltip title={log.record_id || "None"}>
                            <span>{formatUuid(log.record_id)}</span>
                          </Tooltip>
                        </TableCell>
                      )}
                      <TableCell>
                        <Tooltip
                          title={
                            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          }
                          arrow
                        >
                          <Box component="span" sx={{ cursor: "pointer" }}>
                            {formatMetadata(log.metadata)}
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{formatTimestamp(log.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Fade>
        )}
      </Container>
    </Box>
  );
};