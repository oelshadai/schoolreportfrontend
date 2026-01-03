import { useState, useEffect } from 'react'
import { 
  FaHome, FaTasks, FaAward, FaCalendar, FaUsers, FaFileAlt,
  FaBell, FaUser, FaSignOutAlt, FaChevronRight, FaPlay,
  FaClock, FaCheckCircle, FaExclamationTriangle, FaBookOpen,
  FaEye, FaUpload, FaDownload, FaUserCircle, FaComments,
  FaArrowRight, FaGraduationCap, FaChartLine, FaChartBar,
  FaClipboardList
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'

export default function StudentDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('home')
  const [student, setStudent] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [selectedClassmate, setSelectedClassmate] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [classmates, setClassmates] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [reports, setReports] = useState([
    { id: 1, title: 'Term 1 Report', term: 'Term 1', date: new Date(), status: 'Available' },
    { id: 2, title: 'Mid-term Report', term: 'Mid-term', date: new Date(), status: 'Available' }
  ])
  const [availableTasks, setAvailableTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  
  const isSmallMobile = window.innerWidth <= 480

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
      
      setAssignments(data.assignments?.map(a => ({
        id: a.id,
        title: a.assignment?.title || a.title || 'Untitled Assignment',
        subject: a.assignment?.subject || a.subject || 'General',
        due_date: a.assignment?.due_date || a.due_date,
        status: a.status?.toLowerCase() === 'not_started' ? 'pending' : a.status?.toLowerCase(),
        grade: a.grade,
        assignment: a.assignment // Keep full assignment data for view
      })) || [])
      
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
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: 60,
            height: 60,
            border: '4px solid rgba(255,255,255,0.1)',
            borderTop: '4px solid #10b981',
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
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      paddingTop: isMobile ? '60px' : '80px'
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        
        .chat-bubble {
          max-width: 70%;
          padding: 8px 12px;
          border-radius: 16px;
          margin-bottom: 8px;
          word-wrap: break-word;
        }
        
        .chat-bubble.sent {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          margin-left: auto;
          border-bottom-right-radius: 4px;
        }
        
        .chat-bubble.received {
          background: rgba(71, 85, 105, 0.8);
          color: white;
          margin-right: auto;
          border-bottom-left-radius: 4px;
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
        padding: isMobile ? '12px 16px' : '16px 24px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
            <div style={{
              width: isMobile ? 32 : 40,
              height: isMobile ? 32 : 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              {student?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <h1 style={{
                margin: 0,
                color: 'white',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700'
              }}>
                {student?.name}
              </h1>
              <p style={{
                margin: 0,
                color: '#94a3b8',
                fontSize: isMobile ? '12px' : '13px'
              }}>
                {student?.class} • ID: {student?.student_id}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: 'rgba(71, 85, 105, 0.3)',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                color: '#94a3b8',
                borderRadius: '8px',
                padding: isMobile ? '6px' : '8px',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <FaBell size={isMobile ? 14 : 16} />
              {notifications.filter(n => !n.read).length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  background: '#ef4444',
                  borderRadius: '50%',
                  border: '1px solid rgba(15, 23, 42, 0.9)'
                }} />
              )}
            </button>
            
            <button 
              onClick={() => setShowProfile(!showProfile)}
              style={{
                background: 'rgba(71, 85, 105, 0.3)',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                color: '#94a3b8',
                borderRadius: '8px',
                padding: isMobile ? '6px' : '8px',
                cursor: 'pointer'
              }}
            >
              <FaUserCircle size={isMobile ? 14 : 16} />
            </button>
            
            <button 
              onClick={handleLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                borderRadius: '8px',
                padding: isMobile ? '6px' : '8px',
                cursor: 'pointer'
              }}
            >
              <FaSignOutAlt size={isMobile ? 14 : 16} />
            </button>
          </div>
          
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              width: isMobile ? '280px' : '320px',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              zIndex: 100,
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              <h4 style={{
                margin: '0 0 12px 0',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Notifications
              </h4>
              
              {notifications.length === 0 ? (
                <p style={{
                  margin: 0,
                  color: '#94a3b8',
                  fontSize: '12px',
                  textAlign: 'center',
                  padding: '20px 0'
                }}>
                  No new notifications
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notifications.slice(0, 5).map(notification => (
                    <div key={notification.id} style={{
                      background: notification.read ? 'rgba(30, 41, 59, 0.4)' : 'rgba(16, 185, 129, 0.1)',
                      border: `1px solid ${notification.read ? 'rgba(71, 85, 105, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                      borderRadius: '8px',
                      padding: '10px',
                      cursor: 'pointer'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: notification.type === 'assignment' ? '#10b981' : '#3b82f6',
                          marginTop: '4px',
                          flexShrink: 0
                        }} />
                        <div style={{ flex: 1 }}>
                          <h5 style={{
                            margin: '0 0 2px 0',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {notification.title}
                          </h5>
                          <p style={{
                            margin: '0 0 4px 0',
                            color: '#94a3b8',
                            fontSize: '11px',
                            lineHeight: '1.3'
                          }}>
                            {notification.message}
                          </p>
                          <p style={{
                            margin: 0,
                            color: '#64748b',
                            fontSize: '10px'
                          }}>
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
        padding: isMobile ? '8px 16px' : '12px 24px',
        position: 'fixed',
        top: isMobile ? '60px' : '80px',
        left: 0,
        right: 0,
        zIndex: 40
      }}>
        <div style={{
          display: 'flex',
          gap: isMobile ? '4px' : '8px',
          maxWidth: '1200px',
          margin: '0 auto',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
            { id: 'assignments', label: 'Tasks', icon: FaTasks },
            { id: 'live-tasks', label: 'Live Tasks', icon: FaClock },
            { id: 'grades', label: 'Grades', icon: FaAward },
            { id: 'schedule', label: 'Schedule', icon: FaCalendar },
            { id: 'classmates', label: 'Classmates', icon: FaUsers },
            { id: 'reports', label: 'Reports', icon: FaFileAlt }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: isMobile ? '8px 12px' : '10px 16px',
                border: 'none',
                borderRadius: '8px',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <tab.icon size={isMobile ? 12 : 14} />
              {!isSmallMobile && tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        padding: isMobile ? '16px' : '24px',
        paddingTop: isMobile ? '120px' : '140px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="animate-slide-up">
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: isMobile ? '12px' : '16px',
              marginBottom: isMobile ? '20px' : '24px'
            }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '12px',
                padding: isMobile ? '16px 12px' : '20px 16px',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: isMobile ? 32 : 40,
                  height: isMobile ? 32 : 40,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  <FaGraduationCap style={{ color: 'white', fontSize: isMobile ? '14px' : '18px' }} />
                </div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  color: 'white',
                  fontSize: isMobile ? '18px' : '24px',
                  fontWeight: '700'
                }}>
                  {student?.grade_average || 0}%
                </h3>
                <p style={{
                  margin: 0,
                  color: '#94a3b8',
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: '500'
                }}>
                  Grade Average
                </p>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '12px',
                padding: isMobile ? '16px 12px' : '20px 16px',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: isMobile ? 32 : 40,
                  height: isMobile ? 32 : 40,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  <FaTasks style={{ color: 'white', fontSize: isMobile ? '14px' : '18px' }} />
                </div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  color: 'white',
                  fontSize: isMobile ? '18px' : '24px',
                  fontWeight: '700'
                }}>
                  {assignments.filter(a => a.status === 'graded').length}
                </h3>
                <p style={{
                  margin: 0,
                  color: '#94a3b8',
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: '500'
                }}>
                  Completed
                </p>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '12px',
                padding: isMobile ? '16px 12px' : '20px 16px',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: isMobile ? 32 : 40,
                  height: isMobile ? 32 : 40,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  <FaClock style={{ color: 'white', fontSize: isMobile ? '14px' : '18px' }} />
                </div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  color: 'white',
                  fontSize: isMobile ? '18px' : '24px',
                  fontWeight: '700'
                }}>
                  {assignments.filter(a => a.status === 'pending').length}
                </h3>
                <p style={{
                  margin: 0,
                  color: '#94a3b8',
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: '500'
                }}>
                  Pending
                </p>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '12px',
                padding: isMobile ? '16px 12px' : '20px 16px',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: isMobile ? 32 : 40,
                  height: isMobile ? 32 : 40,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  <FaUsers style={{ color: 'white', fontSize: isMobile ? '14px' : '18px' }} />
                </div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  color: 'white',
                  fontSize: isMobile ? '18px' : '24px',
                  fontWeight: '700'
                }}>
                  {classmates.length}
                </h3>
                <p style={{
                  margin: 0,
                  color: '#94a3b8',
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: '500'
                }}>
                  Classmates
                </p>
              </div>
            </div>

            {/* Recent Activity & Announcements */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
              gap: isMobile ? '16px' : '20px',
              marginBottom: '24px'
            }}>
              {/* Recent Assignments */}
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
                    Recent Tasks
                  </h3>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#10b981',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    View All <FaArrowRight size={10} />
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {assignments.slice(0, 3).map(assignment => (
                    <div key={assignment.id} style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      borderRadius: '12px',
                      padding: '12px',
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
                          fontSize: isMobile ? '13px' : '14px',
                          fontWeight: '600'
                        }}>
                          {assignment.title}
                        </h4>
                        <span style={{
                          background: getAssignmentStatusColor(assignment.status),
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}>
                          {assignment.status}
                        </span>
                      </div>
                      <p style={{
                        margin: '0 0 4px 0',
                        color: '#94a3b8',
                        fontSize: '12px'
                      }}>
                        {assignment.subject}
                      </p>
                      <p style={{
                        margin: 0,
                        color: '#64748b',
                        fontSize: '11px'
                      }}>
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Announcements */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '16px',
                padding: isMobile ? '16px' : '20px',
                border: '1px solid rgba(71, 85, 105, 0.3)'
              }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  color: 'white',
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: '700'
                }}>
                  Announcements
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {announcements.map(announcement => (
                    <div key={announcement.id} style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      borderRadius: '12px',
                      padding: '12px',
                      border: '1px solid rgba(71, 85, 105, 0.3)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: announcement.priority === 'high' ? '#ef4444' : '#f59e0b',
                          marginTop: '6px',
                          flexShrink: 0
                        }} />
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            margin: '0 0 4px 0',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            {announcement.title}
                          </h4>
                          <p style={{
                            margin: '0 0 4px 0',
                            color: '#94a3b8',
                            fontSize: '12px',
                            lineHeight: '1.4'
                          }}>
                            {announcement.content}
                          </p>
                          <p style={{
                            margin: 0,
                            color: '#64748b',
                            fontSize: '10px'
                          }}>
                            {new Date(announcement.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '16px',
              padding: isMobile ? '16px' : '20px',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                color: 'white',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700'
              }}>
                Quick Actions
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: '12px'
              }}>
                <button
                  onClick={() => setActiveTab('assignments')}
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <FaTasks style={{ color: '#10b981', fontSize: '20px', marginBottom: '8px' }} />
                  <p style={{ margin: 0, color: '#10b981', fontSize: '12px', fontWeight: '600' }}>View Tasks</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('grades')}
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <FaAward style={{ color: '#3b82f6', fontSize: '20px', marginBottom: '8px' }} />
                  <p style={{ margin: 0, color: '#3b82f6', fontSize: '12px', fontWeight: '600' }}>Check Grades</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('schedule')}
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <FaCalendar style={{ color: '#8b5cf6', fontSize: '20px', marginBottom: '8px' }} />
                  <p style={{ margin: 0, color: '#8b5cf6', fontSize: '12px', fontWeight: '600' }}>View Schedule</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('reports')}
                  style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <FaFileAlt style={{ color: '#f59e0b', fontSize: '20px', marginBottom: '8px' }} />
                  <p style={{ margin: 0, color: '#f59e0b', fontSize: '12px', fontWeight: '600' }}>View Reports</p>
                </button>
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
                  <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '20px' }}>85.5%</h4>
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
                  <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '20px' }}>A-</h4>
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
                  <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '20px' }}>12</h4>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Subjects</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { subject: 'Mathematics', grade: 'A', percentage: 92, color: '#10b981' },
                  { subject: 'English', grade: 'A-', percentage: 88, color: '#3b82f6' },
                  { subject: 'Science', grade: 'B+', percentage: 85, color: '#8b5cf6' },
                  { subject: 'History', grade: 'A', percentage: 90, color: '#10b981' },
                  { subject: 'Geography', grade: 'B', percentage: 82, color: '#f59e0b' }
                ].map((grade, index) => (
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
                        {grade.subject}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          background: grade.color,
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {grade.grade}
                        </span>
                        <span style={{
                          color: '#94a3b8',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {grade.percentage}%
                        </span>
                      </div>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(71, 85, 105, 0.3)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${grade.percentage}%`,
                        height: '100%',
                        background: grade.color,
                        borderRadius: '3px'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
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
                        <button 
                          onClick={() => {
                            console.log('VIEW BUTTON CLICKED!')
                            console.log('Assignment clicked:', assignment)
                            console.log('Assignment.assignment:', assignment.assignment)
                            
                            // Store the assignment data
                            if (assignment.assignment) {
                              console.log('Storing assignment data:', assignment.assignment)
                              localStorage.setItem('current_assignment', JSON.stringify(assignment))
                            } else {
                              console.log('No assignment.assignment found, storing full object')
                              localStorage.setItem('current_assignment', JSON.stringify({ assignment: assignment }))
                            }
                            
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
                        {assignment.status === 'pending' && (
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
                            <FaUpload size={10} style={{ marginRight: '4px' }} />
                            Submit
                          </button>
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