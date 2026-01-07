import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import { useSidebar } from '../state/SidebarContext'
import NotificationSystem from './NotificationSystem'
import EliteLogo from './EliteLogo'
import { 
  FaTachometerAlt, FaUserGraduate, FaBookOpen, FaFileInvoice, 
  FaChalkboardTeacher, FaSignOutAlt, FaLayerGroup, 
  FaBook, FaCog, FaBars, FaTimes, FaClipboardList, FaUserEdit, FaUserCheck, FaChartBar,
  FaChevronLeft, FaChevronRight 
} from 'react-icons/fa'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { sidebarCollapsed, setSidebarCollapsed } = useSidebar()
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

  const SidebarNavLink = ({ to, label, icon: Icon }) => {
    const isActive = location.pathname.startsWith(to)
    return (
      <Link 
        to={to}
        className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: sidebarCollapsed ? 0 : 12,
          padding: sidebarCollapsed ? '12px' : '12px 16px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: isActive ? 600 : 500,
          color: isActive ? '#4f46e5' : '#64748b',
          background: isActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
          border: isActive ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid transparent',
          transition: 'all 0.2s ease',
          textDecoration: 'none',
          width: '100%',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          position: 'relative'
        }}
        onMouseEnter={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'rgba(79, 70, 229, 0.05)'
            e.currentTarget.style.color = '#4f46e5'
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#64748b'
          }
        }}
        title={sidebarCollapsed ? label : ''}
      >
        <Icon size={16} style={{ opacity: 0.8, flexShrink: 0 }} />
        {!sidebarCollapsed && <span>{label}</span>}
      </Link>
    )
  }

  const MobileNavLink = ({ to, label, icon: Icon }) => {
    const isActive = location.pathname.startsWith(to)
    return (
      <Link 
        to={to}
        onClick={() => setMobileMenuOpen(false)}
        className={`nav-link ${isActive ? 'active' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 16px',
          borderRadius: 12,
          fontSize: 15,
          fontWeight: isActive ? 600 : 500,
          color: isActive ? '#4f46e5' : '#64748b',
          background: isActive ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
          border: isActive ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid transparent',
          transition: 'all 0.2s ease',
          textDecoration: 'none',
          width: '100%'
        }}
      >
        <Icon size={16} style={{ opacity: 0.8 }} />
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
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: sidebarCollapsed ? '70px' : '260px',
          height: '100vh',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid #e2e8f0',
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Sidebar Header */}
          <div style={{
            padding: sidebarCollapsed ? '16px 12px' : '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            height: '64px',
            boxSizing: 'border-box'
          }}>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: sidebarCollapsed ? 0 : 12
              }}>
                <EliteLogo size={32} />
                {!sidebarCollapsed && (
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
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={e => e.target.style.color = '#4f46e5'}
                onMouseLeave={e => e.target.style.color = '#64748b'}
              >
                <FaChevronLeft size={14} />
              </button>
            )}
          </div>

          {/* Sidebar Navigation */}
          <nav style={{
            flex: 1,
            padding: sidebarCollapsed ? '16px 8px' : '16px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            overflowY: 'auto'
          }}>
            {visibleNavItems.map(item => (
              <SidebarNavLink key={item.to} {...item} />
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div style={{
            padding: sidebarCollapsed ? '16px 8px' : '16px 16px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            {/* User Info */}
            {!sidebarCollapsed && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 600
                }}>
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', truncate: true }}>
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {user?.role === 'SCHOOL_ADMIN' ? 'Administrator' : 
                     user?.role === 'PRINCIPAL' ? 'Principal' : 'Teacher'}
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: sidebarCollapsed ? 0 : 8,
                padding: sidebarCollapsed ? '12px' : '10px 12px',
                background: 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                color: '#dc2626',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
              }}
              onMouseEnter={e => {
                e.target.style.background = 'rgba(220, 38, 38, 0.05)'
                e.target.style.borderColor = 'rgba(220, 38, 38, 0.2)'
              }}
              onMouseLeave={e => {
                e.target.style.background = 'transparent'
                e.target.style.borderColor = '#e2e8f0'
              }}
              title={sidebarCollapsed ? 'Logout' : ''}
            >
              <FaSignOutAlt size={14} />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>

            {/* Collapse Toggle */}
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px',
                  transition: 'color 0.2s ease',
                  display: 'flex',
                  justifyContent: 'center'
                }}
                onMouseEnter={e => e.target.style.color = '#4f46e5'}
                onMouseLeave={e => e.target.style.color = '#64748b'}
                title="Expand Sidebar"
              >
                <FaChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Header for Desktop */}
      {!isMobile && (
        <header style={{
          position: 'fixed',
          top: 0,
          left: sidebarCollapsed ? '70px' : '260px',
          right: 0,
          zIndex: 999,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          transition: 'left 0.3s ease'
        }}>
          <div style={{
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            height: '64px',
            gap: 16
          }}>
            <NotificationSystem />
          </div>
        </header>
      )}

      {/* Mobile Header */}
      {isMobile && (
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
            height: '56px'
          }}>
            {/* Brand */}
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isSmallMobile ? 8 : 12
              }}>
                <EliteLogo size={isSmallMobile ? 32 : 40} />
                <span style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#1f2937',
                  letterSpacing: '-0.02em'
                }}>
                  Elite Consult
                </span>
              </div>
            </Link>

            {/* Mobile Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isSmallMobile ? 8 : 12
            }}>
              <NotificationSystem />
              <button 
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px',
                  background: 'transparent',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  color: '#dc2626',
                  cursor: 'pointer'
                }}
              >
                <FaSignOutAlt size={14} />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  color: '#64748b',
                  cursor: 'pointer',
                  minHeight: '40px',
                  width: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {mobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
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
                <MobileNavLink key={item.to} {...item} />
              ))}
            </div>
          )}
        </header>
      )}

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
