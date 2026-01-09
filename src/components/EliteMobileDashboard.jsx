import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { 
  FaUser, FaUsers, FaBook, FaChartLine, FaCalendarAlt, FaBell, 
  FaFileAlt, FaTasks, FaGraduationCap, FaArrowRight, FaClock, 
  FaCheckCircle, FaExclamationTriangle, FaChalkboardTeacher,
  FaLayerGroup, FaUserCheck, FaChartBar
} from 'react-icons/fa'

export default function EliteMobileDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Mock data - replace with actual API calls
    setStats({
      students: 1247,
      teachers: 45,
      classes: 28,
      subjects: 12
    })

    setRecentActivity([
      { id: 1, type: 'student', action: 'New student enrolled', time: '2 hours ago', icon: FaUser },
      { id: 2, type: 'assignment', action: 'Math assignment submitted', time: '4 hours ago', icon: FaTasks },
      { id: 3, type: 'report', action: 'Monthly report generated', time: '1 day ago', icon: FaFileAlt }
    ])

    setNotifications([
      { id: 1, title: 'Parent-Teacher Meeting', message: 'Scheduled for tomorrow at 2 PM', priority: 'high' },
      { id: 2, title: 'System Maintenance', message: 'Scheduled downtime this weekend', priority: 'medium' }
    ])
  }, [])

  const getQuickActions = () => {
    if (user?.role === 'TEACHER') {
      return [
        { label: 'Take Attendance', icon: FaUserCheck, color: '#22c55e', path: '/attendance' },
        { label: 'Enter Scores', icon: FaChartBar, color: '#f59e0b', path: '/scores' },
        { label: 'View Classes', icon: FaLayerGroup, color: '#8b5cf6', path: '/classes' },
        { label: 'Generate Reports', icon: FaFileAlt, color: '#ec4899', path: '/reports' }
      ]
    } else {
      return [
        { label: 'Manage Students', icon: FaUserGraduate, color: '#3b82f6', path: '/students' },
        { label: 'Manage Teachers', icon: FaChalkboardTeacher, color: '#10b981', path: '/teachers' },
        { label: 'View Analytics', icon: FaChartLine, color: '#f59e0b', path: '/attendance-dashboard' },
        { label: 'School Settings', icon: FaCog, color: '#6b7280', path: '/settings' }
      ]
    }
  }

  return (
    <div className="elite-app" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="elite-container">
        {/* Welcome Header */}
        <div className="elite-card elite-mb-6" style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: 'var(--elite-radius-full)',
            background: 'var(--elite-gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--elite-space-4)',
            boxShadow: 'var(--elite-shadow-glow)',
            color: 'white',
            fontSize: '32px',
            fontWeight: '700'
          }}>
            {user?.first_name?.charAt(0) || 'U'}
          </div>
          <h1 className="elite-text-2xl elite-font-bold elite-mb-2">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="elite-text-sm" style={{ color: 'var(--elite-text-muted)' }}>
            {user?.role === 'TEACHER' ? '👨‍🏫 Teacher Dashboard' : '👔 Administrator Dashboard'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="elite-grid elite-grid-cols-2 elite-mb-6">
          <div className="elite-stat-card">
            <div className="elite-stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              <FaUserGraduate />
            </div>
            <div className="elite-stat-value">{stats.students}</div>
            <div className="elite-stat-label">Students</div>
          </div>

          <div className="elite-stat-card">
            <div className="elite-stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <FaChalkboardTeacher />
            </div>
            <div className="elite-stat-value">{stats.teachers}</div>
            <div className="elite-stat-label">Teachers</div>
          </div>

          <div className="elite-stat-card">
            <div className="elite-stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
              <FaLayerGroup />
            </div>
            <div className="elite-stat-value">{stats.classes}</div>
            <div className="elite-stat-label">Classes</div>
          </div>

          <div className="elite-stat-card">
            <div className="elite-stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}>
              <FaBook />
            </div>
            <div className="elite-stat-value">{stats.subjects}</div>
            <div className="elite-stat-label">Subjects</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="elite-card elite-mb-6">
          <h2 className="elite-text-lg elite-font-bold elite-mb-4 elite-flex elite-items-center elite-gap-3">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--elite-radius-md)',
              background: 'var(--elite-gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              ⚡
            </div>
            Quick Actions
          </h2>
          <div className="elite-grid elite-grid-cols-2 elite-gap-3">
            {getQuickActions().map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="elite-btn elite-btn-secondary"
                style={{
                  flexDirection: 'column',
                  height: '100px',
                  gap: 'var(--elite-space-2)',
                  background: `linear-gradient(135deg, ${action.color}20, ${action.color}10)`,
                  border: `1px solid ${action.color}30`,
                  color: action.color
                }}
              >
                <action.icon size={24} />
                <span className="elite-text-xs elite-font-semibold">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="elite-card elite-mb-6">
          <div className="elite-flex elite-items-center elite-justify-between elite-mb-4">
            <h2 className="elite-text-lg elite-font-bold elite-flex elite-items-center elite-gap-3">
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--elite-radius-md)',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                📊
              </div>
              Recent Activity
            </h2>
            <button className="elite-btn elite-btn-ghost elite-btn-sm">
              View All <FaArrowRight size={12} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--elite-space-3)' }}>
            {recentActivity.map(activity => (
              <div key={activity.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--elite-space-3)',
                padding: 'var(--elite-space-3)',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--elite-radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--elite-radius-md)',
                  background: 'var(--elite-gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <activity.icon size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <p className="elite-text-sm elite-font-medium" style={{ margin: 0, color: 'var(--elite-text-primary)' }}>
                    {activity.action}
                  </p>
                  <p className="elite-text-xs" style={{ margin: 0, color: 'var(--elite-text-muted)' }}>
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="elite-card">
          <h2 className="elite-text-lg elite-font-bold elite-mb-4 elite-flex elite-items-center elite-gap-3">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--elite-radius-md)',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              🔔
            </div>
            Notifications
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--elite-space-3)' }}>
            {notifications.map(notification => (
              <div key={notification.id} className={`elite-alert elite-alert-${notification.priority === 'high' ? 'error' : 'info'}`}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: notification.priority === 'high' ? 'var(--elite-error)' : 'var(--elite-info)',
                  marginTop: '6px',
                  flexShrink: 0
                }} />
                <div>
                  <h4 className="elite-text-sm elite-font-semibold" style={{ margin: '0 0 4px 0' }}>
                    {notification.title}
                  </h4>
                  <p className="elite-text-xs" style={{ margin: 0, opacity: 0.9 }}>
                    {notification.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}