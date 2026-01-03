import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sr_user')
    return saved && saved !== 'undefined' ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('sr_token'))
  const [loading, setLoading] = useState(false)

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('sr_refresh')
      if (!refreshTokenValue) {
        logout()
        return false
      }
      
      const res = await api.post('/auth/token/refresh/', { refresh: refreshTokenValue })
      const { access } = res.data
      
      setToken(access)
      localStorage.setItem('sr_token', access)
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`
      
      return true
    } catch (err) {
      console.warn('Token refresh failed:', err)
      logout()
      return false
    }
  }

  const logout = async (userType = 'admin') => {
    try {
      const refreshTokenValue = localStorage.getItem('sr_refresh')
      if (refreshTokenValue) {
        const endpoint = userType === 'student' ? '/students/auth/logout/' : '/auth/logout/'
        await api.post(endpoint, { refresh: refreshTokenValue })
      }
    } catch (err) {
      console.warn('Logout API call failed:', err)
    } finally {
      setToken(null)
      setUser(null)
      localStorage.removeItem('sr_token')
      localStorage.removeItem('sr_refresh')
      localStorage.removeItem('sr_user')
    }
  }

  // Check token validity on load
  useEffect(() => {
    const checkToken = async () => {
      const savedToken = localStorage.getItem('sr_token')
      if (savedToken) {
        try {
          // Try a simple API call to verify token
          await api.get('/auth/profile/')
        } catch (error) {
          if (error.response?.status === 401) {
            console.log('Token expired, attempting refresh...')
            await refreshToken()
          }
        }
      }
    }
    checkToken()
  }, [])

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  const login = async (email, password, userType = 'admin') => {
    setLoading(true)
    try {
      const endpoint = userType === 'student' ? '/students/auth/login/' : '/auth/login/'
      const payload = userType === 'student' 
        ? { student_id: email, password } 
        : { email, password }
      
      const res = await api.post(endpoint, payload)
      
      // Handle different response structures
      let access, refresh, userData
      
      if (userType === 'student') {
        access = res.data.access
        refresh = res.data.refresh
        userData = res.data.student // Student data is in 'student' field
      } else {
        access = res.data.access
        refresh = res.data.refresh
        userData = res.data.user // Admin/teacher data is in 'user' field
      }
      
      setToken(access)
      setUser(userData)
      localStorage.setItem('sr_token', access)
      localStorage.setItem('sr_refresh', refresh)
      localStorage.setItem('sr_user', JSON.stringify(userData))
      
      console.log('Login successful:', { userType, userData }) // Debug log
      
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
      
      return { ok: false, message }
    } finally {
      setLoading(false)
    }
  }



  const registerSchool = async ({ school_name, admin_email, password, password_confirm, levels = ['BOTH'], first_name = 'Admin', last_name = 'User' }) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/register-school/', { school_name, admin_email, password, password_confirm, levels, first_name, last_name })
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
  }

  const value = useMemo(() => ({ user, token, login, logout, registerSchool, refreshToken, loading }), [user, token, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
