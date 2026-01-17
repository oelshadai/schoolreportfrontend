import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { 
  FaHome, FaTasks, FaAward, FaCalendar, FaFileAlt, FaBell, 
  FaSignOutAlt, FaGraduationCap, FaClock, FaCheckCircle, 
  FaEye, FaDownload, FaChartLine, FaBookOpen, FaArrowRight,
  FaPlay, FaExclamationTriangle, FaArrowUp, FaArrowDown
} from 'react-icons/fa'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'

export default function StudentPortal() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [student, setStudent] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [availableTasks, setAvailableTasks] = useState([])
  const [scheduleData, setScheduleData] = useState([])
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
      
      // Load student schedule
      try {
        const scheduleRes = await api.get('/students/schedule/').catch(() => ({ data: [] }))
        const schedules = Array.isArray(scheduleRes.data) ? scheduleRes.data : scheduleRes.data.results || []
        setScheduleData(schedules)
        // Also save to localStorage for offline access
        localStorage.setItem('student_schedule', JSON.stringify(schedules))
      } catch (scheduleError) {
        console.error('Error loading schedule:', scheduleError)
        setScheduleData([])
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
      case 'graded': return '#10b981'
      case 'submitted': return '#3b82f6'
      case 'pending': return '#f59e0b'
      case 'overdue': return '#ef4444'
      default: return '#6b7280'
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '16px',
        color: '#6b7280',
        background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3ecf8e',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          Loading your portal...
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
      paddingTop: '80px',
      padding: '80px 20px 20px 20px',
      margin: 0,
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: window.innerWidth <= 768 ? '20px' : '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
            textAlign: window.innerWidth <= 480 ? 'center' : 'left'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexDirection: window.innerWidth <= 480 ? 'column' : 'row'
            }}>
              <div style={{
                width: window.innerWidth <= 480 ? 48 : 56,
                height: window.innerWidth <= 480 ? 48 : 56,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                fontSize: window.innerWidth <= 480 ? '18px' : '20px'
              }}>
                {student?.name?.charAt(0) || 'S'}
              </div>
              <div>
                <h1 style={{
                  fontSize: window.innerWidth <= 480 ? '20px' : window.innerWidth <= 768 ? '24px' : '28px',
                  fontWeight: '700',
                  color: '#1a202c',
                  margin: '0 0 4px 0'
                }}>
                  Welcome back, {student?.name}!
                </h1>
                <p style={{
                  fontSize: window.innerWidth <= 480 ? '14px' : '16px',
                  color: '#718096',
                  margin: 0
                }}>
                  {student?.class} • Student ID: {student?.student_id}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              style={{
                background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                border: '1px solid #fecaca',
                color: '#dc2626',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: window.innerWidth <= 480 ? '16px' : '0'
              }}
            >
              <FaSignOutAlt size={14} />
              Logout
            </button>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: window.innerWidth <= 480 ? 'center' : 'flex-start'
          }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: FaHome },
              { id: 'assignments', label: 'Assignments', icon: FaTasks },
              { id: 'grades', label: 'Grades', icon: FaAward },
              { id: 'schedule', label: 'Schedule', icon: FaCalendar },
              { id: 'reports', label: 'Reports', icon: FaFileAlt }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #3ecf8e, #2dd4bf)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 480 ? 'repeat(2, 1fr)' : window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: window.innerWidth <= 480 ? '16px' : '20px',
              marginBottom: '32px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(62, 207, 142, 0.1)',
                border: '1px solid rgba(62, 207, 142, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <FaGraduationCap size={24} color="white" />
                </div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#1a202c'
                }}>
                  {(() => {
                    // Get grades from localStorage and calculate stats
                    const studentGrades = JSON.parse(localStorage.getItem('student_grades') || '[]')
                    const currentUserId = user?.id || 1
                    const userGrades = studentGrades.filter(grade => grade.student_id == currentUserId && grade.score !== null)
                    const totalScore = userGrades.reduce((sum, grade) => sum + (grade.score || 0), 0)
                    const averageScore = userGrades.length > 0 ? Math.round(totalScore / userGrades.length) : (student?.grade_average || 85)
                    
                    return averageScore
                  })()}%
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#718096',
                  fontWeight: '600'
                }}>
                  Grade Average
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(45, 212, 191, 0.1)',
                border: '1px solid rgba(45, 212, 191, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2dd4bf, #06d6a0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <FaTasks size={24} color="white" />
                </div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#1a202c'
                }}>
                  {assignments.filter(a => a.status === 'graded').length}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#718096',
                  fontWeight: '600'
                }}>
                  Completed
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <FaClock size={24} color="white" />
                </div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#1a202c'
                }}>
                  {assignments.filter(a => a.status === 'pending').length}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#718096',
                  fontWeight: '600'
                }}>
                  Pending
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fdf4ff 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <FaAward size={24} color="white" />
                </div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#1a202c'
                }}>
                  A-
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#718096',
                  fontWeight: '600'
                }}>
                  Current Grade
                </p>
              </div>
            </div>

            {/* Recent Assignments */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c'
                }}>
                  Recent Assignments
                </h3>
                <button
                  onClick={() => setActiveTab('assignments')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3ecf8e',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  View All <FaArrowRight size={12} />
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {assignments.slice(0, 3).map(assignment => (
                  <div key={assignment.id} style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h4 style={{
                        margin: '0 0 4px 0',
                        color: '#1a202c',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>
                        {assignment.title}
                      </h4>
                      <p style={{
                        margin: '0 0 4px 0',
                        color: '#6b7280',
                        fontSize: '14px'
                      }}>
                        {assignment.subject}
                      </p>
                      <p style={{
                        margin: 0,
                        color: '#9ca3af',
                        fontSize: '12px'
                      }}>
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{
                      background: getStatusColor(assignment.status),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {assignment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: '700',
              color: '#1a202c'
            }}>
              My Assignments
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {assignments.map(assignment => (
                <div key={assignment.id} style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <h4 style={{
                      margin: 0,
                      color: '#1a202c',
                      fontSize: '16px',
                      fontWeight: '600',
                      flex: 1
                    }}>
                      {assignment.title}
                    </h4>
                    <span style={{
                      background: getStatusColor(assignment.status),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {assignment.status}
                    </span>
                  </div>
                  <p style={{
                    margin: '0 0 8px 0',
                    color: '#6b7280',
                    fontSize: '14px'
                  }}>
                    {assignment.subject}
                  </p>
                  <p style={{
                    margin: '0 0 16px 0',
                    color: '#9ca3af',
                    fontSize: '12px'
                  }}>
                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </p>
                  {assignment.grade && (
                    <p style={{
                      margin: '0 0 16px 0',
                      color: '#10b981',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Grade: {assignment.grade}%
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {assignment.status !== 'submitted' && (
                      <button 
                        onClick={() => {
                          const assignmentData = {
                            assignment: assignment.assignment || assignment
                          }
                          localStorage.setItem('current_assignment', JSON.stringify(assignmentData))
                          const assignmentId = assignment.assignment?.id || assignment.id
                          navigate(`/student/assignment/${assignmentId}`)
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <FaEye size={10} />
                        View
                      </button>
                    )}
                    {assignment.status === 'submitted' && (
                      <span style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FaCheckCircle size={10} />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grades Tab */}
        {activeTab === 'grades' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: '700',
              color: '#1a202c'
            }}>
              My Grades
            </h3>
            
            {(() => {
              // Get grades from localStorage (populated by gradebook)
              const studentGrades = JSON.parse(localStorage.getItem('student_grades') || '[]')
              const currentUserId = user?.id || 1
              const userGrades = studentGrades.filter(grade => grade.student_id == currentUserId)
              
              // Also include completed assignments from old system
              const completedAssignments = JSON.parse(localStorage.getItem('completed_assignments') || '[]')
              const gradedAssignments = assignments.filter(a => a.grade && a.status === 'graded')
              
              // Combine all grades
              const allGrades = [...userGrades, ...completedAssignments, ...gradedAssignments]
              const totalScore = allGrades.reduce((sum, grade) => {
                const score = grade.score || grade.grade || 0
                return sum + score
              }, 0)
              const averageScore = allGrades.length > 0 ? Math.round(totalScore / allGrades.length) : 0
              
              return (
                <>
                  {/* Grade Summary */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth <= 480 ? '1fr' : window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                    gap: '20px',
                    marginBottom: '32px'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      borderRadius: '16px',
                      padding: '24px',
                      textAlign: 'center',
                      border: '1px solid #bbf7d0'
                    }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                      }}>
                        <FaAward size={24} color="white" />
                      </div>
                      <h4 style={{
                        margin: '0 0 4px 0',
                        fontSize: '28px',
                        fontWeight: '800',
                        color: '#16a34a'
                      }}>
                        {averageScore}%
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#15803d',
                        fontWeight: '600'
                      }}>
                        Overall Average
                      </p>
                    </div>

                    <div style={{
                      background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                      borderRadius: '16px',
                      padding: '24px',
                      textAlign: 'center',
                      border: '1px solid #5eead4'
                    }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                      }}>
                        <FaChartLine size={24} color="white" />
                      </div>
                      <h4 style={{
                        margin: '0 0 4px 0',
                        fontSize: '28px',
                        fontWeight: '800',
                        color: '#0d9488'
                      }}>
                        {averageScore >= 90 ? 'A+' : averageScore >= 80 ? 'A' : averageScore >= 70 ? 'B' : averageScore >= 60 ? 'C' : 'D'}
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#0f766e',
                        fontWeight: '600'
                      }}>
                        Current Grade
                      </p>
                    </div>

                    <div style={{
                      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                      borderRadius: '16px',
                      padding: '24px',
                      textAlign: 'center',
                      border: '1px solid #fde68a'
                    }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #d97706, #b45309)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                      }}>
                        <FaTasks size={24} color="white" />
                      </div>
                      <h4 style={{
                        margin: '0 0 4px 0',
                        fontSize: '28px',
                        fontWeight: '800',
                        color: '#d97706'
                      }}>
                        {allGrades.length}
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#b45309',
                        fontWeight: '600'
                      }}>
                        Graded Assignments
                      </p>
                    </div>
                  </div>

                  {/* Grades List */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    {allGrades.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#6b7280'
                      }}>
                        <FaAward size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                        <h4 style={{
                          margin: '0 0 8px 0',
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          No grades yet
                        </h4>
                        <p style={{
                          margin: 0,
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          Complete assignments to see your grades here
                        </p>
                      </div>
                    ) : (
                      allGrades.map((grade, index) => {
                        const score = grade.score || grade.grade || 0
                        const maxScore = grade.max_score || 100
                        const percentage = Math.round((score / maxScore) * 100)
                        const gradeColor = percentage >= 90 ? '#10b981' : 
                                        percentage >= 80 ? '#0d9488' : 
                                        percentage >= 70 ? '#3b82f6' : 
                                        percentage >= 60 ? '#f59e0b' : '#ef4444'
                        const gradeLetter = percentage >= 90 ? 'A+' : 
                                          percentage >= 80 ? 'A' : 
                                          percentage >= 70 ? 'B' : 
                                          percentage >= 60 ? 'C' : 'D'
                        
                        return (
                          <div key={index} style={{
                            background: '#f8fafc',
                            borderRadius: '12px',
                            padding: '20px',
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.2s ease'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              marginBottom: '12px',
                              flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
                              gap: window.innerWidth <= 480 ? '12px' : '0'
                            }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{
                                  margin: '0 0 8px 0',
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  color: '#1a202c'
                                }}>
                                  {grade.assignment_title || grade.title || grade.assignment?.title || 'Assignment'}
                                </h4>
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px',
                                  fontSize: '14px',
                                  color: '#6b7280'
                                }}>
                                  <p style={{ margin: 0 }}>Subject: {grade.subject || 'General'}</p>
                                  <p style={{ margin: 0 }}>Score: {score}/{maxScore}</p>
                                  {grade.assignment_type && (
                                    <p style={{ margin: 0 }}>Type: {grade.assignment_type}</p>
                                  )}
                                  {grade.correctAnswers && grade.totalQuestions && (
                                    <p style={{ margin: 0 }}>Correct: {grade.correctAnswers}/{grade.totalQuestions}</p>
                                  )}
                                  <p style={{ margin: 0 }}>
                                    Graded: {grade.graded_at ? new Date(grade.graded_at).toLocaleDateString() : 
                                            grade.completedAt ? new Date(grade.completedAt).toLocaleDateString() : 'Recently'}
                                  </p>
                                  {grade.feedback && (
                                    <p style={{ 
                                      margin: '8px 0 0 0', 
                                      padding: '8px', 
                                      background: '#f0f9ff', 
                                      borderRadius: '6px',
                                      fontSize: '13px',
                                      color: '#0369a1',
                                      fontStyle: 'italic'
                                    }}>
                                      Feedback: {grade.feedback}
                                    </p>
                                  )}
                                  {grade.status === 'PENDING_REVIEW' && (
                                    <p style={{ 
                                      margin: '8px 0 0 0', 
                                      padding: '6px 12px', 
                                      background: '#fef3c7', 
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      color: '#92400e',
                                      fontWeight: '600'
                                    }}>
                                      ⏳ Pending teacher review
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {grade.status !== 'PENDING_REVIEW' && (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  alignSelf: window.innerWidth <= 480 ? 'stretch' : 'flex-start'
                                }}>
                                  <div style={{
                                    background: gradeColor,
                                    color: 'white',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    minWidth: '40px',
                                    textAlign: 'center'
                                  }}>
                                    {gradeLetter}
                                  </div>
                                  <div style={{
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: gradeColor
                                  }}>
                                    {percentage}%
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Progress Bar */}
                            {grade.status !== 'PENDING_REVIEW' && (
                              <div style={{
                                width: '100%',
                                height: '8px',
                                background: '#e2e8f0',
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${percentage}%`,
                                  height: '100%',
                                  background: gradeColor,
                                  borderRadius: '4px',
                                  transition: 'width 0.3s ease'
                                }} />
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: '700',
              color: '#1a202c'
            }}>
              Class Schedule
            </h3>
            
            {(() => {
              // Use API data if available, otherwise fallback to localStorage or default
              const schedule = scheduleData.length > 0 ? scheduleData : 
                             JSON.parse(localStorage.getItem('student_schedule') || '[]').length > 0 ? 
                             JSON.parse(localStorage.getItem('student_schedule') || '[]') : 
                             [
                               { id: 1, day: 'Monday', time: '08:00 - 09:00', subject: 'Mathematics', teacher: 'Mr. Johnson', room: 'Room 101' },
                               { id: 2, day: 'Monday', time: '09:00 - 10:00', subject: 'English', teacher: 'Ms. Smith', room: 'Room 205' },
                               { id: 3, day: 'Tuesday', time: '08:00 - 09:00', subject: 'Science', teacher: 'Dr. Brown', room: 'Lab 1' },
                               { id: 4, day: 'Tuesday', time: '10:00 - 11:00', subject: 'History', teacher: 'Mr. Davis', room: 'Room 302' },
                               { id: 5, day: 'Wednesday', time: '12:00 - 13:00', subject: 'Lunch Break', teacher: '', room: 'Cafeteria' },
                               { id: 6, day: 'Thursday', time: '13:00 - 14:00', subject: 'Geography', teacher: 'Ms. Wilson', room: 'Room 201' },
                               { id: 7, day: 'Friday', time: '14:00 - 15:00', subject: 'Physical Education', teacher: 'Coach Miller', room: 'Gymnasium' }
                             ]
              
              // Group by day
              const groupedSchedule = schedule.reduce((acc, item) => {
                const day = item.day || item.day_of_week
                if (!acc[day]) acc[day] = []
                acc[day].push(item)
                return acc
              }, {})
              
              const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
              
              return (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  {daysOrder.map(day => {
                    const daySchedule = groupedSchedule[day] || groupedSchedule[day.toLowerCase()]
                    if (!daySchedule || daySchedule.length === 0) return null
                    
                    return (
                      <div key={day} style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <h4 style={{
                          margin: '0 0 16px 0',
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#1a202c',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)'
                          }} />
                          {day}
                        </h4>
                        
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}>
                          {daySchedule.map((item, idx) => (
                            <div key={idx} style={{
                              background: '#ffffff',
                              borderRadius: '8px',
                              padding: '16px',
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '16px',
                              flexDirection: window.innerWidth <= 480 ? 'column' : 'row'
                            }}>
                              <div style={{
                                background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                minWidth: '100px',
                                textAlign: 'center'
                              }}>
                                {item.time || `${item.start_time} - ${item.end_time}`}
                              </div>
                              
                              <div style={{ flex: 1 }}>
                                <h5 style={{
                                  margin: '0 0 4px 0',
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  color: '#1a202c'
                                }}>
                                  {item.subject}
                                </h5>
                                {item.teacher && (
                                  <p style={{
                                    margin: '0 0 2px 0',
                                    fontSize: '14px',
                                    color: '#6b7280'
                                  }}>
                                    {item.teacher}
                                  </p>
                                )}
                                <p style={{
                                  margin: 0,
                                  fontSize: '12px',
                                  color: '#9ca3af'
                                }}>
                                  {item.room}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  
                  {Object.keys(groupedSchedule).length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: '#6b7280'
                    }}>
                      <FaCalendarAlt size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                      <h4 style={{
                        margin: '0 0 8px 0',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        No schedule available
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        Your teacher will create a schedule for your class
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}

        {activeTab === 'reports' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: '700',
              color: '#1a202c'
            }}>
              My Reports
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {reports.map(report => (
                <div key={report.id} style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{
                    margin: '0 0 8px 0',
                    color: '#1a202c',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    {report.title}
                  </h4>
                  <p style={{
                    margin: '0 0 8px 0',
                    color: '#6b7280',
                    fontSize: '14px'
                  }}>
                    {report.term}
                  </p>
                  <p style={{
                    margin: '0 0 16px 0',
                    color: '#9ca3af',
                    fontSize: '12px'
                  }}>
                    {new Date(report.date).toLocaleDateString()}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <FaEye size={10} />
                      View
                    </button>
                    <button style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <FaDownload size={10} />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}