import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { FaEnvelope, FaUser, FaLock, FaRocket, FaArrowLeft, FaSchool, FaMicrochip } from 'react-icons/fa'

export default function RegisterSchool() {
  const { registerSchool, loading } = useAuth()
  const [form, setForm] = useState({
    school_name: '',
    admin_email: '',
    password: '',
    password_confirm: '',
    first_name: 'Admin',
    last_name: 'User',
    levels: ['BOTH']
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await registerSchool(form)
    if (res.ok) navigate('/dashboard')
    else setError(res.message?.detail || JSON.stringify(res.message))
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
          maxWidth: '500px',
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
              background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <FaSchool size={20} color="white" />
            </div>
            <h1 style={{
              margin: '0 0 6px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#1a202c',
              lineHeight: '1.2'
            }}>Create School Account</h1>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#718096',
              fontWeight: '400'
            }}>Start your free trial today</p>
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
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    color: '#374151',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>School Name</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#a1a1aa',
                      zIndex: 1
                    }}>
                      <FaSchool size={12} />
                    </div>
                    <input 
                      name="school_name" 
                      value={form.school_name} 
                      onChange={handleChange} 
                      required 
                      placeholder="Enter school name"
                      autoComplete="organization"
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
                        e.target.style.borderColor = '#3ecf8e'
                        e.target.style.boxShadow = '0 0 0 2px rgba(62, 207, 142, 0.1)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = '#d1d5db'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    color: '#374151',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>Admin Email</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#a1a1aa',
                      zIndex: 1
                    }}>
                      <FaEnvelope size={12} />
                    </div>
                    <input 
                      type="email" 
                      name="admin_email" 
                      value={form.admin_email} 
                      onChange={handleChange} 
                      required 
                      placeholder="Enter admin email"
                      autoComplete="email"
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
                        e.target.style.borderColor = '#3ecf8e'
                        e.target.style.boxShadow = '0 0 0 2px rgba(62, 207, 142, 0.1)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = '#d1d5db'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '4px',
                      color: '#374151',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>First Name</label>
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
                        name="first_name" 
                        value={form.first_name} 
                        onChange={handleChange} 
                        placeholder="First name"
                        autoComplete="given-name"
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
                          e.target.style.borderColor = '#3ecf8e'
                          e.target.style.boxShadow = '0 0 0 2px rgba(62, 207, 142, 0.1)'
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = '#d1d5db'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '4px',
                      color: '#374151',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>Last Name</label>
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
                        name="last_name" 
                        value={form.last_name} 
                        onChange={handleChange} 
                        placeholder="Last name"
                        autoComplete="family-name"
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
                          e.target.style.borderColor = '#3ecf8e'
                          e.target.style.boxShadow = '0 0 0 2px rgba(62, 207, 142, 0.1)'
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = '#d1d5db'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
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
                      type="password" 
                      name="password" 
                      value={form.password} 
                      onChange={handleChange} 
                      required 
                      placeholder="Create password"
                      autoComplete="new-password"
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
                        e.target.style.borderColor = '#3ecf8e'
                        e.target.style.boxShadow = '0 0 0 2px rgba(62, 207, 142, 0.1)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = '#d1d5db'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    color: '#374151',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>Confirm Password</label>
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
                      type="password" 
                      name="password_confirm" 
                      value={form.password_confirm} 
                      onChange={handleChange} 
                      required 
                      placeholder="Confirm password"
                      autoComplete="new-password"
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
                        e.target.style.borderColor = '#3ecf8e'
                        e.target.style.boxShadow = '0 0 0 2px rgba(62, 207, 142, 0.1)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = '#d1d5db'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: loading ? '#6b7280' : 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  marginTop: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-1px)'
                    e.target.style.boxShadow = '0 3px 10px rgba(62, 207, 142, 0.3)'
                  }
                }}
                onMouseLeave={e => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'none'
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
                <FaRocket size={14} />
                {loading ? 'Creating Account...' : 'Create School Account'}
              </button>
            </form>

            <div style={{
              textAlign: 'center',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: '#a1a1aa'
              }}>
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  style={{
                    color: '#3ecf8e',
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#2dd4bf'}
                  onMouseLeave={e => e.currentTarget.style.color = '#3ecf8e'}
                >
                  Sign in here
                </Link>
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
