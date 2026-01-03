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
      if (res.data.results) {
        res.data.results.forEach(record => {
          attendanceData[record.student] = record.status
        })
      }
      setAttendance(attendanceData)
    } catch (err) {
      console.error('Failed to load attendance:', err)
      console.log('Error details:', err.response?.data)
      // Initialize empty attendance if no records exist
      setAttendance({})
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
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: isMobile ? '20px 12px' : '24px 20px',
      paddingTop: isMobile ? '100px' : '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '16px',
          padding: isMobile ? '20px 16px' : '24px',
          marginBottom: '24px',
          border: '1px solid rgba(71, 85, 105, 0.3)'
        }}>
          <h1 style={{
            margin: '0 0 16px 0',
            fontSize: isMobile ? '20px' : '24px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaUserCheck style={{ color: '#10b981' }} />
            Daily Attendance
          </h1>
          
          {classInfo && (
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '16px' }}>
              {classInfo.level_display || classInfo.level} {classInfo.section} • {students.length} Students
            </p>
          )}
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            color: '#fca5a5'
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            color: '#86efac'
          }}>
            {message}
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
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Select Date
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
                border: '1px solid rgba(71, 85, 105, 0.3)',
                background: 'rgba(30, 41, 59, 0.8)',
                color: 'white',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: 'white', fontSize: '16px' }}>
              Today's Summary
            </h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                  {stats.present}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Present</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                  {stats.absent}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Absent</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#60a5fa' }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '16px',
          padding: isMobile ? '16px' : '24px',
          border: '1px solid rgba(71, 85, 105, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: 0, color: 'white', fontSize: '18px' }}>
              Mark Attendance
            </h2>
            <button
              onClick={saveAttendance}
              disabled={saving}
              style={{
                background: saving ? '#6b7280' : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaSave size={12} />
              {saving ? 'Saving...' : 'Save Attendance'}
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
                  background: 'rgba(30, 41, 59, 0.8)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                    {student.full_name || `${student.first_name} ${student.last_name}`}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                    ID: {student.student_id || student.id}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => toggleAttendance(student.id)}
                    style={{
                      background: attendance[student.id] === 'present' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(71, 85, 105, 0.3)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
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
                      background: attendance[student.id] === 'absent' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(71, 85, 105, 0.3)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
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
      </div>
    </div>
  )
}