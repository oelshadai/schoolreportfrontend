import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaClock, FaUsers, 
  FaClipboardList, FaQuestionCircle, FaCheckCircle, FaCalendarAlt,
  FaUpload, FaFileAlt, FaTimes, FaSave
} from 'react-icons/fa'

export default function Assignments() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState('')

  // Responsive design constants
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
    fetchAssignments()
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const response = await api.get('/schools/classes/')
      const allClasses = response.data.results || response.data
      
      // Filter classes based on user role
      if (user?.role === 'TEACHER') {
        // Show classes where teacher is assigned as class teacher or subject teacher
        const teacherClasses = allClasses.filter(cls => 
          cls.class_teacher === user.id || 
          cls.subjects?.some(subject => subject.teacher === user.id)
        )
        setClasses(teacherClasses)
      } else {
        setClasses(allClasses)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      setError('Failed to load classes')
    }
  }

  const fetchAssignments = async () => {
    try {
      setError('')
      const response = await api.get('/assignments/')
      const data = response.data.results || response.data || []
      setAssignments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
      setError('Failed to load assignments')
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type) => {
    const colors = {
      'QUIZ': '#10b981',
      'EXAM': '#f59e0b',
      'HOMEWORK': '#6366f1',
      'PROJECT': '#8b5cf6',
      'EXERCISE': '#06b6d4'
    }
    return colors[type] || '#6b7280'
  }

  const getStatusColor = (status) => {
    const colors = {
      'DRAFT': '#6b7280',
      'PUBLISHED': '#10b981',
      'CLOSED': '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  if (loading) {
    return (
      <div className="container" style={{
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
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>Please wait while we fetch your data</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{
      maxWidth: 1400,
      margin: '0 auto',
      padding: responsive.isMobile ? '20px 12px' : '24px 20px',
      paddingTop: responsive.isMobile ? '100px' : '24px',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      {/* Header */}
      <div className="mobile-card" style={{ 
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
              fontSize: responsive.isMobile ? '20px' : responsive.isTablet ? '24px' : '28px',
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
              Assignments & Quizzes
            </h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: responsive.isMobile ? '14px' : '16px' }}>
              Create and manage assignments, quizzes, and exams for your classes
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
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
              transition: 'all 0.3s ease',
              minHeight: responsive.isMobile ? 48 : 44,
              width: responsive.isMobile ? '100%' : 'auto',
              justifyContent: 'center'
            }}
          >
            <FaPlus size={14} />
            Create Assignment
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 20,
          color: '#fca5a5',
          fontSize: 14
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Assignment Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: responsive.isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: responsive.isMobile ? '16px' : '24px'
      }}>
        {Array.isArray(assignments) && assignments.map(assignment => (
          <div key={assignment.id} style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '16px',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            padding: responsive.isMobile ? '20px 16px' : '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.3s ease'
          }}>
            {/* Assignment Header */}
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
                    background: getTypeColor(assignment.assignment_type),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {assignment.assignment_type}
                  </span>
                  <span style={{
                    background: getStatusColor(assignment.status),
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

            {/* Assignment Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: responsive.isMobile ? '1fr' : '1fr 1fr',
              gap: '12px',
              marginBottom: '16px',
              padding: '12px',
              background: 'rgba(71, 85, 105, 0.2)',
              borderRadius: '8px',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaCalendarAlt size={14} color="#94a3b8" />
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  Due: {new Date(assignment.due_date).toLocaleDateString()}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaUsers size={14} color="#94a3b8" />
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {assignment.class_name}
                </span>
              </div>
              {assignment.time_limit && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaClock size={14} color="#f59e0b" />
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                    {assignment.time_limit} min
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaCheckCircle size={14} color="#10b981" />
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {assignment.max_score} pts
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
              flexWrap: 'wrap'
            }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                color: '#60a5fa',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <FaEye size={12} />
                View
              </button>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                color: '#10b981',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <FaEdit size={12} />
                Edit
              </button>
              {assignment.assignment_type === 'QUIZ' && (
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  <FaQuestionCircle size={12} />
                  Questions
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(!Array.isArray(assignments) || assignments.length === 0) && (
        <div style={{
          textAlign: 'center',
          padding: responsive.isMobile ? '40px 20px' : '60px 20px',
          color: '#94a3b8',
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '16px',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          backdropFilter: 'blur(12px)'
        }}>
          <FaClipboardList size={48} style={{ marginBottom: '16px', opacity: 0.5, color: '#60a5fa' }} />
          <h3 style={{ fontSize: responsive.isMobile ? '16px' : '18px', fontWeight: '600', marginBottom: '8px', color: 'white' }}>
            No assignments yet
          </h3>
          <p style={{ marginBottom: '24px', fontSize: responsive.isMobile ? '14px' : '16px' }}>
            Create your first assignment or quiz to get started
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: responsive.isMobile ? '12px 24px' : '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            Create Assignment
          </button>
        </div>
      )}

      {/* Create Assignment Modal would go here */}
      {showCreateModal && (
        <CreateAssignmentModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchAssignments}
        />
      )}
    </div>
  )
}

// Create Assignment Modal with enhanced features
function CreateAssignmentModal({ onClose, onSuccess }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignment_type: 'HOMEWORK',
    class_id: '',
    due_date: '',
    due_time: '23:59',
    max_score: 100,
    time_limit: '',
    instructions: ''
  })
  const [classes, setClasses] = useState([])
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: '',
    question_type: 'MULTIPLE_CHOICE',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1
  })
  const [showQuestions, setShowQuestions] = useState(false)
  const [questionFile, setQuestionFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const responsive = {
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth <= 1024
  }

  useEffect(() => {
    fetchTeacherClasses()
  }, [])

  useEffect(() => {
    if (formData.assignment_type === 'QUIZ' || formData.assignment_type === 'EXAM') {
      if (!formData.time_limit) {
        setFormData(prev => ({ ...prev, time_limit: '60' })) // Default 60 minutes
      }
      setShowQuestions(true)
    } else {
      setShowQuestions(false)
      setQuestions([])
    }
  }, [formData.assignment_type])

  const fetchTeacherClasses = async () => {
    try {
      const response = await api.get('/schools/classes/')
      const allClasses = response.data.results || response.data
      
      if (user?.role === 'TEACHER') {
        // Get classes where teacher is class teacher or teaches subjects
        const teacherClasses = allClasses.filter(cls => {
          // Check if teacher is class teacher
          if (cls.class_teacher === user.id) return true
          
          // Check if teacher teaches any subject in this class
          if (cls.subjects && Array.isArray(cls.subjects)) {
            return cls.subjects.some(subject => subject.teacher === user.id)
          }
          
          return false
        })
        
        setClasses(teacherClasses)
        
        // Auto-select if teacher has only one class
        if (teacherClasses.length === 1) {
          setFormData(prev => ({ ...prev, class_id: String(teacherClasses[0].id) }))
        }
      } else {
        setClasses(allClasses)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      setError('Failed to load classes')
    }
  }

  const addQuestion = () => {
    if (!currentQuestion.question_text.trim()) {
      setError('Please enter a question')
      return
    }
    
    if (currentQuestion.question_type === 'MULTIPLE_CHOICE') {
      const validOptions = currentQuestion.options.filter(opt => opt.trim())
      if (validOptions.length < 2) {
        setError('Please provide at least 2 options')
        return
      }
      if (!currentQuestion.correct_answer.trim()) {
        setError('Please select the correct answer')
        return
      }
    }
    
    setQuestions(prev => [...prev, { ...currentQuestion, id: Date.now() }])
    setCurrentQuestion({
      question_text: '',
      question_type: 'MULTIPLE_CHOICE',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1
    })
    setError('')
  }

  const removeQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.txt')) {
        setError('Please upload a JSON or TXT file')
        return
      }
      setQuestionFile(file)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate quiz/exam requirements
      if ((formData.assignment_type === 'QUIZ' || formData.assignment_type === 'EXAM') && questions.length === 0 && !questionFile) {
        setError('Please add questions for quiz/exam or upload a question file')
        setLoading(false)
        return
      }

      const submitData = {
        ...formData,
        due_date: `${formData.due_date}T${formData.due_time}:00`,
        max_score: parseInt(formData.max_score),
        time_limit: formData.time_limit ? parseInt(formData.time_limit) : null,
        questions: questions.length > 0 ? questions : undefined
      }
      
      // If there's a file, handle file upload
      if (questionFile) {
        const formDataWithFile = new FormData()
        Object.keys(submitData).forEach(key => {
          if (key !== 'questions') {
            formDataWithFile.append(key, submitData[key])
          }
        })
        formDataWithFile.append('question_file', questionFile)
        
        await api.post('/assignments/', formDataWithFile, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await api.post('/assignments/', submitData)
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating assignment:', error)
      setError(error?.response?.data?.error || 'Failed to create assignment')
    } finally {
      setLoading(false)
    }
  }

  return (
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
        maxWidth: responsive.isMobile ? '100%' : '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
          paddingBottom: '16px'
        }}>
          <h2 style={{ 
            margin: 0, 
            color: 'white', 
            fontSize: responsive.isMobile ? '18px' : '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: 8,
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaClipboardList size={16} color="white" />
            </div>
            Create Assignment
          </h2>
          <button 
            onClick={onClose}
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

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            color: '#fca5a5',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Basic Info Section */}
            <div style={{
              background: 'rgba(71, 85, 105, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(71, 85, 105, 0.2)'
            }}>
              <h3 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '16px' }}>📝 Basic Information</h3>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px', fontWeight: '500' }}>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, assignment_type: e.target.value }))}
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
                      <option value="QUIZ">❓ Quiz</option>
                      <option value="EXAM">📝 Exam</option>
                      <option value="PROJECT">🎯 Project</option>
                      <option value="EXERCISE">💪 Exercise</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px', fontWeight: '500' }}>Class *</label>
                    <select
                      value={formData.class_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, class_id: e.target.value }))}
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
                      <option value="">Select class</option>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
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
              </div>
            </div>

            {/* Timing Section */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <h3 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '16px' }}>⏰ Timing & Duration</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: responsive.isMobile ? '1fr' : '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px', fontWeight: '500' }}>Due Date *</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, due_time: e.target.value }))}
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

                {(formData.assignment_type === 'QUIZ' || formData.assignment_type === 'EXAM') && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px', fontWeight: '500' }}>Time Limit (min) *</label>
                    <input
                      type="number"
                      value={formData.time_limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, time_limit: e.target.value }))}
                      min="1"
                      max="300"
                      required={formData.assignment_type === 'QUIZ' || formData.assignment_type === 'EXAM'}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        background: 'rgba(30, 41, 59, 0.8)',
                        color: 'white',
                        fontSize: '14px'
                      }}
                      placeholder="60"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Questions Section for Quiz/Exam */}
            {showQuestions && (
              <div style={{
                background: 'rgba(124, 58, 237, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(124, 58, 237, 0.2)'
              }}>
                <h3 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '16px' }}>❓ Questions Management</h3>
                
                {/* File Upload Option */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px',
                  border: '1px dashed rgba(124, 58, 237, 0.3)'
                }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontSize: '14px', fontWeight: '500' }}>
                    📁 Upload Questions File (JSON/TXT)
                  </label>
                  <input
                    type="file"
                    accept=".json,.txt"
                    onChange={handleFileUpload}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(71, 85, 105, 0.3)',
                      background: 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                  {questionFile && (
                    <div style={{ marginTop: '8px', color: '#10b981', fontSize: '12px' }}>
                      ✓ File selected: {questionFile.name}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'center', margin: '16px 0', color: '#94a3b8' }}>OR</div>

                {/* Manual Question Entry */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid rgba(71, 85, 105, 0.3)'
                }}>
                  <h4 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '14px' }}>✏️ Add Question Manually</h4>
                  
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', color: 'white', fontSize: '13px' }}>Question Text</label>
                      <textarea
                        value={currentQuestion.question_text}
                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question_text: e.target.value }))}
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(71, 85, 105, 0.3)',
                          background: 'rgba(15, 23, 42, 0.8)',
                          color: 'white',
                          fontSize: '13px'
                        }}
                        placeholder="Enter your question here..."
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: responsive.isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'white', fontSize: '13px' }}>Type</label>
                        <select
                          value={currentQuestion.question_type}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question_type: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(71, 85, 105, 0.3)',
                            background: 'rgba(15, 23, 42, 0.8)',
                            color: 'white',
                            fontSize: '13px'
                          }}
                        >
                          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                          <option value="TRUE_FALSE">True/False</option>
                          <option value="SHORT_ANSWER">Short Answer</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'white', fontSize: '13px' }}>Points</label>
                        <input
                          type="number"
                          value={currentQuestion.points}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                          min="1"
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(71, 85, 105, 0.3)',
                            background: 'rgba(15, 23, 42, 0.8)',
                            color: 'white',
                            fontSize: '13px'
                          }}
                        />
                      </div>
                    </div>

                    {currentQuestion.question_type === 'MULTIPLE_CHOICE' && (
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontSize: '13px' }}>Options</label>
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                            <input
                              type="radio"
                              name="correct_answer"
                              checked={currentQuestion.correct_answer === option}
                              onChange={() => setCurrentQuestion(prev => ({ ...prev, correct_answer: option }))}
                              style={{ flexShrink: 0 }}
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...currentQuestion.options]
                                newOptions[index] = e.target.value
                                setCurrentQuestion(prev => ({ ...prev, options: newOptions }))
                              }}
                              style={{
                                flex: 1,
                                padding: '6px',
                                borderRadius: '4px',
                                border: '1px solid rgba(71, 85, 105, 0.3)',
                                background: 'rgba(15, 23, 42, 0.8)',
                                color: 'white',
                                fontSize: '12px'
                              }}
                              placeholder={`Option ${index + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {currentQuestion.question_type === 'TRUE_FALSE' && (
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'white', fontSize: '13px' }}>Correct Answer</label>
                        <select
                          value={currentQuestion.correct_answer}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correct_answer: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(71, 85, 105, 0.3)',
                            background: 'rgba(15, 23, 42, 0.8)',
                            color: 'white',
                            fontSize: '13px'
                          }}
                        >
                          <option value="">Select answer</option>
                          <option value="True">True</option>
                          <option value="False">False</option>
                        </select>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={addQuestion}
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: 'center'
                      }}
                    >
                      <FaPlus size={12} />
                      Add Question
                    </button>
                  </div>
                </div>

                {/* Questions List */}
                {questions.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '14px' }}>
                      📋 Added Questions ({questions.length})
                    </h4>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {questions.map((q, index) => (
                        <div key={q.id} style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          borderRadius: '6px',
                          padding: '12px',
                          marginBottom: '8px',
                          border: '1px solid rgba(71, 85, 105, 0.3)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ color: 'white', fontSize: '13px', marginBottom: '4px' }}>
                                <strong>Q{index + 1}:</strong> {q.question_text}
                              </div>
                              <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                                {q.question_type} • {q.points} pts
                                {q.correct_answer && ` • Answer: ${q.correct_answer}`}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeQuestion(q.id)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                color: '#fca5a5',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              <FaTimes size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  background: 'rgba(71, 85, 105, 0.3)',
                  color: '#94a3b8',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaTimes size={12} />
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#6b7280' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                <FaSave size={12} />
                {loading ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}