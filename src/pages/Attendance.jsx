import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'
import { FaUserCheck, FaUserTimes, FaSave, FaCalendarAlt, FaUsers, FaChartBar } from 'react-icons/fa'

export default function Attendance() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
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

  useEffect(() => {
    if (user?.role === 'TEACHER') {
      loadClassStudents()
    }
  }, [user])

  useEffect(() => {
    if (students.length > 0) {
      loadAttendance()
    }
  }, [selectedDate, students])

  const loadClassStudents = async () => {
    try {
      setLoading(true)
      const classRes = await api.get('/schools/classes/')
      const teacherClass = classRes.data.results?.find(c => c.class_teacher === user.id)
      
      if (!teacherClass) {
        setError('You are not assigned as a class teacher')
        return
      }

      setClassInfo(teacherClass)
      
      const studentsRes = await api.get(`/students/?class_id=${teacherClass.id}`)
      setStudents(studentsRes.data.results || [])
    } catch (err) {
      setError('Failed to load class data')
    } finally {
      setLoading(false)
    }
  }

  const loadAttendance = async () => {
    if (!classInfo?.id) {
      console.log('No class info available')
      return
    }
    
    try {
      console.log(`Loading attendance for class ${classInfo.id} on ${selectedDate}`)
      const res = await api.get(`/students/attendance/?class_id=${classInfo.id}&date=${selectedDate}`)
      console.log('Attendance response:', res.data)
      
      const attendanceData = {}
      if (res.data.results && res.data.results.length > 0) {
        res.data.results.forEach(record => {
          attendanceData[record.student] = record.status
        })
      } else {
        // Initialize all students as absent if no records exist
        students.forEach(student => {
          attendanceData[student.id] = 'absent'
        })
      }
      setAttendance(attendanceData)
    } catch (err) {
      console.error('Failed to load attendance:', err)
      // Initialize all students as absent on error
      const attendanceData = {}
      students.forEach(student => {
        attendanceData[student.id] = 'absent'
      })
      setAttendance(attendanceData)
    }
  }

  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }))
  }

  const saveAttendance = async () => {
    try {
      setSaving(true)
      setError('')
      
      const attendanceRecords = students.map(student => ({
        student: student.id,
        class_instance: classInfo.id,
        date: selectedDate,
        status: attendance[student.id] || 'absent'
      }))

      await api.post('/students/attendance/bulk/', { records: attendanceRecords })
      setMessage('Attendance saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const generateReport = async () => {
    try {
      setLoading(true)
      const params = {
        class_id: classInfo.id,
        report_type: reportType
      }
      
      if (reportType === 'daily') {
        params.date = selectedDate
      } else if (reportType === 'weekly') {
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
      setError('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const getAttendanceStats = () => {
    const total = students.length
    const present = Object.values(attendance).filter(status => status === 'present').length
    const absent = total - present
    return { total, present, absent }
  }

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
                Daily Attendance
              </h1>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                Mark student attendance for today
              </p>
            </div>
          </div>
          
          {classInfo && (
            <div style={{
              background: '#f0f9ff',
              borderRadius: '8px',
              padding: '12px 16px',
              border: '1px solid #bae6fd'
            }}>
              <p style={{ margin: 0, color: '#0369a1', fontSize: '14px', fontWeight: '600' }}>
                📚 {classInfo.level_display || classInfo.level} {classInfo.section} • {students.length} Students
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
                  {stats.present}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Present</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                  {stats.absent}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Absent</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Total</div>
              </div>
            </div>
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
              📋 Mark Attendance
            </h2>
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
              onClick={() => setShowReports(!showReports)}
              style={{
                background: '#3b82f6',
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
              <FaChartBar size={14} />
              Reports
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '12px'
          }}>
            {students.map(student => (
              <div
                key={student.id}
                style={{
                  background: '#f9fafb',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
                    {student.full_name || `${student.first_name} ${student.last_name}`}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>
                    ID: {student.student_id || student.id}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => toggleAttendance(student.id)}
                    style={{
                      background: attendance[student.id] === 'present' ? '#16a34a' : '#f3f4f6',
                      color: attendance[student.id] === 'present' ? 'white' : '#6b7280',
                      border: attendance[student.id] === 'present' ? 'none' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaUserCheck size={12} />
                    Present
                  </button>
                  
                  <button
                    onClick={() => setAttendance(prev => ({ ...prev, [student.id]: 'absent' }))}
                    style={{
                      background: attendance[student.id] === 'absent' ? '#dc2626' : '#f3f4f6',
                      color: attendance[student.id] === 'absent' ? 'white' : '#6b7280',
                      border: attendance[student.id] === 'absent' ? 'none' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaUserTimes size={12} />
                    Absent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

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