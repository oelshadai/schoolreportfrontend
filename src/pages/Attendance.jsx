import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'
import { FaUserCheck, FaUserTimes, FaSave, FaCalendarAlt, FaUsers, FaChartBar, FaFilePdf, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

export default function Attendance() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [attendance, setAttendance] = useState({})
  const [attendanceData, setAttendanceData] = useState([])
  const [totalStats, setTotalStats] = useState({ total: 0, present: 0, absent: 0 })
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [classInfo, setClassInfo] = useState(null)
  const [isMobile] = useState(window.innerWidth <= 768)
  const [showReports, setShowReports] = useState(false)
  const [reportType, setReportType] = useState('daily')
  const [reportData, setReportData] = useState(null)
  const [quickActions, setQuickActions] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadClasses()
    if (user?.role === 'TEACHER') {
      loadClassStudents()
    }
    
    // Clean up old attendance data from localStorage
    cleanupOldAttendanceData()
  }, [user])

  useEffect(() => {
    if (selectedClass) {
      if (user?.role === 'ADMIN' || user?.role === 'PRINCIPAL') {
        loadAttendanceReport()
      } else {
        loadStudentsForClass(selectedClass)
      }
    }
  }, [selectedDate, selectedClass, user])

  // Load attendance after students are loaded
  useEffect(() => {
    if (students.length > 0 && selectedClass && user?.role === 'TEACHER') {
      loadAttendance()
    }
  }, [students, selectedClass, selectedDate, user])

  // Save attendance to localStorage whenever it changes
  useEffect(() => {
    if (selectedClass && selectedDate && Object.keys(attendance).length > 0) {
      const storageKey = `attendance_${selectedClass}_${selectedDate}`
      localStorage.setItem(storageKey, JSON.stringify(attendance))
      console.log('Saved attendance to localStorage:', storageKey, attendance)
      
      // Dispatch event to update dashboard immediately
      window.dispatchEvent(new CustomEvent('attendanceUpdated'))
    }
  }, [attendance, selectedClass, selectedDate])

  const loadClasses = async () => {
    try {
      setLoading(true)
      console.log('Loading classes...')
      const response = await api.get('/schools/classes/')
      console.log('Classes response:', response.data)
      
      const classList = response.data.results || response.data || []
      console.log('Parsed classes:', classList)
      setClasses(classList)
      
      // Auto-select first class if available and user is admin
      if (classList.length > 0 && !selectedClass && (user?.role === 'ADMIN' || user?.role === 'PRINCIPAL')) {
        setSelectedClass(classList[0].id)
      }
    } catch (err) {
      console.error('Error loading classes:', err)
      setError('Failed to load classes. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const loadStudentsForClass = async (classId) => {
    if (!classId) return
    
    try {
      setLoading(true)
      const response = await api.get(`/students/?class_id=${classId}`)
      const studentsList = response.data.results || response.data || []
      setStudents(studentsList)
    } catch (err) {
      console.error('Error loading students:', err)
      setError('Failed to load students for selected class')
    } finally {
      setLoading(false)
    }
  }

  const handleClassChange = (classId) => {
    setSelectedClass(classId)
    setAttendance({})
    setAttendanceData([]) // Clear previous data
    setTotalStats({ total: 0, present: 0, absent: 0 })
  }

  const cleanupOldAttendanceData = () => {
    const today = new Date().toISOString().split('T')[0]
    const keysToRemove = []
    
    // Check all localStorage keys for old attendance data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('attendance_')) {
        const datePart = key.split('_').pop()
        if (datePart && datePart !== today) {
          keysToRemove.push(key)
        }
      }
    }
    
    // Remove old attendance data
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log('Removed old attendance data:', key)
    })
  }

  const loadClassStudents = async () => {
    try {
      setLoading(true)
      
      console.log('Loading teacher assignments...')
      
      // Get teacher's assigned classes
      const assignmentsRes = await api.get('/teachers/assignments/')
      const assignments = assignmentsRes.data.results || assignmentsRes.data || []
      
      console.log('Teacher assignments:', assignments)
      
      // Find form class assignment
      const formClassAssignment = assignments.find(assignment => 
        assignment.type === 'form_class'
      )
      
      if (!formClassAssignment) {
        console.log('No form class assignment found')
        setError('You are not assigned as a form teacher')
        return
      }
      
      console.log('Form class assignment:', formClassAssignment)
      setClassInfo(formClassAssignment.class)
      
      // Set the class in classes array and select it
      setClasses([formClassAssignment.class])
      setSelectedClass(formClassAssignment.class.id)
      
      // Get students in this class
      console.log('Loading students for class:', formClassAssignment.class.id)
      const studentsRes = await api.get(`/students/?class_id=${formClassAssignment.class.id}`)
      const studentsList = studentsRes.data.results || studentsRes.data || []
      
      console.log('Students loaded:', studentsList)
      setStudents(studentsList)
      
    } catch (err) {
      console.error('Error loading class students:', err)
      console.error('Error details:', err.response?.data)
      setError(`Failed to load class data: ${err.response?.data?.detail || err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadAttendanceReport = async () => {
    if (!selectedClass) return
    
    try {
      setLoading(true)
      const response = await api.get(`/students/attendance/?class_id=${selectedClass}&date=${selectedDate}`)
      const records = response.data.results || response.data || []
      
      // Get all students for the class
      const studentsResponse = await api.get(`/students/?class_id=${selectedClass}`)
      const allStudents = studentsResponse.data.results || studentsResponse.data || []
      
      // Create attendance report data
      const reportData = allStudents.map(student => {
        const attendanceRecord = records.find(r => r.student_id === student.id || r.student === student.id)
        return {
          id: student.id,
          name: student.name || student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          student_id: student.student_id || student.id,
          status: attendanceRecord?.status || 'absent'
        }
      })
      
      setAttendanceData(reportData)
      
      // Calculate stats
      const present = reportData.filter(s => s.status === 'present').length
      const total = reportData.length
      setTotalStats({ total, present, absent: total - present })
      
    } catch (err) {
      console.error('Error loading attendance report:', err)
      setError('Failed to load attendance report')
    } finally {
      setLoading(false)
    }
  }

  const loadAttendance = async () => {
    if (!selectedClass || user?.role === 'ADMIN' || user?.role === 'PRINCIPAL') return
    
    // First, try to load from localStorage for today's date
    const storageKey = `attendance_${selectedClass}_${selectedDate}`
    const today = new Date().toISOString().split('T')[0]
    
    // If it's today's date, check localStorage first
    if (selectedDate === today) {
      const savedAttendance = localStorage.getItem(storageKey)
      if (savedAttendance) {
        try {
          const parsedAttendance = JSON.parse(savedAttendance)
          console.log('Loaded attendance from localStorage:', parsedAttendance)
          setAttendance(parsedAttendance)
          return // Use localStorage data and skip API call
        } catch (e) {
          console.error('Error parsing saved attendance:', e)
          localStorage.removeItem(storageKey) // Remove corrupted data
        }
      }
    }
    
    // If not today or no localStorage data, try API
    try {
      console.log('Loading attendance for class:', selectedClass, 'date:', selectedDate)
      const response = await api.get(`/students/attendance/?class_id=${selectedClass}&date=${selectedDate}`)
      console.log('Attendance API response:', response.data)
      
      const records = response.data.results || response.data || []
      console.log('Attendance records found:', records)
      
      // Convert to attendance object format
      const attendanceObj = {}
      
      // First, set all students to unmarked (null) by default
      students.forEach(student => {
        attendanceObj[student.id] = null
      })
      
      // Then update with actual attendance records
      records.forEach(record => {
        console.log('Processing record:', record)
        const studentId = record.student_id || record.student?.id || record.student
        if (studentId) {
          attendanceObj[studentId] = record.status
          console.log(`Set student ${studentId} to ${record.status}`)
        }
      })
      
      console.log('Final attendance object:', attendanceObj)
      setAttendance(attendanceObj)
    } catch (err) {
      console.error('Error loading attendance:', err)
      
      // If it's a 404, that just means no attendance data exists yet - this is normal
      if (err.response?.status === 404) {
        console.log('No attendance data found (404) - this is normal for unmarked attendance')
        // Initialize with default unmarked status for all students
        const defaultAttendance = {}
        students.forEach(student => {
          defaultAttendance[student.id] = null
        })
        setAttendance(defaultAttendance)
      } else {
        console.error('Unexpected error loading attendance:', err.response?.data)
        // For other errors, still initialize with unmarked status
        const defaultAttendance = {}
        students.forEach(student => {
          defaultAttendance[student.id] = null
        })
        setAttendance(defaultAttendance)
      }
    }
  }

  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }))
  }

  const markAllPresent = () => {
    const newAttendance = {}
    students.forEach(student => {
      newAttendance[student.id] = 'present'
    })
    setAttendance(newAttendance)
  }

  const markAllAbsent = () => {
    const newAttendance = {}
    students.forEach(student => {
      newAttendance[student.id] = 'absent'
    })
    setAttendance(newAttendance)
  }

  const saveAttendance = async () => {
    try {
      setSaving(true)
      setError('')
      
      // Validate required data
      if (!selectedClass) {
        setError('Please select a class first.')
        return
      }
      
      if (students.length === 0) {
        setError('No students found to save attendance for.')
        return
      }
      
      const attendanceRecords = students
        .filter(student => attendance[student.id] !== null && attendance[student.id] !== undefined)
        .map(student => ({
          student: student.id,
          class_instance: selectedClass,
          date: selectedDate,
          status: attendance[student.id]
        }))

      console.log('Saving attendance records:', attendanceRecords)
      
      // Use the correct bulk attendance endpoint
      const response = await api.post('/students/attendance/bulk/', {
        records: attendanceRecords
      })
      
      console.log('Save response:', response.data)
      
      setMessage('Attendance saved successfully!')
      setTimeout(() => setMessage(''), 3000)
      
      // Don't reload attendance since we already have the current state
      // The attendance state should remain as is after saving
      
      // Dispatch event to update dashboard
      window.dispatchEvent(new CustomEvent('attendanceUpdated'))
      
    } catch (err) {
      console.error('Failed to save attendance:', err)
      console.error('Error details:', err.response?.data)
      
      let errorMessage = 'Failed to save attendance'
      
      if (err.response?.status === 404) {
        errorMessage = 'Attendance endpoint not found. Please check if the backend server is running.'
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.'
      } else if (err.response?.status === 403) {
        errorMessage = 'Permission denied. You may not have access to save attendance for this class.'
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const generateReport = async () => {
    try {
      setLoading(true)
      const params = {
        class_id: selectedClass,
        report_type: reportType,
        date: selectedDate
      }
      
      if (reportType === 'weekly') {
        const date = new Date(selectedDate)
        const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()))
        params.start_date = startOfWeek.toISOString().split('T')[0]
        params.end_date = selectedDate
      } else if (reportType === 'monthly') {
        const date = new Date(selectedDate)
        params.start_date = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
        params.end_date = selectedDate
      }
      
      const res = await api.get('/students/attendance/report/', { params })
      setReportData(res.data)
    } catch (err) {
      console.error('Failed to generate report:', err)
      setError('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    try {
      const printContent = `
        <h2>Daily Attendance Report</h2>
        <p><strong>Class:</strong> ${classes.find(c => c.id == selectedClass)?.name || 'N/A'}</p>
        <p><strong>Date:</strong> ${selectedDate}</p>
        <p><strong>Present:</strong> ${stats.present} | <strong>Absent:</strong> ${stats.absent}</p>
        <table border="1" style="width:100%; border-collapse: collapse;">
          <tr><th>Student Name</th><th>Status</th></tr>
          ${students.map(student => `
            <tr>
              <td>${student.name || student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim()}</td>
              <td>${attendance[student.id] === 'present' ? 'Present' : 'Absent'}</td>
            </tr>
          `).join('')}
        </table>
      `
      
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head><title>Attendance Report</title></head>
          <body>${printContent}</body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
      
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      setError('Failed to generate PDF report')
    }
  }

  const getAttendanceStats = () => {
    const total = students.length
    const present = Object.values(attendance).filter(status => status === 'present').length
    const absent = Object.values(attendance).filter(status => status === 'absent').length
    const unmarked = total - present - absent
    
    console.log('Attendance stats calculated:', {
      total,
      present,
      absent,
      unmarked,
      attendanceObject: attendance
    })
    
    return { total, present, absent, unmarked }
  }

  const filteredStudents = students.filter(student => {
    const name = (student.name || student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim()).toLowerCase()
    const matchesSearch = name.includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || attendance[student.id] === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = getAttendanceStats()

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
        Loading attendance...
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#f8fafc',
      paddingTop: '160px',
      paddingLeft: '20px',
      paddingRight: '20px',
      paddingBottom: '40px',
      overflowX: 'hidden'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              background: '#16a34a',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaUserCheck size={20} color="white" />
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: isMobile ? '20px' : '24px',
                color: '#1f2937',
                fontWeight: '700'
              }}>
                {user?.role === 'ADMIN' || user?.role === 'PRINCIPAL' ? 'Attendance Reports' : 'Daily Attendance'}
              </h1>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                {user?.role === 'ADMIN' || user?.role === 'PRINCIPAL' ? 'View attendance reports by class and date' : 'Mark student attendance for today'}
              </p>
            </div>
          </div>
          
          {(user?.role === 'ADMIN' || user?.role === 'PRINCIPAL') && (
            <div style={{
              background: '#f0f9ff',
              borderRadius: '8px',
              padding: '12px 16px',
              border: '1px solid #bae6fd',
              marginBottom: '12px'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#0369a1',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                📚 Select Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #bae6fd',
                  background: 'white',
                  color: '#0369a1',
                  fontSize: '14px'
                }}
              >
                <option value="">Select a class...</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name || `${cls.level} ${cls.section || ''}`.trim()}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {classInfo && (
            <div style={{
              background: '#f0f9ff',
              borderRadius: '8px',
              padding: '12px 16px',
              border: '1px solid #bae6fd'
            }}>
              <p style={{ margin: 0, color: '#0369a1', fontSize: '14px', fontWeight: '600' }}>
                📚 {classInfo.name} • {students.length} Students
              </p>
            </div>
          )}
          
          {(user?.role === 'ADMIN' || user?.role === 'PRINCIPAL') && selectedClass && (
            <div style={{
              background: '#f0f9ff',
              borderRadius: '8px',
              padding: '12px 16px',
              border: '1px solid #bae6fd'
            }}>
              <p style={{ margin: 0, color: '#0369a1', fontSize: '14px', fontWeight: '600' }}>
                📚 {classes.find(c => c.id == selectedClass)?.name || 'Selected Class'} • {students.length} Students
              </p>
            </div>
          )}
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            color: '#dc2626'
          }}>
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            color: '#16a34a'
          }}>
            ✓ {message}
          </div>
        )}

        {/* Date Selector & Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              📅 Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                background: 'white',
                color: '#374151',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px', fontWeight: '600' }}>
              📊 Attendance Summary
            </h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
                  {user?.role === 'ADMIN' || user?.role === 'PRINCIPAL' ? totalStats.present : stats.present}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Present</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                  {user?.role === 'ADMIN' || user?.role === 'PRINCIPAL' ? totalStats.absent : stats.absent}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Absent</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                  {user?.role === 'ADMIN' || user?.role === 'PRINCIPAL' ? totalStats.total : stats.total}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Total</div>
              </div>
              {user?.role === 'TEACHER' && stats.unmarked > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                    {stats.unmarked}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Unmarked</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Report View */}
        {(user?.role === 'ADMIN' || user?.role === 'PRINCIPAL') && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '18px', fontWeight: '600' }}>
              📊 Attendance Report ({attendanceData.length} students)
            </h2>
            
            {attendanceData.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280'
              }}>
                <FaUsers size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>No attendance data found for selected class and date.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        borderBottom: '2px solid #e5e7eb',
                        fontWeight: '600',
                        color: '#374151'
                      }}>#</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        borderBottom: '2px solid #e5e7eb',
                        fontWeight: '600',
                        color: '#374151'
                      }}>Student Name</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        borderBottom: '2px solid #e5e7eb',
                        fontWeight: '600',
                        color: '#374151'
                      }}>Student ID</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'center',
                        borderBottom: '2px solid #e5e7eb',
                        fontWeight: '600',
                        color: '#374151'
                      }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((student, index) => (
                      <tr key={student.id} style={{
                        borderBottom: '1px solid #f3f4f6',
                        '&:hover': { background: '#f9fafb' }
                      }}>
                        <td style={{
                          padding: '12px',
                          color: '#6b7280'
                        }}>{index + 1}</td>
                        <td style={{
                          padding: '12px',
                          color: '#1f2937',
                          fontWeight: '500'
                        }}>{student.name}</td>
                        <td style={{
                          padding: '12px',
                          color: '#6b7280'
                        }}>{student.student_id}</td>
                        <td style={{
                          padding: '12px',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: student.status === 'present' ? '#dcfce7' : '#fee2e2',
                            color: student.status === 'present' ? '#166534' : '#dc2626'
                          }}>
                            {student.status === 'present' ? '✓ Present' : '✗ Absent'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Teacher Attendance Marking */}
        {user?.role === 'TEACHER' && (
          <>
            {/* Quick Actions & Search */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <h3 style={{ margin: 0, color: '#374151', fontSize: '16px', fontWeight: '600' }}>
                  ⚡ Quick Actions
                </h3>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <button
                  onClick={markAllPresent}
                  style={{
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <FaCheckCircle size={14} />
                  Mark All Present
                </button>
                
                <button
                  onClick={markAllAbsent}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <FaTimesCircle size={14} />
                  Mark All Absent
                </button>
              </div>
              
              {/* Search and Filter */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
                gap: '12px'
              }}>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    color: '#374151',
                    fontSize: '14px'
                  }}
                />
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    color: '#374151',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">All Students</option>
                  <option value="present">Present Only</option>
                  <option value="absent">Absent Only</option>
                </select>
              </div>
            </div>

            {/* Student List */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <h2 style={{ margin: 0, color: '#374151', fontSize: '18px', fontWeight: '600' }}>
                  📋 Mark Attendance ({filteredStudents.length} students)
                </h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={saveAttendance}
                    disabled={saving}
                    style={{
                      background: saving ? '#9ca3af' : '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: saving ? 0.6 : 1
                    }}
                  >
                    <FaSave size={14} />
                    {saving ? 'Saving...' : 'Save Attendance'}
                  </button>
                  
                  <button
                    onClick={downloadPDF}
                    style={{
                      background: '#dc2626',
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
                    <FaFilePdf size={14} />
                    PDF
                  </button>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280'
                }}>
                  <FaUsers size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p>No students found matching your search criteria.</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '12px'
                }}>
                  {filteredStudents.map((student, index) => {
                    const attendanceStatus = attendance[student.id]
                    const isPresent = attendanceStatus === 'present'
                    const isAbsent = attendanceStatus === 'absent'
                    const isUnmarked = attendanceStatus === null || attendanceStatus === undefined
                    
                    return (
                      <div
                        key={student.id}
                        style={{
                          background: isPresent ? '#f0fdf4' : isAbsent ? '#fef2f2' : '#f8fafc',
                          borderRadius: '12px',
                          padding: '16px',
                          border: `2px solid ${isPresent ? '#bbf7d0' : isAbsent ? '#fecaca' : '#e5e7eb'}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px'
                          }}>
                            <span style={{
                              background: isPresent ? '#16a34a' : isAbsent ? '#dc2626' : '#6b7280',
                              color: 'white',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {index + 1}
                            </span>
                            <div style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
                              {student.name || student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim()}
                            </div>
                            {isUnmarked && (
                              <span style={{
                                background: '#f59e0b',
                                color: 'white',
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: '600'
                              }}>
                                Not Marked
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '12px', marginLeft: '32px' }}>
                            ID: {student.student_id || student.id}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => setAttendance(prev => ({ ...prev, [student.id]: 'present' }))}
                            style={{
                              background: attendanceStatus === 'present' ? '#16a34a' : '#f3f4f6',
                              color: attendanceStatus === 'present' ? 'white' : '#6b7280',
                              border: attendanceStatus === 'present' ? 'none' : '1px solid #d1d5db',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              minWidth: '70px',
                              justifyContent: 'center'
                            }}
                          >
                            <FaUserCheck size={12} />
                            P
                          </button>
                          
                          <button
                            onClick={() => setAttendance(prev => ({ ...prev, [student.id]: 'absent' }))}
                            style={{
                              background: attendanceStatus === 'absent' ? '#dc2626' : '#f3f4f6',
                              color: attendanceStatus === 'absent' ? 'white' : '#6b7280',
                              border: attendanceStatus === 'absent' ? 'none' : '1px solid #d1d5db',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              minWidth: '70px',
                              justifyContent: 'center'
                            }}
                          >
                            <FaUserTimes size={12} />
                            A
                          </button>
                        </div>
                      </div>
                    )
                  })}}
                </div>
              )}
            </div>
          </>
        )}

        {/* Reports Section */}
        {showReports && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            marginTop: '24px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '18px', fontWeight: '600' }}>
              📊 Attendance Reports
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '20px'
            }}>
              {['daily', 'weekly', 'monthly'].map(type => (
                <button
                  key={type}
                  onClick={() => setReportType(type)}
                  style={{
                    background: reportType === type ? '#16a34a' : '#f3f4f6',
                    color: reportType === type ? 'white' : '#6b7280',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}
                >
                  {type} Report
                </button>
              ))}
            </div>
            
            <button
              onClick={generateReport}
              disabled={loading}
              style={{
                background: loading ? '#9ca3af' : '#3b82f6',
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
                marginBottom: '20px'
              }}
            >
              <FaChartBar size={14} />
              {loading ? 'Generating...' : `Generate ${reportType} Report`}
            </button>
            
            {reportData && (
              <div style={{
                background: '#f9fafb',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>
                  {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Attendance Summary
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>
                      {reportData.total_present || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Present</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
                      {reportData.total_absent || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Absent</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
                      {reportData.attendance_rate || 0}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Attendance Rate</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}