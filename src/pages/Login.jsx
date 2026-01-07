import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import ForgotPassword from '../components/ForgotPassword'
import { FaEye, FaEyeSlash, FaArrowLeft, FaUser, FaLock, FaMicrochip } from 'react-icons/fa'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  // Mobile detection
  const isMobile = window.innerWidth <= 768
  const isSmallMobile = window.innerWidth <= 480

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await login(email, password)
    if (res.ok) navigate(from, { replace: true })
    else setError(res.message)
  }

  return (
    <div style={{
      height: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(62, 207, 142, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(45, 212, 191, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(6, 214, 160, 0.05) 0%, transparent 50%)
        `,
        animation: 'pulse 4s ease-in-out infinite'
      }} />
      
      <div style={{
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Top Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          {/* Elite Logo - Top Left */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaMicrochip size={24} color="white" />
            </div>
            <span style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'white'
            }}>Elite Tech</span>
          </div>
          
          {/* Back to Home - Top Right */}
          <Link 
            to="/" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#a1a1aa',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.color = '#a1a1aa'
            }}
          >
            <FaArrowLeft size={12} />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <h1 style={{
            margin: '0 0 6px 0',
            fontSize: '24px',
            fontWeight: '700',
            color: 'white',
            lineHeight: '1.2'
          }}>Staff Portal</h1>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#a1a1aa',
            fontWeight: '400'
          }}>Sign in to your school admin portal</p>
        </div>

        {/* Login Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
          marginBottom: '40px'
        }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600'
              }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a1a1aa',
                  zIndex: 1
                }}>
                  <FaUser size={12} />
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="Enter your email"
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 32px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    fontSize: '13px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#3ecf8e'
                    e.target.style.boxShadow = '0 0 0 2px rgba(62, 207, 142, 0.1)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600'
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a1a1aa',
                  zIndex: 0,
                  pointerEvents: 'none'
                }}>
                  <FaLock size={12} />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 10px 12px 36px' : '10px 36px 10px 32px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    fontSize: isMobile ? '16px' : '13px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    position: 'relative',
                    zIndex: 1
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#3ecf8e'
                    e.target.style.boxShadow = '0 0 0 2px rgba(62, 207, 142, 0.1)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#a1a1aa',
                    cursor: 'pointer',
                    padding: '0px',
                    borderRadius: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s ease',
                    width: '5px',
                    height: '5px',
                    zIndex: 10,
                    pointerEvents: 'auto'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = '#a1a1aa'}
                >
                  {showPassword ? <FaEyeSlash size={3} /> : <FaEye size={3} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 20px',
                background: loading ? '#6b7280' : 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                marginBottom: '12px'
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(62, 207, 142, 0.3)'
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              {loading && (
                <div style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#3ecf8e',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                padding: '6px',
                borderRadius: '4px',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#2dd4bf'}
              onMouseLeave={e => e.currentTarget.style.color = '#3ecf8e'}
            >
              Forgot Password?
            </button>
          </form>
          
          <ForgotPassword 
            isOpen={showForgotPassword}
            onClose={() => setShowForgotPassword(false)}
            userType="admin"
          />

          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <p style={{
              margin: '0 0 12px 0',
              fontSize: '13px',
              color: '#a1a1aa'
            }}>
              Are you a student?{' '}
              <Link 
                to="/student-portal" 
                style={{
                  color: '#3ecf8e',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#2dd4bf'}
                onMouseLeave={e => e.currentTarget.style.color = '#3ecf8e'}
              >
                Go to Student Portal
              </Link>
            </p>
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: '#a1a1aa'
            }}>
              Don't have an account?{' '}
              <Link 
                to="/register-school" 
                style={{
                  color: '#3ecf8e',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#2dd4bf'}
                onMouseLeave={e => e.currentTarget.style.color = '#3ecf8e'}
              >
                Create School Account
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}