import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import apiClient from '../utils/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sr_user')
      return saved && saved !== 'undefined' ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('sr_token'))
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState(null)

  // Memoized refresh token function to prevent recreation
  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = localStorage.getItem('sr_refresh')
      if (!refreshTokenValue) {
        logout()
        return false
      }
      
      const access = await apiClient.refreshToken()
      setToken(access)
      return true
    } catch (err) {
      console.warn('Token refresh failed:', err)
      logout()
      return false
    }
  }, [])

  // Memoized logout function
  const logout = useCallback(async (userType = 'admin') => {
    try {
      const refreshTokenValue = localStorage.getItem('sr_refresh')
      if (refreshTokenValue) {
        const endpoint = userType === 'student' ? '/students/auth/logout/' : '/auth/logout/'
        await apiClient.post(endpoint, { refresh: refreshTokenValue })
      }
    } catch (err) {
      console.warn('Logout API call failed:', err)
    } finally {
      setToken(null)
      setUser(null)
      apiClient.clearAuth()
    }
  }, [])

  // Check token validity on mount only - prevent infinite loops
  useEffect(() => {
    let mounted = true
    
    const checkToken = async () => {
      if (!mounted) return
      
      const savedToken = localStorage.getItem('sr_token')
      if (savedToken) {
        try {
          const response = await apiClient.get('/auth/profile/')
          if (mounted && response.data) {
            setUser(response.data)
            localStorage.setItem('sr_user', JSON.stringify(response.data))
          }
        } catch (error) {
          if (mounted && error.response?.status === 401) {
            console.log('Token expired, attempting refresh...')
            const refreshed = await refreshToken()
            if (!refreshed && mounted) {
              logout()
            }
          }
        }
      }
      if (mounted) {
        setInitialized(true)
      }
    }
    
    if (!initialized) {
      checkToken()
    }
    
    return () => {
      mounted = false
    }
  }, []) // Remove refreshToken from dependencies to prevent loops

  // Memoized login function with enhanced error handling
  const login = useCallback(async (email, password, userType = 'admin') => {
    setLoading(true)
    setError(null)
    
    try {
      const endpoint = userType === 'student' ? '/students/auth/login/' : '/auth/login/'
      const payload = userType === 'student' 
        ? { student_id: email, password } 
        : { email, password }
      
      const res = await apiClient.post(endpoint, payload)
      
      let access, refresh, userData
      
      if (userType === 'student') {
        access = res.data.access
        refresh = res.data.refresh
        userData = res.data.student
      } else {
        access = res.data.access
        refresh = res.data.refresh
        userData = res.data.user
      }
      
      // Validate required data
      if (!access || !refresh || !userData) {
        throw new Error('Invalid response from server')
      }
      
      setToken(access)
      setUser(userData)
      localStorage.setItem('sr_token', access)
      localStorage.setItem('sr_refresh', refresh)
      localStorage.setItem('sr_user', JSON.stringify(userData))
      
      return { ok: true }
    } catch (err) {
      console.error('Login error:', err)
      let message = 'Login failed. Please try again.'
      
      if (err.response?.data?.detail) {
        message = err.response.data.detail
      } else if (err.response?.data?.error) {
        message = err.response.data.error
      } else if (err.normalizedMessage) {
        message = err.normalizedMessage
      } else if (err.message?.includes('Network Error')) {
        message = 'Unable to connect to server. Please check your internet connection.'
      } else if (err.response?.status === 401) {
        message = userType === 'student' 
          ? 'Invalid student ID or password. Please check your credentials.'
          : 'Invalid email or password. Please check your credentials.'
      } else if (err.response?.status === 404) {
        message = userType === 'student'
          ? `Student not found. Please check your student ID: ${email}`
          : 'Account not found. Please check your email.'
      } else if (err.response?.status === 400) {
        message = userType === 'student'
          ? 'Student ID and password are required.'
          : 'Email and password are required.'
      }
      
      setError(message)
      return { ok: false, message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Memoized register function
  const registerSchool = useCallback(async ({ school_name, admin_email, password, password_confirm, levels = ['BOTH'], first_name = 'Admin', last_name = 'User' }) => {
    setLoading(true)
    try {
      const res = await apiClient.post('/auth/register-school/', { 
        school_name, admin_email, password, password_confirm, levels, first_name, last_name 
      })
      const { access, refresh, user } = res.data
      setToken(access)
      setUser(user)
      localStorage.setItem('sr_token', access)
      localStorage.setItem('sr_refresh', refresh)
      localStorage.setItem('sr_user', JSON.stringify(user))
      return { ok: true }
    } catch (err) {
      const message = err?.normalizedMessage || err?.response?.data || { detail: 'Registration failed' }
      return { ok: false, message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ 
    user, 
    token, 
    login, 
    logout, 
    registerSchool, 
    refreshToken, 
    loading,
    initialized,
    error,
    clearError: () => setError(null)
  }), [user, token, login, logout, registerSchool, refreshToken, loading, initialized, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
