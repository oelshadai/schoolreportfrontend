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
      minHeight: '100vh',
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
        maxWidth: '500px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          {/* Elite Logo */}
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
          
          {/* Back to Home */}
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
        
        <form onSubmit={handleSubmit} style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
              fontSize: '24px',
              fontWeight: '700',
              color: 'white',
              margin: '0 0 6px',
              letterSpacing: '-0.01em'
            }}>Create School Account</h1>
            <p style={{
              fontSize: '14px',
              color: '#a1a1aa',
              margin: 0
            }}>Start your free trial today</p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {/* Form Fields */}
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: '#e5e7eb',
                marginBottom: '6px'
              }}>School Name</label>
              <div style={{ position: 'relative' }}>
                <FaSchool style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a1a1aa',
                  fontSize: '14px'
                }} />
                <input 
                  name="school_name" 
                  value={form.school_name} 
                  onChange={handleChange} 
                  required 
                  autoComplete="organization"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 36px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
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

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: '#e5e7eb',
                marginBottom: '6px'
              }}>Admin Email</label>
              <div style={{ position: 'relative' }}>
                <FaEnvelope style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a1a1aa',
                  fontSize: '14px'
                }} />
                  <input 
                    type="email" 
                    name="admin_email" 
                    value={form.admin_email} 
                    onChange={handleChange} 
                    required 
                    autoComplete="email"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 36px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#e5e7eb',
                  marginBottom: '6px'
                }}>First Name</label>
                <div style={{ position: 'relative' }}>
                  <FaUser style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#a1a1aa',
                    fontSize: '14px'
                  }} />
                  <input 
                    name="first_name" 
                    value={form.first_name} 
                    onChange={handleChange} 
                    autoComplete="given-name"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 36px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#e5e7eb',
                  marginBottom: '6px'
                }}>Last Name</label>
                <div style={{ position: 'relative' }}>
                  <FaUser style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#a1a1aa',
                    fontSize: '14px'
                  }} />
                  <input 
                    name="last_name" 
                    value={form.last_name} 
                    onChange={handleChange} 
                    autoComplete="family-name"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 36px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
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
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: '#e5e7eb',
                marginBottom: '6px'
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a1a1aa',
                  fontSize: '14px'
                }} />
                  <input 
                    type="password" 
                    name="password" 
                    value={form.password} 
                    onChange={handleChange} 
                    required 
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 36px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
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

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: '#e5e7eb',
                marginBottom: '6px'
              }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a1a1aa',
                  fontSize: '14px'
                }} />
                  <input 
                    type="password" 
                    name="password_confirm" 
                    value={form.password_confirm} 
                    onChange={handleChange} 
                    required 
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 36px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
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
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#6b7280' : 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginTop: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(62, 207, 142, 0.3)'
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.target.style.transform = 'translateY(-1px)'
                e.target.style.boxShadow = '0 6px 20px rgba(62, 207, 142, 0.4)'
              }
            }}
            onMouseLeave={e => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(62, 207, 142, 0.3)'
              }
            }}
          >
            <FaRocket size={16} />
            {loading ? 'Creating Account...' : 'Create School Account'}
          </button>

          {/* Login Link */}
          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            fontSize: '13px',
            color: '#a1a1aa'
          }}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{
                color: '#3ecf8e',
                textDecoration: 'none',
                fontWeight: '500'
              }}
              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
              onMouseLeave={e => e.target.style.textDecoration = 'none'}
            >
              Sign in here
            </Link>
          </div>
        </form>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
