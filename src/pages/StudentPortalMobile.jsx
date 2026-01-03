import { useState, useEffect } from 'react'
import { 
  FaHome, FaTasks, FaAward, FaCalendar, FaUsers, FaFileAlt,
  FaBell, FaUser, FaSignOutAlt, FaChevronRight, FaPlay,
  FaClock, FaCheckCircle, FaExclamationTriangle, FaBookOpen
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'

export default function StudentPortalMobile() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('home')
  const [student, setStudent] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await api.get('/students/auth/dashboard/')
      const data = response.data
      
      setStudent({
        id: data.student.id,
        name: data.student.name,
        student_id: data.student.student_id,
        class: data.student.class,
        grade_average: 85.5
      })
      
      setAssignments(data.assignments.map(a => ({
        id: a.id,
        title: a.assignment.title,
        subject: a.assignment.subject || 'General',
        due_date: a.assignment.due_date,
        status: a.status.toLowerCase() === 'not_started' ? 'pending' : a.status.toLowerCase(),
        grade: a.grade
      })))
      
      setNotifications(data.announcements || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout('student')
    navigate('/student-login')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'graded': return '#10b981'
      case 'submitted': return '#3b82f6'
      case 'pending': return '#f59e0b'
      case 'overdue': return '#ef4444'
      default: return '#6b7280'
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="student-portal">
      <style>{`
        .student-portal {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding-bottom: 80px;
        }
        
        .loading-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 20px rgba(0,0,0,0.1);
        }
        
        .profile-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 16px;
        }
        
        .profile-info h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
        }
        
        .profile-info p {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }
        
        .header-actions {
          display: flex;
          gap: 8px;
        }
        
        .icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .icon-btn:active {
          transform: scale(0.95);
        }
        
        .logout-btn {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        
        .content {
          padding: 20px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 4px 0;
        }
        
        .stat-label {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }
        
        .section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }
        
        .view-all {
          color: #667eea;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .assignment-item {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          border-left: 4px solid;
        }
        
        .assignment-item:last-child {
          margin-bottom: 0;
        }
        
        .assignment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .assignment-title {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }
        
        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          color: white;
        }
        
        .assignment-meta {
          font-size: 12px;
          color: #6b7280;
          margin: 4px 0 0 0;
        }
        
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(0,0,0,0.1);
          padding: 12px 0;
          display: flex;
          justify-content: space-around;
          z-index: 100;
        }
        
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 60px;
        }
        
        .nav-item.active {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }
        
        .nav-item:not(.active) {
          color: #9ca3af;
        }
        
        .nav-label {
          font-size: 10px;
          font-weight: 600;
        }
        
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .action-btn {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: none;
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .action-btn:active {
          transform: scale(0.98);
        }
        
        .action-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          margin: 0 auto 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: white;
        }
        
        .action-label {
          font-size: 12px;
          font-weight: 600;
          color: #1f2937;
          text-align: center;
          margin: 0;
        }
      `}</style>

      {/* Header */}
      <div className="header">
        <div className="profile-section">
          <div className="avatar">
            {student?.name?.charAt(0) || 'S'}
          </div>
          <div className="profile-info">
            <h2>{student?.name}</h2>
            <p>{student?.class} • ID: {student?.student_id}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="icon-btn">
            <FaBell size={16} />
          </button>
          <button className="icon-btn logout-btn" onClick={handleLogout}>
            <FaSignOutAlt size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content">
        {activeTab === 'home' && (
          <>
            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                  <FaAward />
                </div>
                <h3 className="stat-value">{student?.grade_average || 0}%</h3>
                <p className="stat-label">Grade Average</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <FaCheckCircle />
                </div>
                <h3 className="stat-value">{assignments.filter(a => a.status === 'graded').length}</h3>
                <p className="stat-label">Completed</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  <FaClock />
                </div>
                <h3 className="stat-value">{assignments.filter(a => a.status === 'pending').length}</h3>
                <p className="stat-label">Pending</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                  <FaBookOpen />
                </div>
                <h3 className="stat-value">{assignments.length}</h3>
                <p className="stat-label">Total Tasks</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <button className="action-btn" onClick={() => setActiveTab('tasks')}>
                <div className="action-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <FaTasks />
                </div>
                <p className="action-label">My Tasks</p>
              </button>
              <button className="action-btn" onClick={() => setActiveTab('grades')}>
                <div className="action-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                  <FaAward />
                </div>
                <p className="action-label">Grades</p>
              </button>
              <button className="action-btn" onClick={() => setActiveTab('schedule')}>
                <div className="action-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                  <FaCalendar />
                </div>
                <p className="action-label">Schedule</p>
              </button>
              <button className="action-btn" onClick={() => setActiveTab('reports')}>
                <div className="action-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  <FaFileAlt />
                </div>
                <p className="action-label">Reports</p>
              </button>
            </div>

            {/* Recent Tasks */}
            <div className="section">
              <div className="section-header">
                <h3 className="section-title">Recent Tasks</h3>
                <a href="#" className="view-all" onClick={() => setActiveTab('tasks')}>
                  View All <FaChevronRight size={10} />
                </a>
              </div>
              {assignments.slice(0, 3).map(assignment => (
                <div 
                  key={assignment.id} 
                  className="assignment-item"
                  style={{ borderLeftColor: getStatusColor(assignment.status) }}
                >
                  <div className="assignment-header">
                    <h4 className="assignment-title">{assignment.title}</h4>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(assignment.status) }}
                    >
                      {assignment.status}
                    </span>
                  </div>
                  <p className="assignment-meta">
                    {assignment.subject} • Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'tasks' && (
          <div className="section">
            <h3 className="section-title">My Assignments</h3>
            {assignments.map(assignment => (
              <div 
                key={assignment.id} 
                className="assignment-item"
                style={{ borderLeftColor: getStatusColor(assignment.status) }}
              >
                <div className="assignment-header">
                  <h4 className="assignment-title">{assignment.title}</h4>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(assignment.status) }}
                  >
                    {assignment.status}
                  </span>
                </div>
                <p className="assignment-meta">
                  {assignment.subject} • Due: {new Date(assignment.due_date).toLocaleDateString()}
                  {assignment.grade && ` • Grade: ${assignment.grade}%`}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="section">
            <h3 className="section-title">My Grades</h3>
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
              Grades will be displayed here once available
            </p>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="section">
            <h3 className="section-title">Class Schedule</h3>
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
              Schedule will be displayed here once available
            </p>
          </div>
        )}

        {activeTab === 'classmates' && (
          <div className="section">
            <h3 className="section-title">My Classmates</h3>
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
              Classmates will be displayed here once available
            </p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="section">
            <h3 className="section-title">My Reports</h3>
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
              Reports will be displayed here once available
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <FaHome size={18} />
          <span className="nav-label">Home</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <FaTasks size={18} />
          <span className="nav-label">Tasks</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'grades' ? 'active' : ''}`}
          onClick={() => setActiveTab('grades')}
        >
          <FaAward size={18} />
          <span className="nav-label">Grades</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <FaCalendar size={18} />
          <span className="nav-label">Schedule</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'classmates' ? 'active' : ''}`}
          onClick={() => setActiveTab('classmates')}
        >
          <FaUsers size={18} />
          <span className="nav-label">Classmates</span>
        </div>
      </div>
    </div>
  )
}