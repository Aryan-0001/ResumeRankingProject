import { api } from './client.js'

export async function getCompanyProfile() {
  const res = await api.get('/company/me')
  return res.data
}

export async function updateCompanyProfile(payload) {
  const res = await api.put('/company/me', payload)
  return res.data
}

export async function postJob(payload) {
  const res = await api.post('/company/post-job', payload)
  return res.data
}

export async function updateJob(jobId, payload) {
  const res = await api.put(`/company/jobs/${jobId}`, payload)
  return res.data
}

export async function listMyJobs() {
  const res = await api.get('/company/jobs')
  return res.data
}

export async function rankResumes(jobId) {
  const res = await api.get('/company/rank-resumes', { params: { job_id: jobId } })
  return res.data
}

export async function predictFit(applicationId) {
  const res = await api.get('/company/predict-fit', { params: { application_id: applicationId } })
  return res.data
}

export async function setApplicationStatus(applicationId, status) {
  const res = await api.patch(`/company/applications/${applicationId}/status`, { status })
  return res.data
}

export async function deleteJob(jobId) {
  const res = await api.delete(`/company/jobs/${jobId}`)
  return res.data
}

export async function getAIAnalysis(applicationId) {
  const res = await api.get(`/company/ai-analysis/${applicationId}`)
  return res.data
}

export async function getInterviewQuestions(applicationId) {
  const res = await api.get(`/company/interview-questions/${applicationId}`)
  return res.data
}

export async function predictSuccess(applicationId) {
  const res = await api.get(`/company/predict-success/${applicationId}`)
  return res.data
}

export async function getAdvancedAnalysis(applicationId) {
  const res = await api.get(`/company/advanced-analysis/${applicationId}`)
  return res.data
}

export async function getMarketIntelligence(jobId) {
  const res = await api.get(`/company/market-intelligence/${jobId}`)
  return res.data
}

export async function getTeamCompatibility(applicationId) {
  const res = await api.get(`/company/team-compatibility/${applicationId}`)
  return res.data
}

export async function getWorkforcePlanning() {
  const res = await api.get('/company/workforce-planning')
  return res.data
}

export async function listApplications(jobId) {
  const res = await api.get('/company/applications', { params: jobId ? { job_id: jobId } : {} })
  return res.data
}
