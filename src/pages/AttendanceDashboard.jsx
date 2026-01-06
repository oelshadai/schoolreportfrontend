import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'
import { FaCalendarAlt, FaUsers, FaUserCheck, FaUserTimes, FaChartBar, FaEye, FaChalkboardTeacher, FaCalendarWeek, FaDownload } from 'react-icons/fa'

export default function AttendanceDashboard() {
  const { user } = useAuth()
  const [attendanceData, setAttendanceData] = useState([])
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState('')
  const [viewMode, setViewMode] = useState('daily') // daily, weekly, monthly
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMobile] = useState(window.innerWidth <= 768)
  const [showDetails, setShowDetails] = useState(null)

  useEffect(() => {
    loadClasses()
    loadTeachers()
  }, [])

  useEffect(() => {
    if (classes.length > 0) {
      loadAttendanceData()
    }
  }, [selectedDate, selectedClass, classes, viewMode])

  const loadClasses = async () => {
    try {
      const response = await api.get('/schools/classes/')
      setClasses(response.data.results || response.data || [])
    } catch (error) {
      console.error('Error loading classes:', error)
      setError('Failed to load classes')
    }
  }

  const loadTeachers = async () => {
    try {
      const response = await api.get('/teachers/')
      setTeachers(response.data.results || response.data || [])
    } catch (error) {
      console.error('Error loading teachers:', error)
    }
  }

  const loadAttendanceData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = new URLSearchParams({ date: selectedDate })
      if (selectedClass) params.append('class_id', selectedClass)
      
      console.log('Loading attendance with params:', params.toString())
      
      // Try multiple endpoints to find attendance data
      let response
      try {
        response = await api.get(`/students/attendance/?${params}`)
      } catch (error) {
        if (error.response?.status === 404) {
          // Try alternative endpoint
          try {
            response = await api.get(`/attendance/?${params}`)
          } catch (altError) {
            // If both fail, return empty data
            console.log('No attendance data found, using empty dataset')
            setAttendanceData([])
            return
          }
        } else {
          throw error
        }
      }
      
      const attendanceRecords = response.data.results || response.data || []
      
      console.log('Attendance records received:', attendanceRecords)
      
      // Group by class and calculate stats
      const groupedData = {}
      
      classes.forEach(cls => {
        if (!selectedClass || String(cls.id) === selectedClass) {
          const classAttendance = attendanceRecords.filter(record => 
            String(record.class_instance) === String(cls.id)
          )
          
          console.log(`Processing class ${cls.level} ${cls.section}:`, {
            totalRecords: classAttendance.length,
            records: classAttendance.map(r => ({ student: r.student_name, status: r.status }))
          })
          
          const present = classAttendance.filter(record => record.status === 'present').length
          const absent = classAttendance.filter(record => record.status === 'absent').length
          const late = classAttendance.filter(record => record.status === 'late').length
          const total = present + absent + late
          
          console.log(`Class ${cls.level} ${cls.section} stats:`, { present, absent, late, total })
          
          // Find class teacher
          const classTeacher = teachers.find(t => t.id === cls.class_teacher)
          
          groupedData[cls.id] = {
            class: cls,
            teacher: classTeacher,
            present,
            absent,
            late,
            total,
            attendanceRate: total > 0 ? (((present + late) / total) * 100).toFixed(1) : '0.0',
            records: classAttendance,
            lastUpdated: classAttendance.length > 0 ? new Date(Math.max(...classAttendance.map(r => new Date(r.created_at || r.date)))).toLocaleTimeString() : 'Not taken'
          }
        }
      })
      
      console.log('Final grouped data:', groupedData)
      
      setAttendanceData(Object.values(groupedData))
    } catch (error) {
      console.error('Error loading attendance data:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      if (error.response?.status === 404) {
        setError('No attendance data found for the selected date. Please ensure attendance has been recorded.')
        setAttendanceData([])
      } else {
        setError(`Failed to load attendance data: ${error.response?.data?.detail || error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const getTotalStats = () => {
    const totals = attendanceData.reduce((acc, data) => ({
      present: acc.present + data.present,
      absent: acc.absent + data.absent,
      late: acc.late + data.late,
      total: acc.total + data.total,
      classesTaken: acc.classesTaken + (data.total > 0 ? 1 : 0),
      totalClasses: acc.totalClasses + 1
    }), { present: 0, absent: 0, late: 0, total: 0, classesTaken: 0, totalClasses: 0 })
    
    console.log('Total stats calculated:', totals)
    
    return {
      ...totals,
      attendanceRate: totals.total > 0 ? (((totals.present + totals.late) / totals.total) * 100).toFixed(1) : '0.0',
      completionRate: totals.totalClasses > 0 ? ((totals.classesTaken / totals.totalClasses) * 100).toFixed(1) : '0.0'
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Class', 'Teacher', 'Present', 'Late', 'Absent', 'Total', 'Attendance Rate', 'Last Updated'],
      ...attendanceData.map(data => [
        `${data.class.level_display || data.class.level} ${data.class.section}`,
        data.teacher ? `${data.teacher.first_name} ${data.teacher.last_name}` : 'Not Assigned',
        data.present,
        data.late,
        data.absent,
        data.total,
        `${data.attendanceRate}%`,
        data.lastUpdated
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-${selectedDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const totalStats = getTotalStats()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: isMobile ? '20px 12px' : '24px 20px',
      paddingTop: isMobile ? '100px' : '100px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '16px',
          padding: isMobile ? '20px 16px' : '24px',
          marginBottom: '24px',
          border: '1px solid rgba(71, 85, 105, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '16px' : '0'
          }}>
            <div>
              <h1 style={{
                margin: '0 0 8px 0',
                fontSize: isMobile ? '20px' : '24px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <FaChartBar style={{ color: '#10b981' }} />
                Attendance Overview
              </h1>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '16px' }}>
                Monitor daily attendance across all classes
              </p>
            </div>
            
            <button
              onClick={exportData}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaDownload size={12} />
              Export CSV
            </button>
          </div>
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

        {/* Filters */}
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
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Filter by Class
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
                fontSize: '16px'
              }}
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.level_display || cls.level} {cls.section}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr 1fr 1fr',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: isMobile ? '16px' : '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
              {totalStats.present}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Present</div>
          </div>
          
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: isMobile ? '16px' : '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>
              {totalStats.late}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Late</div>
          </div>
          
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: isMobile ? '16px' : '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#ef4444', marginBottom: '4px' }}>
              {totalStats.absent}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Absent</div>
          </div>
          
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: isMobile ? '16px' : '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#60a5fa', marginBottom: '4px' }}>
              {totalStats.total}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total Students</div>
          </div>
          
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: isMobile ? '16px' : '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#22c55e', marginBottom: '4px' }}>
              {totalStats.attendanceRate}%
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Attendance Rate</div>
          </div>
          
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            padding: isMobile ? '16px' : '20px',
            textAlign: 'center',
            gridColumn: isMobile ? 'span 2' : 'auto'
          }}>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '4px' }}>
              {totalStats.classesTaken}/{totalStats.totalClasses}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Classes Taken</div>
          </div>
        </div>

        {/* Class Attendance Table */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '16px',
          padding: isMobile ? '16px' : '24px',
          border: '1px solid rgba(71, 85, 105, 0.3)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: 'white', fontSize: '18px' }}>
            Class Attendance Summary
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              Loading attendance data...
            </div>
          ) : attendanceData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              No attendance data found for the selected date
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              {isMobile ? (
                // Mobile Card View
                <div style={{ display: 'grid', gap: '12px' }}>
                  {attendanceData.map((data) => (
                    <div key={data.class.id} style={{
                      background: 'rgba(30, 41, 59, 0.5)',
                      borderRadius: '12px',
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
                          <h3 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '16px' }}>
                            {data.class.level_display || data.class.level} {data.class.section}
                          </h3>
                          <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaChalkboardTeacher size={10} />
                            {data.teacher ? `${data.teacher.first_name} ${data.teacher.last_name}` : 'No Teacher Assigned'}
                          </p>
                        </div>
                        <span style={{
                          background: data.attendanceRate >= 80 ? 'rgba(16, 185, 129, 0.2)' : data.attendanceRate >= 60 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: data.attendanceRate >= 80 ? '#10b981' : data.attendanceRate >= 60 ? '#fbbf24' : '#ef4444',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {data.attendanceRate}%
                        </span>
                      </div>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr',
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>{data.present}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Present</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>{data.late}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Late</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>{data.absent}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Absent</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#60a5fa' }}>{data.total}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Total</div>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          Updated: {data.lastUpdated}
                        </span>
                        <button
                          onClick={() => setShowDetails(data)}
                          style={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#60a5fa',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FaEye size={10} /> Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop Table View
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(71, 85, 105, 0.3)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#e2e8f0', fontSize: '14px' }}>Class</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#e2e8f0', fontSize: '14px' }}>Teacher</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: '#e2e8f0', fontSize: '14px' }}>Present</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: '#e2e8f0', fontSize: '14px' }}>Late</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: '#e2e8f0', fontSize: '14px' }}>Absent</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: '#e2e8f0', fontSize: '14px' }}>Total</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: '#e2e8f0', fontSize: '14px' }}>Rate</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: '#e2e8f0', fontSize: '14px' }}>Last Updated</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: '#e2e8f0', fontSize: '14px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((data, index) => (
                      <tr key={data.class.id} style={{
                        borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
                        backgroundColor: index % 2 === 0 ? 'rgba(30, 41, 59, 0.3)' : 'transparent'
                      }}>
                        <td style={{ padding: '16px 12px', color: 'white', fontWeight: '500' }}>
                          {data.class.level_display || data.class.level} {data.class.section}
                        </td>
                        <td style={{ padding: '16px 12px', color: '#cbd5e1' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaChalkboardTeacher size={12} style={{ color: '#94a3b8' }} />
                            {data.teacher ? `${data.teacher.first_name} ${data.teacher.last_name}` : 'Not Assigned'}
                          </div>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#10b981',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            {data.present}
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                          <span style={{
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#f59e0b',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            {data.late}
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                          <span style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            {data.absent}
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center', color: '#cbd5e1', fontWeight: '500' }}>
                          {data.total}
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                          <span style={{
                            color: data.attendanceRate >= 80 ? '#10b981' : data.attendanceRate >= 60 ? '#fbbf24' : '#ef4444',
                            fontWeight: '600'
                          }}>
                            {data.attendanceRate}%
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                          {data.lastUpdated}
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                          <button
                            onClick={() => setShowDetails(data)}
                            style={{
                              background: 'rgba(59, 130, 246, 0.2)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: '#60a5fa',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              margin: '0 auto'
                            }}
                          >
                            <FaEye size={12} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetails && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }} onClick={() => setShowDetails(null)}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.95)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: isMobile ? '100%' : '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '18px' }}>
                  {showDetails.class.level_display || showDetails.class.level} {showDetails.class.section} - Details
                </h3>
                <button
                  onClick={() => setShowDetails(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '24px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>

              {showDetails.teacher && (
                <div style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaChalkboardTeacher style={{ color: '#10b981' }} />
                  <span style={{ color: 'white' }}>Teacher: {showDetails.teacher.first_name} {showDetails.teacher.last_name}</span>
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{showDetails.present}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Present</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>{showDetails.late}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Late</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>{showDetails.absent}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Absent</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e' }}>{showDetails.attendanceRate}%</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Rate</div>
                </div>
              </div>

              {showDetails.records.length > 0 ? (
                <div>
                  <h4 style={{ color: 'white', marginBottom: '12px' }}>Student Records:</h4>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {showDetails.records.map(record => (
                      <div key={record.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        marginBottom: '4px',
                        background: 'rgba(30, 41, 59, 0.5)',
                        borderRadius: '6px'
                      }}>
                        <span style={{ color: 'white' }}>{record.student_name || 'Student'}</span>
                        <span style={{
                          background: record.status === 'present' ? 'rgba(16, 185, 129, 0.2)' : 
                                     record.status === 'late' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: record.status === 'present' ? '#10b981' : 
                                record.status === 'late' ? '#f59e0b' : '#ef4444',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {record.status === 'present' ? 'Present' : 
                           record.status === 'late' ? 'Late' : 'Absent'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                  No attendance records found for this class
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}