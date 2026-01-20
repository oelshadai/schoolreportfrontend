import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaClock, FaBookOpen,
  FaUsers, FaSave, FaTimes, FaCheck
} from 'react-icons/fa'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'

export default function TeacherSchedule() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teacherData, setTeacherData] = useState(null)
  const [isFormTeacher, setIsFormTeacher] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [formData, setFormData] = useState({
    class_id: '',
    subject: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    room: '',
    description: ''
  })

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Check if teacher is a form teacher
      const teacherAssignmentsRes = await api.get('/teachers/assignments/').catch(() => ({ data: [] }))
      const assignments = Array.isArray(teacherAssignmentsRes.data) ? teacherAssignmentsRes.data : teacherAssignmentsRes.data.results || []
      const formTeacherAssignment = assignments.find(a => a.type === 'form_class')
      
      setIsFormTeacher(!!formTeacherAssignment)
      setTeacherData(formTeacherAssignment)
      
      if (formTeacherAssignment) {
        // Load existing schedules from localStorage
        const savedSchedules = localStorage.getItem(`schedules_class_${formTeacherAssignment.class?.id}`)
        const scheduleData = savedSchedules ? JSON.parse(savedSchedules) : []
        setSchedules(scheduleData)
        
        // Set default class in form
        setFormData(prev => ({ ...prev, class_id: formTeacherAssignment.class?.id || '' }))
      }

      // Load classes (for form teachers only)
      if (formTeacherAssignment) {
        setClasses([formTeacherAssignment.class])
      }

      // Load subjects
      const subjectsRes = await api.get('/schools/subjects/').catch(() => ({ data: [] }))
      setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : subjectsRes.data.results || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const scheduleData = {
        ...formData,
        teacher: user.id,
        id: editingSchedule ? editingSchedule.id : Date.now() // Use timestamp as ID for new schedules
      }

      // Get existing schedules from localStorage
      const savedSchedules = localStorage.getItem(`schedules_class_${formData.class_id}`)
      let schedulesList = savedSchedules ? JSON.parse(savedSchedules) : []

      if (editingSchedule) {
        // Update existing schedule
        schedulesList = schedulesList.map(s => s.id === editingSchedule.id ? scheduleData : s)
      } else {
        // Add new schedule
        schedulesList.push(scheduleData)
      }

      // Save to localStorage
      localStorage.setItem(`schedules_class_${formData.class_id}`, JSON.stringify(schedulesList))

      // Dispatch event to update student schedules
      window.dispatchEvent(new CustomEvent('scheduleUpdated'))

      await loadData()
      setShowModal(false)
      setEditingSchedule(null)
      setFormData({
        class_id: formData.class_id, // Keep the class_id
        subject: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        room: '',
        description: ''
      })
    } catch (error) {
      console.error('Error saving schedule:', error)
    }
  }

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      class_id: schedule.class_id || '',
      subject: schedule.subject || '',
      day_of_week: schedule.day_of_week || '',
      start_time: schedule.start_time || '',
      end_time: schedule.end_time || '',
      room: schedule.room || '',
      description: schedule.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        // Get existing schedules from localStorage
        const savedSchedules = localStorage.getItem(`schedules_class_${teacherData?.class?.id}`)
        let schedulesList = savedSchedules ? JSON.parse(savedSchedules) : []
        
        // Remove the schedule
        schedulesList = schedulesList.filter(s => s.id !== id)
        
        // Save back to localStorage
        localStorage.setItem(`schedules_class_${teacherData?.class?.id}`, JSON.stringify(schedulesList))
        
        // Dispatch event to update student schedules
        window.dispatchEvent(new CustomEvent('scheduleUpdated'))
        
        await loadData()
      } catch (error) {
        console.error('Error deleting schedule:', error)
      }
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        fontSize: '16px',
        color: '#6b7280'
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
          Loading schedules...
        </div>
      </div>
    )
  }

  // If not a form teacher, show access denied
  if (!isFormTeacher) {
    return (
      <div style={{
        width: '100vw',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
        paddingTop: '100px', // Increased padding for navbar visibility
        padding: '100px 20px 20px 20px',
        margin: 0,
        boxSizing: 'border-box'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '60px 40px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <FaCalendarAlt size={32} color="#dc2626" />
            </div>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#1a202c'
            }}>
              Access Restricted
            </h2>
            <p style={{
              margin: '0 0 24px 0',
              fontSize: '16px',
              color: '#6b7280',
              lineHeight: 1.6
            }}>
              Only <strong>Class Teachers (Form Teachers)</strong> can create and manage class schedules. 
              Subject teachers do not have access to this feature.
            </p>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#9ca3af'
            }}>
              If you believe this is an error, please contact your school administrator.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
      paddingTop: '100px', // Increased padding to ensure navbar is visible
      padding: '100px 20px 20px 20px',
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
            flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaCalendarAlt size={24} color="white" />
              </div>
              <div>
                <h1 style={{
                  fontSize: window.innerWidth <= 480 ? '20px' : '24px',
                  fontWeight: '700',
                  color: '#1a202c',
                  margin: '0 0 4px 0'
                }}>
                  Class Schedule Management
                </h1>
                <p style={{
                  fontSize: '16px',
                  color: '#718096',
                  margin: 0
                }}>
                  Create schedules for your form class: <strong>{teacherData?.class?.name}</strong>
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaPlus size={14} />
              Add Schedule
            </button>
          </div>
        </div>

        {/* Schedule Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {schedules.map(schedule => (
            <div key={schedule.id} style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1a202c',
                    textTransform: 'capitalize'
                  }}>
                    {schedule.day_of_week}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#3ecf8e',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    <FaClock size={12} />
                    {schedule.start_time} - {schedule.end_time}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEdit(schedule)}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <FaEdit size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <FaBookOpen size={12} />
                  Subject: {schedule.subject}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <FaUsers size={12} />
                  Class: {classes.find(c => c.id === schedule.class_id)?.name || 'Unknown'}
                </div>
                {schedule.room && (
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    Room: {schedule.room}
                  </div>
                )}
                {schedule.description && (
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginTop: '8px',
                    padding: '8px',
                    background: '#f8fafc',
                    borderRadius: '6px'
                  }}>
                    {schedule.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {schedules.length === 0 && (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <FaCalendarAlt size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151'
            }}>
              No schedules created yet
            </h3>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '14px'
            }}>
              Create your first class schedule to get started
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
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
                {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingSchedule(null)
                  setFormData({
                    class_id: '',
                    subject: '',
                    day_of_week: '',
                    start_time: '',
                    end_time: '',
                    room: '',
                    description: ''
                  })
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Class
                </label>
                <input
                  type="text"
                  value={teacherData?.class?.name || 'Your Form Class'}
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#f9fafb',
                    color: '#6b7280'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Day of Week
                </label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({...formData, day_of_week: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Day</option>
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Room (Optional)
                </label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <FaSave size={14} />
                  {editingSchedule ? 'Update' : 'Create'} Schedule
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingSchedule(null)
                    setFormData({
                      class_id: '',
                      subject: '',
                      day_of_week: '',
                      start_time: '',
                      end_time: '',
                      room: '',
                      description: ''
                    })
                  }}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}