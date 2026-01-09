import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { FaEye, FaEyeSlash, FaArrowLeft, FaUser, FaLock, FaShield } from 'react-icons/fa'

export default function EliteMobileLogin() {
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
    <div className="elite-app" style={{
      minHeight: '100vh',
      background: 'var(--elite-bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--elite-space-4)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(22, 163, 74, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)
        `,
        animation: 'elitePulse 4s ease-in-out infinite'
      }} />
      
      <div style={{
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--elite-space-6)'
        }}>
          <div className="elite-logo-icon" style={{
            width: '80px',
            height: '80px',
            margin: '0 auto var(--elite-space-4)',
            fontSize: '32px',
            boxShadow: 'var(--elite-shadow-glow)'
          }}>
            <FaShield />
          </div>
          <h1 className="elite-text-3xl elite-font-bold elite-mb-2">
            Elite School Portal
          </h1>
          <p className="elite-text-sm" style={{ color: 'var(--elite-text-muted)' }}>
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="elite-card elite-mb-6">
          {error && (
            <div className="elite-alert elite-alert-error elite-mb-4">
              <FaExclamationTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="elite-form-group">
              <label className="elite-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 'var(--elite-space-3)',
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
                  className="elite-input"
                  style={{ paddingLeft: 'var(--elite-space-10)' }}
                />
              </div>
            </div>

            <div className="elite-form-group">
              <label className="elite-label">Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 'var(--elite-space-3)',
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
                  className="elite-input"
                  style={{ 
                    paddingLeft: 'var(--elite-space-10)',
                    paddingRight: 'var(--elite-space-10)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 'var(--elite-space-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--elite-green-500)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="elite-btn elite-btn-primary elite-w-full elite-mb-4"
              style={{ height: '56px' }}
            >
              {loading && <div className="elite-spinner" />}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            
            <button
              type="button"
              className="elite-btn elite-btn-ghost elite-w-full"
            >
              Forgot Password?
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="elite-card elite-card-compact" style={{ textAlign: 'center' }}>
          <p className="elite-text-sm" style={{ 
            margin: '0 0 var(--elite-space-3) 0',
            color: 'var(--elite-text-muted)' 
          }}>
            Are you a student?{' '}
            <Link 
              to="/student-portal" 
              style={{
                color: 'var(--elite-green-500)',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Go to Student Portal
            </Link>
          </p>
          <p className="elite-text-sm" style={{ 
            margin: 0,
            color: 'var(--elite-text-muted)' 
          }}>
            Don't have an account?{' '}
            <Link 
              to="/register-school" 
              style={{
                color: 'var(--elite-green-500)',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Create School Account
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: 'var(--elite-space-4)' }}>
          <Link 
            to="/" 
            className="elite-btn elite-btn-ghost elite-btn-sm"
          >
            <FaArrowLeft size={12} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}