/**
 * Monitoring and Analytics Dashboard
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  TrendingDown,
  Speed,
  Security,
  CloudUpload,
  People,
  Work,
  Assessment,
  Warning,
  CheckCircle,
  Error,
  Info,
  Settings,
  Timeline,
  BarChart,
  PieChart,
  Activity,
  Database,
  Memory,
  Storage,
  Router,
  Lock,
  Email,
  Phone,
  AccessTime,
  Update,
  FilterList,
  Search
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { motion } from 'framer-motion';

const MonitoringDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch metrics from backend
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Mock data for charts (replace with real data)
  const performanceData = [
    { time: '00:00', requests: 120, errors: 2, latency: 45 },
    { time: '04:00', requests: 80, errors: 1, latency: 38 },
    { time: '08:00', requests: 200, errors: 3, latency: 52 },
    { time: '12:00', requests: 350, errors: 5, latency: 68 },
    { time: '16:00', requests: 280, errors: 4, latency: 58 },
    { time: '20:00', requests: 150, errors: 2, latency: 42 },
    { time: '23:59', requests: 90, errors: 1, latency: 35 }
  ];

  const systemHealthData = [
    { name: 'CPU', value: 65, fill: '#8884d8' },
    { name: 'Memory', value: 78, fill: '#82ca9d' },
    { name: 'Disk', value: 45, fill: '#ffc658' },
    { name: 'Network', value: 32, fill: '#ff7c7c' }
  ];

  const errorRateData = [
    { status: '2xx', count: 1250, color: '#4caf50' },
    { status: '4xx', count: 45, color: '#ff9800' },
    { status: '5xx', count: 12, color: '#f44336' }
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (value, thresholds = { good: 70, warning: 90 }) => {
    if (value < thresholds.good) return 'success';
    if (value < thresholds.warning) return 'warning';
    return 'error';
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading && !metrics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Speed sx={{ fontSize: 60, color: 'primary.main' }} />
        </motion.div>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" onClick={fetchMetrics}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          System Monitoring Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchMetrics}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" icon={<Assessment />} />
          <Tab label="Performance" icon={<Speed />} />
          <Tab label="Security" icon={<Security />} />
          <Tab label="System Health" icon={<Activity />} />
        </Tabs>
      </Paper>

      {/* Overview Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <Router />
                    </Avatar>
                    <Typography variant="h6">API Requests</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatNumber(1567)}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingUp color="success" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="success.main">
                      +12% from last hour
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <People />
                    </Avatar>
                    <Typography variant="h6">Active Users</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    234
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingUp color="success" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="success.main">
                      +8% from yesterday
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <CloudUpload />
                    </Avatar>
                    <Typography variant="h6">File Uploads</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    89
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingDown color="error" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="error.main">
                      -3% from last hour
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <Memory />
                    </Avatar>
                    <Typography variant="h6">Cache Hit Rate</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    94%
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <CheckCircle color="success" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="success.main">
                      Excellent performance
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Performance Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Request Volume Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="errors"
                      stackId="2"
                      stroke="#ff7c7c"
                      fill="#ff7c7c"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* System Health */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Health
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="10%"
                    outerRadius="80%"
                    data={systemHealthData}
                  >
                    <RadialBar
                      minAngle={15}
                      label={{ position: 'insideStart', fill: '#fff' }}
                      background
                      dataKey="value"
                    />
                    <RechartsTooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Performance Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Response Time Trends
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="latency"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ fill: '#8884d8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Error Rate Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={errorRateData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {errorRateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics Table
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Endpoint</TableCell>
                        <TableCell>Avg Response Time</TableCell>
                        <TableCell>Request Count</TableCell>
                        <TableCell>Error Rate</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>/api/auth/login</TableCell>
                        <TableCell>120ms</TableCell>
                        <TableCell>234</TableCell>
                        <TableCell>2.1%</TableCell>
                        <TableCell>
                          <Chip label="Good" color="success" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>/api/candidate/jobs</TableCell>
                        <TableCell>85ms</TableCell>
                        <TableCell>567</TableCell>
                        <TableCell>0.8%</TableCell>
                        <TableCell>
                          <Chip label="Excellent" color="success" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>/api/candidate/upload-resume</TableCell>
                        <TableCell>450ms</TableCell>
                        <TableCell>89</TableCell>
                        <TableCell>5.6%</TableCell>
                        <TableCell>
                          <Chip label="Warning" color="warning" size="small" />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Security Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <Lock />
                  </Avatar>
                  <Typography variant="h6">Security Status</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  All security systems operational
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Rate limiting active" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Input validation enabled" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="JWT tokens secure" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText primary="3 failed login attempts" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Security Events
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Event</TableCell>
                        <TableCell>Source IP</TableCell>
                        <TableCell>Severity</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>14:32:15</TableCell>
                        <TableCell>Failed login attempt</TableCell>
                        <TableCell>192.168.1.100</TableCell>
                        <TableCell>
                          <Chip label="Medium" color="warning" size="small" />
                        </TableCell>
                        <TableCell>Blocked</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>14:28:42</TableCell>
                        <TableCell>Rate limit exceeded</TableCell>
                        <TableCell>10.0.0.45</TableCell>
                        <TableCell>
                          <Chip label="Low" color="info" size="small" />
                        </TableCell>
                        <TableCell>Throttled</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>14:15:30</TableCell>
                        <TableCell>Invalid file upload</TableCell>
                        <TableCell>172.16.0.22</TableCell>
                        <TableCell>
                          <Chip label="Medium" color="warning" size="small" />
                        </TableCell>
                        <TableCell>Rejected</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* System Health Tab */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  CPU Usage
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <Database sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h4">65%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={65}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Normal operation
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Memory Usage
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <Memory sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h4">78%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={78}
                  sx={{ height: 8, borderRadius: 4 }}
                  color="success"
                />
                <Typography variant="body2" color="text.secondary" mt={1}>
                  6.2GB / 8GB
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Disk Usage
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <Storage sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h4">45%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={45}
                  sx={{ height: 8, borderRadius: 4 }}
                  color="warning"
                />
                <Typography variant="body2" color="text.secondary" mt={1}>
                  225GB / 500GB
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Network I/O
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <Router sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="h4">32%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={32}
                  sx={{ height: 8, borderRadius: 4 }}
                  color="info"
                />
                <Typography variant="body2" color="text.secondary" mt={1}>
                  125 Mbps
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Services Status
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" p={2} bgcolor="grey.50" borderRadius={2}>
                      <CheckCircle color="success" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle1">FastAPI Server</Typography>
                        <Typography variant="body2" color="text.secondary">Running - Uptime: 2d 14h 32m</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" p={2} bgcolor="grey.50" borderRadius={2}>
                      <CheckCircle color="success" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle1">Database</Typography>
                        <Typography variant="body2" color="text.secondary">Connected - 0ms latency</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" p={2} bgcolor="grey.50" borderRadius={2}>
                      <CheckCircle color="success" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle1">ML Service</Typography>
                        <Typography variant="body2" color="text.secondary">Operational - 98% accuracy</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" p={2} bgcolor="grey.50" borderRadius={2}>
                      <CheckCircle color="success" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle1">File Storage</Typography>
                        <Typography variant="body2" color="text.secondary">Healthy - 45% used</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Metric Details</DialogTitle>
        <DialogContent>
          {selectedMetric && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedMetric.name}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedMetric.description}
              </Typography>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th">Current Value</TableCell>
                      <TableCell>{selectedMetric.value}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">Status</TableCell>
                      <TableCell>
                        <Chip label={selectedMetric.status} color={selectedMetric.color} size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">Last Updated</TableCell>
                      <TableCell>{selectedMetric.lastUpdated}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MonitoringDashboard;
