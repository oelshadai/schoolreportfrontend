import { useState, useEffect } from 'react'
import { 
  FaHome, FaTasks, FaAward, FaCalendar, FaUsers, FaFileAlt,
  FaBell, FaUser, FaSignOutAlt, FaChevronRight, FaPlay,
  FaClock, FaCheckCircle, FaExclamationTriangle, FaBookOpen,
  FaEye, FaUpload, FaDownload, FaUserCircle, FaComments,
  FaArrowRight, FaGraduationCap, FaChartLine, FaChartBar,
  FaClipboardList, FaBars, FaTimes
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'

export default function StudentDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [student, setStudent] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [availableTasks, setAvailableTasks] = useState([])
  const [reports, setReports] = useState([
    { id: 1, title: 'Term 1 Report', term: 'Term 1', date: new Date(), status: 'Available' },
    { id: 2, title: 'Mid-term Report', term: 'Mid-term', date: new Date(), status: 'Available' }
  ])
  
  const isMobile = window.innerWidth <= 768

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await api.get('/students/auth/dashboard/')
      const data = response.data
      
      console.log('Dashboard data received:', data) // Debug log
      console.log('Student data:', data.student) // Debug student data
      
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
      setClassmates(data.classmates || [])
      setAnnouncements(data.announcements || [])
      
      // Load available tasks
      try {
        const tasksRes = await api.get('/assignments/tasks/available/')
        const tasksData = tasksRes.data
        
        // Handle both old and new response formats
        if (tasksData.results) {
          setAvailableTasks(tasksData.results)
        } else if (Array.isArray(tasksData)) {
          setAvailableTasks(tasksData)
        } else {
          setAvailableTasks([])
        }
      } catch (taskError) {
        console.error('Error loading tasks:', taskError)
        // Set fallback empty array instead of trying to retry
        setAvailableTasks([])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Set fallback data if API fails
      setStudent({
        id: 1,
        name: 'Student User',
        student_id: 'Unknown',
        class: 'No Class',
        grade_average: 0
      })
      setAssignments([])
      setNotifications([])
      setClassmates([])
      setAnnouncements([])
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
      case 'online': return '#10b981'
      case 'away': return '#f59e0b'
      case 'offline': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getAssignmentStatusColor = (status) => {
    switch (status) {
      case 'graded': return '#10b981'
      case 'submitted': return '#3b82f6'
      case 'pending': return '#f59e0b'
      case 'overdue': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedClassmate) return
    
    const message = {
      id: Date.now(),
      sender: student.id,
      receiver: selectedClassmate.id,
      content: newMessage.trim(),
      timestamp: new Date()
    }
    
    setChatMessages(prev => [...prev, message])
    setNewMessage('')
  }

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#374151' }}>
          <div style={{
            width: 60,
            height: 60,
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #16a34a',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#f8fafc',
      paddingTop: '160px',
      paddingLeft: '20px',
      paddingRight: '20px',
      paddingBottom: '40px',
      overflowX: 'hidden'
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Professional Navbar */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 24px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Logo & Student Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              background: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '16px'
            }}>
              {student?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <h2 style={{
                margin: 0,
                color: '#1f2937',
                fontSize: '18px',
                fontWeight: '700'
              }}>
                {student?.name || 'Student Portal'}
              </h2>
              <p style={{
                margin: 0,
                color: '#6b7280',
                fontSize: '13px'
              }}>
                {student?.class} • ID: {student?.student_id}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div style={{
            display: isMobile ? 'none' : 'flex',
            alignItems: 'center',
            gap: '8px'
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
                  borderRadius: '6px',
                  background: activeTab === tab.id ? '#16a34a' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Notifications */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: 'transparent',
                border: '1px solid #e5e7eb',
                color: '#6b7280',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <FaBell size={16} />
              {notifications.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  background: '#ef4444',
                  borderRadius: '50%',
                  border: '2px solid white'
                }} />
              )}
            </button>

            {/* Mobile Menu Toggle */}
            {isMobile && (
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                style={{
                  background: 'transparent',
                  border: '1px solid #e5e7eb',
                  color: '#6b7280',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer'
                }}
              >
                {showMobileMenu ? <FaTimes size={16} /> : <FaBars size={16} />}
              </button>
            )}

            {/* Logout */}
            <button 
              onClick={handleLogout}
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <FaSignOutAlt size={14} />
              {!isMobile && 'Logout'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && showMobileMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #e5e7eb',
            borderTop: 'none',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
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
                onClick={() => {
                  setActiveTab(tab.id)
                  setShowMobileMenu(false)
                }}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  background: activeTab === tab.id ? '#f0fdf4' : 'transparent',
                  color: activeTab === tab.id ? '#16a34a' : '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </nav>
      {/* Main Content */}
      <div style={{
        paddingTop: '80px',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 24px 40px'
      }}>
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Welcome Section */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              border: '1px solid #e5e7eb'
            }}>
              <h1 style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937'
              }}>
                Welcome back, {student?.name}!
              </h1>
              <p style={{
                margin: 0,
                color: '#6b7280',
                fontSize: '16px'
              }}>
                Here's what's happening with your studies today.
              </p>
            </div>

            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  background: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <FaGraduationCap style={{ color: 'white', fontSize: '18px' }} />
                </div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  color: '#1f2937',
                  fontSize: '24px',
                  fontWeight: '700'
                }}>
                  {student?.grade_average || 85}%
                </h3>
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  Grade Average
                </p>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  background: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <FaTasks style={{ color: 'white', fontSize: '18px' }} />
                </div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  color: '#1f2937',
                  fontSize: '24px',
                  fontWeight: '700'
                }}>
                  {assignments.filter(a => a.status === 'graded').length}
                </h3>
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  Completed
                </p>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  background: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <FaClock style={{ color: 'white', fontSize: '18px' }} />
                </div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  color: '#1f2937',
                  fontSize: '24px',
                  fontWeight: '700'
                }}>
                  {assignments.filter(a => a.status === 'pending').length}
                </h3>
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  Pending
                </p>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  background: '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <FaAward style={{ color: 'white', fontSize: '18px' }} />
                </div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  color: '#1f2937',
                  fontSize: '24px',
                  fontWeight: '700'
                }}>
                  A-
                </h3>
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  Current Grade
                </p>
              </div>
            </div>

            {/* Recent Assignments */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  margin: 0,
                  color: '#1f2937',
                  fontSize: '18px',
                  fontWeight: '700'
                }}>
                  Recent Assignments
                </h3>
                <button
                  onClick={() => setActiveTab('assignments')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#16a34a',
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
                    background: '#f9fafb',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <h4 style={{
                        margin: 0,
                        color: '#1f2937',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>
                        {assignment.title}
                      </h4>
                      <span style={{
                        background: getAssignmentStatusColor(assignment.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {assignment.status}
                      </span>
                    </div>
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
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Tasks Tab */}
        {activeTab === 'live-tasks' && (
          <div className="animate-slide-up">
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '16px',
              padding: isMobile ? '16px' : '20px',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                color: 'white',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700'
              }}>
                Live Tasks
              </h3>

              {availableTasks.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#94a3b8'
                }}>
                  <FaClock style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '16px' }}>No live tasks available</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.7 }}>Check back later for new assignments</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {availableTasks.map(task => (
                    <div key={task.id} style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      borderRadius: '12px',
                      padding: isMobile ? '14px' : '16px',
                      border: '1px solid rgba(71, 85, 105, 0.3)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? '8px' : '0'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            margin: '0 0 4px 0',
                            color: 'white',
                            fontSize: isMobile ? '14px' : '16px',
                            fontWeight: '600'
                          }}>
                            {task.title}
                          </h4>
                          <p style={{
                            margin: '0 0 8px 0',
                            color: '#94a3b8',
                            fontSize: '13px'
                          }}>
                            {task.description || 'No description available'}
                          </p>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{
                              background: task.is_available ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: task.is_available ? '#10b981' : '#ef4444',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {task.is_available ? 'Available' : 'Unavailable'}
                            </span>
                            <span style={{
                              color: '#64748b',
                              fontSize: '12px'
                            }}>
                              Duration: {task.duration} minutes
                            </span>
                            {task.score && (
                              <span style={{
                                color: '#10b981',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                Score: {task.score}%
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          alignSelf: isMobile ? 'stretch' : 'flex-start'
                        }}>
                          {task.is_available && !task.attempt_status && (
                            <button 
                              onClick={() => setSelectedTask(task)}
                              style={{
                                background: 'rgba(16, 185, 129, 0.2)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: '#10b981',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                            >
                              <FaPlay size={10} style={{ marginRight: '4px' }} />
                              Start
                            </button>
                          )}
                          {task.attempt_status === 'SUBMITTED' && (
                            <button style={{
                              background: 'rgba(59, 130, 246, 0.2)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: '#60a5fa',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              <FaCheckCircle size={10} style={{ marginRight: '4px' }} />
                              Completed
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'grades' && (
          <div className="animate-slide-up">
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '16px',
              padding: isMobile ? '16px' : '20px',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                color: 'white',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700'
              }}>
                My Grades
              </h3>

              {(() => {
                const completedAssignments = JSON.parse(localStorage.getItem('completed_assignments') || '[]')
                const totalScore = completedAssignments.reduce((sum, a) => sum + a.score, 0)
                const averageScore = completedAssignments.length > 0 ? Math.round(totalScore / completedAssignments.length) : 0
                
                return (
                  <>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                      gap: '16px',
                      marginBottom: '24px'
                    }}>
                      <div style={{
                        background: 'rgba(30, 41, 59, 0.6)',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center',
                        border: '1px solid rgba(71, 85, 105, 0.3)'
                      }}>
                        <FaAward style={{ color: '#10b981', fontSize: '24px', marginBottom: '8px' }} />
                        <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '20px' }}>{averageScore}%</h4>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Overall Average</p>
                      </div>
                      <div style={{
                        background: 'rgba(30, 41, 59, 0.6)',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center',
                        border: '1px solid rgba(71, 85, 105, 0.3)'
                      }}>
                        <FaChartBar style={{ color: '#3b82f6', fontSize: '24px', marginBottom: '8px' }} />
                        <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '20px' }}>
                          {averageScore >= 90 ? 'A+' : averageScore >= 80 ? 'A' : averageScore >= 70 ? 'B' : averageScore >= 60 ? 'C' : 'D'}
                        </h4>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Current Grade</p>
                      </div>
                      <div style={{
                        background: 'rgba(30, 41, 59, 0.6)',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center',
                        border: '1px solid rgba(71, 85, 105, 0.3)'
                      }}>
                        <FaClipboardList style={{ color: '#8b5cf6', fontSize: '24px', marginBottom: '8px' }} />
                        <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '20px' }}>{completedAssignments.length}</h4>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Completed</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {completedAssignments.length === 0 ? (
                        <div style={{
                          textAlign: 'center',
                          padding: '40px 20px',
                          color: '#94a3b8'
                        }}>
                          <FaAward style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                          <p style={{ margin: 0, fontSize: '16px' }}>No completed assignments yet</p>
                          <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.7 }}>Complete some assignments to see your grades here</p>
                        </div>
                      ) : (
                        completedAssignments.map((assignment, index) => {
                          const gradeColor = assignment.score >= 90 ? '#10b981' : 
                                          assignment.score >= 80 ? '#3b82f6' : 
                                          assignment.score >= 70 ? '#8b5cf6' : 
                                          assignment.score >= 60 ? '#f59e0b' : '#ef4444'
                          const grade = assignment.score >= 90 ? 'A+' : 
                                      assignment.score >= 80 ? 'A' : 
                                      assignment.score >= 70 ? 'B' : 
                                      assignment.score >= 60 ? 'C' : 'D'
                          
                          return (
                            <div key={index} style={{
                              background: 'rgba(30, 41, 59, 0.6)',
                              borderRadius: '12px',
                              padding: '16px',
                              border: '1px solid rgba(71, 85, 105, 0.3)'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '8px'
                              }}>
                                <h4 style={{
                                  margin: 0,
                                  color: 'white',
                                  fontSize: '16px',
                                  fontWeight: '600'
                                }}>
                                  {assignment.title}
                                </h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span style={{
                                    background: gradeColor,
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                  }}>
                                    {grade}
                                  </span>
                                  <span style={{
                                    color: '#94a3b8',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}>
                                    {assignment.score}%
                                  </span>
                                </div>
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                marginBottom: '8px',
                                fontSize: '12px',
                                color: '#94a3b8'
                              }}>
                                <span>Subject: {assignment.subject}</span>
                                <span>Score: {assignment.correctAnswers}/{assignment.totalQuestions}</span>
                                <span>Completed: {new Date(assignment.completedAt).toLocaleDateString()}</span>
                              </div>
                              <div style={{
                                width: '100%',
                                height: '6px',
                                background: 'rgba(71, 85, 105, 0.3)',
                                borderRadius: '3px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${assignment.score}%`,
                                  height: '100%',
                                  background: gradeColor,
                                  borderRadius: '3px'
                                }} />
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
          <div className="animate-slide-up">
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '16px',
              padding: isMobile ? '16px' : '20px',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                color: 'white',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700'
              }}>
                Class Schedule
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(7, 1fr)',
                gap: '8px',
                marginBottom: '20px'
              }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: '8px',
                    padding: '8px',
                    textAlign: 'center',
                    border: '1px solid rgba(71, 85, 105, 0.3)'
                  }}>
                    <p style={{
                      margin: 0,
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {day}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { time: '08:00 - 09:00', subject: 'Mathematics', teacher: 'Mr. Johnson', room: 'Room 101' },
                  { time: '09:00 - 10:00', subject: 'English', teacher: 'Ms. Smith', room: 'Room 205' },
                  { time: '10:00 - 11:00', subject: 'Science', teacher: 'Dr. Brown', room: 'Lab 1' },
                  { time: '11:00 - 12:00', subject: 'History', teacher: 'Mr. Davis', room: 'Room 302' },
                  { time: '12:00 - 13:00', subject: 'Lunch Break', teacher: '', room: 'Cafeteria' },
                  { time: '13:00 - 14:00', subject: 'Geography', teacher: 'Ms. Wilson', room: 'Room 201' },
                  { time: '14:00 - 15:00', subject: 'Physical Education', teacher: 'Coach Miller', room: 'Gymnasium' }
                ].map((schedule, index) => (
                  <div key={index} style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(71, 85, 105, 0.3)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? '8px' : '0'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          margin: '0 0 4px 0',
                          color: 'white',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}>
                          {schedule.subject}
                        </h4>
                        <p style={{
                          margin: '0 0 2px 0',
                          color: '#94a3b8',
                          fontSize: '13px'
                        }}>
                          {schedule.teacher}
                        </p>
                        <p style={{
                          margin: 0,
                          color: '#64748b',
                          fontSize: '12px'
                        }}>
                          {schedule.room}
                        </p>
                      </div>
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#10b981',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {schedule.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'classmates' && (
          <div className="animate-slide-up">
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : selectedClassmate ? '1fr 1fr' : '1fr',
              gap: '20px'
            }}>
              {/* Classmates List */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '16px',
                padding: isMobile ? '16px' : '20px',
                border: '1px solid rgba(71, 85, 105, 0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    margin: 0,
                    color: 'white',
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: '700'
                  }}>
                    My Classmates
                  </h3>
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {classmates.filter(c => c.status === 'online').length} online
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {classmates.map(classmate => (
                    <div
                      key={classmate.id}
                      onClick={() => setSelectedClassmate(classmate)}
                      style={{
                        background: selectedClassmate?.id === classmate.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                        borderRadius: '12px',
                        padding: '12px',
                        border: `1px solid ${selectedClassmate?.id === classmate.id ? 'rgba(16, 185, 129, 0.5)' : 'rgba(71, 85, 105, 0.3)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{ position: 'relative' }}>
                          <div style={{
                            width: isMobile ? 36 : 40,
                            height: isMobile ? 36 : 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: isMobile ? '14px' : '16px'
                          }}>
                            {classmate.name.charAt(0)}
                          </div>
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: getStatusColor(classmate.status),
                            border: '2px solid rgba(15, 23, 42, 0.9)'
                          }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            margin: '0 0 2px 0',
                            color: 'white',
                            fontSize: isMobile ? '13px' : '14px',
                            fontWeight: '600'
                          }}>
                            {classmate.name}
                          </h4>
                          <p style={{
                            margin: 0,
                            color: '#94a3b8',
                            fontSize: '11px'
                          }}>
                            {classmate.status === 'online' ? 'Active now' : 
                             classmate.status === 'away' ? 'Away' : 
                             `Last seen ${new Date(classmate.last_seen).toLocaleTimeString()}`}
                          </p>
                        </div>
                        <FaComments style={{
                          color: '#94a3b8',
                          fontSize: '14px'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Window */}
              {selectedClassmate && !isMobile && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  borderRadius: '16px',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '500px'
                }}>
                  {/* Chat Header */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '14px'
                    }}>
                      {selectedClassmate.name.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{
                        margin: 0,
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {selectedClassmate.name}
                      </h4>
                      <p style={{
                        margin: 0,
                        color: '#94a3b8',
                        fontSize: '11px'
                      }}>
                        {selectedClassmate.status === 'online' ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div style={{
                    flex: 1,
                    padding: '16px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {chatMessages.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: '13px',
                        marginTop: '50px'
                      }}>
                        Start a conversation with {selectedClassmate.name}
                      </div>
                    ) : (
                      chatMessages.map(message => (
                        <div
                          key={message.id}
                          className={`chat-bubble ${message.sender === student.id ? 'sent' : 'received'}`}
                        >
                          <p style={{
                            margin: '0 0 4px 0',
                            fontSize: '13px',
                            lineHeight: '1.4'
                          }}>
                            {message.content}
                          </p>
                          <p style={{
                            margin: 0,
                            fontSize: '10px',
                            opacity: 0.7
                          }}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Chat Input */}
                  <div style={{
                    padding: '16px',
                    borderTop: '1px solid rgba(71, 85, 105, 0.3)',
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        borderRadius: '20px',
                        background: 'rgba(30, 41, 59, 0.6)',
                        color: 'white',
                        fontSize: '13px'
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      style={{
                        background: newMessage.trim() ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(71, 85, 105, 0.3)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                        color: 'white'
                      }}
                    >
                      <FaArrowRight size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="animate-slide-up">
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '16px',
              padding: isMobile ? '16px' : '20px',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                color: 'white',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700'
              }}>
                My Assignments
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {assignments.map(assignment => (
                  <div key={assignment.id} style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: '12px',
                    padding: isMobile ? '14px' : '16px',
                    border: '1px solid rgba(71, 85, 105, 0.3)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? '8px' : '0'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          margin: '0 0 4px 0',
                          color: 'white',
                          fontSize: isMobile ? '14px' : '16px',
                          fontWeight: '600'
                        }}>
                          {assignment.title}
                        </h4>
                        <p style={{
                          margin: '0 0 8px 0',
                          color: '#94a3b8',
                          fontSize: '13px'
                        }}>
                          {assignment.subject}
                        </p>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{
                            background: getAssignmentStatusColor(assignment.status),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {assignment.status}
                          </span>
                          <span style={{
                            color: '#64748b',
                            fontSize: '12px'
                          }}>
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </span>
                          {assignment.grade && (
                            <span style={{
                              color: '#10b981',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              Grade: {assignment.grade}%
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        alignSelf: isMobile ? 'stretch' : 'flex-start'
                      }}>
                        {assignment.status !== 'submitted' && (
                          <button 
                            onClick={() => {
                              console.log('VIEW BUTTON CLICKED!')
                              console.log('Assignment clicked:', assignment)
                              console.log('Assignment.assignment:', assignment.assignment)
                              
                              // Store the assignment data with proper structure
                              const assignmentData = {
                                assignment: assignment.assignment || assignment
                              }
                              
                              console.log('Storing assignment data:', assignmentData)
                              localStorage.setItem('current_assignment', JSON.stringify(assignmentData))
                              
                              // Verify storage
                              const stored = localStorage.getItem('current_assignment')
                              console.log('Verification - stored data:', stored)
                              
                              const assignmentId = assignment.assignment?.id || assignment.id
                              console.log('Navigating to assignment ID:', assignmentId)
                              navigate(`/student/assignment/${assignmentId}`)
                            }}
                            style={{
                              background: 'rgba(59, 130, 246, 0.2)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: '#60a5fa',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}
                          >
                            <FaEye size={10} style={{ marginRight: '4px' }} />
                            View
                          </button>
                        )}
                        {assignment.status === 'submitted' && (
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#10b981',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            <FaCheckCircle size={10} style={{ marginRight: '4px' }} />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="animate-slide-up">
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '16px',
              padding: isMobile ? '16px' : '20px',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                color: 'white',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700'
              }}>
                My Reports
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reports.map(report => (
                  <div key={report.id} style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: '12px',
                    padding: isMobile ? '14px' : '16px',
                    border: '1px solid rgba(71, 85, 105, 0.3)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? '12px' : '0'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          margin: '0 0 4px 0',
                          color: 'white',
                          fontSize: isMobile ? '14px' : '16px',
                          fontWeight: '600'
                        }}>
                          {report.title}
                        </h4>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{
                            background: 'rgba(139, 92, 246, 0.2)',
                            color: '#a78bfa',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {report.term}
                          </span>
                          <span style={{
                            color: '#64748b',
                            fontSize: '12px'
                          }}>
                            {new Date(report.date).toLocaleDateString()}
                          </span>
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#10b981',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        alignSelf: isMobile ? 'stretch' : 'flex-start'
                      }}>
                        <button style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#60a5fa',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          <FaEye size={10} style={{ marginRight: '4px' }} />
                          View
                        </button>
                        <button style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#10b981',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          <FaDownload size={10} style={{ marginRight: '4px' }} />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}