import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000 // Reduced from 30 seconds to 10 seconds
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

export function setApiToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`
  else delete api.defaults.headers.common.Authorization
}
