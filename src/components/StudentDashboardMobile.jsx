import { useState, useEffect } from 'react'
import { 
  FaUser, FaUsers, FaBook, FaChartLine, FaCalendarAlt, FaBell, 
  FaComments, FaFileAlt, FaVideo, FaTasks, FaGraduationCap,
  FaSearch, FaHeart, FaShare, FaDownload, FaEye, FaArrowRight,
  FaClock, FaCheckCircle, FaExclamationTriangle, FaPlus, FaSignOutAlt
} from 'react-icons/fa'

export default function StudentDashboardMobile({ student, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [classmates, setClassmates] = useState([])
  const [assignments, setAssignments] = useState([])
  const [reports, setReports] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [selectedClassmate, setSelectedClassmate] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const isMobile = window.innerWidth <= 768
  const isSmallMobile = window.innerWidth <= 480

  useEffect(() => {
    loadMockData()
  }, [])

  const loadMockData = () => {
    // Mock data to avoid API errors
    setClassmates([
      { id: 2, name: 'Jane Smith', avatar: null, status: 'online', last_seen: new Date() },
      { id: 3, name: 'Mike Johnson', avatar: null, status: 'offline', last_seen: new Date(Date.now() - 3600000) },
      { id: 4, name: 'Sarah Wilson', avatar: null, status: 'online', last_seen: new Date() },
      { id: 5, name: 'David Brown', avatar: null, status: 'away', last_seen: new Date(Date.now() - 1800000) }
    ])
    
    setAssignments([
      { id: 1, title: 'Math Assignment 1', subject: 'Mathematics', due_date: '2024-01-20', status: 'pending', grade: null },
      { id: 2, title: 'Science Project', subject: 'Science', due_date: '2024-01-25', status: 'submitted', grade: 88 },
      { id: 3, title: 'English Essay', subject: 'English', due_date: '2024-01-18', status: 'graded', grade: 92 }
    ])
    
    setReports([
      { id: 1, title: 'Mid-Term Report', term: 'Term 1', date: '2024-01-15', type: 'academic', status: 'available' },
      { id: 2, title: 'Progress Report', term: 'Term 1', date: '2024-01-10', type: 'progress', status: 'available' }
    ])
    
    setAnnouncements([
      { id: 1, title: 'School Holiday Notice', content: 'School will be closed next Friday', date: '2024-01-16', priority: 'high' },
      { id: 2, title: 'Library Hours Extended', content: 'Library now open until 8 PM', date: '2024-01-15', priority: 'medium' }
    ])
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedClassmate) return
    
    const message = {
      id: Date.now(),
      sender: student?.id || 1,
      receiver: selectedClassmate.id,
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    }
    
    setChatMessages([...chatMessages, message])
    setNewMessage('')
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      paddingTop: '60px'
    }}>
      <style>{`
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
        padding: '12px 16px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '14px'
            }}>
              {student?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <h1 style={{
                margin: 0,
                color: 'white',
                fontSize: '16px',
                fontWeight: '700'
              }}>
                {student?.name || 'Student'}
              </h1>
              <p style={{
                margin: 0,
                color: '#94a3b8',
                fontSize: '12px'
              }}>
                {student?.class || 'Grade 10A'} • ID: {student?.student_id || 'STD001'}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{
              background: 'rgba(71, 85, 105, 0.3)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              color: '#94a3b8',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer'
            }}>
              <FaBell size={14} />
            </button>
            <button 
              onClick={onLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              <FaSignOutAlt size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
        padding: '8px 16px',
        position: 'fixed',
        top: '60px',
        left: 0,
        right: 0,
        zIndex: 40
      }}>
        <div style={{
          display: 'flex',
          gap: '4px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
            { id: 'classmates', label: 'Classmates', icon: FaUsers },
            { id: 'assignments', label: 'Tasks', icon: FaTasks },
            { id: 'reports', label: 'Reports', icon: FaFileAlt }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 12px',
                border: 'none',
                borderRadius: '8px',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <tab.icon size={12} />
              {!isSmallMobile && tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        padding: '16px',
        paddingTop: '120px'
      }}>
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="animate-slide-up">
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '12px',
                padding: '16px 12px',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  <FaGraduationCap style={{ color: 'white', fontSize: '14px' }} />
                </div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '700'
                }}>
                  85.5%
                </h3>
                <p style={{
                  margin: 0,
                  color: '#94a3b8',
                  fontSize: '10px',
                  fontWeight: '500'
                }}>
                  Grade Average
                </p>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '12px',
                padding: '16px 12px',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  <FaTasks style={{ color: 'white', fontSize: '14px' }} />
                </div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '700'
                }}>
                  {assignments.filter(a => a.status === 'graded').length}
                </h3>
                <p style={{
                  margin: 0,
                  color: '#94a3b8',
                  fontSize: '10px',
                  fontWeight: '500'
                }}>
                  Completed
                </p>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '12px',
                padding: '16px 12px',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  <FaClock style={{ color: 'white', fontSize: '14px' }} />
                </div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '700'
                }}>
                  {assignments.filter(a => a.status === 'pending').length}
                </h3>
                <p style={{
                  margin: 0,
                  color: '#94a3b8',
                  fontSize: '10px',
                  fontWeight: '500'
                }}>
                  Pending
                </p>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '12px',
                padding: '16px 12px',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  <FaUsers style={{ color: 'white', fontSize: '14px' }} />
                </div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '700'
                }}>
                  {classmates.length}
                </h3>
                <p style={{
                  margin: 0,
                  color: '#94a3b8',
                  fontSize: '10px',
                  fontWeight: '500'
                }}>
                  Classmates
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              marginBottom: '16px'
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
                  fontSize: '16px',
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
                        fontSize: '13px',
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
              padding: '16px',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                color: 'white',
                fontSize: '16px',
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
        )}

        {/* Other tabs content would go here */}
        {activeTab === 'classmates' && (
          <div className="animate-slide-up">
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                color: 'white',
                fontSize: '16px',
                fontWeight: '700'
              }}>
                My Classmates
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {classmates.map(classmate => (
                  <div key={classmate.id} style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: '12px',
                    padding: '12px',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    cursor: 'pointer'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '14px'
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
                          fontSize: '13px',
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
          </div>
        )}

        {/* Assignments and Reports tabs would follow similar pattern */}
      </div>
    </div>
  )
}