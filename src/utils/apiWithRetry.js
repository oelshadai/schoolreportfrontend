import axios from 'axios'

// Enhanced API configuration with retry logic
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE.replace(/\/$/, '')
  }
  
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  const isProduction = hostname.includes('netlify.app') || import.meta.env.PROD
  
  return isProduction 
    ? 'https://school-report-saas.onrender.com/api'
    : 'http://localhost:8000/api'
}

const base = getApiBaseUrl()

// Create axios instance with timeout
const api = axios.create({ 
  baseURL: base,
  timeout: 15000, // 15 second timeout
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Retry function with exponential backoff
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0 && shouldRetry(error)) {
      console.log(`Retrying request... ${retries} attempts left`)
      await new Promise(resolve => setTimeout(resolve, delay))
      return retryRequest(fn, retries - 1, delay * 2)
    }
    throw error
  }
}

// Determine if error should trigger a retry
const shouldRetry = (error) => {
  if (!error.response) return true // Network errors
  const status = error.response.status
  return status >= 500 || status === 408 || status === 429 // Server errors, timeout, rate limit
}

// Enhanced request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sr_token') || localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Add trailing slash for non-GET methods
  const method = (config.method || 'get').toLowerCase()
  if (method !== 'get' && typeof config.url === 'string' && 
      !/^https?:\/\//i.test(config.url) && !config.url.endsWith('/')) {
    config.url = config.url + '/'
  }
  
  return config
})

// Enhanced response interceptor with better error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 authentication errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = localStorage.getItem('sr_refresh')
      if (refreshToken && !originalRequest.url?.includes('/auth/token/refresh/')) {
        try {
          const refreshRes = await api.post('/auth/token/refresh/', { refresh: refreshToken })
          const { access } = refreshRes.data
          
          localStorage.setItem('sr_token', access)
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`
          originalRequest.headers.Authorization = `Bearer ${access}`
          
          return api.request(originalRequest)
        } catch (refreshError) {
          console.warn('Token refresh failed, clearing auth data')
          localStorage.removeItem('sr_token')
          localStorage.removeItem('sr_refresh')
          localStorage.removeItem('sr_user')
          
          if (window.innerWidth > 768 && !window.location.pathname.includes('/login')) {
            window.location.href = '/login'
          }
        }
      }
    }

    // Enhanced error message handling
    let message = 'Request failed'
    
    if (error.response) {
      const data = error.response.data
      if (error.response.status === 404 && error.config.url?.includes('/auth/user/')) {
        message = 'Student not found. Please check your username.'
      } else {
        message = data?.detail || data?.message || message
        if (message === 'Request failed' && data && typeof data === 'object') {
          const parts = []
          for (const [k, v] of Object.entries(data)) {
            if (k === 'detail' || k === 'message') continue
            if (Array.isArray(v) && v.length) parts.push(`${k}: ${v[0]}`)
            else if (typeof v === 'string') parts.push(`${k}: ${v}`)
          }
          if (parts.length) message = parts.join(' | ')
        }
      }
    } else if (error.request) {
      // Network error handling
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        message = 'Request timed out. Please check your connection and try again.'
      } else if (error.message?.includes('CORS')) {
        message = 'CORS policy blocked this request. Please check backend CORS configuration.'
      } else if (error.message?.includes('Network Error')) {
        message = 'Unable to reach the server. Please check if the backend is running.'
      } else {
        message = 'Network error - please check your connection.'
      }
    }
    
    error.normalizedMessage = message
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    })
    
    return Promise.reject(error)
  }
)

// Wrapper functions with retry logic
export const apiGet = (url, config = {}) => 
  retryRequest(() => api.get(url, config))

export const apiPost = (url, data, config = {}) => 
  retryRequest(() => api.post(url, data, config))

export const apiPut = (url, data, config = {}) => 
  retryRequest(() => api.put(url, data, config))

export const apiPatch = (url, data, config = {}) => 
  retryRequest(() => api.patch(url, data, config))

export const apiDelete = (url, config = {}) => 
  retryRequest(() => api.delete(url, config))

// CORS-enabled request with fallback
export const corsEnabledRequest = async (endpoint, options = {}) => {
  try {
    return await api(endpoint, options)
  } catch (error) {
    if (error.message?.includes('CORS') && endpoint.includes('/teachers/')) {
      console.log('CORS blocked, trying CORS-enabled endpoint...')
      const corsEndpoint = endpoint.replace('/teachers/', '/teachers/cors/')
      return await api(corsEndpoint, options)
    }
    throw error
  }
}

// Health check function
export const checkBackendHealth = async () => {
  try {
    const response = await axios.get(`${base}/health/`, { timeout: 5000 })
    return { healthy: true, status: response.status }
  } catch (error) {
    return { 
      healthy: false, 
      error: error.message,
      suggestion: 'Backend server may not be running. Try starting it with: python manage.py runserver'
    }
  }
}

export default api