import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaMicrochip, FaUserTie, FaUserGraduate, FaSchool, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa'

export default function Layout({ children, showNav = true, user = null }) {
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div style={{
      background: '#0a0a0a',
      color: 'white',
      minHeight: '100vh'
    }}>
      {showNav && (
        <nav style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textDecoration: 'none'
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaMicrochip size={16} color="white" />
              </div>
              <span style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'white'
              }}>Elite Tech</span>
            </Link>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20
            }}>
              {!user && !isMobile && (
                <>
                  <Link 
                    to="/login" 
                    style={{
                      color: '#a1a1aa',
                      textDecoration: 'none',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <FaUserTie size={14} />
                    Staff Login
                  </Link>
                  <Link 
                    to="/student-login" 
                    style={{
                      color: '#a1a1aa',
                      textDecoration: 'none',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <FaUserGraduate size={14} />
                    Student Login
                  </Link>
                </>
              )}
              
              {user && (
                <>
                  <span style={{
                    color: '#a1a1aa',
                    fontSize: 14,
                    fontWeight: 500
                  }}>
                    Welcome, {user.name || user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#a1a1aa',
                      padding: '8px 16px',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s'
                    }}
                  >
                    <FaSignOutAlt size={12} />
                    Logout
                  </button>
                </>
              )}
              
              {!user && (
                <Link 
                  to="/register-school" 
                  style={{
                    background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(62, 207, 142, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <FaSchool size={14} />
                  Register Your School
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
      
      <main style={{
        paddingTop: showNav ? '80px' : '0',
        minHeight: '100vh'
      }}>
        {children}
      </main>
    </div>
  )
}

export const FormContainer = ({ children, title, subtitle }) => (
  <div style={{
    padding: '80px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 80px)'
  }}>
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 16,
      padding: '40px',
      maxWidth: '500px',
      width: '100%'
    }}>
      {title && (
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 700,
            margin: '0 0 8px',
            background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>{title}</h1>
          {subtitle && (
            <p style={{
              fontSize: 16,
              color: '#a1a1aa',
              margin: 0
            }}>{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  </div>
)

export const Button = ({ children, variant = 'primary', onClick, type = 'button', disabled = false, ...props }) => {
  const baseStyle = {
    padding: '12px 24px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: disabled ? 0.6 : 1
  }

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(62, 207, 142, 0.3)'
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.05)',
      color: '#3ecf8e',
      border: '1px solid rgba(62, 207, 142, 0.3)'
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyle,
        ...variants[variant]
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export const Input = ({ label, error, ...props }) => (
  <div style={{ marginBottom: '20px' }}>
    {label && (
      <label style={{
        display: 'block',
        fontSize: 14,
        fontWeight: 500,
        color: '#e5e5e5',
        marginBottom: '8px'
      }}>
        {label}
      </label>
    )}
    <input
      style={{
        width: '100%',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: `1px solid ${error ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
        borderRadius: 8,
        color: 'white',
        fontSize: 14,
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box'
      }}
      {...props}
    />
    {error && (
      <span style={{
        display: 'block',
        fontSize: 12,
        color: '#ef4444',
        marginTop: '4px'
      }}>
        {error}
      </span>
    )}
  </div>
)