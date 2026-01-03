import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { FaEnvelope, FaUser, FaLock, FaRocket, FaArrowLeft, FaSchool } from 'react-icons/fa'

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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        position: 'relative'
      }}>
        {/* Back to Home */}
        <Link 
          to="/" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            color: 'rgba(255, 255, 255, 0.8)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '32px',
            padding: '12px 20px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.color = 'white'
            e.currentTarget.style.transform = 'translateX(-2px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
            e.currentTarget.style.transform = 'translateX(0)'
          }}
        >
          <FaArrowLeft size={12} />
          Back to Home
        </Link>
        
        <form onSubmit={handleSubmit} style={{
          background: 'white',
          padding: '48px',
          borderRadius: '24px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <FaSchool size={28} color="white" />
            </div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#1f2937',
              margin: '0 0 8px',
              letterSpacing: '-0.02em'
            }}>Create School Account</h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: 0
            }}>Start your free trial today</p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              marginBottom: '24px'
            }}>
              {error}
            </div>
          )}

          {/* Form Fields */}
          <div style={{ display: 'grid', gap: '24px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>School Name</label>
              <div style={{ position: 'relative' }}>
                <FaSchool style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '16px'
                }} />
                <input 
                  name="school_name" 
                  value={form.school_name} 
                  onChange={handleChange} 
                  required 
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 48px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>Admin Email</label>
              <div style={{ position: 'relative' }}>
                <FaEnvelope style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '16px'
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
                      padding: '16px 16px 16px 48px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>First Name</label>
                <div style={{ position: 'relative' }}>
                  <FaUser style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    fontSize: '16px'
                  }} />
                  <input 
                    name="first_name" 
                    value={form.first_name} 
                    onChange={handleChange} 
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 48px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Last Name</label>
                <div style={{ position: 'relative' }}>
                  <FaUser style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    fontSize: '16px'
                  }} />
                  <input 
                    name="last_name" 
                    value={form.last_name} 
                    onChange={handleChange} 
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 48px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '16px'
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
                      padding: '16px 16px 16px 48px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '16px'
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
                      padding: '16px 16px 16px 48px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
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
              padding: '18px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: loading ? 'none' : '0 10px 25px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)'
              }
            }}
            onMouseLeave={e => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)'
              }
            }}
          >
            <FaRocket size={18} />
            {loading ? 'Creating Account...' : 'Create School Account'}
          </button>

          {/* Login Link */}
          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{
                color: '#3b82f6',
                textDecoration: 'none',
                fontWeight: '600'
              }}
              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
              onMouseLeave={e => e.target.style.textDecoration = 'none'}
            >
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
