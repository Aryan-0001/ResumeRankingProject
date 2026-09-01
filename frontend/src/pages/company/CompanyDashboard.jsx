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
  Typography
} from '@mui/material'

import {
  getCompanyProfile,
  listMyJobs,
  postJob,
  predictFit,
  rankResumes,
  setApplicationStatus,
  updateCompanyProfile,
  updateJob,
  deleteJob,
  getAIAnalysis,
  getInterviewQuestions,
  predictSuccess,
  getAdvancedAnalysis,
  getMarketIntelligence,
  getTeamCompatibility,
  getWorkforcePlanning
} from '../../api/company.js'
import LoadingBlock from '../../components/LoadingBlock.jsx'
import { useAuth } from '../../state/AuthContext.jsx'

export default function CompanyDashboard() {
  const { user, clearAuth } = useAuth()

  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [ranking, setRanking] = useState(null)

  const [newJob, setNewJob] = useState({ job_title: '', job_description: '', required_skills: '' })
  const [editJob, setEditJob] = useState(null)

  const [fitDialogOpen, setFitDialogOpen] = useState(false)
  const [fitLoading, setFitLoading] = useState(false)
  const [fitResult, setFitResult] = useState(null)

  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false)
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null)

  const [interviewQuestionsOpen, setInterviewQuestionsOpen] = useState(false)
  const [interviewQuestionsLoading, setInterviewQuestionsLoading] = useState(false)
  const [interviewQuestionsResult, setInterviewQuestionsResult] = useState(null)

  const [successPredictionOpen, setSuccessPredictionOpen] = useState(false)
  const [successPredictionLoading, setSuccessPredictionLoading] = useState(false)
  const [successPredictionResult, setSuccessPredictionResult] = useState(null)

  const [advancedAnalysisOpen, setAdvancedAnalysisOpen] = useState(false)
  const [advancedAnalysisLoading, setAdvancedAnalysisLoading] = useState(false)
  const [advancedAnalysisResult, setAdvancedAnalysisResult] = useState(null)

  const [marketIntelligenceOpen, setMarketIntelligenceOpen] = useState(false)
  const [marketIntelligenceLoading, setMarketIntelligenceLoading] = useState(false)
  const [marketIntelligenceResult, setMarketIntelligenceResult] = useState(null)

  const [teamCompatibilityOpen, setTeamCompatibilityOpen] = useState(false)
  const [teamCompatibilityLoading, setTeamCompatibilityLoading] = useState(false)
  const [teamCompatibilityResult, setTeamCompatibilityResult] = useState(null)

  const [workforcePlanningOpen, setWorkforcePlanningOpen] = useState(false)
  const [workforcePlanningLoading, setWorkforcePlanningLoading] = useState(false)
  const [workforcePlanningResult, setWorkforcePlanningResult] = useState(null)

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedJob = useMemo(() => jobs.find((j) => String(j.id) === String(selectedJobId)), [jobs, selectedJobId])

  async function refresh() {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const [p, j] = await Promise.all([getCompanyProfile(), listMyJobs()])
      setProfile(p)
      setJobs(j)
      if (j.length > 0) setSelectedJobId((prev) => prev || String(j[0].id))
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to load company dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!selectedJobId) {
        setRanking(null)
        return
      }
      try {
        const res = await rankResumes(Number(selectedJobId))
        setRanking(res)
      } catch (e) {
        setRanking(null)
      }
    })()
  }, [selectedJobId])

  async function onSaveProfile() {
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      const updated = await updateCompanyProfile({
        company_name: profile?.company_name || null,
        description: profile?.description || null
      })
      setProfile(updated)
      setSuccess('Profile saved')
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to save profile')
    } finally {
      setActionLoading(false)
    }
  }

  async function onPostJob() {
    setActionLoading(true)
    setError('')
    setSuccess('')
    
    // Client-side validation
    if (!newJob.job_title || newJob.job_title.length < 2) {
      setError('Job title must be at least 2 characters long')
      setActionLoading(false)
      return
    }
    
    if (!newJob.job_description || newJob.job_description.length < 20) {
      setError('Job description must be at least 20 characters long')
      setActionLoading(false)
      return
    }
    
    try {
      const skills = (newJob.required_skills || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const jobData = {
        job_title: newJob.job_title,
        job_description: newJob.job_description,
        required_skills: skills
      }
      
      console.log('Posting job with data:', jobData)
      await postJob(jobData)
      setSuccess('Job posted successfully!')
      setNewJob({ job_title: '', job_description: '', required_skills: '' })
      await refresh()
    } catch (e) {
      console.error('Post job error:', e)
      const errorMessage = e?.response?.data?.detail || 'Failed to post job'
      
      // Provide more user-friendly error messages
      if (errorMessage.includes('validation')) {
        setError('Please check all required fields and try again')
      } else if (errorMessage.includes('unauthorized')) {
        setError('You are not authorized to post jobs')
      } else {
        setError(errorMessage)
      }
    } finally {
      setActionLoading(false)
    }
  }

  async function onShortlist(applicationId) {
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      await setApplicationStatus(applicationId, 'shortlisted')
      setSuccess('Candidate shortlisted')
      const res = await rankResumes(Number(selectedJobId))
      setRanking(res)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to shortlist')
    } finally {
      setActionLoading(false)
    }
  }

  async function onReject(applicationId) {
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      await setApplicationStatus(applicationId, 'rejected')
      setSuccess('Candidate rejected')
      const res = await rankResumes(Number(selectedJobId))
      setRanking(res)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to reject')
    } finally {
      setActionLoading(false)
    }
  }

  async function onViewFit(applicationId) {
    setFitDialogOpen(true)
    setFitLoading(true)
    setFitResult(null)
    try {
      const res = await predictFit(applicationId)
      setFitResult(res)
    } catch (e) {
      setFitResult({ error: e?.response?.data?.detail || 'Failed to compute fit' })
    } finally {
      setFitLoading(false)
    }
  }

  function onEditJob(job) {
    setEditJob({
      id: job.id,
      job_title: job.job_title,
      job_description: job.job_description,
      required_skills: job.required_skills.join(', ')
    })
  }

  async function onUpdateJob() {
    if (!editJob) return
    
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      const skills = (editJob.required_skills || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      await updateJob(editJob.id, {
        job_title: editJob.job_title,
        job_description: editJob.job_description,
        required_skills: skills
      })
      setSuccess('Job updated')
      setEditJob(null)
      await refresh()
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to update job')
    } finally {
      setActionLoading(false)
    }
  }

  function onCancelEdit() {
    setEditJob(null)
  }

  async function onDeleteJob(jobId) {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return
    
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      await deleteJob(jobId)
      setSuccess('Job deleted successfully')
      if (selectedJobId === String(jobId)) {
        setSelectedJobId('')
        setRanking(null)
      }
      await refresh()
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to delete job')
    } finally {
      setActionLoading(false)
    }
  }

  async function onAIAnalysis(applicationId) {
    setAiAnalysisOpen(true)
    setAiAnalysisLoading(true)
    setAiAnalysisResult(null)
    try {
      const result = await getAIAnalysis(applicationId)
      setAiAnalysisResult(result)
    } catch (e) {
      setAiAnalysisResult({ error: e?.response?.data?.detail || 'Failed to get AI analysis' })
    } finally {
      setAiAnalysisLoading(false)
    }
  }

  async function onInterviewQuestions(applicationId) {
    setInterviewQuestionsOpen(true)
    setInterviewQuestionsLoading(true)
    setInterviewQuestionsResult(null)
    try {
      const result = await getInterviewQuestions(applicationId)
      setInterviewQuestionsResult(result)
    } catch (e) {
      setInterviewQuestionsResult({ error: e?.response?.data?.detail || 'Failed to generate interview questions' })
    } finally {
      setInterviewQuestionsLoading(false)
    }
  }

  async function onSuccessPrediction(applicationId) {
    setSuccessPredictionOpen(true)
    setSuccessPredictionLoading(true)
    setSuccessPredictionResult(null)
    try {
      const result = await predictSuccess(applicationId)
      setSuccessPredictionResult(result)
    } catch (e) {
      setSuccessPredictionResult({ error: e?.response?.data?.detail || 'Failed to predict success' })
    } finally {
      setSuccessPredictionLoading(false)
    }
  }

  async function onAdvancedAnalysis(applicationId) {
    setAdvancedAnalysisOpen(true)
    setAdvancedAnalysisLoading(true)
    setAdvancedAnalysisResult(null)
    try {
      const result = await getAdvancedAnalysis(applicationId)
      setAdvancedAnalysisResult(result)
    } catch (e) {
      setAdvancedAnalysisResult({ error: e?.response?.data?.detail || 'Failed to get advanced analysis' })
    } finally {
      setAdvancedAnalysisLoading(false)
    }
  }

  async function onMarketIntelligence(jobId) {
    setMarketIntelligenceOpen(true)
    setMarketIntelligenceLoading(true)
    setMarketIntelligenceResult(null)
    try {
      const result = await getMarketIntelligence(jobId)
      setMarketIntelligenceResult(result)
    } catch (e) {
      setMarketIntelligenceResult({ error: e?.response?.data?.detail || 'Failed to get market intelligence' })
    } finally {
      setMarketIntelligenceLoading(false)
    }
  }

  async function onTeamCompatibility(applicationId) {
    setTeamCompatibilityOpen(true)
    setTeamCompatibilityLoading(true)
    setTeamCompatibilityResult(null)
    try {
      const result = await getTeamCompatibility(applicationId)
      setTeamCompatibilityResult(result)
    } catch (e) {
      setTeamCompatibilityResult({ error: e?.response?.data?.detail || 'Failed to analyze team compatibility' })
    } finally {
      setTeamCompatibilityLoading(false)
    }
  }

  async function onWorkforcePlanning() {
    setWorkforcePlanningOpen(true)
    setWorkforcePlanningLoading(true)
    setWorkforcePlanningResult(null)
    try {
      const result = await getWorkforcePlanning()
      setWorkforcePlanningResult(result)
    } catch (e) {
      setWorkforcePlanningResult({ error: e?.response?.data?.detail || 'Failed to get workforce planning' })
    } finally {
      setWorkforcePlanningLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Company Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Signed in as {user?.email}
          </Typography>
        </Box>
        <Button variant="outlined" onClick={clearAuth}>
          Logout
        </Button>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      ) : null}

      {loading ? <LoadingBlock /> : null}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography fontWeight={800}>Company Profile</Typography>
                <TextField
                  label="Company Name"
                  value={profile?.company_name || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, company_name: e.target.value }))}
                />
                <TextField
                  label="Description"
                  multiline
                  minRows={4}
                  value={profile?.description || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
                />
                <Button variant="contained" disabled={actionLoading || loading} onClick={onSaveProfile}>
                  {actionLoading ? 'Saving...' : 'Save Profile'}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography fontWeight={800}>Post a Job</Typography>
                <TextField
                  label="Job Title"
                  value={newJob.job_title}
                  onChange={(e) => setNewJob((j) => ({ ...j, job_title: e.target.value }))}
                  helperText={`Minimum 2 characters required (${newJob.job_title.length}/2)`}
                  error={newJob.job_title.length > 0 && newJob.job_title.length < 2}
                />
                <TextField
                  label="Job Description"
                  multiline
                  minRows={6}
                  value={newJob.job_description}
                  onChange={(e) => setNewJob((j) => ({ ...j, job_description: e.target.value }))}
                  helperText={`Minimum 20 characters required (${newJob.job_description.length}/20)`}
                  error={newJob.job_description.length > 0 && newJob.job_description.length < 20}
                />
                <TextField
                  label="Required Skills (comma separated)"
                  value={newJob.required_skills}
                  onChange={(e) => setNewJob((j) => ({ ...j, required_skills: e.target.value }))}
                />
                <Button
                  variant="contained"
                  disabled={actionLoading || loading || !newJob.job_title || !newJob.job_description || newJob.job_title.length < 2 || newJob.job_description.length < 20}
                  onClick={onPostJob}
                >
                  {actionLoading ? 'Posting...' : 'Post Job'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={800}>Resume Ranking & Job Fit</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Combined Score = 50% TF-IDF similarity + 50% BERT similarity (normalized 0–100)
                    </Typography>
                  </Box>
                  <TextField
                    select
                    label="Select Job"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    sx={{ minWidth: 260 }}
                  >
                    {jobs.map((j) => (
                      <MenuItem key={j.id} value={String(j.id)}>
                        {j.job_title}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>

                {/* Job Details and Edit Section */}
                {selectedJob && (
                  <Card variant="outlined" sx={{ mt: 2 }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography fontWeight={600} color="primary">
                            Job Details: {selectedJob.job_title}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => onEditJob(selectedJob)}
                              disabled={actionLoading}
                            >
                              Edit Job
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => onDeleteJob(selectedJob.id)}
                              disabled={actionLoading}
                            >
                              Delete Job
                            </Button>
                          </Stack>
                        </Stack>
                        
                        {editJob?.id === selectedJob.id ? (
                          // Edit Form
                          <Stack spacing={2}>
                            <TextField
                              label="Job Title"
                              value={editJob.job_title}
                              onChange={(e) => setEditJob(j => ({ ...j, job_title: e.target.value }))}
                              fullWidth
                            />
                            <TextField
                              label="Job Description"
                              multiline
                              minRows={4}
                              value={editJob.job_description}
                              onChange={(e) => setEditJob(j => ({ ...j, job_description: e.target.value }))}
                              fullWidth
                            />
                            <TextField
                              label="Required Skills (comma separated)"
                              value={editJob.required_skills}
                              onChange={(e) => setEditJob(j => ({ ...j, required_skills: e.target.value }))}
                              fullWidth
                            />
                            <Stack direction="row" spacing={1}>
                              <Button
                                variant="contained"
                                onClick={onUpdateJob}
                                disabled={actionLoading || !editJob.job_title || !editJob.job_description}
                              >
                                {actionLoading ? 'Updating...' : 'Update Job'}
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={onCancelEdit}
                                disabled={actionLoading}
                              >
                                Cancel
                              </Button>
                            </Stack>
                          </Stack>
                        ) : (
                          // View Mode
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {selectedJob.job_description}
                            </Typography>
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                              {selectedJob.required_skills.map((skill) => (
                                <Chip key={skill} label={skill} size="small" color="primary" />
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                <Divider />

                {/* Strategic Insights Section */}
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={800}>
                    🚀 Strategic Insights
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI-powered market intelligence and workforce planning
                  </Typography>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    {selectedJob && (
                      <Button
                        variant="outlined"
                        color="info"
                        onClick={() => onMarketIntelligence(selectedJob.id)}
                        disabled={marketIntelligenceLoading}
                        startIcon={<span>📊</span>}
                      >
                        Market Intelligence
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={onWorkforcePlanning}
                      disabled={workforcePlanningLoading}
                      startIcon={<span>🎯</span>}
                    >
                      Workforce Planning
                    </Button>
                  </Stack>
                </Stack>

                <Divider />

                {!selectedJob ? (
                  <Typography variant="body2" color="text.secondary">
                    Post a job to start receiving applications.
                  </Typography>
                ) : ranking?.ranked?.length ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Application</TableCell>
                        <TableCell>Resume Score</TableCell>
                        <TableCell>Fit %</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Matched Skills</TableCell>
                        <TableCell>Missing Skills</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ranking.ranked.map((r, idx) => (
                        <TableRow key={r.application_id} hover>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>#{r.application_id}</TableCell>
                          <TableCell>{Math.round(r.resume_score)}</TableCell>
                          <TableCell>{Math.round(r.fit_percentage)}%</TableCell>
                          <TableCell>
                            <Chip size="small" label={r.status} />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                              {r.matched_skills.slice(0, 4).map((s) => (
                                <Chip key={s} size="small" color="success" label={s} />
                              ))}
                              {r.matched_skills.length > 4 ? <Chip size="small" label={`+${r.matched_skills.length - 4}`} /> : null}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                              {r.missing_skills.slice(0, 4).map((s) => (
                                <Chip key={s} size="small" color="warning" label={s} />
                              ))}
                              {r.missing_skills.length > 4 ? <Chip size="small" label={`+${r.missing_skills.length - 4}`} /> : null}
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="flex-end" flexWrap="wrap">
                              <Button size="small" variant="outlined" onClick={() => onViewFit(r.application_id)}>
                                Predict Fit
                              </Button>
                              <Button size="small" variant="outlined" color="secondary" onClick={() => onAIAnalysis(r.application_id)}>
                                AI Analysis
                              </Button>
                              <Button size="small" variant="outlined" color="info" onClick={() => onInterviewQuestions(r.application_id)}>
                                Interview Q's
                              </Button>
                              <Button size="small" variant="outlined" color="success" onClick={() => onSuccessPrediction(r.application_id)}>
                                Predict Success
                              </Button>
                              <Button size="small" variant="outlined" color="warning" onClick={() => onAdvancedAnalysis(r.application_id)}>
                                Advanced Analysis
                              </Button>
                              <Button size="small" variant="outlined" color="primary" onClick={() => onTeamCompatibility(r.application_id)}>
                                Team Fit
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                disabled={actionLoading || loading}
                                onClick={() => onShortlist(r.application_id)}
                              >
                                Shortlist
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                disabled={actionLoading || loading}
                                onClick={() => onReject(r.application_id)}
                              >
                                Reject
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No applications yet for this job.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={fitDialogOpen} onClose={() => setFitDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Fit Prediction</DialogTitle>
        <DialogContent>
          {fitLoading ? <LoadingBlock /> : null}
          {fitResult?.error ? <Alert severity="error">{fitResult.error}</Alert> : null}
          {fitResult && !fitResult.error ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Chip color="primary" label={`Resume Score: ${Math.round(fitResult.resume_score)}`} />
                <Chip color="info" label={`Fit: ${Math.round(fitResult.fit_percentage)}%`} />
              </Stack>
              <Divider />
              <Typography fontWeight={800}>Missing skills</Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {fitResult.missing_skills.length === 0 ? (
                  <Chip size="small" color="success" label="No missing skills detected" />
                ) : (
                  fitResult.missing_skills.map((s) => <Chip key={s} size="small" label={s} />)
                )}
              </Stack>
              <Typography fontWeight={800}>Suggestions</Typography>
              <Stack spacing={0.5}>
                {fitResult.suggestions.map((s, idx) => (
                  <Typography key={idx} variant="body2" color="text.secondary">
                    - {s}
                  </Typography>
                ))}
              </Stack>
              <Typography fontWeight={800}>Model Explanation (debug)</Typography>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'grey.100',
                  overflow: 'auto',
                  fontSize: 12
                }}
              >
                {JSON.stringify(fitResult.explanation, null, 2)}
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* AI Analysis Dialog */}
      <Dialog open={aiAnalysisOpen} onClose={() => setAiAnalysisOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>AI Candidate Analysis</DialogTitle>
        <DialogContent>
          {aiAnalysisLoading ? <LoadingBlock /> : null}
          {aiAnalysisResult?.error ? <Alert severity="error">{aiAnalysisResult.error}</Alert> : null}
          {aiAnalysisResult && !aiAnalysisResult.error ? (
            <Stack spacing={2}>
              <Typography variant="h6" color="primary">
                {aiAnalysisResult.candidate_name} - {aiAnalysisResult.job_title}
              </Typography>
              <Typography variant="body2">
                <strong>Summary:</strong> {aiAnalysisResult.ai_analysis.summary}
              </Typography>
              <Typography variant="body2">
                <strong>Experience Level:</strong> {aiAnalysisResult.ai_analysis.experience_level}
              </Typography>
              <Typography variant="body2">
                <strong>Key Skills:</strong>
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {aiAnalysisResult.ai_analysis.key_skills?.map((skill) => (
                  <Chip key={skill} label={skill} size="small" color="primary" />
                ))}
              </Stack>
              <Typography variant="body2">
                <strong>Strengths:</strong>
              </Typography>
              <Stack spacing={0.5}>
                {aiAnalysisResult.ai_analysis.strengths?.map((strength, idx) => (
                  <Typography key={idx} variant="body2" color="text.secondary">
                    • {strength}
                  </Typography>
                ))}
              </Stack>
              <Typography variant="body2">
                <strong>Technical Score:</strong> {aiAnalysisResult.ai_analysis.technical_score}/100
              </Typography>
              <Typography variant="body2">
                <strong>Leadership Potential:</strong> {aiAnalysisResult.ai_analysis.leadership_potential}/100
              </Typography>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Interview Questions Dialog */}
      <Dialog open={interviewQuestionsOpen} onClose={() => setInterviewQuestionsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>AI Interview Questions</DialogTitle>
        <DialogContent>
          {interviewQuestionsLoading ? <LoadingBlock /> : null}
          {interviewQuestionsResult?.error ? <Alert severity="error">{interviewQuestionsResult.error}</Alert> : null}
          {interviewQuestionsResult && !interviewQuestionsResult.error ? (
            <Stack spacing={2}>
              <Typography variant="h6" color="primary">
                {interviewQuestionsResult.candidate_name} - {interviewQuestionsResult.job_title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Personalized interview questions based on candidate's resume and job requirements:
              </Typography>
              <Stack spacing={1}>
                {interviewQuestionsResult.interview_questions?.map((question, idx) => (
                  <Card key={idx} variant="outlined">
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="body2">
                        <strong>{idx + 1}.</strong> {question}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Success Prediction Dialog */}
      <Dialog open={successPredictionOpen} onClose={() => setSuccessPredictionOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>AI Success Prediction</DialogTitle>
        <DialogContent>
          {successPredictionLoading ? <LoadingBlock /> : null}
          {successPredictionResult?.error ? <Alert severity="error">{successPredictionResult.error}</Alert> : null}
          {successPredictionResult && !successPredictionResult.error ? (
            <Stack spacing={2}>
              <Typography variant="h6" color="primary">
                {successPredictionResult.candidate_name} - {successPredictionResult.job_title}
              </Typography>
              <Typography variant="h4" color="success" align="center">
                {successPredictionResult.success_prediction.success_probability}% Success Probability
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Technical Match:</strong> {successPredictionResult.success_prediction.technical_match}%
                </Typography>
                <Typography variant="body2">
                  <strong>Experience Match:</strong> {successPredictionResult.success_prediction.experience_match}%
                </Typography>
                <Typography variant="body2">
                  <strong>Cultural Fit:</strong> {successPredictionResult.success_prediction.cultural_fit}%
                </Typography>
                <Typography variant="body2">
                  <strong>Growth Potential:</strong> {successPredictionResult.success_prediction.growth_potential}%
                </Typography>
              </Stack>
              <Typography variant="body2">
                <strong>Recommendation:</strong> {successPredictionResult.success_prediction.recommendation}
              </Typography>
              {successPredictionResult.success_prediction.risk_factors?.length > 0 && (
                <>
                  <Typography variant="body2">
                    <strong>Risk Factors:</strong>
                  </Typography>
                  <Stack spacing={0.5}>
                    {successPredictionResult.success_prediction.risk_factors.map((risk, idx) => (
                      <Typography key={idx} variant="body2" color="error">
                        • {risk}
                      </Typography>
                    ))}
                  </Stack>
                </>
              )}
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Advanced Analysis Dialog */}
      <Dialog open={advancedAnalysisOpen} onClose={() => setAdvancedAnalysisOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>🧠 Ultra-Comprehensive Candidate Analysis</DialogTitle>
        <DialogContent>
          {advancedAnalysisLoading ? <LoadingBlock /> : null}
          {advancedAnalysisResult?.error ? <Alert severity="error">{advancedAnalysisResult.error}</Alert> : null}
          {advancedAnalysisResult && !advancedAnalysisResult.error ? (
            <Stack spacing={3}>
              <Typography variant="h6" color="primary">
                {advancedAnalysisResult.candidate_name} - {advancedAnalysisResult.job_title}
              </Typography>
              
              {/* Executive Summary */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                    Executive Summary
                  </Typography>
                  <Typography variant="body2">
                    {advancedAnalysisResult.comprehensive_analysis?.executive_summary}
                  </Typography>
                </CardContent>
              </Card>

              {/* Technical Proficiency */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                    Technical Proficiency
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Overall Score:</strong> {advancedAnalysisResult.comprehensive_analysis?.technical_proficiency?.overall_score}/100
                    </Typography>
                    <Typography variant="body2">
                      <strong>Learning Capability:</strong> {advancedAnalysisResult.comprehensive_analysis?.technical_proficiency?.learning_capability}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Core Technologies:</strong>
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {advancedAnalysisResult.comprehensive_analysis?.technical_proficiency?.core_technologies?.map((tech) => (
                        <Chip key={tech} label={tech} size="small" color="primary" />
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/* Experience Analysis */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                    Experience Analysis
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Relevant Experience:</strong> {advancedAnalysisResult.comprehensive_analysis?.experience_analysis?.years_relevant_experience} years
                    </Typography>
                    <Typography variant="body2">
                      <strong>Industry Alignment:</strong> {advancedAnalysisResult.comprehensive_analysis?.experience_analysis?.industry_alignment}%
                    </Typography>
                    <Typography variant="body2">
                      <strong>Career Progression:</strong> {advancedAnalysisResult.comprehensive_analysis?.experience_analysis?.career_progression}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              {/* Soft Skills Assessment */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                    Soft Skills Assessment
                  </Typography>
                  <Stack spacing={1}>
                    {Object.entries(advancedAnalysisResult.comprehensive_analysis?.soft_skills_assessment || {}).map(([skill, score]) => (
                      <Stack key={skill} direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2" sx={{ minWidth: 150 }}>
                          <strong>{skill.charAt(0).toUpperCase() + skill.slice(1)}:</strong>
                        </Typography>
                        <Box sx={{ width: 200, bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                          <Box sx={{ width: `${score}%`, bgcolor: 'primary.main', height: 8, borderRadius: 1 }} />
                        </Box>
                        <Typography variant="body2">{score}%</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Predictive Indicators */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                    Predictive Indicators
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Success Probability:</strong> {advancedAnalysisResult.comprehensive_analysis?.predictive_indicators?.success_probability}%
                    </Typography>
                    <Typography variant="body2">
                      <strong>Retention Likelihood:</strong> {advancedAnalysisResult.comprehensive_analysis?.predictive_indicators?.retention_likelihood}%
                    </Typography>
                    <Typography variant="body2">
                      <strong>Promotion Timeline:</strong> {advancedAnalysisResult.comprehensive_analysis?.predictive_indicators?.promotion_timeline}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Market Intelligence Dialog */}
      <Dialog open={marketIntelligenceOpen} onClose={() => setMarketIntelligenceOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>📊 Market Intelligence</DialogTitle>
        <DialogContent>
          {marketIntelligenceLoading ? <LoadingBlock /> : null}
          {marketIntelligenceResult?.error ? <Alert severity="error">{marketIntelligenceResult.error}</Alert> : null}
          {marketIntelligenceResult && !marketIntelligenceResult.error ? (
            <Stack spacing={3}>
              <Typography variant="h6" color="primary">
                {marketIntelligenceResult.job_title} - {marketIntelligenceResult.company_name}
              </Typography>
              
              {/* Talent Market Analysis */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                    Talent Market Analysis
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Candidate Supply:</strong> {marketIntelligenceResult.market_intelligence?.talent_market_analysis?.candidate_supply}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Competition Level:</strong> {marketIntelligenceResult.market_intelligence?.talent_market_analysis?.competition_level}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Time to Fill:</strong> {marketIntelligenceResult.market_intelligence?.talent_market_analysis?.time_to_fill_estimate}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              {/* Compensation Intelligence */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                    Compensation Intelligence
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Market Median:</strong> {marketIntelligenceResult.market_intelligence?.compensation_intelligence?.market_median}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Market Range:</strong> {marketIntelligenceResult.market_intelligence?.compensation_intelligence?.market_range?.join(' - ')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Top Quartile:</strong> {marketIntelligenceResult.market_intelligence?.compensation_intelligence?.top_quartile}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              {/* Skill Demand Trends */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                    Skill Demand Trends
                  </Typography>
                  <Stack spacing={2}>
                    <div>
                      <Typography variant="body2" color="success.main">
                        <strong>📈 Growing Skills:</strong>
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {marketIntelligenceResult.market_intelligence?.skill_demand_trends?.growing_skills?.map((skill) => (
                          <Chip key={skill} label={skill} size="small" color="success" />
                        ))}
                      </Stack>
                    </div>
                    <div>
                      <Typography variant="body2" color="error.main">
                        <strong>📉 Declining Skills:</strong>
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {marketIntelligenceResult.market_intelligence?.skill_demand_trends?.declining_skills?.map((skill) => (
                          <Chip key={skill} label={skill} size="small" color="error" />
                        ))}
                      </Stack>
                    </div>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Team Compatibility Dialog */}
      <Dialog open={teamCompatibilityOpen} onClose={() => setTeamCompatibilityOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>👥 Team Compatibility Analysis</DialogTitle>
        <DialogContent>
          {teamCompatibilityLoading ? <LoadingBlock /> : null}
          {teamCompatibilityResult?.error ? <Alert severity="error">{teamCompatibilityResult.error}</Alert> : null}
          {teamCompatibilityResult && !teamCompatibilityResult.error ? (
            <Stack spacing={3}>
              <Typography variant="h6" color="primary">
                {teamCompatibilityResult.candidate_name} - {teamCompatibilityResult.job_title}
              </Typography>
              
              <Typography variant="h4" color="success" align="center">
                {teamCompatibilityResult.team_compatibility?.team_compatibility_score}% Team Compatibility
              </Typography>

              {/* Role Fit Analysis */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                    Role Fit Analysis
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Complementary Skills:</strong>
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {teamCompatibilityResult.team_compatibility?.role_fit_analysis?.complementary_skills?.map((skill) => (
                        <Chip key={skill} label={skill} size="small" color="success" />
                      ))}
                    </Stack>
                    <Typography variant="body2">
                      <strong>Gap Filling Potential:</strong>
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {teamCompatibilityResult.team_compatibility?.role_fit_analysis?.gap_filling_potential?.map((gap) => (
                        <Chip key={gap} label={gap} size="small" color="primary" />
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/* Team Dynamics Impact */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                    Team Dynamics Impact
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Team Morale Impact:</strong> {teamCompatibilityResult.team_compatibility?.team_dynamics_impact?.team_morale_impact}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Productivity Influence:</strong> {teamCompatibilityResult.team_compatibility?.team_dynamics_impact?.productivity_influence}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Innovation Catalyst:</strong> {teamCompatibilityResult.team_compatibility?.team_dynamics_impact?.innovation_catalyst ? '✅ Yes' : '❌ No'}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              {/* Potential Synergies */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                    Potential Synergies
                  </Typography>
                  <Stack spacing={2}>
                    {teamCompatibilityResult.team_compatibility?.potential_synergies?.map((synergy, idx) => (
                      <Card key={idx} variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="body2">
                          <strong>With {synergy.team_member}:</strong> {synergy.synergy_type} synergy ({synergy.collaboration_potential} potential)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Benefits: {synergy.mutual_benefits?.join(', ')}
                        </Typography>
                      </Card>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Workforce Planning Dialog */}
      <Dialog open={workforcePlanningOpen} onClose={() => setWorkforcePlanningOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>🎯 Strategic Workforce Planning</DialogTitle>
        <DialogContent>
          {workforcePlanningLoading ? <LoadingBlock /> : null}
          {workforcePlanningResult?.error ? <Alert severity="error">{workforcePlanningResult.error}</Alert> : null}
          {workforcePlanningResult && !workforcePlanningResult.error ? (
            <Stack spacing={3}>
              <Typography variant="h6" color="primary">
                {workforcePlanningResult.company_name} - Strategic Insights
              </Typography>
              
              {/* Future Skill Requirements */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                    Future Skill Requirements
                  </Typography>
                  <Stack spacing={2}>
                    <div>
                      <Typography variant="body2" color="success.main">
                        <strong>🔥 Critical Skills (12 months):</strong>
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {workforcePlanningResult.workforce_planning?.future_skill_requirements?.critical_skills_12_months?.map((skill) => (
                          <Chip key={skill} label={skill} size="small" color="success" />
                        ))}
                      </Stack>
                    </div>
                    <div>
                      <Typography variant="body2" color="info.main">
                        <strong>🚀 Emerging Skills (24 months):</strong>
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {workforcePlanningResult.workforce_planning?.future_skill_requirements?.emerging_skills_24_months?.map((skill) => (
                          <Chip key={skill} label={skill} size="small" color="info" />
                        ))}
                      </Stack>
                    </div>
                  </Stack>
                </CardContent>
              </Card>

              {/* Hiring Forecast */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                    Hiring Forecast
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Quarterly Hiring Needs:</strong> {workforcePlanningResult.workforce_planning?.hiring_forecast?.quarterly_hiring_needs?.join(', ')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>New Role Emergence:</strong>
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {workforcePlanningResult.workforce_planning?.hiring_forecast?.new_role_emergence?.map((role) => (
                        <Chip key={role} label={role} size="small" color="primary" />
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/* Talent Risk Assessment */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                    Talent Risk Assessment
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Retention Risk Roles:</strong>
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {workforcePlanningResult.workforce_planning?.talent_risk_assessment?.retention_risk_roles?.map((role) => (
                        <Chip key={role} label={role} size="small" color="warning" />
                      ))}
                    </Stack>
                    <Typography variant="body2">
                      <strong>Skill Gap Risks:</strong>
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {workforcePlanningResult.workforce_planning?.talent_risk_assessment?.skill_gap_risks?.map((gap) => (
                        <Chip key={gap} label={gap} size="small" color="error" />
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/* Development Strategies */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                    Development Strategies
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Upskilling Priorities:</strong>
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {workforcePlanningResult.workforce_planning?.development_strategies?.upskilling_priorities?.map((priority) => (
                        <Chip key={priority} label={priority} size="small" color="success" />
                      ))}
                    </Stack>
                    <Typography variant="body2">
                      <strong>Leadership Pipeline:</strong>
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {workforcePlanningResult.workforce_planning?.development_strategies?.leadership_pipeline_development?.map((item) => (
                        <Chip key={item} label={item} size="small" color="primary" />
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
