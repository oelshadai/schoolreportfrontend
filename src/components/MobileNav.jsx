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
      {/* Floating Menu Button for All Users */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 40,
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)',
          transition: 'all 0.3s ease'
        }}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

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
            top: '80px',
            right: '16px',
            zIndex: 45,
            background: 'white',
            borderRadius: '16px',
            padding: '8px',
            minWidth: '200px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e5e7eb'
          }}>
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
                    color: isActive ? '#4f46e5' : '#374151',
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