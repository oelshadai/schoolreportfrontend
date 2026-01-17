import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'
import { FaChartBar, FaCalendarAlt, FaUsers, FaDownload, FaEye } from 'react-icons/fa'

export default function AttendanceAnalytics() {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [attendanceData, setAttendanceData] = useState([])
  const [statistics, setStatistics] = useState({})
  const [loading, setLoading] = useState(false)
  const [isMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      loadAttendanceData()
    }
  }, [selectedClass, selectedMonth])

  const loadClasses = async () => {
    try {
      const res = await api.get('/schools/classes/')
      setClasses(res.data.results || [])
      if (res.data.results?.length > 0) {
        setSelectedClass(res.data.results[0].id.toString())
      }
    } catch (err) {
      console.error('Failed to load classes:', err)
    }
  }

  const loadAttendanceData = async () => {
    try {
      setLoading(true)
      const [attendanceRes, statsRes] = await Promise.all([
        api.get(`/attendance/analytics/?class_id=${selectedClass}&month=${selectedMonth}`),
        api.get(`/attendance/statistics/?class_id=${selectedClass}&month=${selectedMonth}`)
      ])
      
      setAttendanceData(attendanceRes.data.results || [])
      setStatistics(statsRes.data || {})
    } catch (err) {
      console.error('Failed to load attendance data:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportAttendance = async () => {
    try {
      const res = await api.get(`/attendance/export/?class_id=${selectedClass}&month=${selectedMonth}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `attendance_${selectedMonth}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Failed to export attendance:', err)
    }
  }

  const getAttendancePercentage = (present, total) => {
    return total > 0 ? ((present / total) * 100).toFixed(1) : 0
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: isMobile ? '20px 12px' : '24px 20px',
      paddingTop: isMobile ? '100px' : '80px',
      overflow: 'auto'
    }}>
      <div style={{ width: '100%' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: isMobile ? '20px 16px' : '24px',
          marginBottom: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{
            margin: '0 0 16px 0',
            fontSize: isMobile ? '20px' : '24px',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaChartBar style={{ color: '#60a5fa' }} />
            Attendance Analytics
          </h1>
          
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
                color: 'white',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Select Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
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
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.level_display || cls.level} {cls.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Select Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
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

            <button
              onClick={exportAttendance}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
            >
              <FaDownload size={12} />
              Export Excel
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#60a5fa', marginBottom: '8px' }}>
              {statistics.total_students || 0}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>Total Students</div>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
              {getAttendancePercentage(statistics.total_present, statistics.total_possible)}%
            </div>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>Average Attendance</div>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
              {statistics.school_days || 0}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>School Days</div>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444', marginBottom: '8px' }}>
              {statistics.total_absent || 0}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>Total Absences</div>
          </div>
        </div>

        {/* Student Attendance Table */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '16px',
          padding: isMobile ? '16px' : '24px',
          border: '1px solid rgba(71, 85, 105, 0.3)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: 'white', fontSize: '18px' }}>
            Student Attendance Details
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              Loading attendance data...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: isMobile ? '600px' : 'auto'
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: 'white', fontSize: '14px' }}>
                      Student Name
                    </th>
                    <th style={{ padding: '12px', textAlign: 'center', color: 'white', fontSize: '14px' }}>
                      Present Days
                    </th>
                    <th style={{ padding: '12px', textAlign: 'center', color: 'white', fontSize: '14px' }}>
                      Absent Days
                    </th>
                    <th style={{ padding: '12px', textAlign: 'center', color: 'white', fontSize: '14px' }}>
                      Attendance %
                    </th>
                    <th style={{ padding: '12px', textAlign: 'center', color: 'white', fontSize: '14px' }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((student, index) => {
                    const percentage = getAttendancePercentage(student.present_days, student.total_days)
                    const status = percentage >= 75 ? 'Good' : percentage >= 50 ? 'Warning' : 'Critical'
                    const statusColor = percentage >= 75 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444'
                    
                    return (
                      <tr key={student.student_id} style={{
                        borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
                        background: index % 2 === 0 ? 'rgba(30, 41, 59, 0.3)' : 'transparent'
                      }}>
                        <td style={{ padding: '12px', color: 'white', fontSize: '14px' }}>
                          {student.student_name}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#10b981', fontSize: '14px', fontWeight: '600' }}>
                          {student.present_days}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#ef4444', fontSize: '14px', fontWeight: '600' }}>
                          {student.absent_days}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'white', fontSize: '14px', fontWeight: '600' }}>
                          {percentage}%
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            background: `${statusColor}20`,
                            color: statusColor,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}