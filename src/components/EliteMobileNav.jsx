import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { useState } from 'react'
import { 
  FaTachometerAlt, FaUserGraduate, FaBookOpen, FaFileInvoice, 
  FaChalkboardTeacher, FaLayerGroup, FaCog, FaUserCheck, FaChartBar, 
  FaBars, FaTimes, FaSignOutAlt, FaBell
} from 'react-icons/fa'

export default function EliteMobileNav() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const getNavItems = () => {
    const baseItems = [
      { to: "/dashboard", Icon: FaTachometerAlt, label: "Dashboard", color: "#3b82f6" }
    ]

    if (user?.role === 'TEACHER') {
      return [
        ...baseItems,
        { to: "/classes", Icon: FaLayerGroup, label: "Classes", color: "#8b5cf6" },
        { to: "/attendance", Icon: FaUserCheck, label: "Attendance", color: "#22c55e" },
        { to: "/scores", Icon: FaBookOpen, label: "Scores", color: "#f59e0b" },
        { to: "/reports", Icon: FaFileInvoice, label: "Reports", color: "#ec4899" }
      ]
    } else if (user?.role === 'SCHOOL_ADMIN' || user?.role === 'PRINCIPAL') {
      return [
        ...baseItems,
        { to: "/students", Icon: FaUserGraduate, label: "Students", color: "#3b82f6" },
        { to: "/attendance-dashboard", Icon: FaChartBar, label: "Analytics", color: "#22c55e" },
        { to: "/teachers", Icon: FaChalkboardTeacher, label: "Teachers", color: "#10b981" },
        { to: "/subjects", Icon: FaBookOpen, label: "Subjects", color: "#f59e0b" },
        { to: "/reports", Icon: FaFileInvoice, label: "Reports", color: "#ec4899" },
        { to: "/settings", Icon: FaCog, label: "Settings", color: "#6b7280" }
      ]
    }
    
    return baseItems
  }

  return (
    <>
      {/* Elite Top Navigation Bar */}
      <div className="elite-navbar">
        <div className="elite-navbar-content">
          {/* Logo */}
          <div className="elite-logo">
            <div className="elite-logo-icon">
              <FaLayerGroup size={16} />
            </div>
            <span>Elite School</span>
          </div>

          {/* User Info & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="elite-btn elite-btn-ghost elite-btn-sm"
              style={{ padding: '8px', minHeight: '36px', width: '36px' }}
            >
              <FaBell size={14} />
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="elite-btn elite-btn-primary elite-btn-sm"
              style={{ padding: '8px', minHeight: '36px', width: '36px' }}
            >
              {isOpen ? <FaTimes size={14} /> : <FaBars size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Elite Slide-out Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 55,
              backdropFilter: 'blur(8px)'
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '280px',
            maxWidth: '80vw',
            zIndex: 60,
            background: 'var(--elite-bg-secondary)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRight: 'none',
            boxShadow: 'var(--elite-shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'eliteSlideInRight 0.3s ease-out'
          }}>
            {/* Menu Header */}
            <div style={{
              padding: 'var(--elite-space-5)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'var(--elite-bg-tertiary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--elite-radius-full)',
                  background: 'var(--elite-gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '18px',
                  boxShadow: 'var(--elite-shadow-glow)'
                }}>
                  {user?.first_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 style={{
                    margin: 0,
                    color: 'var(--elite-text-primary)',
                    fontSize: '16px',
                    fontWeight: '700'
                  }}>
                    {user?.first_name} {user?.last_name}
                  </h3>
                  <p style={{
                    margin: 0,
                    color: 'var(--elite-text-muted)',
                    fontSize: '12px',
                    textTransform: 'capitalize'
                  }}>
                    {user?.role?.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div style={{
              flex: 1,
              padding: 'var(--elite-space-3)',
              overflowY: 'auto'
            }}>
              {getNavItems().map((item, index) => {
                const isActive = location.pathname.startsWith(item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      borderRadius: 'var(--elite-radius-md)',
                      textDecoration: 'none',
                      color: isActive ? 'var(--elite-green-400)' : 'var(--elite-text-secondary)',
                      background: isActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                      fontWeight: isActive ? '600' : '500',
                      fontSize: '15px',
                      transition: 'all var(--elite-transition-normal)',
                      marginBottom: '4px',
                      border: isActive ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid transparent'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--elite-radius-md)',
                      background: isActive ? item.color : 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? 'white' : 'var(--elite-text-muted)',
                      boxShadow: isActive ? `0 4px 12px ${item.color}40` : 'none'
                    }}>
                      <item.Icon size={18} />
                    </div>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Menu Footer */}
            <div style={{
              padding: 'var(--elite-space-4)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'var(--elite-bg-tertiary)'
            }}>
              <button
                onClick={() => {
                  logout()
                  setIsOpen(false)
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--elite-radius-md)',
                  color: 'var(--elite-error)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all var(--elite-transition-normal)'
                }}
              >
                <FaSignOutAlt size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Elite Bottom Navigation */}
      <div className="elite-bottom-nav">
        {getNavItems().slice(0, 5).map(item => {
          const isActive = location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`elite-bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="elite-bottom-nav-icon">
                <item.Icon size={18} />
              </div>
              <span className="elite-nav-label">{item.label}</span>
            </Link>
          )
        })}
      </div>

      <style>{`
        @keyframes eliteSlideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}