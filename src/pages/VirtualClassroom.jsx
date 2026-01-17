import { useState, useEffect } from 'react'
import api from '../utils/api'
import { useAuth } from '../state/AuthContext'
import { 
  FaVideo, FaUsers, FaClipboardList, FaBullhorn, FaChartBar, 
  FaPlus, FaEdit, FaTrash, FaClock, FaCalendarAlt, FaEye,
  FaDownload, FaUpload, FaComments, FaBookOpen, FaTasks
} from 'react-icons/fa'

export default function VirtualClassroom() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('assignments')
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState([])
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [classReview, setClassReview] = useState([])
  const [tasks, setTasks] = useState([])

  const isMobile = window.innerWidth <= 768

  useEffect(() => {
    loadInitialData()
    loadTasks()
  }, [])

  useEffect(() => {
    if (activeTab === 'review') {
      loadClassReview()
    }
  }, [activeTab])

  const loadInitialData = async () => {
    try {
      const [assignmentsRes, classesRes] = await Promise.all([
        api.get('/assignments/assignments/'),
        api.get('/schools/classes/')
      ])
      
      setAssignments(assignmentsRes.data.results || assignmentsRes.data)
      
      const allClasses = classesRes.data.results || classesRes.data
      const teacherClasses = allClasses.filter(c => c.class_teacher === user.id)
      setClasses(teacherClasses)
      
      if (teacherClasses.length === 1) {
        setSelectedClass(String(teacherClasses[0].id))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadClassReview = async () => {
    try {
      const response = await api.get('/assignments/assignments/class_review/')
      setClassReview(response.data)
    } catch (error) {
      console.error('Error loading class review:', error)
    }
  }

  const createTask = async (formData) => {
    try {
      await api.post('/assignments/tasks/create/', formData)
      loadTasks()
      setShowTaskModal(false)
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const loadTasks = async () => {
    try {
      const response = await api.get('/assignments/tasks/available')
      setTasks(response.data.results || response.data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
      setTasks([])
    }
  }

  const activateTask = async (taskId) => {
    try {
      await api.post(`/assignments/tasks/${taskId}/activate/`)
      loadTasks()
    } catch (error) {
      console.error('Error activating task:', error)
    }
  }

  const createAssignment = async (formData) => {
    try {
      // Get current term automatically
      const termsRes = await api.get('/schools/terms/')
      const terms = termsRes.data.results || termsRes.data
      const currentTerm = terms.find(t => t.is_current) || terms[0]
      
      const payload = {
        ...formData,
        class_instance: parseInt(formData.class_instance),
        term: currentTerm?.id,
        due_date: formData.start_time // Use start_time as due_date
      }
      
      console.log('Creating assignment with payload:', payload)
      
      const response = await api.post('/assignments/create', payload)
      console.log('Assignment created successfully:', response.data)
      
      loadInitialData()
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating assignment:', error)
      console.error('Error response:', error.response?.data)
      
      let errorMessage = 'Failed to create assignment.'
      if (error.response?.data) {
        const errorData = error.response.data
        if (typeof errorData === 'object') {
          const errorMessages = []
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`)
            } else {
              errorMessages.push(`${field}: ${messages}`)
            }
          }
          errorMessage = errorMessages.join('\n')
        } else {
          errorMessage = errorData
        }
      }
      
      alert(errorMessage)
    }
  }

  const extendDueDate = async (assignmentId, newDate) => {
    try {
      await api.post(`/assignments/assignments/${assignmentId}/extend_due_date/`, {
        due_date: newDate
      })
      loadInitialData()
    } catch (error) {
      console.error('Error extending due date:', error)
    }
  }

  const deleteAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await api.delete(`/assignments/assignments/${assignmentId}/delete_assignment/`)
        loadInitialData()
      } catch (error) {
        console.error('Error deleting assignment:', error)
      }
    }
  }

  const createAnnouncement = async (formData) => {
    try {
      await api.post('/assignments/assignments/create_announcement/', formData)
      setShowAnnouncementModal(false)
    } catch (error) {
      console.error('Error creating announcement:', error)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#f8fafc',
      paddingTop: '120px',
      paddingLeft: '20px',
      paddingRight: '20px',
      paddingBottom: '40px',
      overflowX: 'hidden'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#16a34a',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaVideo size={20} color="white" />
            </div>
            <div>
              <h1 style={{
                margin: '0 0 8px 0',
                fontSize: isMobile ? 24 : 32,
                fontWeight: 700,
                color: '#1f2937'
              }}>
                Virtual Classroom
              </h1>
              <p style={{ margin: 0, color: '#6b7280' }}>
                Manage assignments, announcements, and class activities
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '12px 20px',
                background: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaPlus />
              New Assignment
            </button>
            
            <button
              onClick={() => setShowTaskModal(true)}
              style={{
                padding: '12px 20px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaClock />
              Timed Task
            </button>
            
            <button
              onClick={() => setShowAnnouncementModal(true)}
              style={{
                padding: '12px 20px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaBullhorn />
              Announce
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '8px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'assignments', label: 'Assignments', icon: FaTasks },
            { id: 'tasks', label: 'Timed Tasks', icon: FaClock },
            { id: 'review', label: 'Class Review', icon: FaChartBar },
            { id: 'students', label: 'Students', icon: FaUsers },
            { id: 'materials', label: 'Materials', icon: FaBookOpen }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 16px',
                background: activeTab === tab.id 
                  ? '#16a34a' 
                  : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: 8,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {activeTab === 'assignments' && (
          <AssignmentsTab 
            assignments={assignments}
            onExtendDueDate={extendDueDate}
            onDelete={deleteAssignment}
            isMobile={isMobile}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksTab 
            tasks={tasks}
            onActivate={activateTask}
            isMobile={isMobile}
          />
        )}

        {activeTab === 'review' && (
          <ClassReviewTab 
            classReview={classReview}
            isMobile={isMobile}
          />
        )}

        {activeTab === 'students' && (
          <StudentsTab 
            selectedClass={selectedClass}
            classes={classes}
            setSelectedClass={setSelectedClass}
            isMobile={isMobile}
          />
        )}

        {activeTab === 'materials' && (
          <MaterialsTab isMobile={isMobile} />
        )}

        {/* Create Assignment Modal */}
        {showCreateModal && (
          <CreateAssignmentModal
            onClose={() => setShowCreateModal(false)}
            onCreate={createAssignment}
            classes={classes}
            isMobile={isMobile}
          />
        )}

        {/* Create Task Modal */}
        {showTaskModal && (
          <CreateTaskModal
            onClose={() => setShowTaskModal(false)}
            onCreate={createTask}
            classes={classes}
            isMobile={isMobile}
          />
        )}

        {/* Announcement Modal */}
        {showAnnouncementModal && (
          <AnnouncementModal
            onClose={() => setShowAnnouncementModal(false)}
            onCreate={createAnnouncement}
            classes={classes}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  )
}

// Assignments Tab Component
function AssignmentsTab({ assignments, onExtendDueDate, onDelete, isMobile }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
        My Assignments ({assignments.length})
      </h3>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        {assignments.map(assignment => (
          <div key={assignment.id} style={{
            background: '#f9fafb',
            borderRadius: 12,
            padding: '16px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#1f2937' }}>
                  {assignment.title}
                </h4>
                <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
                  {assignment.class_name} • {assignment.assignment_type}
                </p>
                <p style={{ margin: 0, color: '#f59e0b', fontSize: '12px' }}>
                  Due: {new Date(assignment.due_date).toLocaleString()}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const newDate = prompt('Enter new due date (YYYY-MM-DD HH:MM):')
                    if (newDate) onExtendDueDate(assignment.id, newDate)
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <FaClock size={12} />
                </button>
                
                <button
                  onClick={() => onDelete(assignment.id)}
                  style={{
                    padding: '6px 12px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <FaTrash size={12} />
                </button>
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '8px',
              fontSize: '12px'
            }}>
              <div style={{ color: '#10b981' }}>
                Status: {assignment.status}
              </div>
              <div style={{ color: '#8b5cf6' }}>
                Max Score: {assignment.max_score}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Class Review Tab Component
function ClassReviewTab({ classReview, isMobile }) {
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.8)',
      borderRadius: 16,
      padding: '20px'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#e2e8f0' }}>
        Class Progress Overview
      </h3>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        {classReview.map(item => (
          <div key={item.id} style={{
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: 12,
            padding: '16px',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px'
            }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#e2e8f0' }}>
                  {item.title}
                </h4>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                  {item.class} • {item.type}
                </p>
              </div>
              
              <span style={{
                padding: '4px 8px',
                background: item.status === 'PUBLISHED' ? '#10b981' : '#f59e0b',
                color: 'white',
                borderRadius: 4,
                fontSize: '12px'
              }}>
                {item.status}
              </span>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '12px',
              marginTop: '12px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
                  {item.progress.total_students}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total Students</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                  {item.progress.submitted}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Submitted</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {item.progress.graded}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Graded</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {item.progress.pending}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Pending</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Students Tab Component
function StudentsTab({ selectedClass, classes, setSelectedClass, isMobile }) {
  const [students, setStudents] = useState([])
  
  useEffect(() => {
    if (selectedClass) {
      loadStudents()
    }
  }, [selectedClass])
  
  const loadStudents = async () => {
    try {
      const response = await api.get(`/students/?class_id=${selectedClass}`)
      setStudents(response.data.results || response.data)
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }
  
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.8)',
      borderRadius: 16,
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h3 style={{ margin: 0, color: '#e2e8f0' }}>
          Class Students ({students.length})
        </h3>
        
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          style={{
            padding: '8px 12px',
            background: 'rgba(30, 41, 59, 0.8)',
            color: 'white',
            border: '1px solid rgba(71, 85, 105, 0.4)',
            borderRadius: 6,
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
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {students.map(student => (
          <div key={student.id} style={{
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: 12,
            padding: '16px',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {student.first_name[0]}{student.last_name[0]}
              </div>
              
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#e2e8f0' }}>
                  {student.full_name}
                </h4>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>
                  ID: {student.student_id}
                </p>
              </div>
            </div>
            
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              <div>Gender: {student.gender}</div>
              <div>Status: {student.is_active ? 'Active' : 'Inactive'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Materials Tab Component
function MaterialsTab({ isMobile }) {
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.8)',
      borderRadius: 16,
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, color: '#e2e8f0' }}>
          Learning Materials
        </h3>
        
        <button style={{
          padding: '8px 16px',
          background: 'linear-gradient(135deg, #059669, #047857)',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaUpload size={14} />
          Upload Material
        </button>
      </div>
      
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#94a3b8'
      }}>
        <FaBookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p>No materials uploaded yet. Start by uploading your first learning material.</p>
      </div>
    </div>
  )
}

// Create Assignment Modal Component
function CreateAssignmentModal({ onClose, onCreate, classes, isMobile }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignment_type: 'HOMEWORK',
    class_instance: '',
    start_time: '',
    duration: '',
    max_score: 10,
    content_type: '', // 'upload' or 'questions'
    questions: [],
    attachment: null
  })
  
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: '',
    question_type: 'MULTIPLE_CHOICE',
    points: 1,
    options: [
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false }
    ]
  })
  
  const isQuizType = ['QUIZ', 'EXAM'].includes(formData.assignment_type)
  
  const handleNext = () => {
    if (step === 1) {
      if (!formData.title || !formData.class_instance || !formData.start_time) {
        alert('Please fill in all required fields')
        return
      }
    }
    if (step === 2) {
      if (!formData.content_type) {
        alert('Please select how you want to create the assignment')
        return
      }
    }
    setStep(step + 1)
  }
  
  const handleBack = () => setStep(step - 1)
  
  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, { option_text: '', is_correct: false }]
    })
  }
  
  const updateOption = (index, field, value) => {
    const options = [...currentQuestion.options]
    if (field === 'is_correct' && value) {
      // Only one correct answer for multiple choice
      options.forEach((opt, i) => opt.is_correct = i === index)
    } else {
      options[index][field] = value
    }
    setCurrentQuestion({ ...currentQuestion, options })
  }
  
  const addQuestion = () => {
    if (!currentQuestion.question_text.trim()) {
      alert('Please enter a question')
      return
    }
    if (currentQuestion.options.length < 2) {
      alert('Please add at least 2 options')
      return
    }
    if (!currentQuestion.options.some(o => o.is_correct)) {
      alert('Please select the correct answer')
      return
    }
    
    setFormData({
      ...formData,
      questions: [...formData.questions, { ...currentQuestion, order: formData.questions.length }]
    })
    
    // Reset form
    setCurrentQuestion({
      question_text: '',
      question_type: 'MULTIPLE_CHOICE',
      points: 1,
      options: [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false }
      ]
    })
  }
  
  const handleSubmit = () => {
    if (isQuizType && formData.questions.length === 0) {
      alert('Please add at least one question for quiz/exam')
      return
    }
    onCreate(formData)
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderRadius: 16,
        padding: '24px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#e2e8f0' }}>
            Create Assignment - Step {step} of 3
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: s <= step ? '#10b981' : '#374151'
              }} />
            ))}
          </div>
        </div>
        
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Assignment Details Section */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              padding: '20px',
              borderRadius: 12,
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <h5 style={{ margin: '0 0 16px 0', color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>
                Assignment Details
              </h5>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter assignment title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      color: 'white',
                      border: '1px solid rgba(71, 85, 105, 0.4)',
                      borderRadius: 8,
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>
                    Type *
                  </label>
                  <select
                    value={formData.assignment_type}
                    onChange={(e) => setFormData({...formData, assignment_type: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      color: 'white',
                      border: '1px solid rgba(71, 85, 105, 0.4)',
                      borderRadius: 8,
                      fontSize: '14px'
                    }}
                  >
                    <option value="HOMEWORK">📝 Homework</option>
                    <option value="PROJECT">🎯 Project</option>
                    <option value="QUIZ">❓ Quiz</option>
                    <option value="EXAM">📋 Exam</option>
                  </select>
                </div>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  placeholder="Provide assignment instructions and details..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: 'white',
                    border: '1px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: 8,
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
            
            {/* Class & Grading Section */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              padding: '20px',
              borderRadius: 12,
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <h5 style={{ margin: '0 0 16px 0', color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>
                Class & Grading
              </h5>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>
                    Assign to Class *
                  </label>
                  <select
                    value={formData.class_instance}
                    onChange={(e) => setFormData({...formData, class_instance: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      color: 'white',
                      border: '1px solid rgba(71, 85, 105, 0.4)',
                      borderRadius: 8,
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select a class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.level_display || cls.level}{cls.section ? ` - ${cls.section}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>
                    Max Score
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    value={formData.max_score}
                    onChange={(e) => setFormData({...formData, max_score: parseInt(e.target.value) || 10})}
                    min="1"
                    max="1000"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      color: 'white',
                      border: '1px solid rgba(71, 85, 105, 0.4)',
                      borderRadius: 8,
                      fontSize: '14px',
                      textAlign: 'center'
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Schedule Section */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              padding: '20px',
              borderRadius: 12,
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <h5 style={{ margin: '0 0 16px 0', color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>
                📅 Schedule & Timing
              </h5>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      color: 'white',
                      border: '1px solid rgba(71, 85, 105, 0.4)',
                      borderRadius: 8,
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    placeholder="60"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || ''})}
                    min="1"
                    max="480"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      color: 'white',
                      border: '1px solid rgba(71, 85, 105, 0.4)',
                      borderRadius: 8,
                      fontSize: '14px',
                      textAlign: 'center'
                    }}
                  />
                </div>
              </div>
              
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: 8,
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <p style={{ margin: 0, color: '#60a5fa', fontSize: '12px' }}>
                  💡 <strong>Tip:</strong> Duration is optional for homework/projects, but recommended for quizzes and exams to set time limits.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: Content Type Selection */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ color: '#e2e8f0', margin: 0 }}>How do you want to create this assignment?</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: formData.content_type === 'upload' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                border: `1px solid ${formData.content_type === 'upload' ? '#10b981' : 'rgba(71, 85, 105, 0.3)'}`,
                borderRadius: 8,
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="content_type"
                  value="upload"
                  checked={formData.content_type === 'upload'}
                  onChange={(e) => setFormData({...formData, content_type: e.target.value})}
                  style={{ accentColor: '#10b981' }}
                />
                <div>
                  <h5 style={{ margin: '0 0 4px 0', color: '#e2e8f0' }}>Upload File</h5>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Upload a document, image, or other file</p>
                </div>
              </label>
              
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: formData.content_type === 'questions' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                border: `1px solid ${formData.content_type === 'questions' ? '#10b981' : 'rgba(71, 85, 105, 0.3)'}`,
                borderRadius: 8,
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="content_type"
                  value="questions"
                  checked={formData.content_type === 'questions'}
                  onChange={(e) => setFormData({...formData, content_type: e.target.value})}
                  style={{ accentColor: '#10b981' }}
                />
                <div>
                  <h5 style={{ margin: '0 0 4px 0', color: '#e2e8f0' }}>Create Questions</h5>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Add multiple choice questions for quiz/exam</p>
                </div>
              </label>
            </div>
          </div>
        )}
        
        {/* Step 3: File Upload */}
        {step === 3 && formData.content_type === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ color: '#e2e8f0', margin: 0 }}>Upload Assignment File</h4>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png,.txt"
              onChange={(e) => setFormData({...formData, attachment: e.target.files[0]})}
              style={{
                padding: '12px',
                background: 'rgba(30, 41, 59, 0.8)',
                color: 'white',
                border: '1px solid rgba(71, 85, 105, 0.4)',
                borderRadius: 8
              }}
            />
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
              Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT
            </p>
          </div>
        )}
        
        {/* Step 3: Questions */}
        {step === 3 && formData.content_type === 'questions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ color: '#e2e8f0', margin: 0 }}>Create Questions</h4>
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                padding: '4px 12px',
                borderRadius: 12,
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {formData.questions.length} Questions Added
              </span>
            </div>
            
            {/* Question Form */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              padding: '20px',
              borderRadius: 12,
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Enter your question here..."
                  value={currentQuestion.question_text}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, question_text: e.target.value})}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: 'white',
                    border: '1px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: 8,
                    fontSize: '14px'
                  }}
                />
                <input
                  type="number"
                  placeholder="Points"
                  value={currentQuestion.points}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value) || 1})}
                  min="1"
                  max="10"
                  style={{
                    width: '80px',
                    padding: '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: 'white',
                    border: '1px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: 8,
                    textAlign: 'center'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0' }}>Answer Options (select the correct one):</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '8px',
                      background: option.is_correct ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 23, 42, 0.5)',
                      borderRadius: 8,
                      border: `1px solid ${option.is_correct ? '#10b981' : 'rgba(71, 85, 105, 0.3)'}`
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        minWidth: '60px'
                      }}>
                        <input
                          type="radio"
                          name="correct_answer"
                          checked={option.is_correct}
                          onChange={() => updateOption(index, 'is_correct', true)}
                          style={{ accentColor: '#10b981' }}
                        />
                        <span style={{
                          color: option.is_correct ? '#10b981' : '#94a3b8',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      
                      <input
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        value={option.option_text}
                        onChange={(e) => updateOption(index, 'option_text', e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: '13px'
                        }}
                      />
                      
                      {option.is_correct && (
                        <span style={{
                          color: '#10b981',
                          fontSize: '10px',
                          fontWeight: '600',
                          background: 'rgba(16, 185, 129, 0.2)',
                          padding: '2px 6px',
                          borderRadius: 4
                        }}>
                          ✓ CORRECT
                        </span>
                      )}
                      
                      {currentQuestion.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const options = currentQuestion.options.filter((_, i) => i !== index)
                            setCurrentQuestion({...currentQuestion, options})
                          }}
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: 4,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={addOption}
                    disabled={currentQuestion.options.length >= 6}
                    style={{
                      padding: '8px 16px',
                      background: currentQuestion.options.length >= 6 ? 'rgba(71, 85, 105, 0.3)' : 'rgba(59, 130, 246, 0.2)',
                      color: currentQuestion.options.length >= 6 ? '#6b7280' : '#60a5fa',
                      border: `1px solid ${currentQuestion.options.length >= 6 ? 'rgba(71, 85, 105, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                      borderRadius: 6,
                      cursor: currentQuestion.options.length >= 6 ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    + Add Option
                  </button>
                  
                  <button
                    type="button"
                    onClick={addQuestion}
                    disabled={!currentQuestion.question_text || currentQuestion.options.length < 2 || !currentQuestion.options.some(o => o.is_correct)}
                    style={{
                      padding: '8px 16px',
                      background: (!currentQuestion.question_text || currentQuestion.options.length < 2 || !currentQuestion.options.some(o => o.is_correct)) 
                        ? 'rgba(71, 85, 105, 0.3)' 
                        : 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      cursor: (!currentQuestion.question_text || currentQuestion.options.length < 2 || !currentQuestion.options.some(o => o.is_correct)) 
                        ? 'not-allowed' 
                        : 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    ✓ Add Question
                  </button>
                </div>
              </div>
            </div>
            
            {/* Added Questions List */}
            {formData.questions.length > 0 && (
              <div style={{
                background: 'rgba(30, 41, 59, 0.3)',
                padding: '16px',
                borderRadius: 12,
                border: '1px solid rgba(71, 85, 105, 0.3)'
              }}>
                <h5 style={{ color: '#e2e8f0', margin: '0 0 12px 0', fontSize: '14px' }}>Questions Added:</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {formData.questions.map((q, i) => (
                    <div key={i} style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      padding: '12px',
                      borderRadius: 8,
                      border: '1px solid rgba(71, 85, 105, 0.3)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 4px 0', color: '#e2e8f0', fontSize: '13px', fontWeight: '600' }}>
                          Q{i + 1}: {q.question_text}
                        </p>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px' }}>
                          {q.options.length} options • {q.points} point{q.points !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const questions = formData.questions.filter((_, index) => index !== i)
                          setFormData({...formData, questions})
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#ef4444',
                          border: 'none',
                          borderRadius: 4,
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '24px' }}>
          <div>
            {step > 1 && (
              <button
                onClick={handleBack}
                style={{
                  padding: '12px 20px',
                  background: 'rgba(71, 85, 105, 0.4)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 20px',
                background: 'rgba(71, 85, 105, 0.4)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            
            {step < 3 ? (
              <button
                onClick={handleNext}
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                Create Assignment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Tasks Tab Component
function TasksTab({ tasks, onActivate, isMobile }) {
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.8)',
      borderRadius: 16,
      padding: '20px'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#e2e8f0' }}>
        Timed Tasks ({tasks.length})
      </h3>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        {tasks.map(task => (
          <div key={task.id} style={{
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: 12,
            padding: '16px',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#e2e8f0' }}>
                  {task.title}
                </h4>
                <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '14px' }}>
                  {task.class_name} • {task.questions?.length || 0} questions
                </p>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                  <span style={{ color: '#10b981' }}>Start: {new Date(task.start_time).toLocaleString()}</span>
                  <span style={{ color: '#f59e0b' }}>Duration: {task.duration} min</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  padding: '4px 8px',
                  background: task.status === 'ACTIVE' ? '#10b981' : task.status === 'SCHEDULED' ? '#f59e0b' : '#6b7280',
                  color: 'white',
                  borderRadius: 4,
                  fontSize: '12px'
                }}>
                  {task.status}
                </span>
                
                {task.status === 'SCHEDULED' && (
                  <button
                    onClick={() => onActivate(task.id)}
                    style={{
                      padding: '4px 8px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {tasks.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#94a3b8'
          }}>
            <FaClock size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No timed tasks created yet. Create your first timed task to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Create Task Modal Component
function CreateTaskModal({ onClose, onCreate, classes, isMobile }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class_id: '',
    start_time: '',
    duration: 30,
    questions: [{ question: '', options: ['', '', '', ''], correct_answer: 0 }]
  })
  
  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', options: ['', '', '', ''], correct_answer: 0 }]
    })
  }
  
  const updateQuestion = (index, field, value) => {
    const questions = [...formData.questions]
    questions[index][field] = value
    setFormData({ ...formData, questions })
  }
  
  const updateOption = (qIndex, oIndex, value) => {
    const questions = [...formData.questions]
    questions[qIndex].options[oIndex] = value
    setFormData({ ...formData, questions })
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onCreate(formData)
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderRadius: 16,
        padding: '24px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#e2e8f0' }}>
          Create Timed Task
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            placeholder="Task Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
            style={{
              padding: '12px',
              background: 'rgba(30, 41, 59, 0.8)',
              color: 'white',
              border: '1px solid rgba(71, 85, 105, 0.4)',
              borderRadius: 8,
              fontSize: '14px'
            }}
          />
          
          <select
            value={formData.class_id}
            onChange={(e) => setFormData({...formData, class_id: e.target.value})}
            required
            style={{
              padding: '12px',
              background: 'rgba(30, 41, 59, 0.8)',
              color: 'white',
              border: '1px solid rgba(71, 85, 105, 0.4)',
              borderRadius: 8,
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
          
          <input
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => setFormData({...formData, start_time: e.target.value})}
            required
            style={{
              padding: '12px',
              background: 'rgba(30, 41, 59, 0.8)',
              color: 'white',
              border: '1px solid rgba(71, 85, 105, 0.4)',
              borderRadius: 8,
              fontSize: '14px'
            }}
          />
          
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={formData.duration}
            onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
            min="1"
            style={{
              padding: '12px',
              background: 'rgba(30, 41, 59, 0.8)',
              color: 'white',
              border: '1px solid rgba(71, 85, 105, 0.4)',
              borderRadius: 8,
              fontSize: '14px'
            }}
          />
          
          <div>
            <h4 style={{ color: '#e2e8f0', margin: '0 0 12px 0' }}>Questions</h4>
            {formData.questions.map((q, qIndex) => (
              <div key={qIndex} style={{
                background: 'rgba(30, 41, 59, 0.5)',
                padding: '16px',
                borderRadius: 8,
                marginBottom: '12px'
              }}>
                <input
                  type="text"
                  placeholder={`Question ${qIndex + 1}`}
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: 'white',
                    border: '1px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: 4,
                    marginBottom: '8px'
                  }}
                />
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                    <input
                      type="radio"
                      name={`correct_${qIndex}`}
                      checked={q.correct_answer === oIndex}
                      onChange={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                    />
                    <input
                      type="text"
                      placeholder={`Option ${oIndex + 1}`}
                      value={option}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: 'white',
                        border: '1px solid rgba(71, 85, 105, 0.4)',
                        borderRadius: 4,
                        fontSize: '12px'
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addQuestion}
              style={{
                padding: '8px 16px',
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 6,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Add Question
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 20px',
                background: 'rgba(71, 85, 105, 0.4)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Announcement Modal Component
function AnnouncementModal({ onClose, onCreate, classes, isMobile }) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    class_id: ''
  })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onCreate(formData)
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderRadius: 16,
        padding: '24px',
        width: '100%',
        maxWidth: '500px',
        border: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#e2e8f0' }}>
          Create Announcement
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            placeholder="Announcement Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
            style={{
              padding: '12px',
              background: 'rgba(30, 41, 59, 0.8)',
              color: 'white',
              border: '1px solid rgba(71, 85, 105, 0.4)',
              borderRadius: 8,
              fontSize: '14px'
            }}
          />
          
          <textarea
            placeholder="Message"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            required
            rows="4"
            style={{
              padding: '12px',
              background: 'rgba(30, 41, 59, 0.8)',
              color: 'white',
              border: '1px solid rgba(71, 85, 105, 0.4)',
              borderRadius: 8,
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
          
          <select
            value={formData.class_id}
            onChange={(e) => setFormData({...formData, class_id: e.target.value})}
            required
            style={{
              padding: '12px',
              background: 'rgba(30, 41, 59, 0.8)',
              color: 'white',
              border: '1px solid rgba(71, 85, 105, 0.4)',
              borderRadius: 8,
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
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 20px',
                background: 'rgba(71, 85, 105, 0.4)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Send Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}