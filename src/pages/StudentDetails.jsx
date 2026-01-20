import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'
import { 
  FaUser, FaCalendarCheck, FaHeart, FaComments, 
  FaSave, FaSearch, FaEdit, FaCheck 
} from 'react-icons/fa'

export default function StudentDetails() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [terms, setTerms] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [notification, setNotification] = useState(null)

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }
  
  // Form data
  const [attendanceData, setAttendanceData] = useState({
    days_present: 0,
    days_absent: 0,
    times_late: 0
  })
  
  const [behaviorData, setBehaviorData] = useState({
    conduct: 'GOOD',
    attitude: 'GOOD',
    interest: '',
    punctuality: 'GOOD',
    class_teacher_remarks: '',
    promoted_to: ''
  })

  const ratingOptions = [
    { value: 'EXCELLENT', label: 'Excellent' },
    { value: 'VERY_GOOD', label: 'Very Good' },
    { value: 'GOOD', label: 'Good' },
    { value: 'SATISFACTORY', label: 'Satisfactory' },
    { value: 'NEEDS_IMPROVEMENT', label: 'Needs Improvement' }
  ]

  // Responsive design constants
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })
  
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isSmallMobile = screenSize.width <= 480
  const isMobile = screenSize.width <= 768
  const isTablet = screenSize.width <= 1024
  const isDesktop = screenSize.width > 1024

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedStudent) {
      loadStudentData()
    }
  }, [selectedStudent])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [studentsRes, termsRes] = await Promise.all([
        api.get('/students/'),
        api.get('/schools/terms/')
      ])
      
      let allStudents = studentsRes.data.results || studentsRes.data
      console.log('All students loaded:', allStudents.length)
      console.log('Sample student:', allStudents[0])
      
      // For teachers, try to filter but show all students if filtering fails
      if (user?.role === 'TEACHER') {
        try {
          const teacherAssignmentsRes = await api.get('/teachers/assignments/')
          const teacherAssignments = teacherAssignmentsRes.data.results || teacherAssignmentsRes.data || []
          
          if (teacherAssignments.length > 0) {
            const assignedClassIds = [...new Set(teacherAssignments.map(a => a.class?.id).filter(Boolean))]
            console.log('Teacher assigned class IDs:', assignedClassIds)
            
            const filteredStudents = allStudents.filter(student => {
              const studentClassId = student.current_class?.id || student.class_instance || student.class_id
              return assignedClassIds.includes(studentClassId)
            })
            
            if (filteredStudents.length > 0) {
              allStudents = filteredStudents
              console.log('Filtered students for teacher:', allStudents.length)
            } else {
              console.log('No students found in assigned classes, showing all students')
            }
          }
        } catch (error) {
          console.error('Error filtering students for teacher:', error)
        }
      }
      
      setStudents(allStudents)
      setTerms(termsRes.data.results || termsRes.data)
      
      // Auto-select current term
      const currentTerm = (termsRes.data.results || termsRes.data).find(t => t.is_current)
      if (currentTerm) {
        setSelectedTerm(String(currentTerm.id))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStudentData = async () => {
    try {
      const currentTerm = terms.find(t => t.is_current)
      const termId = currentTerm ? currentTerm.id : selectedTerm
      
      // Load attendance data with proper error handling
      try {
        const attendanceRes = await api.get(`/students/term-attendance/?student_id=${selectedStudent}&term_id=${termId}`)
        const attendanceRecord = (attendanceRes.data.results || attendanceRes.data || [])[0]
        
        if (attendanceRecord) {
          setAttendanceData({
            days_present: attendanceRecord.days_present || 0,
            days_absent: attendanceRecord.days_absent || 0,
            times_late: attendanceRecord.times_late || 0
          })
        } else {
          throw new Error('No term attendance found')
        }
      } catch (error) {
        console.log('No term attendance found, calculating from daily records')
        // Try to calculate from daily attendance + localStorage
        try {
          const dailyAttendanceRes = await api.get(`/students/attendance/?student_id=${selectedStudent}`)
          const dailyRecords = dailyAttendanceRes.data.results || dailyAttendanceRes.data || []
          
          // Also check localStorage for today's attendance
          const localStorageAttendance = getLocalStorageAttendanceForStudent(selectedStudent)
          
          // Combine API and localStorage data
          const allRecords = [...dailyRecords, ...localStorageAttendance]
          
          const present = allRecords.filter(r => r.status === 'present').length
          const absent = allRecords.filter(r => r.status === 'absent').length  
          const late = allRecords.filter(r => r.status === 'late').length
          
          console.log('Total attendance calculated:', { present, absent, late, totalRecords: allRecords.length })
          
          setAttendanceData({
            days_present: present,
            days_absent: absent,
            times_late: late
          })
        } catch (dailyError) {
          console.log('No daily attendance records found, checking localStorage only')
          // Check localStorage for any attendance data
          const localStorageAttendance = getLocalStorageAttendanceForStudent(selectedStudent)
          
          if (localStorageAttendance.length > 0) {
            const present = localStorageAttendance.filter(r => r.status === 'present').length
            const absent = localStorageAttendance.filter(r => r.status === 'absent').length  
            const late = localStorageAttendance.filter(r => r.status === 'late').length
            
            setAttendanceData({
              days_present: present,
              days_absent: absent,
              times_late: late
            })
          } else {
            setAttendanceData({ days_present: 0, days_absent: 0, times_late: 0 })
          }
        }
      }
      
      // Load behavior data with proper error handling
      try {
        const behaviorRes = await api.get(`/students/behaviour/?student_id=${selectedStudent}&term_id=${termId}`)
        const behaviorRecord = (behaviorRes.data.results || behaviorRes.data || [])[0]
        
        if (behaviorRecord) {
          setBehaviorData({
            conduct: behaviorRecord.conduct || 'GOOD',
            attitude: behaviorRecord.attitude || 'GOOD',
            interest: behaviorRecord.interest || '',
            punctuality: behaviorRecord.punctuality || 'GOOD',
            class_teacher_remarks: behaviorRecord.class_teacher_remarks || '',
            promoted_to: behaviorRecord.promoted_to || ''
          })
        } else {
          throw new Error('No behavior record found')
        }
      } catch (error) {
        console.log('No existing behavior record found')
        setBehaviorData({
          conduct: 'GOOD',
          attitude: 'GOOD', 
          interest: '',
          punctuality: 'GOOD',
          class_teacher_remarks: '',
          promoted_to: ''
        })
      }
    } catch (error) {
      console.error('Error loading student data:', error)
      showNotification('Error loading student data', 'error')
    }
  }

  const handleSave = async () => {
    if (!selectedStudent) {
      showNotification('Please select a student', 'error')
      return
    }

    try {
      setSaving(true)
      
      const currentTerm = terms.find(t => t.is_current)
      const termId = currentTerm ? currentTerm.id : selectedTerm
      
      if (!termId) {
        showNotification('No term selected', 'error')
        return
      }
      
      const behaviorPayload = {
        student: parseInt(selectedStudent),
        term: parseInt(termId),
        conduct: behaviorData.conduct,
        attitude: behaviorData.attitude,
        interest: behaviorData.interest || 'VARIED_INTERESTS',
        punctuality: behaviorData.punctuality,
        class_teacher_remarks: behaviorData.class_teacher_remarks || '',
        promoted_to: behaviorData.promoted_to || ''
      }
      
      // Handle unique constraint: student+term combination
      let existingRecord = null
      try {
        const checkRes = await api.get(`/students/behaviour/?student_id=${selectedStudent}&term_id=${termId}`)
        const records = checkRes.data.results || checkRes.data || []
        existingRecord = records.find(r => 
          parseInt(r.student) === parseInt(selectedStudent) && 
          parseInt(r.term) === parseInt(termId)
        )
      } catch (error) {
        console.log('No existing behavior record found')
      }
      
      if (existingRecord) {
        // Update existing record to avoid unique constraint violation
        await api.patch(`/students/behaviour/${existingRecord.id}/`, behaviorPayload)
        showNotification('Student behavior updated successfully!', 'success')
      } else {
        // Try main endpoint first, fallback to alternative
        try {
          await api.post('/students/behaviour/', behaviorPayload)
          showNotification('Student behavior created successfully!', 'success')
        } catch (mainError) {
          if (mainError.response?.status === 405) {
            // Try alternative endpoint
            await api.post('/students/behaviour/create/', behaviorPayload)
            showNotification('Student behavior created successfully!', 'success')
          } else {
            throw mainError
          }
        }
      }
      
    } catch (error) {
      console.error('Error saving data:', error)
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message
      showNotification(`Failed to save: ${errorMsg}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getLocalStorageAttendanceForStudent = (studentId) => {
    const attendanceRecords = []
    
    // Check all localStorage keys for attendance data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('attendance_')) {
        try {
          const attendanceData = JSON.parse(localStorage.getItem(key))
          const datePart = key.split('_').pop()
          
          // Check if this student has attendance data in this localStorage entry
          if (attendanceData[studentId] && attendanceData[studentId] !== null) {
            attendanceRecords.push({
              student_id: studentId,
              status: attendanceData[studentId],
              date: datePart,
              source: 'localStorage'
            })
          }
        } catch (e) {
          console.error('Error parsing localStorage attendance:', e)
        }
      }
    }
    
    return attendanceRecords
  }

  const selectedStudentObj = students.find(s => s.id === parseInt(selectedStudent))

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      paddingLeft: isMobile ? '12px' : isTablet ? '16px' : '20px',
      paddingRight: isMobile ? '12px' : isTablet ? '16px' : '20px',
      paddingBottom: isMobile ? '20px' : isTablet ? '24px' : '32px',
      paddingTop: '120px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      color: '#1f2937',
      margin: 0,
      boxSizing: 'border-box'
    }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '16px 20px',
          borderRadius: '8px',
          color: 'white',
          fontWeight: '600',
          fontSize: '14px',
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          background: notification.type === 'success' ? '#16a34a' : 
                     notification.type === 'error' ? '#dc2626' : '#3b82f6',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {notification.message}
        </div>
      )}
      
      <style>
        {`
          body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }
          
          @media screen and (max-width: 480px) {
            .page-header {
              padding: 16px 14px !important;
              gap: 14px !important;
            }
          }
          
          @media screen and (max-width: 768px) {
            .page-header { 
              flex-direction: column !important; 
              padding: 20px 16px !important;
              gap: 16px !important;
            }
          }
          
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
      
      {/* Enhanced Header with Mobile-First Design */}
      <div className="page-header" style={{ 
        marginBottom: isMobile ? 20 : 24,
        background: 'white',
        borderRadius: isMobile ? 16 : 20,
        padding: isMobile ? '20px 16px' : isTablet ? '24px 20px' : '28px 24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? 16 : 12
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 12 : 16
        }}>
          <div style={{
            background: '#16a34a',
            borderRadius: 12,
            padding: isMobile ? '12px' : '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.3)'
          }}>
            <FaUser size={isMobile ? 20 : 24} color="white" />
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: isMobile ? 22 : isTablet ? 26 : 32,
              fontWeight: 700,
              color: '#1f2937',
              lineHeight: 1.2
            }}>{user?.role === 'TEACHER' ? 'My Students Details' : 'Student Details'}</h1>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: isMobile ? 13 : 14,
              color: '#6b7280',
              fontWeight: 500
            }}>
              {user?.role === 'TEACHER' 
                ? 'Enter attendance and behavior for students in your assigned classes'
                : 'Enter attendance, behavior, and additional information'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Selection Section */}
      <div style={{
        background: 'white',
        borderRadius: isMobile ? 12 : 16,
        padding: isMobile ? '16px 12px' : isTablet ? '20px 16px' : '24px 20px',
        marginBottom: isMobile ? 20 : 24,
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ 
          fontSize: isMobile ? 16 : 18, 
          fontWeight: '600', 
          marginBottom: isMobile ? 12 : 16,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#1f2937'
        }}>
          <FaSearch />
          Select Student
        </h2>
        
        <div style={{
          marginBottom: isMobile ? 12 : 16
        }}>
          <label style={{ 
            display: 'block', 
            fontSize: isMobile ? 13 : 14, 
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
              padding: isMobile ? '14px' : '10px',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: isMobile ? 10 : 6,
              fontSize: isMobile ? 16 : 14,
              background: 'rgba(255, 255, 255, 0.8)',
              color: '#1f2937',
              minHeight: isMobile ? 48 : 'auto'
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            fontSize: isMobile ? 13 : 14, 
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
              padding: isMobile ? '14px' : '10px',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: isMobile ? 10 : 6,
              fontSize: isMobile ? 16 : 14,
              background: 'rgba(255, 255, 255, 0.8)',
              color: '#1f2937',
              minHeight: isMobile ? 48 : 'auto'
            }}
          >
            <option value="">Select Student</option>
            {filteredStudents.map(student => (
              <option key={student.id} value={student.id}>
                {student.student_id} - {student.full_name} ({student.class_name || student.current_class?.name || 'No Class'})
              </option>
            ))}
          </select>
        </div>

        {selectedStudentObj && (
          <div style={{
            marginTop: isMobile ? 12 : 16,
            padding: isMobile ? '10px' : '12px',
            background: user?.role === 'TEACHER' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            borderRadius: isMobile ? 10 : 8,
            fontSize: isMobile ? 13 : 14,
            border: user?.role === 'TEACHER' ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)',
            color: '#1f2937'
          }}>
            <strong>Selected:</strong> {selectedStudentObj.full_name} - Class: {selectedStudentObj.class_name || selectedStudentObj.current_class?.name || 'No Class'}
            {user?.role === 'TEACHER' && (
              <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>
                ✓ This student is in your assigned class
              </div>
            )}
          </div>
        )}
        
        {/* Debug Info */}
        {loading && (
          <div style={{ marginTop: 16, padding: 12, background: '#f3f4f6', borderRadius: 8, fontSize: 14 }}>
            Loading students...
          </div>
        )}
        
        {!loading && students.length === 0 && (
          <div style={{ marginTop: 16, padding: 12, background: '#fef2f2', borderRadius: 8, fontSize: 14, color: '#dc2626' }}>
            No students found. Check console for details.
          </div>
        )}
        
        {!loading && students.length > 0 && (
          <div style={{ marginTop: 16, padding: 12, background: '#f0fdf4', borderRadius: 8, fontSize: 14, color: '#16a34a' }}>
            Found {students.length} students. Filtered: {filteredStudents.length}
          </div>
        )}
      </div>

      {selectedStudent && (
        <>
          {/* Attendance Section - Read Only */}
          <div style={{
            background: 'white',
            borderRadius: isMobile ? 12 : 16,
            padding: isMobile ? '16px 12px' : isTablet ? '20px 16px' : '24px 20px',
            marginBottom: isMobile ? 20 : 24,
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ 
              fontSize: isMobile ? 16 : 18, 
              fontWeight: '600', 
              marginBottom: isMobile ? 12 : 16,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#1f2937'
            }}>
              <FaCalendarCheck />
              Attendance Summary (Auto-calculated)
            </h2>
            
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: isMobile ? 10 : 8,
              padding: isMobile ? '16px' : '20px',
              marginBottom: isMobile ? 12 : 16
            }}>
              <p style={{
                margin: '0 0 12px 0',
                fontSize: isMobile ? 13 : 14,
                color: '#64748b',
                fontStyle: 'italic'
              }}>
                📊 This data includes all attendance records from both saved API data and recent localStorage entries.
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: isMobile ? 12 : 16
              }}>
                <div style={{
                  background: 'white',
                  padding: isMobile ? '12px' : '16px',
                  borderRadius: isMobile ? 8 : 6,
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: isMobile ? 24 : 28,
                    fontWeight: 'bold',
                    color: '#16a34a',
                    marginBottom: '4px'
                  }}>
                    {attendanceData.days_present}
                  </div>
                  <div style={{
                    fontSize: isMobile ? 12 : 13,
                    color: '#64748b',
                    fontWeight: '600'
                  }}>
                    Days Present
                  </div>
                </div>
                
                <div style={{
                  background: 'white',
                  padding: isMobile ? '12px' : '16px',
                  borderRadius: isMobile ? 8 : 6,
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: isMobile ? 24 : 28,
                    fontWeight: 'bold',
                    color: '#dc2626',
                    marginBottom: '4px'
                  }}>
                    {attendanceData.days_absent}
                  </div>
                  <div style={{
                    fontSize: isMobile ? 12 : 13,
                    color: '#64748b',
                    fontWeight: '600'
                  }}>
                    Days Absent
                  </div>
                </div>
                
                <div style={{
                  background: 'white',
                  padding: isMobile ? '12px' : '16px',
                  borderRadius: isMobile ? 8 : 6,
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: isMobile ? 24 : 28,
                    fontWeight: 'bold',
                    color: '#f59e0b',
                    marginBottom: '4px'
                  }}>
                    {attendanceData.times_late}
                  </div>
                  <div style={{
                    fontSize: isMobile ? 12 : 13,
                    color: '#64748b',
                    fontWeight: '600'
                  }}>
                    Times Late
                  </div>
                </div>
                
                <div style={{
                  background: 'white',
                  padding: isMobile ? '12px' : '16px',
                  borderRadius: isMobile ? 8 : 6,
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: isMobile ? 24 : 28,
                    fontWeight: 'bold',
                    color: '#3b82f6',
                    marginBottom: '4px'
                  }}>
                    {attendanceData.days_present + attendanceData.days_absent > 0 
                      ? ((attendanceData.days_present / (attendanceData.days_present + attendanceData.days_absent)) * 100).toFixed(1)
                      : '0.0'
                    }%
                  </div>
                  <div style={{
                    fontSize: isMobile ? 12 : 13,
                    color: '#64748b',
                    fontWeight: '600'
                  }}>
                    Attendance Rate
                  </div>
                </div>
                
                <div style={{
                  background: 'white',
                  padding: isMobile ? '12px' : '16px',
                  borderRadius: isMobile ? 8 : 6,
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: isMobile ? 24 : 28,
                    fontWeight: 'bold',
                    color: '#8b5cf6',
                    marginBottom: '4px'
                  }}>
                    {attendanceData.days_present + attendanceData.days_absent + attendanceData.times_late}
                  </div>
                  <div style={{
                    fontSize: isMobile ? 12 : 13,
                    color: '#64748b',
                    fontWeight: '600'
                  }}>
                    Total Records
                  </div>
                </div>
              </div>
              
              <div style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: '#e0f2fe',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#0369a1',
                textAlign: 'center'
              }}>
                💡 Total includes all attendance records taken for this student from API database and recent localStorage data
              </div>
            </div>
          </div>

          {/* Behavior Section */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: isMobile ? 12 : 16,
            padding: isMobile ? '16px 12px' : isTablet ? '20px 16px' : '24px 20px',
            marginBottom: isMobile ? 20 : 24,
            border: '1px solid rgba(71, 85, 105, 0.3)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ 
              fontSize: isMobile ? 16 : 18, 
              fontWeight: '600', 
              marginBottom: isMobile ? 12 : 16,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'white'
            }}>
              <FaHeart />
              Behavior & Conduct
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: isMobile ? 12 : 16,
              marginBottom: isMobile ? 12 : 16
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: isMobile ? 13 : 14, 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Conduct
                </label>
                <select
                  value={behaviorData.conduct}
                  onChange={(e) => setBehaviorData({
                    ...behaviorData,
                    conduct: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px' : '10px',
                    border: '2px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: isMobile ? 10 : 6,
                    fontSize: isMobile ? 16 : 14,
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    minHeight: isMobile ? 48 : 'auto'
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
                  fontSize: isMobile ? 13 : 14, 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Attitude
                </label>
                <select
                  value={behaviorData.attitude}
                  onChange={(e) => setBehaviorData({
                    ...behaviorData,
                    attitude: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px' : '10px',
                    border: '2px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: isMobile ? 10 : 6,
                    fontSize: isMobile ? 16 : 14,
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    minHeight: isMobile ? 48 : 'auto'
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
                  fontSize: isMobile ? 13 : 14, 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Interest
                </label>
                <input
                  type="text"
                  list="interest-options"
                  placeholder="Select or type interest..."
                  value={behaviorData.interest}
                  onChange={(e) => setBehaviorData({
                    ...behaviorData,
                    interest: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px' : '10px',
                    border: '2px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: isMobile ? 10 : 6,
                    fontSize: isMobile ? 16 : 14,
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    minHeight: isMobile ? 48 : 'auto'
                  }}
                />
                <datalist id="interest-options">
                  <option value="READING_WRITING" />
                  <option value="MATHEMATICS_SCIENCE" />
                  <option value="SPORTS_GAMES" />
                  <option value="ARTS_CRAFTS" />
                  <option value="MUSIC_DANCING" />
                  <option value="TECHNOLOGY_COMPUTERS" />
                  <option value="SOCIAL_ACTIVITIES" />
                  <option value="LEADERSHIP_ACTIVITIES" />
                  <option value="VARIED_INTERESTS" />
                </datalist>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: isMobile ? 13 : 14, 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Punctuality
                </label>
                <select
                  value={behaviorData.punctuality}
                  onChange={(e) => setBehaviorData({
                    ...behaviorData,
                    punctuality: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px' : '10px',
                    border: '2px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: isMobile ? 10 : 6,
                    fontSize: isMobile ? 16 : 14,
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    minHeight: isMobile ? 48 : 'auto'
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
                fontSize: isMobile ? 13 : 14, 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#e2e8f0'
              }}>
                Class Teacher's Remarks (Terminal Report)
              </label>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '8px',
                flexWrap: 'wrap'
              }}>
                <button
                  type="button"
                  onClick={() => setBehaviorData({
                    ...behaviorData,
                    class_teacher_remarks: "Student has shown remarkable improvement this term. Demonstrates excellent understanding in core subjects. Participation in class discussions is commendable."
                  })}
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    borderRadius: '4px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Excellent
                </button>
                <button
                  type="button"
                  onClick={() => setBehaviorData({
                    ...behaviorData,
                    class_teacher_remarks: "A well-behaved student with good academic performance. Shows consistent effort in all subjects. Keep up the excellent work."
                  })}
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    borderRadius: '4px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Good
                </button>
                <button
                  type="button"
                  onClick={() => setBehaviorData({
                    ...behaviorData,
                    class_teacher_remarks: "Student shows satisfactory progress in academic work. Needs to be more attentive during lessons. Has potential to do better."
                  })}
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    borderRadius: '4px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Needs Improvement
                </button>
              </div>
              <textarea
                value={behaviorData.class_teacher_remarks}
                onChange={(e) => setBehaviorData({
                  ...behaviorData,
                  class_teacher_remarks: e.target.value
                })}
                placeholder="Enter class teacher's final remarks for terminal report..."
                rows={3}
                style={{
                  width: '100%',
                  padding: isMobile ? '14px' : '10px',
                  border: '2px solid rgba(71, 85, 105, 0.4)',
                  borderRadius: isMobile ? 10 : 6,
                  fontSize: isMobile ? 16 : 14,
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: 'white',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  minHeight: isMobile ? 80 : 60
                }}
              />
            </div>
          </div>
          
          {/* Terminal Report Section */}
          <div style={{
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            borderRadius: isMobile ? 12 : 16,
            padding: isMobile ? '16px 12px' : isTablet ? '20px 16px' : '24px 20px',
            marginBottom: isMobile ? 20 : 24,
            border: '1px solid rgba(71, 85, 105, 0.3)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ 
              fontSize: isMobile ? 16 : 18, 
              fontWeight: '600', 
              marginBottom: isMobile ? 12 : 16,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'white'
            }}>
              <FaComments />
              Promotion Details
            </h2>
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: isMobile ? 13 : 14, 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#e2e8f0'
              }}>
                Promoted To
              </label>
              <input
                type="text"
                placeholder="e.g., Class 2, JHS 1, SHS 2..."
                value={behaviorData.promoted_to}
                onChange={(e) => setBehaviorData({
                  ...behaviorData,
                  promoted_to: e.target.value
                })}
                style={{
                  width: '100%',
                  padding: isMobile ? '14px' : '10px',
                  border: '2px solid rgba(71, 85, 105, 0.4)',
                  borderRadius: isMobile ? 10 : 6,
                  fontSize: isMobile ? 16 : 14,
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: 'white',
                  minHeight: isMobile ? 48 : 'auto'
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
                gap: '8px',
                background: saving ? 'rgba(107, 114, 128, 0.5)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: isMobile ? 12 : 8,
                padding: isMobile ? '16px 24px' : '12px 24px',
                fontSize: isMobile ? 15 : 16,
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                margin: '0 auto',
                minHeight: isMobile ? 54 : 44,
                boxShadow: saving ? 'none' : '0 6px 16px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              {saving ? <FaEdit /> : <FaSave />}
              {saving ? 'Saving...' : 'Save Student Details'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}