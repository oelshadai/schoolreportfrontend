import { useState, useEffect } from 'react'
import { 
  FaHome, FaTasks, FaAward, FaCalendar, FaFileAlt, FaUser, FaCog 
} from 'react-icons/fa'

export default function StudentBottomNav({ activeTab, onTabChange }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navigationItems = [
    { id: 'dashboard', label: 'Home', icon: FaHome },
    { id: 'assignments', label: 'Tasks', icon: FaTasks },
    { id: 'grades', label: 'Grades', icon: FaAward },
    { id: 'schedule', label: 'Schedule', icon: FaCalendar },
    { id: 'reports', label: 'Reports', icon: FaFileAlt }
  ]

  // Only show on mobile
  if (!isMobile) return null

  return (
    <nav className="student-bottom-nav">
      <div className="bottom-nav-container">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>

      <style jsx>{`
        .student-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--color-neutral-0);
          border-top: 1px solid var(--color-neutral-200);
          box-shadow: 0 -4px 6px -1px rgb(0 0 0 / 0.1), 0 -2px 4px -2px rgb(0 0 0 / 0.1);
          z-index: var(--z-fixed);
          padding-bottom: env(safe-area-inset-bottom, 0);
          backdrop-filter: blur(8px);
        }

        .bottom-nav-container {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: var(--space-3) var(--space-2);
          max-width: 100%;
        }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-1);
          padding: var(--space-2);
          border: none;
          border-radius: var(--radius-md);
          background: transparent;
          color: var(--color-neutral-500);
          cursor: pointer;
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          transition: all var(--transition-base);
          min-width: 60px;
          position: relative;
          overflow: hidden;
        }

        .bottom-nav-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: var(--student-gradient-primary);
          transition: width var(--transition-base);
        }

        .bottom-nav-item.active::before {
          width: 80%;
        }

        .bottom-nav-item:hover {
          color: var(--color-neutral-700);
          background: var(--color-neutral-100);
        }

        .bottom-nav-item.active {
          color: var(--student-primary);
          background: var(--color-primary-lightest);
        }

        .nav-label {
          font-size: var(--font-size-xs);
          line-height: 1;
          white-space: nowrap;
        }

        /* Touch-friendly sizing */
        @media (max-width: 480px) {
          .bottom-nav-item {
            min-width: 50px;
            padding: var(--space-1);
          }
          
          .nav-label {
            font-size: 10px;
          }
        }

        /* Safe area handling for devices with notches */
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .student-bottom-nav {
            padding-bottom: calc(var(--space-3) + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </nav>
  )
}