import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import NotificationSystem from './NotificationSystem'
import EliteLogo from './EliteLogo'
import { 
  FaTachometerAlt, FaUserGraduate, FaBookOpen, FaFileInvoice, 
  FaChalkboardTeacher, FaSignOutAlt, FaLayerGroup, 
  FaBook, FaCog, FaBars, FaTimes, FaClipboardList, FaUserEdit, FaUserCheck, FaChartBar 
} from 'react-icons/fa'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = screenSize.width <= 768
  const isSmallMobile = screenSize.width <= 480
  const isTablet = screenSize.width <= 1024 && screenSize.width > 768

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: FaTachometerAlt, roles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'] },
    { to: '/classes', label: 'Classes', icon: FaLayerGroup, roles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'] },
    { to: '/subjects', label: 'Subjects', icon: FaBook, roles: ['SCHOOL_ADMIN', 'PRINCIPAL'] },
    { to: '/students', label: 'Students', icon: FaUserGraduate, roles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'] },
    { to: '/student-details', label: 'Student Details', icon: FaUserEdit, roles: ['TEACHER'] },
    { to: '/attendance', label: 'Attendance', icon: FaUserCheck, roles: ['TEACHER'] },
    { to: '/attendance-dashboard', label: 'Attendance Overview', icon: FaChartBar, roles: ['SCHOOL_ADMIN', 'PRINCIPAL'] },
    { to: '/vclass', label: 'Virtual Class', icon: FaClipboardList, roles: ['TEACHER'] },
    { to: '/scores', label: 'Enter Scores', icon: FaBookOpen, roles: ['TEACHER'] },
    { to: '/reports', label: 'Reports', icon: FaFileInvoice, roles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'] },
    { to: '/teachers', label: 'Teachers', icon: FaChalkboardTeacher, roles: ['SCHOOL_ADMIN', 'PRINCIPAL'] },
    { to: '/settings', label: 'Settings', icon: FaCog, roles: ['SCHOOL_ADMIN', 'PRINCIPAL'] }
  ]

  const visibleNavItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  )

  const NavLink = ({ to, label, icon: Icon, mobile = false }) => {
    const isActive = location.pathname.startsWith(to)
    return (
      <Link 
        to={to}
        onClick={() => mobile && setMobileMenuOpen(false)}
        className={`nav-link ${isActive ? 'active' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: mobile ? 10 : 6,
          padding: mobile ? '14px 16px' : '10px 14px',
          borderRadius: mobile ? 12 : 10,
          fontSize: mobile ? 15 : 13,
          fontWeight: isActive ? 600 : 500,
          color: isActive ? '#4f46e5' : '#64748b',
          background: isActive ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
          border: isActive ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid transparent',
          transition: 'all 0.2s ease',
          textDecoration: 'none',
          width: mobile ? '100%' : 'auto',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={e => {
          if (!isActive && !mobile) {
            e.currentTarget.style.background = 'rgba(79, 70, 229, 0.05)'
            e.currentTarget.style.color = '#4f46e5'
          }
        }}
        onMouseLeave={e => {
          if (!isActive && !mobile) {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#64748b'
          }
        }}
      >
        <Icon size={mobile ? 16 : 14} style={{ opacity: 0.8 }} />
        <span>{label}</span>
      </Link>
    )
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--gray-200)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1536px',
          margin: '0 auto',
          padding: isSmallMobile ? '0 12px' : '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: isMobile ? '56px' : '64px'
        }}>
          {/* Brand - Elite Consult Logo */}
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isSmallMobile ? 8 : 12,
              cursor: 'pointer'
            }}>
              <EliteLogo size={isSmallMobile ? 32 : 40} />
              {!isMobile && (
                <span style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#1f2937',
                  letterSpacing: '-0.02em'
                }}>
                  Elite Consult
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flex: 1,
              justifyContent: 'center',
              maxWidth: '700px',
              padding: '0 20px'
            }}>
              {visibleNavItems.map(item => (
                <NavLink key={item.to} {...item} />
              ))}
            </nav>
          )}

          {/* User Menu & Mobile Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isSmallMobile ? 8 : 12
          }}>
            {/* User Info */}
            <div style={{
              display: isMobile ? 'none' : 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 12px',
              background: '#f8fafc',
              borderRadius: 10,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 14,
                fontWeight: 600
              }}>
                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                  {user?.first_name} {user?.last_name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {user?.role === 'SCHOOL_ADMIN' ? 'Administrator' : 
                   user?.role === 'PRINCIPAL' ? 'Principal' : 'Teacher'}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <NotificationSystem />

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--error)',
                borderColor: 'var(--gray-300)'
              }}
            >
              <FaSignOutAlt size={14} />
              <span style={{ display: isMobile ? 'none' : 'inline' }}>Logout</span>
            </button>

            {/* Mobile Menu Toggle */}
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="btn btn-ghost btn-sm"
                style={{
                  padding: '8px',
                  minHeight: '40px',
                  width: '40px'
                }}
              >
                {mobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            borderBottom: '1px solid var(--gray-200)',
            boxShadow: 'var(--shadow-lg)',
            padding: isSmallMobile ? '12px' : '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: isSmallMobile ? 6 : 8,
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            {/* Mobile User Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: isSmallMobile ? '10px 12px' : '12px 16px',
              background: 'var(--gray-50)',
              borderRadius: 8,
              marginBottom: isSmallMobile ? 6 : 8
            }}>
              <div style={{
                width: isSmallMobile ? 36 : 40,
                height: isSmallMobile ? 36 : 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: isSmallMobile ? 14 : 16,
                fontWeight: 600
              }}>
                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: isSmallMobile ? 14 : 16, fontWeight: 600, color: 'var(--text)' }}>
                  {user?.first_name} {user?.last_name}
                </div>
                <div style={{ fontSize: isSmallMobile ? 11 : 14, color: 'var(--muted)' }}>
                  {user?.role === 'SCHOOL_ADMIN' ? 'Administrator' : 
                   user?.role === 'PRINCIPAL' ? 'Principal' : 'Teacher'}
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            {visibleNavItems.map(item => (
              <NavLink key={item.to} {...item} mobile />
            ))}
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
