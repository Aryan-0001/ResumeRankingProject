import { api } from './client.js'
import { aiApi } from './ai-client.js'

export async function getCandidateProfile() {
  const res = await api.get('/candidate/me')
  return res.data
}

export async function updateCandidateProfile(payload) {
  const res = await api.put('/candidate/me', payload)
  return res.data
}

export async function uploadResume(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/candidate/upload-resume', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function listJobs() {
  const res = await api.get('/candidate/jobs')
  return res.data
}

export async function getRecommendedJobs() {
  const res = await aiApi.get('/candidate/recommended-jobs')
  return res.data
}

export async function applyToJob(jobId) {
  const res = await api.post(`/candidate/apply/${jobId}`)
  return res.data
}

export async function optimizeResume(jobId) {
  const res = await aiApi.get(`/candidate/optimize-resume/${jobId}`)
  return res.data
}

export async function getCareerAnalysis() {
  const res = await aiApi.get('/candidate/career-analysis')
  return res.data
}

export async function getInterviewPrep(applicationId) {
  const res = await aiApi.get(`/candidate/interview-prep/${applicationId}`)
  return res.data
}

export async function getCareerPathPlanner(targetRole, timelineMonths = 24) {
  const res = await aiApi.get(`/candidate/career-path-planner/${targetRole}`, { 
    params: { timeline_months: timelineMonths } 
  })
  return res.data
}

export async function getSkillGapAnalysis(jobId) {
  const res = await aiApi.get(`/candidate/skill-gap-analysis/${jobId}`)
  return res.data
}

export async function getPersonalizedLearningPlan() {
  const res = await aiApi.get('/candidate/personalized-learning-plan')
  return res.data
}

export async function withdrawApplication(applicationId) {
  const res = await api.delete(`/candidate/applications/${applicationId}`)
  return res.data
}

export async function listMyApplications() {
  const res = await api.get('/candidate/applications')
  return res.data
}

export async function getJobFit(applicationId) {
  const res = await api.get('/candidate/job-fit', { params: { application_id: applicationId } })
  return res.data
}
