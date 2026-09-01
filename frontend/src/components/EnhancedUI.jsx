"""
Enhanced UI components with modern design patterns
"""
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
  Fade,
  Slide,
  Grow,
  IconButton,
  Tooltip,
  Badge,
  Avatar,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Paper,
  Grid,
  Container,
  Stack,
  Skeleton
} from '@mui/material';
import {
  ExpandMore,
  Refresh,
  CloudUpload,
  Search,
  FilterList,
  TrendingUp,
  Assessment,
  People,
  Work,
  School,
  Code,
  Business,
  Email,
  Phone,
  LocationOn,
  Schedule,
  CheckCircle,
  Error,
  Warning,
  Info,
  Lightbulb,
  Psychology,
  Speed,
  Security,
  Analytics
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { alpha, useTheme } from '@mui/material/styles';

// Animated Card Component
export const AnimatedCard = ({ children, delay = 0, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
    >
      <Card {...props}>
        {children}
      </Card>
    </motion.div>
  );
};

// Enhanced Loading Component
export const EnhancedLoading = ({ message = 'Loading...', size = 'medium' }) => {
  const theme = useTheme();
  
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      gap={2}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <CircularProgress 
          size={size === 'small' ? 40 : size === 'large' ? 80 : 60}
          thickness={4}
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            borderRadius: '50%'
          }}
        />
      </motion.div>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

// Modern Alert Component
export const ModernAlert = ({ severity, message, action, onClose }) => {
  const getIcon = () => {
    switch (severity) {
      case 'success': return <CheckCircle />;
      case 'error': return <Error />;
      case 'warning': return <Warning />;
      default: return <Info />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Alert
        severity={severity}
        icon={getIcon()}
        action={action}
        onClose={onClose}
        sx={{
          borderRadius: 2,
          '& .MuiAlert-message': {
            fontWeight: 500
          }
        }}
      >
        {message}
      </Alert>
    </motion.div>
  );
};

// Enhanced Stats Card
export const StatsCard = ({ title, value, icon, trend, color = 'primary', subtitle }) => {
  const theme = useTheme();
  
  return (
    <AnimatedCard>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette[color].main, 0.1),
              color: theme.palette[color].main,
              width: 56,
              height: 56
            }}
          >
            {icon}
          </Avatar>
          {trend && (
            <Chip
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              color={trend > 0 ? 'success' : 'error'}
              size="small"
              icon={<TrendingUp />}
            />
          )}
        </Box>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </AnimatedCard>
  );
};

// Interactive Job Card
export const InteractiveJobCard = ({ job, onApply, saved, onSave }) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <AnimatedCard>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {job.job_title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {job.company_name}
            </Typography>
          </Box>
          <IconButton
            onClick={() => onSave(job.id)}
            color={saved ? 'primary' : 'default'}
          >
            <Bookmark />
          </IconButton>
        </Box>
        
        <Typography variant="body2" color="text.secondary" mb={2}>
          {job.job_description?.substring(0, 150)}...
        </Typography>
        
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          {job.required_skills?.slice(0, 3).map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              size="small"
              variant="outlined"
              color="primary"
            />
          ))}
          {job.required_skills?.length > 3 && (
            <Chip
              label={`+${job.required_skills.length - 3} more`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Posted {new Date(job.created_at).toLocaleDateString()}
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => onApply(job.id)}
            startIcon={<Work />}
          >
            Apply Now
          </Button>
        </Box>
      </CardContent>
    </AnimatedCard>
  );
};

// Enhanced Search Bar
export const EnhancedSearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  onSearch, 
  placeholder = "Search...",
  filters = null 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <Paper
      elevation={isFocused ? 8 : 2}
      sx={{
        p: 2,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        background: theme => alpha(theme.palette.background.paper, 0.9)
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Search color="action" />
        <TextField
          fullWidth
          variant="standard"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          InputProps={{
            disableUnderline: true
          }}
        />
        {filters && (
          <IconButton onClick={filters}>
            <FilterList />
          </IconButton>
        )}
        <Button
          variant="contained"
          onClick={onSearch}
          startIcon={<Search />}
          sx={{ borderRadius: 2 }}
        >
          Search
        </Button>
      </Box>
    </Paper>
  );
};

// Skill Progress Component
export const SkillProgress = ({ skills, title = "Skills" }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Stack spacing={2}>
        {skills.map((skill, index) => (
          <Box key={index}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" fontWeight="medium">
                {skill.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {skill.level}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={skill.level}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${skill.color || '#1976d2'}, ${skill.color || '#42a5f5'})`
                }
              }}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

// Dashboard Analytics Component
export const DashboardAnalytics = ({ data }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <StatsCard
          title="Total Applications"
          value={data.totalApplications}
          icon={<Work />}
          trend={data.applicationsTrend}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatsCard
          title="Profile Views"
          value={data.profileViews}
          icon={<People />}
          trend={data.viewsTrend}
          color="secondary"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatsCard
          title="Fit Score"
          value={`${data.averageFit}%`}
          icon={<Assessment />}
          trend={data.fitTrend}
          color="success"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatsCard
          title="Active Jobs"
          value={data.activeJobs}
          icon={<Business />}
          trend={data.jobsTrend}
          color="warning"
        />
      </Grid>
    </Grid>
  );
};

// Responsive Tab Panel
export const ResponsiveTabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </Box>
      )}
    </div>
  );
};

// Enhanced Form Component
export const EnhancedForm = ({ children, onSubmit, loading, error }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={onSubmit}>
        <Stack spacing={3}>
          {error && (
            <ModernAlert severity="error" message={error} />
          )}
          {children}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ borderRadius: 2, py: 1.5 }}
          >
            {loading ? 'Processing...' : 'Submit'}
          </Button>
        </Stack>
      </form>
    </motion.div>
  );
};

// Notification Toast Component
export const NotificationToast = ({ message, type, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
      >
        <Alert
          severity={type}
          onClose={onClose}
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            borderRadius: 2
          }}
        >
          {message}
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
};

// Skeleton Loader Component
export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="rectangular" width="100%" height={60} />
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Skeleton variant="text" width="30%" height={20} />
                <Skeleton variant="rectangular" width={100} height={36} />
              </Box>
            </CardContent>
          </Card>
        );
      case 'list':
        return (
          <Box>
            {[...Array(3)].map((_, i) => (
              <Box key={i} display="flex" alignItems="center" gap={2} mb={2}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box flex={1}>
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="60%" height={16} />
                </Box>
              </Box>
            ))}
          </Box>
        );
      default:
        return <Skeleton variant="rectangular" width="100%" height={200} />;
    }
  };

  return (
    <Stack spacing={2}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </Stack>
  );
};
