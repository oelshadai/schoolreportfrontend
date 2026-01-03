import { useState, useEffect } from 'react'
import api from '../utils/api'
import { useAuth } from '../state/AuthContext'
import { FaComments, FaSave, FaUser, FaHeart } from 'react-icons/fa'

export default function TeacherRemarks() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [remarks, setRemarks] = useState({})
  const [terms, setTerms] = useState([])
  const [selectedTermId, setSelectedTermId] = useState('')

  const isMobile = window.innerWidth <= 768

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedClassId) {
      loadStudents()
    }
  }, [selectedClassId])

  useEffect(() => {
    if (selectedClassId && selectedTermId) {
      loadRemarks()
    }
  }, [selectedClassId, selectedTermId])

  const loadInitialData = async () => {
    try {
      const [classesRes, termsRes] = await Promise.all([
        api.get('/schools/classes/'),
        api.get('/schools/terms/')
      ])
      
      const allClasses = classesRes.data.results || classesRes.data
      const allTerms = termsRes.data.results || termsRes.data
      
      // Filter classes for class teachers
      const teacherClasses = allClasses.filter(c => c.class_teacher === user.id)
      setClasses(teacherClasses)
      setTerms(allTerms)
      
      // Auto-select teacher's class if only one
      if (teacherClasses.length === 1) {
        setSelectedClassId(String(teacherClasses[0].id))
      }
      
      // Auto-select current term
      const currentTerm = allTerms.find(t => t.is_current) || allTerms[0]
      if (currentTerm) {
        setSelectedTermId(String(currentTerm.id))
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
      setMessage({ text: 'Failed to load data', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async () => {
    try {
      const response = await api.get(`/students/?class_id=${selectedClassId}`)
      setStudents(response.data.results || response.data)
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const loadRemarks = async () => {
    try {
      const response = await api.get(`/teacher-remarks/?class_id=${selectedClassId}&term_id=${selectedTermId}`)
      const remarksData = response.data.results || response.data
      
      // Convert array to object for easier access
      const remarksObj = {}
      remarksData.forEach(remark => {
        remarksObj[remark.student] = {
          teacher_remarks: remark.teacher_remarks || '',
          student_interests: remark.student_interests || ''
        }
      })
      setRemarks(remarksObj)
    } catch (error) {
      console.error('Error loading remarks:', error)
    }
  }

  const handleRemarkChange = (studentId, field, value) => {
    setRemarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    if (!selectedClassId || !selectedTermId) {
      setMessage({ text: 'Please select class and term', type: 'error' })
      return
    }

    setSaving(true)
    setMessage({ text: '', type: '' })

    try {
      const remarksToSave = Object.entries(remarks).map(([studentId, data]) => ({
        student: parseInt(studentId),
        class_id: parseInt(selectedClassId),
        term_id: parseInt(selectedTermId),
        teacher_remarks: data.teacher_remarks || '',
        student_interests: data.student_interests || ''
      }))

      await api.post('/teacher-remarks/bulk-create/', { remarks: remarksToSave })
      
      setMessage({ text: 'Remarks saved successfully!', type: 'success' })
    } catch (error) {
      console.error('Error saving remarks:', error)
      setMessage({ text: 'Failed to save remarks', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(59, 130, 246, 0.3)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      padding: isMobile ? '20px 12px' : '24px 20px',
      paddingTop: isMobile ? '100px' : '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(16px)',
          borderRadius: 20,
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: isMobile ? 24 : 32,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #a78bfa, #6366f1)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaComments />
            Teacher Remarks
          </h1>
          <p style={{ margin: 0, color: '#94a3b8' }}>
            Add remarks and interests for your students
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div style={{
            padding: '16px 20px',
            marginBottom: '24px',
            background: message.type === 'success' 
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))' 
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
            border: message.type === 'success'
              ? '2px solid rgba(34, 197, 94, 0.3)'
              : '2px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 12,
            color: message.type === 'success' ? '#86efac' : '#fca5a5'
          }}>
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(16px)',
          borderRadius: 16,
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
            gap: '16px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#e2e8f0'
              }}>Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid rgba(71, 85, 105, 0.4)',
                  borderRadius: 8,
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

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#e2e8f0'
              }}>Term</label>
              <select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid rgba(71, 85, 105, 0.4)',
                  borderRadius: 8,
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="">Select Term</option>
                {terms.map(term => (
                  <option key={term.id} value={term.id}>
                    {term.name_display || term.name} {term.is_current && '(Current)'}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !selectedClassId || !selectedTermId}
              style={{
                padding: '12px 20px',
                background: saving || !selectedClassId || !selectedTermId 
                  ? '#6b7280' 
                  : 'linear-gradient(135deg, #059669, #047857)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: '14px',
                fontWeight: 600,
                cursor: saving || !selectedClassId || !selectedTermId ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
            >
              <FaSave />
              {saving ? 'Saving...' : 'Save All'}
            </button>
          </div>
        </div>

        {/* Students List */}
        {selectedClassId && selectedTermId && students.length > 0 && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(16px)',
            borderRadius: 16,
            padding: '20px',
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: 18,
              fontWeight: 600,
              color: '#e2e8f0'
            }}>
              Student Remarks ({students.length} students)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    marginBottom: '16px'
                  }}>
                    <FaUser style={{ color: '#60a5fa' }} />
                    <h4 style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#e2e8f0'
                    }}>
                      {student.full_name}
                    </h4>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#e2e8f0'
                      }}>
                        <FaComments size={12} />
                        Teacher's Remarks
                      </label>
                      <textarea
                        value={remarks[student.id]?.teacher_remarks || ''}
                        onChange={(e) => handleRemarkChange(student.id, 'teacher_remarks', e.target.value)}
                        placeholder="Enter your remarks about this student's performance, behavior, etc."
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid rgba(71, 85, 105, 0.4)',
                          borderRadius: 8,
                          background: 'rgba(15, 23, 42, 0.8)',
                          color: 'white',
                          fontSize: '14px',
                          resize: 'vertical',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#e2e8f0'
                      }}>
                        <FaHeart size={12} />
                        Student's Interests
                      </label>
                      <textarea
                        value={remarks[student.id]?.student_interests || ''}
                        onChange={(e) => handleRemarkChange(student.id, 'student_interests', e.target.value)}
                        placeholder="Enter student's interests, hobbies, talents, etc."
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid rgba(71, 85, 105, 0.4)',
                          borderRadius: 8,
                          background: 'rgba(15, 23, 42, 0.8)',
                          color: 'white',
                          fontSize: '14px',
                          resize: 'vertical',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedClassId && selectedTermId && students.length === 0 && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(16px)',
            borderRadius: 16,
            padding: '40px',
            textAlign: 'center',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            color: '#94a3b8'
          }}>
            No students found for the selected class.
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}