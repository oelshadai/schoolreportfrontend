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
  FaChevronLeft, FaChevronRight, FaHome, FaCogs 
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

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  return (
    <>
      {/* Mobile-First Header */}
      <header 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          backgroundColor: 'var(--card-bg)',
          borderBottom: '1px solid var(--border-color)',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 'var(--space-4)',
          paddingRight: 'var(--space-4)',
          paddingTop: 'env(safe-area-inset-top, 0)',
          paddingBottom: '0',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Logo Section */}
        <Link 
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: isMobile ? 18 : 20,
            color: 'var(--text-primary)',
            minWidth: '150px'
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #115e3d, #0c4d31)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)'
          }}>
            <FaHome size={18} color="white" />
          </div>
          {!isMobile && <span>Elite Tech</span>}
        </Link>

        {/* Notification System */}
        <div style={{ flex: 1, maxWidth: isMobile ? 'none' : '300px' }}>
          <NotificationSystem />
        </div>

        {/* Mobile Menu Toggle */}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: 'var(--space-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '48px',
              minWidth: '48px'
            }}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        )}

        {/* Desktop Header Actions */}
        {!isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)'
          }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {user?.name || 'User'}
            </span>
            <button
              onClick={handleLogout}
              className="btn-ghost"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-3)',
                minHeight: 'auto',
                fontSize: '14px'
              }}
            >
              <FaSignOutAlt size={16} />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Desktop Horizontal Navigation - Removed fixed sidebar, using top nav instead */}

      {/* Mobile Menu Dropdown */}
      {isMobile && mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            zIndex: 35,
            maxHeight: 'calc(100vh - 64px)',
            overflowY: 'auto',
            animation: 'slideInFromBottom 0.2s ease-out'
          }}
        >
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            padding: 'var(--space-2)'
          }}>
            {visibleNavItems.map(item => {
              const isActive = location.pathname.startsWith(item.to)
              const Icon = item.icon
              
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '15px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#115e3d' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'rgba(17, 94, 61, 0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(17, 94, 61, 0.2)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={16} style={{ opacity: 0.8 }} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Mobile Menu Footer */}
          <div style={{
            paddingTop: 'var(--space-4)',
            paddingBottom: 'var(--space-4)',
            paddingLeft: 'var(--space-2)',
            paddingRight: 'var(--space-2)',
            borderTop: '1px solid var(--border-color)',
            marginTop: 'var(--space-4)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-3)'
            }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {user?.name || 'User'}
              </span>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                handleLogout()
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                fontSize: '15px',
                fontWeight: 600,
                color: '#ef4444',
                backgroundColor: 'transparent',
                border: '1px solid #ef4444',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <FaSignOutAlt size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Backdrop */}
      {isMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 30,
            animation: 'fadeIn 0.2s ease-out'
          }}
        />
      )}

      {/* Adjust layout based on screen size */}
      <style>{`
        @media (max-width: 768px) {
          .container {
            margin-left: 0;
            padding-top: calc(64px + var(--space-4));
            padding-bottom: calc(80px + env(safe-area-inset-bottom, 0));
          }
        }
        
        @media (min-width: 769px) {
          .container {
            margin-left: ${sidebarCollapsed ? '80px' : '260px'};
            padding-top: calc(64px + var(--space-4));
            transition: margin-left 0.3s ease;
          }
        }
        
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}
