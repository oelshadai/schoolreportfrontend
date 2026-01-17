import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { 
  FaHome, FaTasks, FaAward, FaCalendar, FaFileAlt, FaBell, 
  FaSignOutAlt, FaUser, FaBars, FaTimes, FaGraduationCap,
  FaClock, FaCheckCircle, FaEye, FaDownload, FaChartLine,
  FaBookOpen, FaUsers, FaComments, FaPlay, FaArrowRight
} from 'react-icons/fa'
import { useAuth } from '../state/AuthContext'
import StudentBottomNav from '../components/StudentBottomNav'
import api from '../utils/api'

export default function StudentPortalProfessional() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [student, setStudent] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [availableTasks, setAvailableTasks] = useState([])
  const [reports, setReports] = useState([
    { id: 1, title: 'Term 1 Report', term: 'Term 1', date: new Date(), status: 'Available' },
    { id: 2, title: 'Mid-term Report', term: 'Mid-term', date: new Date(), status: 'Available' }
  ])

  // If no user is logged in, redirect to student login
  if (!user) {
    return <Navigate to="/student-login" replace />
  }
  
  // If user is not a student, redirect to appropriate login
  if (user.role !== 'STUDENT') {
    return <Navigate to="/login" replace />
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await api.get('/students/auth/dashboard/')
      const data = response.data
      
      setStudent({
        id: data.student?.id || 1,
        name: data.student?.name || 'Student User',
        student_id: data.student?.student_id || 'Unknown',
        class: data.student?.class || 'No Class',
        grade_average: 85.5
      })
      
      setAssignments(data.assignments?.map(a => {
        const assignmentId = a.assignment?.id || a.id
        const isSubmitted = localStorage.getItem(`assignment_submitted_${assignmentId}`) === 'true'
        
        return {
          id: a.id,
          title: a.assignment?.title || a.title || 'Untitled Assignment',
          subject: a.assignment?.subject || a.subject || 'General',
          due_date: a.assignment?.due_date || a.due_date,
          status: isSubmitted ? 'submitted' : (a.status?.toLowerCase() === 'not_started' ? 'pending' : a.status?.toLowerCase()),
          grade: a.grade,
          assignment: a.assignment
        }
      }) || [])
      
      setNotifications(data.announcements || [])
      
      // Load available tasks
      try {
        const tasksRes = await api.get('/assignments/tasks/available/')
        const tasksData = tasksRes.data
        
        if (tasksData.results) {
          setAvailableTasks(tasksData.results)
        } else if (Array.isArray(tasksData)) {
          setAvailableTasks(tasksData)
        } else {
          setAvailableTasks([])
        }
      } catch (taskError) {
        console.error('Error loading tasks:', taskError)
        setAvailableTasks([])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setStudent({
        id: 1,
        name: 'Student User',
        student_id: 'Unknown',
        class: 'No Class',
        grade_average: 0
      })
      setAssignments([])
      setNotifications([])
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
      case 'graded': return 'var(--color-success)'
      case 'submitted': return 'var(--color-info)'
      case 'pending': return 'var(--color-warning)'
      case 'overdue': return 'var(--color-error)'
      default: return 'var(--color-neutral-500)'
    }
  }

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaHome },
    { id: 'assignments', label: 'Assignments', icon: FaTasks },
    { id: 'grades', label: 'Grades', icon: FaAward },
    { id: 'schedule', label: 'Schedule', icon: FaCalendar },
    { id: 'reports', label: 'Reports', icon: FaFileAlt }
  ]

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your portal...</p>
        </div>
        <style jsx>{`
          .loading-container {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--color-neutral-50);
          }
          .loading-spinner {
            text-align: center;
            color: var(--color-neutral-700);
          }
          .spinner {
            width: 60px;
            height: 60px;
            border: 4px solid var(--color-neutral-200);
            border-top: 4px solid var(--color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="student-portal">
      {/* Professional Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo & Student Info */}
          <div className="navbar-brand">
            <div className="student-avatar">
              {student?.name?.charAt(0) || 'S'}
            </div>
            <div className="student-info">
              <h2 className="student-name">{student?.name || 'Student Portal'}</h2>
              <p className="student-details">{student?.class} • ID: {student?.student_id}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-nav desktop-nav">
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
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
            <button 
              className="action-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell size={16} />
              {notifications.length > 0 && <div className="notification-badge"></div>}
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              className="action-btn mobile-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <FaTimes size={16} /> : <FaBars size={16} />}
            </button>

            {/* Logout */}
            <button className="logout-btn" onClick={handleLogout}>
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
                onClick={() => {
                  setActiveTab(item.id)
                  setShowMobileMenu(false)
                }}
                className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="tab-content">
              {/* Welcome Section */}
              <div className="welcome-card">
                <h1>Welcome back, {student?.name}!</h1>
                <p>Here's what's happening with your studies today.</p>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon success">
                    <FaGraduationCap />
                  </div>
                  <div className="stat-content">
                    <h3>{student?.grade_average || 85}%</h3>
                    <p>Grade Average</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon info">
                    <FaTasks />
                  </div>
                  <div className="stat-content">
                    <h3>{assignments.filter(a => a.status === 'graded').length}</h3>
                    <p>Completed</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon warning">
                    <FaClock />
                  </div>
                  <div className="stat-content">
                    <h3>{assignments.filter(a => a.status === 'pending').length}</h3>
                    <p>Pending</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon primary">
                    <FaAward />
                  </div>
                  <div className="stat-content">
                    <h3>A-</h3>
                    <p>Current Grade</p>
                  </div>
                </div>
              </div>

              {/* Recent Assignments */}
              <div className="section-card">
                <div className="section-header">
                  <h3>Recent Assignments</h3>
                  <button
                    className="view-all-btn"
                    onClick={() => setActiveTab('assignments')}
                  >
                    View All <FaArrowRight size={12} />
                  </button>
                </div>
                
                <div className="assignments-list">
                  {assignments.slice(0, 3).map(assignment => (
                    <div key={assignment.id} className="assignment-item">
                      <div className="assignment-content">
                        <h4>{assignment.title}</h4>
                        <p className="assignment-subject">{assignment.subject}</p>
                        <p className="assignment-due">Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                      </div>
                      <div className={`assignment-status ${assignment.status}`}>
                        {assignment.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="tab-content">
              <div className="section-card">
                <h3>My Assignments</h3>
                <div className="assignments-grid">
                  {assignments.map(assignment => (
                    <div key={assignment.id} className="assignment-card">
                      <div className="assignment-header">
                        <h4>{assignment.title}</h4>
                        <div className={`status-badge ${assignment.status}`}>
                          {assignment.status}
                        </div>
                      </div>
                      <p className="assignment-subject">{assignment.subject}</p>
                      <p className="assignment-due">Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                      {assignment.grade && (
                        <p className="assignment-grade">Grade: {assignment.grade}%</p>
                      )}
                      <div className="assignment-actions">
                        {assignment.status !== 'submitted' && (
                          <button 
                            className="btn btn-primary"
                            onClick={() => {
                              const assignmentData = {
                                assignment: assignment.assignment || assignment
                              }
                              localStorage.setItem('current_assignment', JSON.stringify(assignmentData))
                              const assignmentId = assignment.assignment?.id || assignment.id
                              navigate(`/student/assignment/${assignmentId}`)
                            }}
                          >
                            <FaEye size={12} />
                            View
                          </button>
                        )}
                        {assignment.status === 'submitted' && (
                          <div className="completed-badge">
                            <FaCheckCircle size={12} />
                            Completed
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Grades Tab */}
          {activeTab === 'grades' && (
            <div className="tab-content">
              <div className="section-card">
                <h3>My Grades</h3>
                {(() => {
                  const completedAssignments = JSON.parse(localStorage.getItem('completed_assignments') || '[]')
                  const totalScore = completedAssignments.reduce((sum, a) => sum + a.score, 0)
                  const averageScore = completedAssignments.length > 0 ? Math.round(totalScore / completedAssignments.length) : 0
                  
                  return (
                    <>
                      <div className="grade-summary">
                        <div className="grade-stat">
                          <FaAward className="grade-icon" />
                          <div>
                            <h4>{averageScore}%</h4>
                            <p>Overall Average</p>
                          </div>
                        </div>
                        <div className="grade-stat">
                          <FaChartLine className="grade-icon" />
                          <div>
                            <h4>{averageScore >= 90 ? 'A+' : averageScore >= 80 ? 'A' : averageScore >= 70 ? 'B' : averageScore >= 60 ? 'C' : 'D'}</h4>
                            <p>Current Grade</p>
                          </div>
                        </div>
                        <div className="grade-stat">
                          <FaTasks className="grade-icon" />
                          <div>
                            <h4>{completedAssignments.length}</h4>
                            <p>Completed</p>
                          </div>
                        </div>
                      </div>

                      <div className="grades-list">
                        {completedAssignments.length === 0 ? (
                          <div className="empty-state">
                            <FaAward size={48} />
                            <p>No completed assignments yet</p>
                            <small>Complete some assignments to see your grades here</small>
                          </div>
                        ) : (
                          completedAssignments.map((assignment, index) => {
                            const gradeColor = assignment.score >= 90 ? 'var(--color-success)' : 
                                            assignment.score >= 80 ? 'var(--color-info)' : 
                                            assignment.score >= 70 ? 'var(--color-primary)' : 
                                            assignment.score >= 60 ? 'var(--color-warning)' : 'var(--color-error)'
                            const grade = assignment.score >= 90 ? 'A+' : 
                                        assignment.score >= 80 ? 'A' : 
                                        assignment.score >= 70 ? 'B' : 
                                        assignment.score >= 60 ? 'C' : 'D'
                            
                            return (
                              <div key={index} className="grade-item">
                                <div className="grade-content">
                                  <h4>{assignment.title}</h4>
                                  <p>Subject: {assignment.subject}</p>
                                  <p>Score: {assignment.correctAnswers}/{assignment.totalQuestions}</p>
                                  <p>Completed: {new Date(assignment.completedAt).toLocaleDateString()}</p>
                                </div>
                                <div className="grade-score">
                                  <div className="grade-badge" style={{ backgroundColor: gradeColor }}>
                                    {grade}
                                  </div>
                                  <div className="score-percentage">{assignment.score}%</div>
                                </div>
                                <div className="progress-bar">
                                  <div 
                                    className="progress-fill" 
                                    style={{ 
                                      width: `${assignment.score}%`,
                                      backgroundColor: gradeColor
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="tab-content">
              <div className="section-card">
                <h3>Class Schedule</h3>
                <div className="schedule-grid">
                  {[
                    { time: '08:00 - 09:00', subject: 'Mathematics', teacher: 'Mr. Johnson', room: 'Room 101' },
                    { time: '09:00 - 10:00', subject: 'English', teacher: 'Ms. Smith', room: 'Room 205' },
                    { time: '10:00 - 11:00', subject: 'Science', teacher: 'Dr. Brown', room: 'Lab 1' },
                    { time: '11:00 - 12:00', subject: 'History', teacher: 'Mr. Davis', room: 'Room 302' },
                    { time: '12:00 - 13:00', subject: 'Lunch Break', teacher: '', room: 'Cafeteria' },
                    { time: '13:00 - 14:00', subject: 'Geography', teacher: 'Ms. Wilson', room: 'Room 201' },
                    { time: '14:00 - 15:00', subject: 'Physical Education', teacher: 'Coach Miller', room: 'Gymnasium' }
                  ].map((schedule, index) => (
                    <div key={index} className="schedule-item">
                      <div className="schedule-time">{schedule.time}</div>
                      <div className="schedule-content">
                        <h4>{schedule.subject}</h4>
                        {schedule.teacher && <p>{schedule.teacher}</p>}
                        <p className="schedule-room">{schedule.room}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="tab-content">
              <div className="section-card">
                <h3>My Reports</h3>
                <div className="reports-grid">
                  {reports.map(report => (
                    <div key={report.id} className="report-card">
                      <div className="report-header">
                        <h4>{report.title}</h4>
                        <div className="status-badge available">{report.status}</div>
                      </div>
                      <p className="report-term">{report.term}</p>
                      <p className="report-date">{new Date(report.date).toLocaleDateString()}</p>
                      <div className="report-actions">
                        <button className="btn btn-secondary">
                          <FaEye size={12} />
                          View
                        </button>
                        <button className="btn btn-primary">
                          <FaDownload size={12} />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <StudentBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <style jsx>{`
        .student-portal {
          width: 100vw;
          height: 100vh;
          background: var(--color-neutral-50);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Navbar Styles */
        .navbar {
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
        }

        .student-avatar {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          background: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-lg);
        }

        .student-info {
          display: flex;
          flex-direction: column;
        }

        .student-name {
          margin: 0;
          color: var(--color-neutral-900);
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
        }

        .student-details {
          margin: 0;
          color: var(--color-neutral-500);
          font-size: var(--font-size-sm);
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
        }

        .nav-item:hover {
          background: var(--color-neutral-100);
          color: var(--color-neutral-900);
        }

        .nav-item.active {
          background: var(--color-primary);
          color: white;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-md);
          background: transparent;
          color: var(--color-neutral-600);
          cursor: pointer;
          position: relative;
          transition: all var(--transition-base);
        }

        .action-btn:hover {
          background: var(--color-neutral-100);
          color: var(--color-neutral-900);
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
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: var(--color-error);
          border-radius: 50%;
          border: 2px solid white;
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
        }

        .mobile-nav-item.active {
          background: var(--color-primary-light);
          color: var(--color-primary);
        }

        /* Main Content */
        .main-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-6);
          padding-bottom: calc(var(--space-6) + 80px); /* Account for bottom nav on mobile */
        }

        @media (min-width: 768px) {
          .main-content {
            padding-bottom: var(--space-6); /* Remove bottom padding on desktop */
          }
        }

        .content-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .tab-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        /* Cards */
        .welcome-card {
          background: var(--color-neutral-0);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          border: 1px solid var(--color-neutral-200);
          box-shadow: var(--shadow-sm);
        }

        .welcome-card h1 {
          margin: 0 0 var(--space-2) 0;
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-neutral-900);
        }

        .welcome-card p {
          margin: 0;
          color: var(--color-neutral-600);
          font-size: var(--font-size-lg);
        }

        .section-card {
          background: var(--color-neutral-0);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          border: 1px solid var(--color-neutral-200);
          box-shadow: var(--shadow-sm);
        }

        .section-card h3 {
          margin: 0 0 var(--space-6) 0;
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-neutral-900);
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-6);
        }

        .section-header h3 {
          margin: 0;
        }

        .view-all-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: none;
          border: none;
          color: var(--color-primary);
          cursor: pointer;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          transition: color var(--transition-base);
        }

        .view-all-btn:hover {
          color: var(--color-primary-hover);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
        }

        .stat-card {
          background: var(--color-neutral-0);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          border: 1px solid var(--color-neutral-200);
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-lg);
          color: white;
        }

        .stat-icon.success { background: var(--color-success); }
        .stat-icon.info { background: var(--color-info); }
        .stat-icon.warning { background: var(--color-warning); }
        .stat-icon.primary { background: var(--color-primary); }

        .stat-content h3 {
          margin: 0 0 var(--space-1) 0;
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-neutral-900);
        }

        .stat-content p {
          margin: 0;
          color: var(--color-neutral-500);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
        }

        /* Assignments */
        .assignments-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .assignment-item {
          background: var(--color-neutral-50);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          border: 1px solid var(--color-neutral-200);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .assignment-content h4 {
          margin: 0 0 var(--space-1) 0;
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-neutral-900);
        }

        .assignment-subject {
          margin: 0 0 var(--space-1) 0;
          color: var(--color-neutral-600);
          font-size: var(--font-size-sm);
        }

        .assignment-due {
          margin: 0;
          color: var(--color-neutral-500);
          font-size: var(--font-size-xs);
        }

        .assignment-status {
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          text-transform: capitalize;
        }

        .assignment-status.graded {
          background: var(--color-success-light);
          color: var(--color-success);
        }

        .assignment-status.submitted {
          background: var(--color-info-light);
          color: var(--color-info);
        }

        .assignment-status.pending {
          background: var(--color-warning-light);
          color: var(--color-warning);
        }

        .assignments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-4);
        }

        .assignment-card {
          background: var(--color-neutral-50);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          border: 1px solid var(--color-neutral-200);
          transition: all var(--transition-base);
        }

        .assignment-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .assignment-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-3);
        }

        .assignment-header h4 {
          margin: 0;
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-neutral-900);
          flex: 1;
        }

        .status-badge {
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          text-transform: capitalize;
        }

        .status-badge.graded {
          background: var(--color-success-light);
          color: var(--color-success);
        }

        .status-badge.submitted {
          background: var(--color-info-light);
          color: var(--color-info);
        }

        .status-badge.pending {
          background: var(--color-warning-light);
          color: var(--color-warning);
        }

        .status-badge.available {
          background: var(--color-success-light);
          color: var(--color-success);
        }

        .assignment-actions {
          margin-top: var(--space-4);
          display: flex;
          gap: var(--space-2);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          border: none;
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--color-primary-hover);
        }

        .btn-secondary {
          background: var(--color-neutral-200);
          color: var(--color-neutral-900);
        }

        .btn-secondary:hover {
          background: var(--color-neutral-300);
        }

        .completed-badge {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--color-success);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
        }

        /* Grades */
        .grade-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .grade-stat {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          background: var(--color-neutral-50);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          border: 1px solid var(--color-neutral-200);
        }

        .grade-icon {
          font-size: var(--font-size-2xl);
          color: var(--color-primary);
        }

        .grade-stat h4 {
          margin: 0 0 var(--space-1) 0;
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-neutral-900);
        }

        .grade-stat p {
          margin: 0;
          color: var(--color-neutral-500);
          font-size: var(--font-size-sm);
        }

        .grades-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .grade-item {
          background: var(--color-neutral-50);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          border: 1px solid var(--color-neutral-200);
        }

        .grade-content {
          margin-bottom: var(--space-3);
        }

        .grade-content h4 {
          margin: 0 0 var(--space-2) 0;
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-neutral-900);
        }

        .grade-content p {
          margin: 0 0 var(--space-1) 0;
          color: var(--color-neutral-600);
          font-size: var(--font-size-sm);
        }

        .grade-score {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
        }

        .grade-badge {
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          color: white;
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-sm);
        }

        .score-percentage {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          color: var(--color-neutral-900);
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: var(--color-neutral-200);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width var(--transition-base);
        }

        /* Schedule */
        .schedule-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .schedule-item {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          background: var(--color-neutral-50);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          border: 1px solid var(--color-neutral-200);
        }

        .schedule-time {
          background: var(--color-primary);
          color: white;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          min-width: 120px;
          text-align: center;
        }

        .schedule-content {
          flex: 1;
        }

        .schedule-content h4 {
          margin: 0 0 var(--space-1) 0;
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-neutral-900);
        }

        .schedule-content p {
          margin: 0 0 var(--space-1) 0;
          color: var(--color-neutral-600);
          font-size: var(--font-size-sm);
        }

        .schedule-room {
          color: var(--color-neutral-500) !important;
          font-size: var(--font-size-xs) !important;
        }

        /* Reports */
        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-4);
        }

        .report-card {
          background: var(--color-neutral-50);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          border: 1px solid var(--color-neutral-200);
          transition: all var(--transition-base);
        }

        .report-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .report-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-3);
        }

        .report-header h4 {
          margin: 0;
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-neutral-900);
          flex: 1;
        }

        .report-term {
          margin: 0 0 var(--space-1) 0;
          color: var(--color-neutral-600);
          font-size: var(--font-size-sm);
        }

        .report-date {
          margin: 0 0 var(--space-4) 0;
          color: var(--color-neutral-500);
          font-size: var(--font-size-xs);
        }

        .report-actions {
          display: flex;
          gap: var(--space-2);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: var(--space-12);
          color: var(--color-neutral-500);
        }

        .empty-state svg {
          margin-bottom: var(--space-4);
          opacity: 0.5;
        }

        .empty-state p {
          margin: 0 0 var(--space-2) 0;
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
        }

        .empty-state small {
          font-size: var(--font-size-sm);
          opacity: 0.7;
        }

        /* Responsive Design */
        @media (max-width: 640px) {
          .main-content {
            padding: var(--space-4);
          }

          .welcome-card {
            padding: var(--space-6);
          }

          .welcome-card h1 {
            font-size: var(--font-size-2xl);
          }

          .section-card {
            padding: var(--space-4);
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat-card {
            flex-direction: column;
            text-align: center;
            gap: var(--space-2);
          }

          .stat-icon {
            width: 40px;
            height: 40px;
          }

          .assignments-grid {
            grid-template-columns: 1fr;
          }

          .reports-grid {
            grid-template-columns: 1fr;
          }

          .grade-summary {
            grid-template-columns: 1fr;
          }

          .schedule-item {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-2);
          }

          .schedule-time {
            min-width: auto;
            align-self: stretch;
          }
        }
      `}</style>
    </div>
  )
}