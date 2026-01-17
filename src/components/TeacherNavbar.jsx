import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import NotificationSystem from './NotificationSystem'
import { 
  FaTachometerAlt, FaUserGraduate, FaBookOpen, FaFileInvoice, 
  FaChalkboardTeacher, FaSignOutAlt, FaLayerGroup, 
  FaClipboardList, FaUserEdit, FaUserCheck, FaBars, FaTimes, FaHome, FaCalendarAlt
} from 'react-icons/fa'

export default function TeacherNavbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isFormTeacher, setIsFormTeacher] = useState(false)
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

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

  // Check if teacher is a form teacher
  useEffect(() => {
    const checkFormTeacherStatus = async () => {
      try {
        const response = await fetch('/api/teacher-assignments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          const hasFormClass = data.some(assignment => assignment.is_form_teacher)
          setIsFormTeacher(hasFormClass)
        }
      } catch (error) {
        console.error('Error checking form teacher status:', error)
      }
    }

    if (user) {
      checkFormTeacherStatus()
    }
  }, [user])

  const isMobile = screenSize.width <= 768

  // STRICT Teacher Navigation - ONLY these links allowed
  const baseNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { to: '/classes', label: 'Classes', icon: FaLayerGroup },
    { to: '/students', label: 'Students', icon: FaUserGraduate },
    { to: '/attendance', label: 'Attendance', icon: FaUserCheck },
    { to: '/teacher-schedule', label: 'Schedule', icon: FaCalendarAlt },
    { to: '/vclass', label: 'Virtual Class', icon: FaChalkboardTeacher },
    { to: '/scores', label: 'Enter Score', icon: FaClipboardList },
    { to: '/gradebook', label: 'Grades', icon: FaBookOpen },
    { to: '/reports', label: 'Student Reports', icon: FaFileInvoice },
    { to: '/student-details', label: 'Student Details', icon: FaUserEdit }
  ]

  const teacherNavItems = baseNavItems

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  return (
    <>
      {/* Teacher Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100vw',
        zIndex: 40,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '16px',
        paddingRight: '16px',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        margin: 0
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: isMobile ? 18 : 20,
          color: '#1a202c',
          minWidth: '150px'
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(62, 207, 142, 0.3)'
          }}>
            <FaChalkboardTeacher size={18} color="white" />
          </div>
          {!isMobile && <span>Teacher Portal</span>}
        </Link>

        {/* Notifications */}
        <div style={{ flex: 1, maxWidth: isMobile ? 'none' : '200px', marginRight: '16px' }}>
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
              color: '#1a202c',
              cursor: 'pointer',
              padding: '8px',
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

        {/* Desktop Navigation */}
        {!isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <nav style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginRight: '16px'
            }}>
              {teacherNavItems.slice(0, 6).map(item => {
                const isActive = location.pathname.startsWith(item.to)
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#3ecf8e' : '#64748b',
                      backgroundColor: isActive ? 'rgba(62, 207, 142, 0.1)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#f8fafc'
                        e.currentTarget.style.color = '#3ecf8e'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#64748b'
                      }
                    }}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            
            <span style={{ fontSize: '14px', color: '#64748b' }}>
              {user?.first_name || 'Teacher'}
            </span>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'none',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#ef4444'
                e.currentTarget.style.color = '#ef4444'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.color = '#64748b'
              }}
            >
              <FaSignOutAlt size={16} />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          width: '100vw',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          zIndex: 35,
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
          animation: 'slideInFromTop 0.2s ease-out',
          margin: 0
        }}>
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            padding: '16px'
          }}>
            {teacherNavItems.map(item => {
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
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#3ecf8e' : '#64748b',
                    backgroundColor: isActive ? 'rgba(62, 207, 142, 0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(62, 207, 142, 0.2)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Mobile Footer */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #e2e8f0',
            marginTop: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>
                {user?.first_name || 'Teacher'}
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
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
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

      {/* Mobile Backdrop */}
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

      <style>{`
        @keyframes slideInFromTop {
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