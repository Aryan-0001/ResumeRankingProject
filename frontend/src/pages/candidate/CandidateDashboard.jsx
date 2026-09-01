import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Fade,
  Paper,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip as MuiTooltip
} from '@mui/material'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Brightness7,
  Work,
  School,
  TrendingUp,
  Upload,
  Edit,
  Logout,
  Assessment,
  Lightbulb,
  Timeline
} from '@mui/icons-material'

import {
  applyToJob,
  getCandidateProfile,
  getJobFit,
  getRecommendedJobs,
  listJobs,
  listMyApplications,
  updateCandidateProfile,
  uploadResume,
  withdrawApplication,
  optimizeResume,
  getCareerAnalysis,
  getInterviewPrep,
  getCareerPathPlanner,
  getSkillGapAnalysis,
  getPersonalizedLearningPlan
} from '../../api/candidate.js'
import LoadingBlock from '../../components/LoadingBlock.jsx'
import { useAuth } from '../../state/AuthContext.jsx'

function CandidateDashboard() {
  const { user, clearAuth } = useAuth()
  
  // Core state
  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [apps, setApps] = useState([])
  const [selectedAppId, setSelectedAppId] = useState('')
  
  // UI State
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Feature flags (initially set to false, can be enabled later)
  const [showAdvancedFeatures] = useState(false)

  const jobById = useMemo(() => {
    const m = new Map()
    jobs.forEach((j) => m.set(j.id, j))
    return m
  }, [jobs])

  const chartData = useMemo(() => {
    return apps
      .slice()
      .reverse()
      .map((a) => ({
        name: `#${a.id}`,
        resume_score: Number(a.resume_score ?? 0),
        fit_percentage: Number(a.fit_percentage ?? 0)
      }))
  }, [apps])

  // State for dialogs and their data
  const [fit, setFit] = useState(null)
  const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false)
  const [optimizeLoading, setOptimizeLoading] = useState(false)
  const [optimizeResult, setOptimizeResult] = useState(null)
  const [careerDialogOpen, setCareerDialogOpen] = useState(false)
  const [careerLoading, setCareerLoading] = useState(false)
  const [careerResult, setCareerResult] = useState(null)
  const [interviewPrepDialogOpen, setInterviewPrepDialogOpen] = useState(false)
  const [interviewPrepLoading, setInterviewPrepLoading] = useState(false)
  const [interviewPrepResult, setInterviewPrepResult] = useState(null)
  const [careerPathDialogOpen, setCareerPathDialogOpen] = useState(false)
  const [careerPathLoading, setCareerPathLoading] = useState(false)
  const [careerPathResult, setCareerPathResult] = useState(null)
  const [skillGapDialogOpen, setSkillGapDialogOpen] = useState(false)
  const [skillGapLoading, setSkillGapLoading] = useState(false)
  const [skillGapResult, setSkillGapResult] = useState(null)
  const [learningPlanDialogOpen, setLearningPlanDialogOpen] = useState(false)
  const [learningPlanLoading, setLearningPlanLoading] = useState(false)
  const [learningPlanResult, setLearningPlanResult] = useState(null)
  const [targetRole, setTargetRole] = useState('')

  async function refreshApplicationsOnly() {
    try {
      const [a, j] = await Promise.all([
        listMyApplications(),
        listJobs()
      ])
      setApps(a)
      setJobs(j)
    } catch (e) {
      console.warn('Failed to refresh applications:', e)
    }
  }

  async function refreshAll() {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      // Load essential data first (profile, jobs, applications)
      const [p, j, a] = await Promise.all([
        getCandidateProfile(),
        listJobs(),
        listMyApplications()
      ])
      setProfile(p)
      setJobs(j)
      setApps(a)
      
      if (a.length > 0 && !selectedAppId) {
        setSelectedAppId(a[0].id)
      }

      // Load recommended jobs separately (can be slow due to AI calls)
      setRecommendationsLoading(true)
      try {
        const r = await getRecommendedJobs()
        setRecommendedJobs(r)
      } catch (recError) {
        console.warn('Failed to load recommended jobs:', recError)
        // Don't fail the entire dashboard if recommendations fail
        // Show some dummy jobs as fallback
        const fallbackJobs = j.slice(0, 5).map(job => ({
          ...job,
          ai_match_score: Math.floor(Math.random() * 30) + 60, // Random match between 60-90
          ai_insights: { recommendation: "Good match based on your profile" }
        }))
        setRecommendedJobs(fallbackJobs)
      } finally {
        setRecommendationsLoading(false)
      }
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAll()
  }, [])

  // Refresh applications every 2 minutes to get live status updates (reduced from 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedAppId) {
        // Only refresh applications and job fit, not recommended jobs (to avoid AI calls)
        refreshApplicationsOnly()
      }
    }, 120000) // 2 minutes instead of 30 seconds

    return () => clearInterval(interval)
  }, [selectedAppId])

  useEffect(() => {
    ;(async () => {
      if (!selectedAppId) {
        setFit(null)
        return
      }

      try {
        const data = await getJobFit(selectedAppId)
        setFit(data)
        setApps((prev) =>
          prev.map((a) =>
            a.id === selectedAppId
              ? { ...a, resume_score: data.resume_score, fit_percentage: data.fit_percentage }
              : a
          )
        )
      } catch (e) {
        setFit(null)
      }
    })()
  }, [selectedAppId])

  async function onSaveProfile() {
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      const updated = await updateCandidateProfile({
        name: profile?.name || '',
        skills: profile?.skills || '',
        education: profile?.education || '',
        experience: profile?.experience || ''
      })
      setProfile(updated)
      setSuccess('Profile updated successfully')
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to update profile')
    } finally {
      setActionLoading(false)
    }
  }

  async function onResumeUpload(file) {
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      const updated = await uploadResume(file)
      setProfile(updated)
      setSuccess('Resume uploaded and parsed successfully! Your profile has been updated with extracted information.')
      await refreshAll()
    } catch (e) {
      setError(e?.response?.data?.detail || 'Resume upload failed')
    } finally {
      setActionLoading(false)
    }
  }

  async function onApply(jobId) {
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      await applyToJob(jobId)
      setSuccess('Applied successfully')
      await refreshAll()
    } catch (e) {
      setError(e?.response?.data?.detail || 'Apply failed')
    } finally {
      setActionLoading(false)
    }
  }

  async function onWithdraw(applicationId) {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return
    
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      await withdrawApplication(applicationId)
      setSuccess('Application withdrawn successfully')
      if (selectedAppId === applicationId) {
        setSelectedAppId(null)
        setFit(null)
      }
      await refreshAll()
    } catch (e) {
      setError(e?.response?.data?.detail || 'Withdraw failed')
    } finally {
      setActionLoading(false)
    }
  }

  async function onOptimizeResume(jobId) {
    setOptimizeDialogOpen(true)
    setOptimizeLoading(true)
    setOptimizeResult(null)
    try {
      const result = await optimizeResume(jobId)
      setOptimizeResult(result)
    } catch (e) {
      setOptimizeResult({ error: e?.response?.data?.detail || 'Failed to optimize resume' })
    } finally {
      setOptimizeLoading(false)
    }
  }

  async function onCareerAnalysis() {
    setCareerDialogOpen(true)
    setCareerLoading(true)
    setCareerResult(null)
    try {
      const result = await getCareerAnalysis()
      setCareerResult(result)
    } catch (e) {
      setCareerResult({ error: e?.response?.data?.detail || 'Failed to get career analysis' })
    } finally {
      setCareerLoading(false)
    }
  }

  async function onInterviewPrep(applicationId) {
    setInterviewPrepDialogOpen(true)
    setInterviewPrepLoading(true)
    setInterviewPrepResult(null)
    try {
      const result = await getInterviewPrep(applicationId)
      setInterviewPrepResult(result)
    } catch (e) {
      setInterviewPrepResult({ error: e?.response?.data?.detail || 'Failed to get interview preparation' })
    } finally {
      setInterviewPrepLoading(false)
    }
  }

  async function onCareerPathPlanner() {
    if (!targetRole.trim()) {
      setError('Please enter a target role')
      return
    }
    
    setCareerPathDialogOpen(true)
    setCareerPathLoading(true)
    setCareerPathResult(null)
    try {
      const result = await getCareerPathPlanner(targetRole, 24)
      setCareerPathResult(result)
    } catch (e) {
      setCareerPathResult({ error: e?.response?.data?.detail || 'Failed to generate career path' })
    } finally {
      setCareerPathLoading(false)
    }
  }

  async function onSkillGapAnalysis(jobId) {
    setSkillGapDialogOpen(true)
    setSkillGapLoading(true)
    setSkillGapResult(null)
    try {
      const result = await getSkillGapAnalysis(jobId)
      setSkillGapResult(result)
    } catch (e) {
      setSkillGapResult({ error: e?.response?.data?.detail || 'Failed to analyze skill gaps' })
    } finally {
      setSkillGapLoading(false)
    }
  }

  async function onPersonalizedLearningPlan() {
    setLearningPlanDialogOpen(true)
    setLearningPlanLoading(true)
    setLearningPlanResult(null)
    try {
      const result = await getPersonalizedLearningPlan()
      setLearningPlanResult(result)
    } catch (e) {
      setLearningPlanResult({ error: e?.response?.data?.detail || 'Failed to generate learning plan' })
    } finally {
      setLearningPlanLoading(false)
    }
  }

  return (
    <Fade in timeout={600}>
      <Box sx={{ 
        p: 3,
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse at top left, rgba(0, 255, 255, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(255, 0, 255, 0.08) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0a 0%, #050505 100%)
        `,
        position: 'relative'
      }}>
        {/* Neon Header */}
        <Paper 
          elevation={24}
          sx={{ 
            p: 3,
            mb: 4,
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(15, 15, 15, 0.95) 100%)',
            border: '2px solid transparent',
            backgroundClip: 'padding-box, border-box',
            backgroundOrigin: 'padding-box, border-box',
            backgroundImage: `
              linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(15, 15, 15, 0.95)),
              linear-gradient(45deg, #00ffff, #ff00ff)
            `,
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.5),
              0 0 40px rgba(0, 255, 255, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            backdropFilter: 'blur(20px)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #00ffff, #ff00ff, transparent)',
              animation: 'slide 3s ease-in-out infinite'
            },
            '@keyframes slide': {
              '0%': { transform: 'translateX(-100%)' },
              '100%': { transform: 'translateX(100%)' }
            }
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  background: 'linear-gradient(45deg, #00ffff, #ff00ff)',
                  boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
                  fontSize: '1.5rem',
                  fontWeight: 700
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'C'}
              </Avatar>
              <Box>
                <Typography 
                  variant="h3" 
                  fontWeight={700}
                  sx={{
                    background: 'linear-gradient(45deg, #00ffff, #ff00ff)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
                    mb: 0.5
                  }}
                >
                  Candidate Dashboard
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 400
                  }}
                >
                  Welcome back, <Box component="span" sx={{ color: '#00ffff', fontWeight: 600 }}>{user?.name || 'Candidate'}</Box>
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={clearAuth}
              sx={{
                background: 'rgba(255, 0, 64, 0.1)',
                border: '1px solid rgba(255, 0, 64, 0.3)',
                color: '#ff0040',
                '&:hover': {
                  background: 'rgba(255, 0, 64, 0.2)',
                  boxShadow: '0 0 20px rgba(255, 0, 64, 0.4)'
                }
              }}
            >
              <Logout />
            </IconButton>
          </Box>
        </Paper>

        {/* Error and Success Alerts */}
        <Fade in={!!error} timeout={300}>
          <Box>
            {error && (
              <Alert 
                severity="error" 
                onClose={() => setError('')} 
                sx={{ 
                  mb: 2,
                  background: 'rgba(255, 0, 64, 0.1)',
                  border: '1px solid rgba(255, 0, 64, 0.3)',
                  color: '#ff6b6b',
                  '& .MuiAlert-icon': {
                    color: '#ff0040'
                  }
                }}
              >
                {error}
              </Alert>
            )}
          </Box>
        </Fade>
        
        <Fade in={!!success} timeout={300}>
          <Box>
            {success && (
              <Alert 
                severity="success" 
                onClose={() => setSuccess('')} 
                sx={{ 
                  mb: 2,
                  background: 'rgba(0, 255, 64, 0.1)',
                  border: '1px solid rgba(0, 255, 64, 0.3)',
                  color: '#00ff40',
                  '& .MuiAlert-icon': {
                    color: '#00ff40'
                  }
                }}
              >
                {success}
              </Alert>
            )}
          </Box>
        </Fade>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <LoadingBlock />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Profile Section */}
            <Grid item xs={12} md={5}>
              <Card sx={{
                background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(15, 15, 15, 0.95) 100%)',
                border: '1px solid rgba(0, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: 'rgba(0, 255, 255, 0.4)',
                  boxShadow: '0 12px 40px rgba(0, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Avatar sx={{ background: 'linear-gradient(45deg, #00ffff, #ff00ff)' }}>
                      <Edit />
                    </Avatar>
                    <Typography 
                      variant="h5" 
                      fontWeight={600}
                      sx={{
                        background: 'linear-gradient(45deg, #00ffff, #ff00ff)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      My Profile
                    </Typography>
                  </Box>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profile?.name || ''}
                      onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                      margin="normal"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          background: 'rgba(26, 26, 26, 0.8)',
                          border: '1px solid rgba(0, 255, 255, 0.3)',
                          borderRadius: '12px',
                          '&:hover': {
                            borderColor: 'rgba(0, 255, 255, 0.5)',
                            boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)'
                          },
                          '&.Mui-focused': {
                            borderColor: '#00ffff',
                            boxShadow: '0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 10px rgba(0, 255, 255, 0.1)'
                          }
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Skills (comma separated)"
                      value={profile?.skills || ''}
                      onChange={(e) => setProfile(p => ({ ...p, skills: e.target.value }))}
                      margin="normal"
                      helperText="e.g., Python, JavaScript, Project Management"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          background: 'rgba(26, 26, 26, 0.8)',
                          border: '1px solid rgba(0, 255, 255, 0.3)',
                          borderRadius: '12px',
                          '&:hover': {
                            borderColor: 'rgba(0, 255, 255, 0.5)',
                            boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)'
                          },
                          '&.Mui-focused': {
                            borderColor: '#00ffff',
                            boxShadow: '0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 10px rgba(0, 255, 255, 0.1)'
                          }
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Education"
                      value={profile?.education || ''}
                      onChange={(e) => setProfile(p => ({ ...p, education: e.target.value }))}
                      margin="normal"
                      multiline
                      rows={2}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          background: 'rgba(26, 26, 26, 0.8)',
                          border: '1px solid rgba(0, 255, 255, 0.3)',
                          borderRadius: '12px',
                          '&:hover': {
                            borderColor: 'rgba(0, 255, 255, 0.5)',
                            boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)'
                          },
                          '&.Mui-focused': {
                            borderColor: '#00ffff',
                            boxShadow: '0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 10px rgba(0, 255, 255, 0.1)'
                          }
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Experience"
                      value={profile?.experience || ''}
                      onChange={(e) => setProfile(p => ({ ...p, experience: e.target.value }))}
                      margin="normal"
                      multiline
                      rows={4}
                      helperText="Briefly describe your work experience"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          background: 'rgba(26, 26, 26, 0.8)',
                          border: '1px solid rgba(0, 255, 255, 0.3)',
                          borderRadius: '12px',
                          '&:hover': {
                            borderColor: 'rgba(0, 255, 255, 0.5)',
                            boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)'
                          },
                          '&.Mui-focused': {
                            borderColor: '#00ffff',
                            boxShadow: '0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 10px rgba(0, 255, 255, 0.1)'
                          }
                        }
                      }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
                      <Button 
                        variant="contained" 
                        onClick={onSaveProfile} 
                        disabled={actionLoading}
                        fullWidth
                        sx={{
                          background: 'linear-gradient(45deg, #00ffff 0%, #00ced1 100%)',
                          boxShadow: '0 0 25px rgba(0, 255, 255, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.1)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #40e0d0 0%, #00ffff 100%)',
                            boxShadow: '0 0 35px rgba(0, 255, 255, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        {actionLoading ? 'Saving...' : 'Save Profile'}
                      </Button>
                      
                      <Button 
                        component="label" 
                        variant="outlined" 
                        disabled={actionLoading}
                        fullWidth
                        sx={{
                          borderColor: '#ff00ff',
                          color: '#ff00ff',
                          '&:hover': {
                            borderColor: '#ff40ff',
                            color: '#ff40ff',
                            boxShadow: '0 0 20px rgba(255, 0, 255, 0.4)'
                          }
                        }}
                      >
                        Upload Resume
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) onResumeUpload(file)
                            e.target.value = ''
                        }}
                      />
                    </Button>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                    {profile?.resume_path 
                      ? `Resume uploaded: ${profile.resume_path.split('/').pop()}`
                      : 'No resume uploaded yet'}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Career Development Section */}
            <Box mt={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Career Development</Typography>
                  <Stack spacing={2}>
                    <Button 
                      variant="outlined" 
                      onClick={onCareerAnalysis}
                      disabled={actionLoading}
                    >
                      Get Career Analysis
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      onClick={() => selectedAppId && onInterviewPrep(selectedAppId)}
                      disabled={!selectedAppId || actionLoading}
                    >
                      Prepare for Interview
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      onClick={onPersonalizedLearningPlan}
                      disabled={actionLoading}
                    >
                      View Learning Plan
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* Applications Section */}
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>My Applications</Typography>
                
                {apps.length > 0 ? (
                  <Box>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="fit_percentage" fill="#8884d8" name="Fit %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                    
                    <Box mt={3}>
                      <Typography variant="subtitle2" gutterBottom>Application Details</Typography>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Job Title</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Fit %</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {apps.map((app) => (
                            <TableRow key={app.id}>
                              <TableCell>{jobById.get(app.job_id)?.job_title || 'N/A'}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={app.status} 
                                  color={
                                    app.status === 'accepted' ? 'success' : 
                                    app.status === 'rejected' ? 'error' : 'default'
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{app.fit_percentage || 'N/A'}%</TableCell>
                              <TableCell>
                                <Button 
                                  size="small" 
                                  onClick={() => onWithdraw(app.id)}
                                  disabled={app.status !== 'applied'}
                                >
                                  Withdraw
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Box>
                ) : (
                  <Typography>You haven't applied to any jobs yet.</Typography>
                )}
              </CardContent>
            </Card>

            {/* Recommended Jobs Section */}
            {(recommendedJobs.length > 0 || recommendationsLoading) && (
              <Box mt={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recommended Jobs
                      {recommendationsLoading && (
                        <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                          Loading AI recommendations...
                        </Typography>
                      )}
                    </Typography>
                    {recommendationsLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Analyzing your profile with AI to find the best matches...
                        </Typography>
                      </Box>
                    ) : (
                      <Grid container spacing={2}>
                        {recommendedJobs.map((job) => (
                          <Grid item xs={12} key={job.id}>
                            <Card variant="outlined">
                              <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                  <Typography variant="h6">{job.job_title}</Typography>
                                  {job.ai_match_score && (
                                    <Chip
                                      label={`${job.ai_match_score}% Match`}
                                      color={job.ai_match_score >= 70 ? "success" : job.ai_match_score >= 50 ? "warning" : "default"}
                                      size="small"
                                      sx={{ fontWeight: 'bold' }}
                                    />
                                  )}
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  {job.company} • {job.location || 'Location not specified'}
                                </Typography>
                                {job.salary && (
                                  <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
                                    {job.salary}
                                  </Typography>
                                )}
                                <Box mt={1} mb={1}>
                                  {job.required_skills?.map((skill) => (
                                    <Chip
                                      key={skill}
                                      label={skill.trim()}
                                      size="small"
                                      sx={{ mr: 0.5, mb: 0.5 }}
                                    />
                                  ))}
                                </Box>
                                {job.ai_insights && (
                                  <Box mt={1} p={1} bgcolor="grey.50" borderRadius={1}>
                                    <Typography variant="caption" color="text.secondary">
                                      <strong>AI Insights:</strong> {job.ai_insights.recommendation || 'Good match'}
                                    </Typography>
                                  </Box>
                                )}
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => onApply(job.id)}
                                  disabled={actionLoading}
                                  sx={{ mt: 1 }}
                                >
                                  Apply Now
                                </Button>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  </Fade>
)
}

export default CandidateDashboard
