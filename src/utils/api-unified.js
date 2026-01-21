import axios from 'axios'

/**
 * Production-ready unified API client
 * Consolidates all API functionality with proper error handling, retry logic, and token refresh management
 */
class UnifiedApiClient {
  constructor() {
    this.baseURL = this.getApiBaseUrl()
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    this.setupInterceptors()
    this.refreshPromise = null
    this.retryQueue = []
    this.isRefreshing = false
  }

  getApiBaseUrl() {
    if (import.meta.env.VITE_API_BASE) {
      return import.meta.env.VITE_API_BASE.replace(/\/$/, '')
    }
    
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    const isProduction = hostname.includes('netlify.app') || 
                        hostname.includes('vercel.app') || 
                        hostname.includes('render.com') || 
                        import.meta.env.PROD
    
    return isProduction 
      ? 'https://school-report-saas.onrender.com/api'
      : 'http://localhost:8000/api'
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('sr_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      // Add trailing slash for non-GET methods to work with DRF
      const method = (config.method || 'get').toLowerCase()
      if (method !== 'get' && typeof config.url === 'string' && 
          !/^https?:\/\//i.test(config.url) && !config.url.endsWith('/')) {
        config.url = config.url + '/'
      }
      
      return config
    })

    // Response interceptor with proper token refresh and retry logic
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        // Handle 401 authentication errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.retryQueue.push({ resolve, reject, config: originalRequest })
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true
          
          try {
            await this.refreshToken()
            const token = localStorage.getItem('sr_token')
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
              
              // Process queued requests
              this.processRetryQueue(null, token)
              
              return this.client.request(originalRequest)
            }
          } catch (refreshError) {
            this.processRetryQueue(refreshError, null)
            this.clearAuth()
            
            // Only redirect if not already on login page
            if (typeof window !== 'undefined' && 
                !window.location.pathname.includes('/login') &&
                !window.location.pathname.includes('/student-login')) {
              window.location.href = '/login'
            }
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        // Enhanced error normalization
        const normalizedError = this.normalizeError(error)
        return Promise.reject(normalizedError)
      }
    )
  }

  processRetryQueue(error, token) {
    this.retryQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error)
      } else {
        config.headers.Authorization = `Bearer ${token}`
        resolve(this.client.request(config))
      }
    })
    this.retryQueue = []
  }

  async refreshToken() {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem('sr_refresh')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post(`${this.baseURL}/auth/token/refresh/`, {
          refresh: refreshToken
        })

        const { access } = response.data
        localStorage.setItem('sr_token', access)
        this.client.defaults.headers.common['Authorization'] = `Bearer ${access}`
        
        return access
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  normalizeError(error) {
    let message = 'Request failed'
    
    if (error.response) {
      const data = error.response.data
      const status = error.response.status
      
      // Handle specific error cases
      if (status === 404 && error.config.url?.includes('/auth/user/')) {
        message = 'Student not found. Please check your username.'
      } else if (status === 400) {
        message = data?.detail || data?.message || 'Invalid request data'
      } else if (status === 403) {
        message = 'You do not have permission to perform this action'
      } else if (status === 409) {
        message = data?.detail || 'Conflict - resource already exists'
      } else if (status === 422) {
        message = 'Validation error - please check your input'
      } else if (status === 500) {
        message = 'Server error. Please try again later.'
      } else if (status === 502 || status === 503) {
        message = 'Service temporarily unavailable. Please try again.'
      } else {
        message = data?.detail || data?.message || message
        
        // Handle validation errors
        if (message === 'Request failed' && data && typeof data === 'object') {
          const parts = []
          for (const [key, value] of Object.entries(data)) {
            if (key === 'detail' || key === 'message') continue
            if (Array.isArray(value) && value.length) {
              parts.push(`${key}: ${value[0]}`)
            } else if (typeof value === 'string') {
              parts.push(`${key}: ${value}`)
            }
          }
          if (parts.length) message = parts.join(' | ')
        }
      }
    } else if (error.request) {
      // Network errors
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
    return error
  }

  clearAuth() {
    localStorage.removeItem('sr_token')
    localStorage.removeItem('sr_refresh')
    localStorage.removeItem('sr_user')
    delete this.client.defaults.headers.common['Authorization']
  }

  // Retry logic with exponential backoff
  async withRetry(fn, retries = 3, delay = 1000) {
    try {
      return await fn()
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        console.log(`Retrying request... ${retries} attempts left`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.withRetry(fn, retries - 1, delay * 2)
      }
      throw error
    }
  }

  shouldRetry(error) {
    if (!error.response) return true // Network errors
    const status = error.response.status
    return status >= 500 || status === 408 || status === 429
  }

  // CORS-enabled request with fallback
  async corsEnabledRequest(endpoint, options = {}) {
    try {
      return await this.client(endpoint, options)
    } catch (error) {
      if (error.message?.includes('CORS') && endpoint.includes('/teachers/')) {
        console.log('CORS blocked, trying CORS-enabled endpoint...')
        const corsEndpoint = endpoint.replace('/teachers/', '/teachers/cors/')
        return await this.client(corsEndpoint, options)
      }
      throw error
    }
  }

  // Public API methods with retry logic
  async get(url, config = {}) {
    return this.withRetry(() => this.client.get(url, config))
  }

  async post(url, data, config = {}) {
    return this.withRetry(() => this.client.post(url, data, config))
  }

  async put(url, data, config = {}) {
    return this.withRetry(() => this.client.put(url, data, config))
  }

  async patch(url, data, config = {}) {
    return this.withRetry(() => this.client.patch(url, data, config))
  }

  async delete(url, config = {}) {
    return this.withRetry(() => this.client.delete(url, config))
  }

  // Health check
  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseURL}/health/`, { timeout: 5000 })
      return { healthy: true, status: response.status }
    } catch (error) {
      return { 
        healthy: false, 
        error: error.message,
        suggestion: 'Backend server may not be running. Try starting it with: python manage.py runserver'
      }
    }
  }

  // User validation utility
  async validateUser(userId, username) {
    try {
      // For students, try the student-specific endpoint first
      if (username && username.startsWith('std_')) {
        const response = await this.get(`/students/profile/${username}/`)
        return { success: true, user: response.data }
      }
      
      // Fallback to general user endpoint
      const response = await this.get(`/auth/user/${userId}/`)
      return { success: true, user: response.data }
    } catch (error) {
      console.error('User validation failed:', error)
      return {
        success: false,
        error: error.response?.status === 404 
          ? `Student not found. Please check your username: ${username || 'Unknown'}`
          : 'Unable to verify user credentials. Please try logging in again.'
      }
    }
  }

  // Batch request utility
  async batchRequest(requests) {
    try {
      const promises = requests.map(req => {
        const { method, url, data, config } = req
        return this[method.toLowerCase()](url, data, config)
      })
      
      return await Promise.allSettled(promises)
    } catch (error) {
      console.error('Batch request failed:', error)
      throw error
    }
  }

  // File upload with progress
  async uploadFile(url, file, onProgress) {
    const formData = new FormData()
    formData.append('file', file)
    
    return this.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      }
    })
  }
}

// Export singleton instance
const api = new UnifiedApiClient()
export default api

// Export specific methods for backward compatibility
export const { 
  get: apiGet, 
  post: apiPost, 
  put: apiPut, 
  patch: apiPatch, 
  delete: apiDelete,
  corsEnabledRequest,
  validateUser,
  checkHealth,
  batchRequest,
  uploadFile
} = api

// Export class for advanced usage
export { UnifiedApiClient }