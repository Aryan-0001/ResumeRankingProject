import axios from 'axios'
import { api } from './client.js'

// Separate client for AI calls with longer timeout
export const aiApi = axios.create({
  baseURL: '/api',
  timeout: 30000 // 30 seconds for AI calls
})

// Copy authorization headers from the regular API client
aiApi.interceptors.request.use(
  (config) => {
    // Reuse the auth header from the main API client, with a localStorage fallback.
    const token =
      api.defaults.headers.common.Authorization ||
      (localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = token
    }
    console.log('AI API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('AI API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging
aiApi.interceptors.response.use(
  (response) => {
    console.log('AI API Response:', response.config.method?.toUpperCase(), response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('AI API Response Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)
