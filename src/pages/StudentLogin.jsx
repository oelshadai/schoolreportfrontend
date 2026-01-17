import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { FaEye, FaEyeSlash, FaArrowLeft, FaUserGraduate, FaLock, FaMicrochip } from 'react-icons/fa'

export default function StudentLogin() {
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/student-dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await login(studentId, password, 'student')
    if (res.ok) navigate(from, { replace: true })
    else setError(res.message)
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 999,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 0',
        width: '100%',
        margin: 0
      }}>
        <div style={{
          width: '100%',
          margin: 0,
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '1.25rem',
            color: '#1a202c'
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaMicrochip size={18} color="white" />
            </div>
            <span>Elite Tech</span>
          </Link>
          
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#718096',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            padding: '8px 16px',
            borderRadius: '8px',
            background: '#f7fafc',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s ease'
          }}>
            <FaArrowLeft size={12} />
            Back to Home
          </Link>
        </div>
      </nav>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '0 20px 20px',
        background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
        minHeight: 'calc(100vh - 80px)',
        overflow: 'auto'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          position: 'relative'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2dd4bf, #06d6a0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <FaUserGraduate size={20} color="white" />
            </div>
            <h1 style={{
              margin: '0 0 6px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#1a202c',
              lineHeight: '1.2'
            }}>Student Portal</h1>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#718096',
              fontWeight: '400'
            }}>Sign in with your student credentials</p>
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}>
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
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
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>Student ID</label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#a1a1aa',
                    zIndex: 1
                  }}>
                    <FaUserGraduate size={12} />
                  </div>
                  <input 
                    type="text" 
                    value={studentId} 
                    onChange={(e) => setStudentId(e.target.value)} 
                    required 
                    placeholder="Enter your student ID"
                    autoComplete="username"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 32px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13px',
                      background: '#ffffff',
                      color: '#374151',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#2dd4bf'
                      e.target.style.boxShadow = '0 0 0 2px rgba(45, 212, 191, 0.1)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#d1d5db'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  color: '#374151',
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
                    zIndex: 1
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
                      padding: '10px 36px 10px 32px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13px',
                      background: '#ffffff',
                      color: '#374151',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#2dd4bf'
                      e.target.style.boxShadow = '0 0 0 2px rgba(45, 212, 191, 0.1)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#d1d5db'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#a1a1aa',
                      cursor: 'pointer',
                      padding: '3px',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#374151'}
                    onMouseLeave={e => e.currentTarget.style.color = '#a1a1aa'}
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 20px',
                  background: loading ? '#6b7280' : 'linear-gradient(135deg, #2dd4bf, #06d6a0)',
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
                    e.currentTarget.style.boxShadow = '0 3px 10px rgba(45, 212, 191, 0.3)'
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
            </form>

            <div style={{
              textAlign: 'center',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <p style={{
                margin: '0 0 12px 0',
                fontSize: '13px',
                color: '#a1a1aa'
              }}>
                Are you a staff member?{' '}
                <Link 
                  to="/login" 
                  style={{
                    color: '#2dd4bf',
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#06d6a0'}
                  onMouseLeave={e => e.currentTarget.style.color = '#2dd4bf'}
                >
                  Staff Login
                </Link>
              </p>
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: '#a1a1aa'
              }}>
                Need help? Contact your school administrator
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}