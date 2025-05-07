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
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
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
  const userId = useUserStore((state) => state.userId);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const loading = useUserStore((state) => state.loading);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
    <Container maxWidth="lg" sx={{ pt: 8, pb: 6 }}>
      <Typography variant="h4" color="primary" align="center" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="subtitle1" align="center" gutterBottom>
        {`Admin ID: ${userId}`}
      </Typography>

      <Box sx={{ mt: 6, mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center">
          <Typography variant="h5" component="h2">
            Audit Logs
          </Typography>
          <Tooltip title="Shows the last 100 system activities">
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Times displayed in: {Intl.DateTimeFormat().resolvedOptions().timeZone}
        </Typography>
      </Box>

      {loadingAudit ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper elevation={0} sx={{ p: 3, bgcolor: "error.light", color: "error.contrastText", borderRadius: 2 }}>
          <Typography>{error}</Typography>
        </Paper>
      ) : auditLogs.length === 0 ? (
        <Paper elevation={1} sx={{ p: 3, bgcolor: "grey.100", borderRadius: 2, textAlign: "center" }}>
          <Typography>No audit logs found</Typography>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ overflowX: "auto", borderRadius: 2 }}>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead sx={{ bgcolor: "primary.main" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Action</TableCell>
                {!isMobile && <TableCell sx={{ color: "white", fontWeight: 600 }}>Table</TableCell>}
                {!isMobile && <TableCell sx={{ color: "white", fontWeight: 600 }}>Record ID</TableCell>}
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  {isMobile ? "Meta" : "Metadata"}
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Timestamp (UTC)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow
                  key={log.log_id}
                  hover
                  sx={{ "&:nth-of-type(odd)": { bgcolor: "rgba(0, 0, 0, 0.03)" } }}
                >
                  <TableCell>{log.email || "System"}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      size="small"
                      color={getActionColor(log.action)}
                      sx={{ fontWeight: 500 }}
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
      )}
    </Container>
  );
};
