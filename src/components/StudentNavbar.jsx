import { useState, useEffect } from 'react'
import { 
  FaHome, FaTasks, FaAward, FaCalendar, FaFileAlt, FaBell, 
  FaSignOutAlt, FaBars, FaTimes, FaUser, FaCog
} from 'react-icons/fa'

export default function StudentNavbar({ 
  student, 
  activeTab, 
  onTabChange, 
  onLogout, 
  notifications = [] 
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaHome },
    { id: 'assignments', label: 'Assignments', icon: FaTasks },
    { id: 'grades', label: 'Grades', icon: FaAward },
    { id: 'schedule', label: 'Schedule', icon: FaCalendar },
    { id: 'reports', label: 'Reports', icon: FaFileAlt }
  ]

  const handleTabClick = (tabId) => {
    onTabChange(tabId)
    setShowMobileMenu(false)
  }

  return (
    <>
      <nav className="student-navbar">
        <div className="navbar-container">
          {/* Brand/Logo Section */}
          <div className="navbar-brand">
            <div className="student-avatar">
              {student?.name?.charAt(0) || 'S'}
            </div>
            <div className="student-info">
              <h2 className="student-name">{student?.name || 'Student Portal'}</h2>
              <p className="student-details">
                {student?.class} • ID: {student?.student_id}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-nav desktop-nav">
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="navbar-actions">
            {/* Notifications */}
            <div className="notification-wrapper">
              <button 
                className="action-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell size={16} />
                {notifications.length > 0 && (
                  <div className="notification-badge">{notifications.length}</div>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="dropdown-header">
                    <h4>Notifications</h4>
                    <button 
                      className="close-btn"
                      onClick={() => setShowNotifications(false)}
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                  <div className="notifications-list">
                    {notifications.length === 0 ? (
                      <div className="no-notifications">
                        <FaBell size={24} />
                        <p>No new notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification, index) => (
                        <div key={index} className="notification-item">
                          <div className="notification-content">
                            <h5>{notification.title}</h5>
                            <p>{notification.message}</p>
                            <small>{new Date(notification.date).toLocaleDateString()}</small>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="action-btn mobile-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <FaTimes size={16} /> : <FaBars size={16} />}
            </button>

            {/* Logout Button */}
            <button className="logout-btn" onClick={onLogout}>
              <FaSignOutAlt size={14} />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="mobile-menu">
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      <style jsx>{`
        .student-navbar {
          background: var(--color-neutral-0);
          border-bottom: 1px solid var(--color-neutral-200);
          box-shadow: var(--shadow-sm);
          position: sticky;
          top: 0;
          z-index: var(--z-sticky);
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          max-width: 1400px;
          margin: 0 auto;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          min-width: 0;
          flex: 1;
        }

        .student-avatar {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-lg);
          box-shadow: var(--shadow-sm);
          flex-shrink: 0;
        }

        .student-info {
          min-width: 0;
          flex: 1;
        }

        .student-name {
          margin: 0;
          color: var(--color-neutral-900);
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .student-details {
          margin: 0;
          color: var(--color-neutral-500);
          font-size: var(--font-size-sm);
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .navbar-nav {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .desktop-nav {
          display: none;
        }

        @media (min-width: 768px) {
          .desktop-nav {
            display: flex;
          }
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          border: none;
          border-radius: var(--radius-md);
          background: transparent;
          color: var(--color-neutral-600);
          cursor: pointer;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          transition: all var(--transition-base);
          white-space: nowrap;
        }

        .nav-item:hover {
          background: var(--color-neutral-100);
          color: var(--color-neutral-900);
          transform: translateY(-1px);
        }

        .nav-item.active {
          background: var(--color-primary);
          color: white;
          box-shadow: var(--shadow-sm);
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex-shrink: 0;
        }

        .notification-wrapper {
          position: relative;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-md);
          background: var(--color-neutral-0);
          color: var(--color-neutral-600);
          cursor: pointer;
          position: relative;
          transition: all var(--transition-base);
        }

        .action-btn:hover {
          background: var(--color-neutral-100);
          color: var(--color-neutral-900);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .mobile-menu-btn {
          display: flex;
        }

        @media (min-width: 768px) {
          .mobile-menu-btn {
            display: none;
          }
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          background: var(--color-error);
          color: white;
          border-radius: var(--radius-full);
          font-size: 10px;
          font-weight: var(--font-weight-bold);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .notifications-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 320px;
          max-width: 90vw;
          background: var(--color-neutral-0);
          border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          z-index: var(--z-dropdown);
          animation: slideInDown var(--transition-base);
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4);
          border-bottom: 1px solid var(--color-neutral-200);
        }

        .dropdown-header h4 {
          margin: 0;
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-neutral-900);
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--color-neutral-500);
          cursor: pointer;
          padding: var(--space-1);
          border-radius: var(--radius-sm);
          transition: all var(--transition-base);
        }

        .close-btn:hover {
          background: var(--color-neutral-100);
          color: var(--color-neutral-900);
        }

        .notifications-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .no-notifications {
          padding: var(--space-8);
          text-align: center;
          color: var(--color-neutral-500);
        }

        .no-notifications svg {
          margin-bottom: var(--space-2);
          opacity: 0.5;
        }

        .no-notifications p {
          margin: 0;
          font-size: var(--font-size-sm);
        }

        .notification-item {
          padding: var(--space-4);
          border-bottom: 1px solid var(--color-neutral-100);
          transition: background var(--transition-base);
        }

        .notification-item:hover {
          background: var(--color-neutral-50);
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-content h5 {
          margin: 0 0 var(--space-1) 0;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-neutral-900);
        }

        .notification-content p {
          margin: 0 0 var(--space-2) 0;
          font-size: var(--font-size-sm);
          color: var(--color-neutral-600);
          line-height: 1.4;
        }

        .notification-content small {
          font-size: var(--font-size-xs);
          color: var(--color-neutral-500);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          border: 1px solid var(--color-error-light);
          border-radius: var(--radius-md);
          background: var(--color-error-light);
          color: var(--color-error);
          cursor: pointer;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          transition: all var(--transition-base);
        }

        .logout-btn:hover {
          background: var(--color-error);
          color: white;
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .logout-text {
          display: none;
        }

        @media (min-width: 640px) {
          .logout-text {
            display: inline;
          }
        }

        /* Mobile Menu */
        .mobile-menu {
          display: flex;
          flex-direction: column;
          border-top: 1px solid var(--color-neutral-200);
          padding: var(--space-4);
          gap: var(--space-2);
          background: var(--color-neutral-0);
          animation: slideInDown var(--transition-base);
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          border: none;
          border-radius: var(--radius-md);
          background: transparent;
          color: var(--color-neutral-600);
          cursor: pointer;
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
          text-align: left;
          width: 100%;
          transition: all var(--transition-base);
        }

        .mobile-nav-item:hover {
          background: var(--color-neutral-100);
          color: var(--color-neutral-900);
        }

        .mobile-nav-item.active {
          background: var(--color-primary-light);
          color: var(--color-primary);
        }

        /* Animations */
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .navbar-container {
            padding: var(--space-3) var(--space-4);
          }

          .student-avatar {
            width: 40px;
            height: 40px;
            font-size: var(--font-size-base);
          }

          .student-name {
            font-size: var(--font-size-base);
          }

          .student-details {
            font-size: var(--font-size-xs);
          }

          .navbar-actions {
            gap: var(--space-2);
          }

          .action-btn {
            width: 36px;
            height: 36px;
          }

          .logout-btn {
            padding: var(--space-2);
          }

          .notifications-dropdown {
            width: calc(100vw - 32px);
            right: -16px;
          }
        }

        @media (max-width: 480px) {
          .student-info {
            display: none;
          }
        }
      `}</style>
    </>
  )
}