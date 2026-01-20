import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'
import { 
  FaGraduationCap, FaSearch, FaSave, FaCalendarCheck, 
  FaUser, FaEdit, FaCheck, FaSpinner 
} from 'react-icons/fa'

export default function TerminalReports() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [currentTerm, setCurrentTerm] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  
  // School settings for terminal reports
  const [schoolSettings, setSchoolSettings] = useState(null)
  
  // Terminal report data
  const [reportData, setReportData] = useState({
    class_teacher_remarks: '',
    promoted_to: '',
    next_term_begins: '',
    vacation_date: '',
    conduct: 'GOOD',
    attitude: 'GOOD',
    interest: '',
    punctuality: 'GOOD',
    total_attendance: 0,
    days_present: 0,
    days_absent: 0,
    times_late: 0
  })

  const ratingOptions = [
    { value: 'EXCELLENT', label: 'Excellent' },
    { value: 'VERY_GOOD', label: 'Very Good' },
    { value: 'GOOD', label: 'Good' },
    { value: 'SATISFACTORY', label: 'Satisfactory' },
    { value: 'NEEDS_IMPROVEMENT', label: 'Needs Improvement' }
  ]

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedStudent && currentTerm) {
      loadStudentTerminalData()
    }
  }, [selectedStudent, currentTerm])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Get current term, students, and school settings
      const [studentsRes, termsRes, settingsRes] = await Promise.all([
        api.get('/students/'),
        api.get('/schools/terms/'),
        api.get('/schools/settings/')
      ])
      
      let allStudents = studentsRes.data.results || studentsRes.data
      
      // Filter students for teachers
      if (user?.role === 'TEACHER') {
        try {
          const teacherAssignmentsRes = await api.get('/teachers/assignments/')
          const teacherAssignments = teacherAssignmentsRes.data.results || teacherAssignmentsRes.data || []
          const assignedClassIds = [...new Set(teacherAssignments.map(a => a.class?.id).filter(Boolean))]
          
          allStudents = allStudents.filter(student => {
            const studentClassId = student.current_class?.id || student.class_instance || student.class_id
            return assignedClassIds.includes(studentClassId)
          })
        } catch (error) {
          console.error('Error filtering students for teacher:', error)
        }
      }
      
      setStudents(allStudents)
      setSchoolSettings(settingsRes.data)
      
      // Auto-select current term
      const terms = termsRes.data.results || termsRes.data
      const current = terms.find(t => t.is_current)
      if (current) {
        setCurrentTerm(current)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStudentTerminalData = async () => {
    try {
      setAttendanceLoading(true)
      
      // Load existing terminal report data and auto-calculate attendance
      const [behaviorRes, attendanceRes] = await Promise.all([
        api.get(`/students/behaviour/?student_id=${selectedStudent}&term_id=${currentTerm.id}`).catch(() => ({ data: { results: [] } })),
        calculateTotalAttendance(selectedStudent, currentTerm.id)
      ])
      
      const behaviorRecord = (behaviorRes.data.results || behaviorRes.data)[0]
      
      setReportData({
        class_teacher_remarks: behaviorRecord?.class_teacher_remarks || '',
        promoted_to: behaviorRecord?.promoted_to || '',
        next_term_begins: behaviorRecord?.next_term_begins || '',
        vacation_date: behaviorRecord?.vacation_date || '',
        conduct: behaviorRecord?.conduct || 'GOOD',
        attitude: behaviorRecord?.attitude || 'GOOD',
        interest: behaviorRecord?.interest || '',
        punctuality: behaviorRecord?.punctuality || 'GOOD',
        ...attendanceRes
      })
    } catch (error) {
      console.error('Error loading student data:', error)
    } finally {
      setAttendanceLoading(false)
    }
  }

  const calculateTotalAttendance = async (studentId, termId) => {
    try {
      // Try multiple endpoints to get attendance data
      const endpoints = [
        `/students/attendance/?student_id=${studentId}&term_id=${termId}`,
        `/attendance/daily/?student=${studentId}&term=${termId}`,
        `/students/${studentId}/attendance/?term=${termId}`
      ]
      
      let attendanceData = { days_present: 0, days_absent: 0, times_late: 0 }
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint)
          const data = response.data.results || response.data
          
          if (Array.isArray(data) && data.length > 0) {
            // Sum up all attendance records for the term
            attendanceData = data.reduce((acc, record) => ({
              days_present: acc.days_present + (parseInt(record.days_present) || 0),
              days_absent: acc.days_absent + (parseInt(record.days_absent) || 0),
              times_late: acc.times_late + (parseInt(record.times_late) || 0)
            }), { days_present: 0, days_absent: 0, times_late: 0 })
            break
          } else if (data && !Array.isArray(data)) {
            attendanceData = {
              days_present: parseInt(data.days_present) || 0,
              days_absent: parseInt(data.days_absent) || 0,
              times_late: parseInt(data.times_late) || 0
            }
            break
          }
        } catch (error) {
          console.log(`Endpoint ${endpoint} failed, trying next...`)
        }
      }
      
      const totalAttendance = attendanceData.days_present + attendanceData.days_absent
      
      return {
        ...attendanceData,
        total_attendance: totalAttendance
      }
    } catch (error) {
      console.error('Error calculating attendance:', error)
      return { days_present: 0, days_absent: 0, times_late: 0, total_attendance: 0 }
    }
  }

  const handleSave = async () => {
    if (!selectedStudent || !currentTerm) {
      alert('Please select a student')
      return
    }

    try {
      setSaving(true)
      
      // Save terminal report data
      await api.post('/students/behaviour/', {
        student: parseInt(selectedStudent),
        term: parseInt(currentTerm.id),
        class_teacher_remarks: reportData.class_teacher_remarks,
        promoted_to: reportData.promoted_to,
        next_term_begins: reportData.next_term_begins,
        vacation_date: reportData.vacation_date,
        conduct: reportData.conduct,
        attitude: reportData.attitude,
        interest: reportData.interest,
        punctuality: reportData.punctuality
      })
      
      alert('Terminal report saved successfully!')
    } catch (error) {
      console.error('Error saving terminal report:', error)
      alert('Error saving terminal report. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedStudentObj = students.find(s => s.id === parseInt(selectedStudent))

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      padding: '32px 20px',
      paddingTop: '120px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      color: '#1f2937',
      margin: 0,
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: 24,
        background: 'white',
        borderRadius: 20,
        padding: '28px 24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <div style={{
            background: '#7c3aed',
            borderRadius: 12,
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.3)'
          }}>
            <FaGraduationCap size={24} color="white" />
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              color: '#1f2937',
              lineHeight: 1.2
            }}>Terminal Reports</h1>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: 14,
              color: '#6b7280',
              fontWeight: 500
            }}>
              Enter terminal report details for {currentTerm?.name || 'current term'}
            </p>
          </div>
        </div>
        
        {currentTerm && (
          <div style={{
            background: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 600,
            color: '#7c3aed'
          }}>
            Current Term: {currentTerm.name}
          </div>
        )}
      </div>

      {/* Student Selection */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '24px 20px',
        marginBottom: 24,
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#1f2937'
        }}>
          <FaSearch />
          Select Student
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: 16,
          marginBottom: 16
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: 14, 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1f2937'
            }}>
              Search Student
            </label>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                borderRadius: 8,
                fontSize: 14,
                background: 'rgba(255, 255, 255, 0.8)',
                color: '#1f2937'
              }}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: 14, 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1f2937'
            }}>
              Student
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                borderRadius: 8,
                fontSize: 14,
                background: 'rgba(255, 255, 255, 0.8)',
                color: '#1f2937'
              }}
            >
              <option value="">Select Student</option>
              {filteredStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.student_id} - {student.full_name} ({student.class_name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedStudentObj && (
          <div style={{
            padding: '12px',
            background: 'rgba(124, 58, 237, 0.1)',
            borderRadius: 8,
            fontSize: 14,
            border: '1px solid rgba(124, 58, 237, 0.2)',
            color: '#1f2937'
          }}>
            <strong>Selected:</strong> {selectedStudentObj.full_name} - Class: {selectedStudentObj.class_name}
          </div>
        )}
      </div>

      {selectedStudent && currentTerm && (
        <>
          {/* Terminal Report Settings */}
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '24px 20px',
            marginBottom: 24,
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#1f2937'
            }}>
              <FaEdit />
              Terminal Report Configuration
            </h2>
            
            {schoolSettings ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 16,
                padding: '16px',
                background: '#f9fafb',
                borderRadius: 12,
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 14,
                  color: '#374151'
                }}>
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    background: schoolSettings.show_position_in_class ? '#16a34a' : '#d1d5db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {schoolSettings.show_position_in_class ? '✓' : '✗'}
                  </div>
                  <span>Show Positions: {schoolSettings.show_position_in_class ? 'Enabled' : 'Disabled'}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 14,
                  color: '#374151'
                }}>
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    background: schoolSettings.show_student_photos ? '#16a34a' : '#d1d5db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {schoolSettings.show_student_photos ? '✓' : '✗'}
                  </div>
                  <span>Student Photos: {schoolSettings.show_student_photos ? 'Enabled' : 'Disabled'}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 14,
                  color: '#374151'
                }}>
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    background: schoolSettings.class_teacher_signature_required ? '#16a34a' : '#d1d5db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {schoolSettings.class_teacher_signature_required ? '✓' : '✗'}
                  </div>
                  <span>Class Teacher Signature: {schoolSettings.class_teacher_signature_required ? 'Required' : 'Optional'}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 14,
                  color: '#374151'
                }}>
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    background: schoolSettings.show_headteacher_signature ? '#16a34a' : '#d1d5db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {schoolSettings.show_headteacher_signature ? '✓' : '✗'}
                  </div>
                  <span>Head Teacher Signature: {schoolSettings.show_headteacher_signature ? 'Enabled' : 'Disabled'}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 14,
                  color: '#374151'
                }}>
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    background: schoolSettings.show_promotion_on_terminal ? '#16a34a' : '#d1d5db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {schoolSettings.show_promotion_on_terminal ? '✓' : '✗'}
                  </div>
                  <span>Promotion Status: {schoolSettings.show_promotion_on_terminal ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: 14
              }}>
                Loading configuration...
              </div>
            )}
            
            <div style={{
              marginTop: 16,
              padding: '12px 16px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 8,
              fontSize: 13,
              color: '#1e40af'
            }}>
              💡 To modify these settings, go to School Settings → Report Settings
            </div>
          </div>

          {/* Attendance Summary */}
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '24px 20px',
            marginBottom: 24,
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#1f2937'
            }}>
              <FaCalendarCheck />
              Attendance Summary {attendanceLoading && <FaSpinner className="fa-spin" />}
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 16
            }}>
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: 12,
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>
                  {reportData.days_present}
                </div>
                <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                  Days Present
                </div>
              </div>
              
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 12,
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626' }}>
                  {reportData.days_absent}
                </div>
                <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
                  Days Absent
                </div>
              </div>
              
              <div style={{
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                borderRadius: 12,
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706' }}>
                  {reportData.times_late}
                </div>
                <div style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>
                  Times Late
                </div>
              </div>
              
              <div style={{
                background: 'rgba(124, 58, 237, 0.1)',
                border: '1px solid rgba(124, 58, 237, 0.2)',
                borderRadius: 12,
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#7c3aed' }}>
                  {reportData.total_attendance}
                </div>
                <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>
                  Total Days
                </div>
              </div>
            </div>
          </div>

          {/* Behavior & Conduct */}
          <div style={{
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            borderRadius: 16,
            padding: '24px 20px',
            marginBottom: 24,
            border: '1px solid rgba(71, 85, 105, 0.3)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'white'
            }}>
              <FaUser />
              Behavior & Conduct
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 16
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14, 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Conduct
                </label>
                <select
                  value={reportData.conduct}
                  onChange={(e) => setReportData({
                    ...reportData,
                    conduct: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: 8,
                    fontSize: 14,
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white'
                  }}
                >
                  {ratingOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14, 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Attitude
                </label>
                <select
                  value={reportData.attitude}
                  onChange={(e) => setReportData({
                    ...reportData,
                    attitude: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: 8,
                    fontSize: 14,
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white'
                  }}
                >
                  {ratingOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14, 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Punctuality
                </label>
                <select
                  value={reportData.punctuality}
                  onChange={(e) => setReportData({
                    ...reportData,
                    punctuality: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: 8,
                    fontSize: 14,
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white'
                  }}
                >
                  {ratingOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: 14, 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#e2e8f0'
              }}>
                Interest/Hobbies
              </label>
              <input
                type="text"
                placeholder="e.g., Reading, Sports, Music, Art..."
                value={reportData.interest}
                onChange={(e) => setReportData({
                  ...reportData,
                  interest: e.target.value
                })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid rgba(71, 85, 105, 0.4)',
                  borderRadius: 8,
                  fontSize: 14,
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: 'white'
                }}
              />
            </div>
          </div>

          {/* Terminal Report Details */}
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            borderRadius: 16,
            padding: '24px 20px',
            marginBottom: 24,
            boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)'
          }}>
            <h2 style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'white'
            }}>
              <FaGraduationCap />
              Terminal Report Details
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 16
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14, 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: 'white'
                }}>
                  Promoted To
                </label>
                <input
                  type="text"
                  placeholder="e.g., Class 2, JHS 1..."
                  value={reportData.promoted_to}
                  onChange={(e) => setReportData({
                    ...reportData,
                    promoted_to: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 8,
                    fontSize: 14,
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14, 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: 'white'
                }}>
                  Next Term Begins
                </label>
                <input
                  type="date"
                  value={reportData.next_term_begins}
                  onChange={(e) => setReportData({
                    ...reportData,
                    next_term_begins: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 8,
                    fontSize: 14,
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14, 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: 'white'
                }}>
                  Vacation Date
                </label>
                <input
                  type="date"
                  value={reportData.vacation_date}
                  onChange={(e) => setReportData({
                    ...reportData,
                    vacation_date: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 8,
                    fontSize: 14,
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                />
              </div>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: 14, 
                fontWeight: '600', 
                marginBottom: '8px',
                color: 'white'
              }}>
                Class Teacher's Remarks
              </label>
              <textarea
                value={reportData.class_teacher_remarks}
                onChange={(e) => setReportData({
                  ...reportData,
                  class_teacher_remarks: e.target.value
                })}
                placeholder="Enter final remarks for terminal report..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 8,
                  fontSize: 14,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Save Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: saving ? 'rgba(107, 114, 128, 0.5)' : 'linear-gradient(135deg, #16a34a, #15803d)',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                padding: '16px 32px',
                fontSize: 16,
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                margin: '0 auto',
                boxShadow: saving ? 'none' : '0 6px 16px rgba(22, 163, 74, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              {saving ? <FaSpinner className="fa-spin" /> : <FaSave />}
              {saving ? 'Saving Terminal Report...' : 'Save Terminal Report'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}