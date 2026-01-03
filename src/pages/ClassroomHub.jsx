import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'
import { 
  FaVideo, FaPlay, FaStop, FaUsers, FaComments, FaPlus, FaClipboardList,
  FaCalendarAlt, FaClock, FaEye, FaPaperPlane, FaChevronLeft
} from 'react-icons/fa'

export default function ClassroomHub() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('live')
  const [isMobile] = useState(window.innerWidth <= 768)
  
  // Live Sessions State
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [participants, setParticipants] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  
  // Assignments State
  const [assignments, setAssignments] = useState([])
  const [classes, setClasses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('session') // 'session' or 'assignment'
  
  // Form Data
  const [sessionForm, setSessionForm] = useState({
    title: '', class_id: '', scheduled_time: '', duration: 60
  })
  const [assignmentForm, setAssignmentForm] = useState({
    title: '', description: '', assignment_type: 'HOMEWORK', class_instance: '',
    due_date: '', due_time: '23:59', max_score: 10, attachment: null
  })

  const isTeacher = user?.role === 'TEACHER'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [sessionsRes, assignmentsRes, classesRes] = await Promise.all([
        api.get('/virtual-sessions/'),
        api.get('/assignments/assignments/'),
        api.get('/schools/classes/')
      ])
      
      setSessions(sessionsRes.data.results || sessionsRes.data)
      setAssignments(assignmentsRes.data.results || assignmentsRes.data)
      
      const allClasses = classesRes.data.results || classesRes.data
      if (isTeacher) {
        const teacherClasses = allClasses.filter(c => 
          c.class_teacher === user.id || 
          c.subjects?.some(subject => subject.teacher === user.id)
        )
        setClasses(teacherClasses)
      } else {
        setClasses(allClasses.filter(c => c.students?.includes(user.id)))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const createSession = async (e) => {
    e.preventDefault()
    try {
      await api.post('/virtual-sessions/', sessionForm)
      setShowModal(false)
      setSessionForm({ title: '', class_id: '', scheduled_time: '', duration: 60 })
      loadData()
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  const createAssignment = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      const dueDateTime = `${assignmentForm.due_date}T${assignmentForm.due_time}:00`
      
      Object.keys(assignmentForm).forEach(key => {
        if (key === 'due_time') return
        if (key === 'due_date') {
          formData.append(key, dueDateTime)
        } else if (assignmentForm[key] !== null && assignmentForm[key] !== '') {
          formData.append(key, assignmentForm[key])
        }
      })

      await api.post('/assignments/assignments/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setShowModal(false)
      setAssignmentForm({
        title: '', description: '', assignment_type: 'HOMEWORK', class_instance: '',
        due_date: '', due_time: '23:59', max_score: 10, attachment: null
      })
      loadData()
    } catch (error) {
      console.error('Error creating assignment:', error)
    }
  }

  const joinSession = async (sessionId) => {
    try {
      const response = await api.post(`/virtual-sessions/${sessionId}/join/`)
      setActiveSession(response.data)
      loadParticipants(sessionId)
      loadMessages(sessionId)
    } catch (error) {
      console.error('Error joining session:', error)
    }
  }

  const startSession = async (sessionId) => {
    try {
      await api.post(`/virtual-sessions/${sessionId}/start/`)
      joinSession(sessionId)
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const endSession = async () => {
    try {
      await api.post(`/virtual-sessions/${activeSession.id}/end/`)
      setActiveSession(null)
      setParticipants([])
      setMessages([])
      loadData()
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  const loadParticipants = async (sessionId) => {
    try {
      const response = await api.get(`/virtual-sessions/${sessionId}/participants/`)
      setParticipants(response.data)
    } catch (error) {
      console.error('Error loading participants:', error)
    }
  }

  const loadMessages = async (sessionId) => {
    try {
      const response = await api.get(`/virtual-sessions/${sessionId}/messages/`)
      setMessages(response.data)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    
    try {
      await api.post(`/virtual-sessions/${activeSession.id}/messages/`, {
        message: newMessage
      })
      setNewMessage('')
      loadMessages(activeSession.id)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Active Session View
  if (activeSession) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white'
      }}>
        {/* Session Header */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          padding: isMobile ? '12px 16px' : '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(71, 85, 105, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setActiveSession(null)}
              style={{
                background: 'rgba(71, 85, 105, 0.3)',
                border: 'none',
                borderRadius: '6px',
                padding: '8px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <FaChevronLeft />
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: isMobile ? '16px' : '18px' }}>{activeSession.title}</h2>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>
                {participants.length} participants
              </p>
            </div>
          </div>
          {isTeacher && (
            <button
              onClick={endSession}
              style={{
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <FaStop /> End
            </button>
          )}
        </div>

        {/* Session Content */}
        <div style={{ display: 'flex', flex: 1, flexDirection: isMobile ? 'column' : 'row' }}>
          {/* Video Area */}
          <div style={{
            flex: 1,
            background: 'rgba(30, 41, 59, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: isMobile ? '250px' : '400px',
            margin: '12px'
          }}>
            <div style={{
              fontSize: isMobile ? '14px' : '18px',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexDirection: 'column'
            }}>
              <FaVideo size={isMobile ? 32 : 48} />
              <span>Live Session</span>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div style={{
            width: isMobile ? '100%' : '300px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderLeft: isMobile ? 'none' : '1px solid rgba(71, 85, 105, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: isMobile ? '300px' : 'auto'
          }}>
            {/* Participants */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaUsers /> Participants ({participants.length})
              </h3>
              <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                {participants.map(p => (
                  <div key={p.id} style={{
                    padding: '6px',
                    borderRadius: '6px',
                    marginBottom: '4px',
                    background: 'rgba(71, 85, 105, 0.2)',
                    fontSize: '12px'
                  }}>
                    {p.user_name} {p.is_teacher && '(Teacher)'}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{
                padding: '12px 16px 8px',
                borderBottom: '1px solid rgba(71, 85, 105, 0.3)'
              }}>
                <h3 style={{ margin: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaComments /> Chat
                </h3>
              </div>
              
              <div style={{
                flex: 1,
                padding: '12px',
                overflowY: 'auto',
                maxHeight: '200px'
              }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{
                    marginBottom: '8px',
                    padding: '6px',
                    borderRadius: '6px',
                    background: 'rgba(71, 85, 105, 0.2)'
                  }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>
                      {msg.user_name}
                    </div>
                    <div style={{ fontSize: '12px' }}>{msg.message}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} style={{
                padding: '12px',
                borderTop: '1px solid rgba(71, 85, 105, 0.3)',
                display: 'flex',
                gap: '8px'
              }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer'
                  }}
                >
                  <FaPaperPlane />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Hub View
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paddingBottom: isMobile ? '80px' : '20px'
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: isMobile ? '20px 12px' : '24px 20px',
        paddingTop: isMobile ? '60px' : '120px',
        color: 'white'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          borderRadius: isMobile ? 16 : 20,
          padding: isMobile ? '20px 16px' : '24px 20px',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? 16 : 0
          }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: isMobile ? 22 : 32,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #86efac, #22c55e)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2
              }}>Classroom Hub</h1>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: isMobile ? 13 : 14,
                color: '#1f2937',
                fontWeight: 500
              }}>
                {isTeacher ? 'Manage live sessions and assignments' : 'Join classes and view assignments'}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        {isMobile && (
          <div style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '20px',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}>
            <button
              onClick={() => setActiveTab('live')}
              style={{
                flex: 1,
                padding: '12px',
                background: activeTab === 'live' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <FaVideo size={14} />
              Live
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              style={{
                flex: 1,
                padding: '12px',
                background: activeTab === 'assignments' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <FaClipboardList size={14} />
              Tasks
            </button>
          </div>
        )}

        {/* Content Sections */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '24px'
        }}>
          {/* Live Sessions */}
          {(!isMobile || activeTab === 'live') && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: isMobile ? 18 : 20,
                  fontWeight: '600',
                  color: 'white'
                }}>Live Sessions</h2>
                {isTeacher && (
                  <button
                    onClick={() => {
                      setModalType('session')
                      setShowModal(true)
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: isMobile ? '8px 12px' : '10px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaPlus size={12} />
                    {isMobile ? 'New' : 'Create'}
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {sessions.map(session => (
                  <div key={session.id} style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    backdropFilter: 'blur(12px)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          margin: '0 0 4px 0',
                          fontSize: isMobile ? 14 : 16,
                          fontWeight: '600',
                          color: 'white'
                        }}>
                          {session.title}
                        </h3>
                        <p style={{
                          margin: 0,
                          color: '#94a3b8',
                          fontSize: '12px'
                        }}>
                          {session.class_name}
                        </p>
                      </div>
                      <span style={{
                        background: session.status === 'LIVE' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                                   session.status === 'SCHEDULED' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#6b7280',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '500'
                      }}>
                        {session.status}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                        {new Date(session.scheduled_time).toLocaleDateString()} • {session.duration}min
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {session.status === 'SCHEDULED' && isTeacher && (
                          <button
                            onClick={() => startSession(session.id)}
                            style={{
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <FaPlay size={10} />
                            Start
                          </button>
                        )}
                        {session.status === 'LIVE' && (
                          <button
                            onClick={() => joinSession(session.id)}
                            style={{
                              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <FaVideo size={10} />
                            Join
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignments */}
          {(!isMobile || activeTab === 'assignments') && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: isMobile ? 18 : 20,
                  fontWeight: '600',
                  color: 'white'
                }}>Assignments</h2>
                {isTeacher && (
                  <button
                    onClick={() => {
                      setModalType('assignment')
                      setShowModal(true)
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: isMobile ? '8px 12px' : '10px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaPlus size={12} />
                    {isMobile ? 'New' : 'Create'}
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {assignments.map(assignment => (
                  <div key={assignment.id} style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    backdropFilter: 'blur(12px)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '4px',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{
                            background: assignment.assignment_type === 'QUIZ' ? '#8b5cf6' : '#6366f1',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '600'
                          }}>
                            {assignment.assignment_type}
                          </span>
                          <span style={{
                            background: assignment.status === 'PUBLISHED' ? '#10b981' : '#f59e0b',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '600'
                          }}>
                            {assignment.status}
                          </span>
                        </div>
                        <h3 style={{
                          margin: '0 0 4px 0',
                          fontSize: isMobile ? 14 : 16,
                          fontWeight: '600',
                          color: 'white'
                        }}>
                          {assignment.title}
                        </h3>
                        <p style={{
                          margin: 0,
                          color: '#94a3b8',
                          fontSize: '12px',
                          lineHeight: '1.3'
                        }}>
                          {assignment.description}
                        </p>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#94a3b8',
                        fontSize: '11px'
                      }}>
                        <FaCalendarAlt size={10} />
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </div>
                      <button style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        color: '#60a5fa',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FaEye size={10} />
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: isMobile ? '16px' : '24px'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            borderRadius: '16px',
            padding: isMobile ? '20px' : '24px',
            maxWidth: isMobile ? '100%' : '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: isMobile ? '18px' : '20px' }}>
                Create {modalType === 'session' ? 'Live Session' : 'Assignment'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ×
              </button>
            </div>
            
            {modalType === 'session' ? (
              <form onSubmit={createSession} style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'white' }}>Title</label>
                  <input
                    type="text"
                    value={sessionForm.title}
                    onChange={(e) => setSessionForm({...sessionForm, title: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(71, 85, 105, 0.3)',
                      background: 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'white' }}>Class</label>
                  <select
                    value={sessionForm.class_id}
                    onChange={(e) => setSessionForm({...sessionForm, class_id: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(71, 85, 105, 0.3)',
                      background: 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.level_display || cls.level}{cls.section ? ` ${cls.section}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'white' }}>Date & Time</label>
                    <input
                      type="datetime-local"
                      value={sessionForm.scheduled_time}
                      onChange={(e) => setSessionForm({...sessionForm, scheduled_time: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        background: 'rgba(30, 41, 59, 0.8)',
                        color: 'white',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'white' }}>Duration (min)</label>
                    <input
                      type="number"
                      value={sessionForm.duration}
                      onChange={(e) => setSessionForm({...sessionForm, duration: e.target.value})}
                      min="15"
                      max="180"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        background: 'rgba(30, 41, 59, 0.8)',
                        color: 'white',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      background: 'rgba(71, 85, 105, 0.3)',
                      color: '#94a3b8',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Create
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={createAssignment} style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px' }}>Title *</label>
                  <input
                    type="text"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(71, 85, 105, 0.3)',
                      background: 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      fontSize: '14px'
                    }}
                    placeholder="Enter assignment title"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px' }}>Type</label>
                    <select
                      value={assignmentForm.assignment_type}
                      onChange={(e) => setAssignmentForm({...assignmentForm, assignment_type: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        background: 'rgba(30, 41, 59, 0.8)',
                        color: 'white',
                        fontSize: '14px'
                      }}
                    >
                      <option value="HOMEWORK">📚 Homework</option>
                      <option value="PROJECT">🎯 Project</option>
                      <option value="EXERCISE">💪 Exercise</option>
                      <option value="QUIZ">❓ Quiz</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px' }}>Class *</label>
                    <select
                      value={assignmentForm.class_instance}
                      onChange={(e) => setAssignmentForm({...assignmentForm, class_instance: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        background: 'rgba(30, 41, 59, 0.8)',
                        color: 'white',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.level_display || cls.level}{cls.section ? ` ${cls.section}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px' }}>Description</label>
                  <textarea
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                    rows={3}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(71, 85, 105, 0.3)',
                      background: 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                    placeholder="Enter assignment description"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px' }}>Due Date *</label>
                    <input
                      type="date"
                      value={assignmentForm.due_date}
                      onChange={(e) => setAssignmentForm({...assignmentForm, due_date: e.target.value})}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        background: 'rgba(30, 41, 59, 0.8)',
                        color: 'white',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px' }}>Due Time</label>
                    <input
                      type="time"
                      value={assignmentForm.due_time}
                      onChange={(e) => setAssignmentForm({...assignmentForm, due_time: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        background: 'rgba(30, 41, 59, 0.8)',
                        color: 'white',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px' }}>Max Score</label>
                    <input
                      type="number"
                      value={assignmentForm.max_score}
                      onChange={(e) => setAssignmentForm({...assignmentForm, max_score: e.target.value})}
                      min="1"
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        background: 'rgba(30, 41, 59, 0.8)',
                        color: 'white',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px' }}>Attachment (Optional)</label>
                  <input
                    type="file"
                    onChange={(e) => setAssignmentForm({...assignmentForm, attachment: e.target.files[0]})}
                    accept=".pdf,.doc,.docx,.jpg,.png,.txt"
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid rgba(71, 85, 105, 0.3)',
                      background: 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    style={{
                      background: 'rgba(71, 85, 105, 0.3)',
                      color: '#94a3b8',
                      border: '1px solid rgba(71, 85, 105, 0.3)',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    Create Assignment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}