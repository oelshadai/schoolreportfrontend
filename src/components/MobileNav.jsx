import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { 
  FaTachometerAlt, FaUserGraduate, FaBookOpen, FaFileInvoice, 
  FaChalkboardTeacher, FaLayerGroup, FaCog, FaVideo, FaComments, FaUserCheck, FaChartBar 
} from 'react-icons/fa'

export default function MobileNav() {
  const { user } = useAuth()
  const location = useLocation()

  const NavItem = ({ to, Icon, label, badge }) => {
    const isActive = location.pathname.startsWith(to)
    return (
      <Link 
        to={to} 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          color: isActive ? 'var(--primary)' : 'var(--gray-500)',
          textDecoration: 'none',
          padding: '12px 8px',
          borderRadius: 12,
          minWidth: 60,
          transition: 'all 0.2s ease',
          position: 'relative',
          background: isActive 
            ? 'rgba(79, 70, 229, 0.1)' 
            : 'transparent',
          transform: isActive ? 'translateY(-2px)' : 'translateY(0)'
        }}
      >
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={isActive ? 22 : 20} />
          {badge && (
            <span style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: 'var(--error)',
              color: 'white',
              borderRadius: 10,
              padding: '2px 6px',
              fontSize: 10,
              fontWeight: 600,
              minWidth: 16,
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {badge}
            </span>
          )}
        </div>
        <span style={{
          fontSize: 11,
          lineHeight: 1,
          fontWeight: isActive ? 600 : 500,
          textAlign: 'center',
          opacity: isActive ? 1 : 0.8
        }}>
          {label}
        </span>
      </Link>
    )
  }

  const getNavItems = () => {
    const baseItems = [
      { to: "/dashboard", Icon: FaTachometerAlt, label: "Home" }
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
        { to: "/classroom", Icon: FaVideo, label: "Classroom" },
        { to: "/teachers", Icon: FaChalkboardTeacher, label: "Teachers" },
        { to: "/reports", Icon: FaFileInvoice, label: "Reports" },
        { to: "/settings", Icon: FaCog, label: "Settings" }
      ]
    }
    
    return baseItems
  }

  // Only show on mobile
  if (window.innerWidth > 768) return null

  return (
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
      padding: '8px 6px calc(8px + env(safe-area-inset-bottom))',
      justifyContent: 'space-around',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
    }}>
      {getNavItems().map(item => (
        <NavItem key={item.to} {...item} />
      ))}
    </nav>
  )
}
