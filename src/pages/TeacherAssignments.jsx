import { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaEye, FaUpload, FaCalendarAlt, FaUsers, FaClock, FaClipboardList } from 'react-icons/fa'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'

export default function TeacherAssignments() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignment_type: 'HOMEWORK',
    class_instance: '',
    due_date: '',
    due_time: '23:59',
    max_score: 10,
    attachment: null
  })

  // Responsive design
  const getResponsiveStyles = () => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200
    return {
      isMobile: width <= 480,
      isTablet: width <= 768,
      isDesktop: width > 768
    }
  }

  const responsive = getResponsiveStyles()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [assignmentsRes, classesRes] = await Promise.all([
        api.get('/assignments/assignments/'),
        api.get('/schools/classes/')
      ])
      setAssignments(assignmentsRes.data.results || assignmentsRes.data)
      
      // Filter classes for teacher
      const allClasses = classesRes.data.results || classesRes.data
      if (user?.role === 'TEACHER') {
        const teacherClasses = allClasses.filter(cls => 
          cls.class_teacher === user.id || 
          cls.subjects?.some(subject => subject.teacher === user.id)
        )
        setClasses(teacherClasses)
        
        // Auto-select if only one class
        if (teacherClasses.length === 1 && !formData.class_instance) {
          setFormData(prev => ({ ...prev, class_instance: String(teacherClasses[0].id) }))
        }
      } else {
        setClasses(allClasses)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const formDataObj = new FormData()
      
      // Combine date and time
      const dueDateTime = `${formData.due_date}T${formData.due_time}:00`
      
      Object.keys(formData).forEach(key => {
        if (key === 'due_time') return // Skip separate time field
        if (key === 'due_date') {
          formDataObj.append(key, dueDateTime)
        } else if (formData[key] !== null && formData[key] !== '') {
          formDataObj.append(key, formData[key])
        }
      })

      await api.post('/assignments/assignments/', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setShowModal(false)
      setFormData({
        title: '',
        description: '',
        assignment_type: 'HOMEWORK',
        class_instance: classes.length === 1 ? String(classes[0].id) : '',
        due_date: '',
        due_time: '23:59',
        max_score: 10,
        attachment: null
      })
      loadData()
    } catch (error) {
      console.error('Error creating assignment:', error)
    }
  }

  const publishAssignment = async (id) => {
    try {
      await api.post(`/assignments/assignments/${id}/publish/`)
      loadData()
    } catch (error) {
      console.error('Error publishing assignment:', error)
    }
  }

  if (loading) {
    return (
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: responsive.isMobile ? '20px 12px' : '24px 20px',
        paddingTop: responsive.isMobile ? '100px' : '24px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        minHeight: '100vh',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>Loading assignments...</div>
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>Please wait</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: 1400,
      margin: '0 auto',
      padding: responsive.isMobile ? '20px 12px' : '24px 20px',
      paddingTop: responsive.isMobile ? '100px' : '24px',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '20px',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(16px)',
        borderRadius: responsive.isMobile ? 16 : 20,
        padding: responsive.isMobile ? '20px 16px' : '24px 20px',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: responsive.isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: responsive.isMobile ? 'flex-start' : 'center',
          gap: responsive.isMobile ? 16 : 0
        }}>
          <div>
            <h1 style={{
              display: 'flex',
              alignItems: 'center',
              gap: responsive.isMobile ? 12 : 16,
              fontSize: responsive.isMobile ? '20px' : '28px',
              margin: '0 0 8px 0',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: 12,
                padding: responsive.isMobile ? '10px' : '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)'
              }}>
                <FaClipboardList size={responsive.isMobile ? 18 : 22} color="white" />
              </div>
              Teacher Assignments
            </h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: responsive.isMobile ? '14px' : '16px' }}>
              Create and manage assignments for your classes
            </p>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: responsive.isMobile ? '14px 18px' : '12px 20px',
              fontSize: responsive.isMobile ? '14px' : '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              width: responsive.isMobile ? '100%' : 'auto',
              justifyContent: 'center'
            }}
          >
            <FaPlus size={14} />
            Create Assignment
          </button>
        </div>
      </div>

      {/* Assignment Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: responsive.isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: responsive.isMobile ? '16px' : '24px'
      }}>
        {assignments.map(assignment => (
          <div key={assignment.id} style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '16px',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            padding: responsive.isMobile ? '20px 16px' : '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    background: assignment.assignment_type === 'QUIZ' ? '#8b5cf6' : '#6366f1',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {assignment.assignment_type}
                  </span>
                  <span style={{
                    background: assignment.status === 'PUBLISHED' ? '#10b981' : '#f59e0b',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {assignment.status}
                  </span>
                </div>
                <h3 style={{
                  fontSize: responsive.isMobile ? '16px' : '18px',
                  fontWeight: '600',
                  color: 'white',
                  margin: '0 0 8px 0'
                }}>
                  {assignment.title}
                </h3>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '14px',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  {assignment.description}
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: responsive.isMobile ? '1fr' : '1fr 1fr',
              gap: '12px',
              marginBottom: '16px',
              padding: '12px',
              background: 'rgba(71, 85, 105, 0.2)',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaCalendarAlt size={14} color="#94a3b8" />
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  Due: {new Date(assignment.due_date).toLocaleDateString()}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaClock size={14} color="#94a3b8" />
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {new Date(assignment.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaUsers size={14} color="#94a3b8" />
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {assignment.class_name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  Max: {assignment.max_score} pts
                </span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
              flexWrap: 'wrap'
            }}>
              {assignment.status === 'DRAFT' && (
                <button 
                  onClick={() => publishAssignment(assignment.id)}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Publish
                </button>
              )}
              <button style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                color: '#60a5fa',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <FaEye size={12} />
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: responsive.isMobile ? '16px' : '24px'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            borderRadius: '16px',
            padding: responsive.isMobile ? '20px' : '24px',
            maxWidth: responsive.isMobile ? '100%' : '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
              paddingBottom: '16px'
            }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: responsive.isMobile ? '18px' : '20px' }}>
                Create Assignment
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
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px', fontWeight: '500' }}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
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

              <div style={{ display: 'grid', gridTemplateColumns: responsive.isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px', fontWeight: '500' }}>Type</label>
                  <select
                    value={formData.assignment_type}
                    onChange={(e) => setFormData({...formData, assignment_type: e.target.value})}
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
                  <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px', fontWeight: '500' }}>Class *</label>
                  <select
                    value={formData.class_instance}
                    onChange={(e) => setFormData({...formData, class_instance: e.target.value})}
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
                        {cls.class_teacher === user?.id ? ' (Your Class)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px', fontWeight: '500' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
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

              <div style={{ display: 'grid', gridTemplateColumns: responsive.isMobile ? '1fr' : '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px', fontWeight: '500' }}>Due Date *</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
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
                  <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px', fontWeight: '500' }}>Due Time</label>
                  <input
                    type="time"
                    value={formData.due_time}
                    onChange={(e) => setFormData({...formData, due_time: e.target.value})}
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
                  <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px', fontWeight: '500' }}>Max Score</label>
                  <input
                    type="number"
                    value={formData.max_score}
                    onChange={(e) => setFormData({...formData, max_score: e.target.value})}
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
                <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px', fontWeight: '500' }}>Attachment (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setFormData({...formData, attachment: e.target.files[0]})}
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

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
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
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}