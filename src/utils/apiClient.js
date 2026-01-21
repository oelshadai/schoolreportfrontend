import axios from 'axios'

// Production-ready API client with proper error handling and retry logic
class ApiClient {
  constructor() {
    this.baseURL = this.getApiBaseUrl()
    console.log('API Client initialized with base URL:', this.baseURL)
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
  }

  getApiBaseUrl() {
    // Check for explicit environment variable first
    if (import.meta.env.VITE_API_BASE) {
      return import.meta.env.VITE_API_BASE.replace(/\/$/, '')
    }
    
    // Force production API URL for deployed apps
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    
    // Check if we're on a production domain
    if (hostname.includes('netlify.app') || 
        hostname.includes('vercel.app') || 
        hostname.includes('render.com') ||
        hostname !== 'localhost') {
      return 'https://school-report-saas.onrender.com/api'
    }
    
    // Development fallback
    return 'http://localhost:8000/api'
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('sr_token')
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

    // Response interceptor with proper token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          
          try {
            await this.refreshToken()
            const token = localStorage.getItem('sr_token')
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return this.client.request(originalRequest)
            }
          } catch (refreshError) {
            this.clearAuth()
            if (window.location.pathname !== '/login') {
              window.location.href = '/login'
            }
          }
        }

        // Enhanced error handling
        const normalizedError = this.normalizeError(error)
        return Promise.reject(normalizedError)
      }
    )
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
      
      // Log response details for debugging
      console.error('API Error Response:', {
        status,
        data,
        headers: error.response.headers,
        url: error.config?.url
      })
      
      if (status === 404 && error.config.url?.includes('/auth/user/')) {
        message = 'Student not found. Please check your username.'
      } else if (typeof data === 'string') {
        // Handle HTML responses (like Django admin redirects)
        if (data.includes('<html>') || data.includes('<!DOCTYPE')) {
          message = 'Server returned HTML instead of JSON. Check API endpoint configuration.'
        } else {
          message = data
        }
      } else if (data?.detail) {
        message = data.detail
      } else if (data?.message) {
        message = data.message
      } else if (data && typeof data === 'object') {
        const parts = []
        for (const [k, v] of Object.entries(data)) {
          if (k === 'detail' || k === 'message') continue
          if (Array.isArray(v) && v.length) parts.push(`${k}: ${v[0]}`)
          else if (typeof v === 'string') parts.push(`${k}: ${v}`)
        }
        if (parts.length) message = parts.join(' | ')
      }
    } else if (error.request) {
      console.error('Network Error:', {
        message: error.message,
        code: error.code,
        config: error.config
      })
      
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

  // Retry wrapper with exponential backoff
  async withRetry(fn, retries = 3, delay = 1000) {
    try {
      return await fn()
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
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

  // Public API methods
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
}

// Export singleton instance
const apiClient = new ApiClient()
export default apiClient