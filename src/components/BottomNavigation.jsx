import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import { 
  FaTachometerAlt, FaUserGraduate, FaFileInvoice,
  FaChalkboardTeacher, FaCog, FaLayerGroup, FaChartBar, FaClock
} from 'react-icons/fa'

/**
 * Mobile-First Bottom Navigation Component
 * Shows on mobile (<640px), hidden on desktop
 * Follows iOS/Android design patterns
 */
export default function BottomNavigation() {
  const { user } = useAuth()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!isMobile) return null

  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { to: '/dashboard', label: 'Home', icon: FaTachometerAlt, roles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'] },
      { to: '/students', label: 'Students', icon: FaUserGraduate, roles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'] },
    ]

    const roleSpecific = {
      'TEACHER': [
        { to: '/attendance', label: 'Attendance', icon: FaClock, roles: ['TEACHER'] },
        { to: '/reports', label: 'Reports', icon: FaFileInvoice, roles: ['TEACHER'] },
      ],
      'PRINCIPAL': [
        { to: '/attendance-dashboard', label: 'Attendance', icon: FaChartBar, roles: ['PRINCIPAL'] },
        { to: '/reports', label: 'Reports', icon: FaFileInvoice, roles: ['PRINCIPAL'] },
      ],
      'SCHOOL_ADMIN': [
        { to: '/teachers', label: 'Teachers', icon: FaChalkboardTeacher, roles: ['SCHOOL_ADMIN'] },
        { to: '/reports', label: 'Reports', icon: FaFileInvoice, roles: ['SCHOOL_ADMIN'] },
      ]
    }

    const userRoleItems = roleSpecific[user?.role] || []
    const allItems = [...baseItems, ...userRoleItems]
    
    return allItems.filter(item => item.roles.includes(user?.role))
  }

  const navItems = getNavItems()

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--card-bg)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
        height: 'calc(60px + env(safe-area-inset-bottom, 0))',
        zIndex: 1000,
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'slideUpFromBottom 0.3s ease-out'
      }}
    >
      {navItems.map(item => {
        const Icon = item.icon
        const active = isActive(item.to)
        
        return (
          <Link
            key={item.to}
            to={item.to}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              flex: 1,
              padding: '8px 4px',
              color: active ? '#115e3d' : 'var(--text-tertiary)',
              textDecoration: 'none',
              fontSize: '11px',
              fontWeight: active ? '600' : '500',
              transition: 'all 0.2s ease',
              borderTop: active ? '3px solid #115e3d' : '3px solid transparent',
              backgroundColor: active ? 'rgba(17, 94, 61, 0.05)' : 'transparent',
              minHeight: '60px',
              cursor: 'pointer',
              position: 'relative',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none'
            }}
            onClick={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(17, 94, 61, 0.1)'
              setTimeout(() => {
                e.currentTarget.style.backgroundColor = active ? 'rgba(17, 94, 61, 0.05)' : 'transparent'
              }, 100)
            }}
          >
            <Icon size={24} style={{ opacity: active ? 1 : 0.8 }} />
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '60px'
            }}>
              {item.label}
            </span>
            
            {/* Active indicator dot */}
            {active && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 4,
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#115e3d'
                }}
              />
            )}
          </Link>
        )
      })}

      <style>{`
        @keyframes slideUpFromBottom {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  )
}
