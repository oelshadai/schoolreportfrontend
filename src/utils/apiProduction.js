import axios from 'axios'

/**
 * Production-Ready Unified API Client
 * Consolidates all API functionality with optimized error handling, retry logic, and performance
 */
class ProductionApiClient {
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
    
    // Performance monitoring
    this.requestCount = 0
    this.errorCount = 0
    
    console.log(`🚀 API Client initialized with base URL: ${this.baseURL}`)
  }

  getApiBaseUrl() {
    // Production-first URL detection
    if (import.meta.env.VITE_API_BASE) {
      return import.meta.env.VITE_API_BASE.replace(/\/$/, '')
    }
    
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    const isProduction = hostname.includes('render.com') || 
                        hostname.includes('netlify.app') || 
                        hostname.includes('vercel.app') || 
                        import.meta.env.PROD
    
    return isProduction 
      ? 'https://school-report-saas.onrender.com/api'
      : 'http://localhost:8000/api'
  }

  setupInterceptors() {
    // Request interceptor with performance tracking
    this.client.interceptors.request.use((config) => {
      this.requestCount++
      
      const token = localStorage.getItem('sr_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      // Add trailing slash for DRF compatibility
      const method = (config.method || 'get').toLowerCase()
      if (method !== 'get' && typeof config.url === 'string' && 
          !/^https?:\/\//i.test(config.url) && !config.url.endsWith('/')) {
        config.url = config.url + '/'
      }
      
      // Add request timestamp for performance monitoring
      config.metadata = { startTime: new Date() }
      
      return config
    })

    // Response interceptor with comprehensive error handling
    this.client.interceptors.response.use(
      (response) => {
        // Calculate request duration
        const endTime = new Date()
        const duration = endTime - response.config.metadata.startTime
        
        if (duration > 5000) {
          console.warn(`Slow API request detected: ${response.config.url} took ${duration}ms`)
        }
        
        return response
      },
      async (error) => {
        this.errorCount++
        const originalRequest = error.config

        // Handle 401 authentication errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
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
              this.processRetryQueue(null, token)
              return this.client.request(originalRequest)
            }
          } catch (refreshError) {
            this.processRetryQueue(refreshError, null)
            this.clearAuth()
            
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
        
        console.log('✅ Token refreshed successfully')
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
      
      // Handle specific HTTP status codes
      switch (status) {
        case 400:
          message = data?.detail || data?.message || 'Invalid request data'
          break
        case 401:
          message = 'Authentication required. Please log in again.'
          break
        case 403:
          message = 'You do not have permission to perform this action'
          break
        case 404:
          if (error.config.url?.includes('/auth/user/')) {
            message = 'Student not found. Please check your username.'
          } else {
            message = 'The requested resource was not found'
          }
          break
        case 409:
          message = data?.detail || 'Conflict - resource already exists'
          break
        case 422:
          message = 'Validation error - please check your input'
          break
        case 429:
          message = 'Too many requests. Please wait a moment and try again.'
          break
        case 500:
          message = 'Server error. Please try again later.'
          break
        case 502:
        case 503:
          message = 'Service temporarily unavailable. Please try again.'
          break
        default:
          message = data?.detail || data?.message || message
      }
      
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
    } else if (error.request) {
      // Network errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        message = 'Request timed out. Please check your connection and try again.'
      } else if (error.message?.includes('CORS')) {
        message = 'CORS policy blocked this request. Please check backend CORS configuration.'
      } else if (error.message?.includes('Network Error')) {
        message = 'Unable to reach the server. Please check your internet connection.'
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
        console.log(`🔄 Retrying request... ${retries} attempts left`)
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
        console.log('🔄 CORS blocked, trying CORS-enabled endpoint...')
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

  // Health check for backend connectivity
  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseURL}/health/`, { 
        timeout: 5000 
      })
      return { 
        healthy: true, 
        status: response.status,
        latency: response.config.metadata ? 
          new Date() - response.config.metadata.startTime : 'unknown'
      }
    } catch (error) {
      return { 
        healthy: false, 
        error: error.message,
        suggestion: 'Backend server may not be running or unreachable'
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

  // Batch request utility for performance
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

  // File upload with progress tracking
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

  // Performance metrics
  getMetrics() {
    return {
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount * 100).toFixed(2) + '%' : '0%',
      baseURL: this.baseURL
    }
  }

  // Reset metrics
  resetMetrics() {
    this.requestCount = 0
    this.errorCount = 0
  }
}

// Export singleton instance
const api = new ProductionApiClient()
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
  uploadFile,
  getMetrics
} = api

// Export class for advanced usage
export { ProductionApiClient }