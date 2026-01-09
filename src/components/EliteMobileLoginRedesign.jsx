import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { FaEye, FaEyeSlash, FaArrowLeft, FaUser, FaLock, FaShield, FaExclamationTriangle } from 'react-icons/fa'

export default function EliteMobileLoginRedesign() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await login(email, password)
    if (res.ok) navigate(from, { replace: true })
    else setError(res.message)
  }

  return (
    <div className="elite-login-container" style={{
      minHeight: '100vh',
      background: 'var(--elite-gradient-bg)',
      backgroundAttachment: 'fixed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--elite-space-4)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(22, 163, 74, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.08) 0%, transparent 50%)
        `,
        animation: 'elitePulse 6s ease-in-out infinite'
      }} />
      
      {/* Floating Particles */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(2px 2px at 20px 30px, rgba(34, 197, 94, 0.3), transparent),
          radial-gradient(2px 2px at 40px 70px, rgba(34, 197, 94, 0.2), transparent),
          radial-gradient(1px 1px at 90px 40px, rgba(34, 197, 94, 0.4), transparent),
          radial-gradient(1px 1px at 130px 80px, rgba(34, 197, 94, 0.2), transparent),
          radial-gradient(2px 2px at 160px 30px, rgba(34, 197, 94, 0.3), transparent)
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 100px',
        animation: 'eliteSlideInRight 20s linear infinite',
        opacity: 0.6
      }} />
      
      <div className="elite-login-content" style={{
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header Section */}
        <div className="elite-login-header" style={{
          textAlign: 'center',
          marginBottom: 'var(--elite-space-8)'
        }}>
          <div className="elite-logo-icon" style={{
            width: '80px',
            height: '80px',
            margin: '0 auto var(--elite-space-4)',
            background: 'var(--elite-gradient-primary)',
            borderRadius: 'var(--elite-radius-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            color: 'white',
            boxShadow: 'var(--elite-shadow-glow)',
            animation: 'eliteSlideInUp 0.8s ease-out'
          }}>
            <FaShield />
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #86efac, #22c55e)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 var(--elite-space-2) 0',
            lineHeight: '1.2',
            animation: 'eliteSlideInUp 0.8s ease-out 0.1s both'
          }}>
            Elite School Portal
          </h1>
          <p style={{
            color: 'var(--elite-text-muted)',
            fontSize: '16px',
            fontWeight: '500',
            margin: 0,
            animation: 'eliteSlideInUp 0.8s ease-out 0.2s both'
          }}>
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form Card */}
        <div className="elite-card elite-card-glass" style={{
          marginBottom: 'var(--elite-space-6)',
          animation: 'eliteSlideInUp 0.8s ease-out 0.3s both'
        }}>
          {error && (
            <div className="elite-alert elite-alert-error" style={{
              marginBottom: 'var(--elite-space-4)',
              animation: 'eliteSlideInUp 0.3s ease-out'
            }}>
              <FaExclamationTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="elite-form-group">
              <label className="elite-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 'var(--elite-space-4)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--elite-text-muted)',
                  zIndex: 1
                }}>
                  <FaUser size={16} />
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="Enter your email"
                  className="elite-input elite-focus-ring"
                  style={{ 
                    paddingLeft: 'calc(var(--elite-space-4) + 24px + var(--elite-space-2))',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="elite-form-group">
              <label className="elite-label">Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 'var(--elite-space-4)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--elite-text-muted)',
                  zIndex: 1
                }}>
                  <FaLock size={16} />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="Enter your password"
                  className="elite-input elite-focus-ring"
                  style={{ 
                    paddingLeft: 'calc(var(--elite-space-4) + 24px + var(--elite-space-2))',
                    paddingRight: 'calc(var(--elite-space-4) + 24px + var(--elite-space-2))',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 'var(--elite-space-4)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--elite-green-primary)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: 'var(--elite-radius-sm)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--elite-green-subtle)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'none'
                  }}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="elite-btn elite-btn-primary elite-w-full"
              style={{ 
                height: '56px',
                fontSize: '16px',
                fontWeight: '700',
                marginBottom: 'var(--elite-space-4)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {loading && (
                <div className="elite-spinner" style={{ marginRight: 'var(--elite-space-2)' }} />
              )}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            
            {/* Forgot Password Button */}
            <button
              type="button"
              className="elite-btn elite-btn-ghost elite-w-full"
              style={{ fontSize: '14px' }}
            >
              Forgot Password?
            </button>
          </form>
        </div>

        {/* Footer Links Card */}
        <div className="elite-card elite-card-compact elite-card-glass" style={{ 
          textAlign: 'center',
          animation: 'eliteSlideInUp 0.8s ease-out 0.4s both'
        }}>
          <p style={{ 
            margin: '0 0 var(--elite-space-3) 0',
            fontSize: '14px',
            color: 'var(--elite-text-muted)' 
          }}>
            Are you a student?{' '}
            <Link 
              to="/student-portal" 
              style={{
                color: 'var(--elite-green-primary)',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'var(--elite-green-light)'
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'var(--elite-green-primary)'
              }}
            >
              Go to Student Portal
            </Link>
          </p>
          <p style={{ 
            margin: 0,
            fontSize: '14px',
            color: 'var(--elite-text-muted)' 
          }}>
            Don't have an account?{' '}
            <Link 
              to="/register-school" 
              style={{
                color: 'var(--elite-green-primary)',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'var(--elite-green-light)'
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'var(--elite-green-primary)'
              }}
            >
              Create School Account
            </Link>
          </p>
        </div>

        {/* Back to Home Button */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 'var(--elite-space-6)',
          animation: 'eliteSlideInUp 0.8s ease-out 0.5s both'
        }}>
          <Link 
            to="/" 
            className="elite-btn elite-btn-ghost elite-btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--elite-space-2)',
              padding: 'var(--elite-space-3) var(--elite-space-5)'
            }}
          >
            <FaArrowLeft size={12} />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Floating Action Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        background: 'var(--elite-gradient-primary)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--elite-shadow-glow)',
        animation: 'elitePulse 3s ease-in-out infinite',
        opacity: 0.8
      }}>
        <FaShield size={24} color="white" />
      </div>
    </div>
  )
}