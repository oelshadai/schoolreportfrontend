import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { useState } from 'react'
import { 
  FaTachometerAlt, FaUserGraduate, FaBookOpen, FaFileInvoice, 
  FaChalkboardTeacher, FaLayerGroup, FaCog, FaVideo, FaComments, FaUserCheck, FaChartBar, FaBars, FaTimes 
} from 'react-icons/fa'

export default function MobileNav() {
  const { user } = useAuth()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const getNavItems = () => {
    const baseItems = [
      { to: "/dashboard", Icon: FaTachometerAlt, label: "Dashboard" }
    ]

    if (user?.role === 'TEACHER') {
      return [
        ...baseItems,
        { to: "/classes", Icon: FaLayerGroup, label: "Classes" },
        { to: "/attendance", Icon: FaUserCheck, label: "Attendance" },
        { to: "/scores", Icon: FaBookOpen, label: "Scores" },
        { to: "/reports", Icon: FaFileInvoice, label: "Reports" }
      ]
    } else if (user?.role === 'SCHOOL_ADMIN' || user?.role === 'PRINCIPAL') {
      return [
        ...baseItems,
        { to: "/students", Icon: FaUserGraduate, label: "Students" },
        { to: "/attendance-dashboard", Icon: FaChartBar, label: "Attendance" },
        { to: "/teachers", Icon: FaChalkboardTeacher, label: "Teachers" },
        { to: "/subjects", Icon: FaBookOpen, label: "Subjects" },
        { to: "/reports", Icon: FaFileInvoice, label: "Reports" },
        { to: "/settings", Icon: FaCog, label: "Settings" }
      ]
    }
    
    return baseItems
  }

  const currentPage = getNavItems().find(item => location.pathname.startsWith(item.to))

  // Only show on mobile
  if (window.innerWidth > 768) return null

  return (
    <>
      {/* Mobile Navigation Bar */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--gray-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Current Page Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: 1
        }}>
          {currentPage && (
            <>
              <currentPage.Icon size={20} style={{ color: 'var(--primary)' }} />
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--gray-900)'
              }}>
                {currentPage.label}
              </span>
            </>
          )}
        </div>

        {/* Menu Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </nav>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 35,
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div style={{
            position: 'fixed',
            bottom: '80px',
            right: '16px',
            zIndex: 45,
            background: 'white',
            borderRadius: '16px',
            padding: '8px',
            minWidth: '200px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--gray-200)',
            animation: 'slideUp 0.2s ease-out'
          }}>
            <style>{`
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
            
            {getNavItems().map(item => {
              const isActive = location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: isActive ? 'var(--primary)' : 'var(--gray-700)',
                    background: isActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '15px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <item.Icon size={18} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
