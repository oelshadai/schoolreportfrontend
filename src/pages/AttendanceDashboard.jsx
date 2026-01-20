import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'
import { FaUsers, FaUserCheck, FaUserTimes, FaChartBar, FaCalendarAlt, FaSchool } from 'react-icons/fa'

export default function AttendanceDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0
  })
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceData, setAttendanceData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'PRINCIPAL' || user?.role === 'SCHOOL_ADMIN') {
      loadClasses()
      loadTodayStats()
    }
    
    // Listen for attendance updates from other components
    const handleAttendanceUpdate = () => {
      console.log('Attendance updated, refreshing dashboard stats')
      loadTodayStats()
    }
    
    // Listen for page visibility changes to refresh when user comes back
    const handleVisibilityChange = () => {
      if (!document.hidden && (user?.role === 'ADMIN' || user?.role === 'PRINCIPAL' || user?.role === 'SCHOOL_ADMIN')) {
        console.log('Page became visible, refreshing stats')
        loadTodayStats()
      }
    }
    
    window.addEventListener('attendanceUpdated', handleAttendanceUpdate)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('attendanceUpdated', handleAttendanceUpdate)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user])

  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadAttendanceData()
    }
  }, [selectedClass, selectedDate])

  const loadClasses = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('Loading classes for dashboard...')
      const response = await api.get('/schools/classes/')
      console.log('Classes response:', response.data)
      
      const classList = response.data.results || response.data || []
      console.log('Parsed classes:', classList)
      setClasses(classList)
      
      if (classList.length > 0) {
        setSelectedClass(classList[0].id)
      } else {
        setError('No classes found. Please create classes first.')
      }
    } catch (error) {
      console.error('Failed to load classes:', error)
      console.error('Error details:', error.response?.data)
      setError(`Failed to load classes: ${error.response?.data?.detail || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadTodayStats = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      
      // Get all students count
      const studentsRes = await api.get('/students/')
      const totalStudents = studentsRes.data.results?.length || studentsRes.data?.length || 0
      
      // Get today's attendance - handle 404 gracefully
      let todayAttendance = []
      try {
        const attendanceRes = await api.get(`/students/attendance/?date=${today}`)
        todayAttendance = attendanceRes.data.results || attendanceRes.data || []
      } catch (err) {
        if (err.response?.status === 404) {
          console.log('No attendance data found for today - checking localStorage for unsaved data')
          todayAttendance = []
          
          // Check localStorage for today's attendance data that might not be saved to API yet
          const localStorageAttendance = getLocalStorageAttendanceForToday()
          if (localStorageAttendance.length > 0) {
            console.log('Found localStorage attendance data:', localStorageAttendance)
            todayAttendance = localStorageAttendance
          }
        } else {
          throw err
        }
      }
      
      const presentToday = todayAttendance.filter(a => a.status === 'present').length
      const absentToday = totalStudents - presentToday
      const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0
      
      console.log('Dashboard stats calculated:', {
        totalStudents,
        presentToday,
        absentToday,
        attendanceRate,
        attendanceDataSource: todayAttendance.length > 0 ? 'API/localStorage' : 'none'
      })
      
      setStats({
        totalStudents,
        presentToday,
        absentToday,
        attendanceRate
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
      // Set default stats if loading fails
      setStats({
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        attendanceRate: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAttendanceData = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/students/attendance/?class_id=${selectedClass}&date=${selectedDate}`)
      setAttendanceData(response.data.results || response.data || [])
    } catch (error) {
      console.error('Failed to load attendance data:', error)
      if (error.response?.status === 404) {
        console.log('No attendance data found for selected class and date - this is normal if no attendance has been marked yet')
      }
      setAttendanceData([])
    } finally {
      setLoading(false)
    }
  }

  const getLocalStorageAttendanceForToday = () => {
    const today = new Date().toISOString().split('T')[0]
    const attendanceRecords = []
    
    // Check all localStorage keys for today's attendance data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('attendance_') && key.endsWith(`_${today}`)) {
        try {
          const attendanceData = JSON.parse(localStorage.getItem(key))
          console.log(`Found localStorage attendance for key ${key}:`, attendanceData)
          
          // Convert localStorage format to API format
          Object.entries(attendanceData).forEach(([studentId, status]) => {
            if (status && status !== null) {
              attendanceRecords.push({
                student_id: studentId,
                status: status,
                date: today
              })
            }
          })
        } catch (e) {
          console.error('Error parsing localStorage attendance:', e)
        }
      }
    }
    
    return attendanceRecords
  }

  const getClassStats = () => {
    const total = attendanceData.length
    const present = attendanceData.filter(a => a.status === 'present').length
    const absent = total - present
    const rate = total > 0 ? Math.round((present / total) * 100) : 0
    return { total, present, absent, rate }
  }

  const classStats = getClassStats()

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#f8fafc',
      paddingTop: '160px',
      paddingLeft: '20px',
      paddingRight: '20px',
      paddingBottom: '40px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: '#3b82f6',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaChartBar size={20} color="white" />
              </div>
              <div>
                <h1 style={{
                  margin: 0,
                  fontSize: '24px',
                  color: '#1f2937',
                  fontWeight: '700'
                }}>
                  Attendance Dashboard
                </h1>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                  Monitor school-wide attendance statistics
                </p>
              </div>
            </div>
            <button
              onClick={loadTodayStats}
              disabled={loading}
              style={{
                background: loading ? '#9ca3af' : '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🔄 {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error Message */}
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

        {/* Overall Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: '#3b82f6',
                borderRadius: '8px',
                padding: '8px'
              }}>
                <FaUsers size={16} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                  {stats.totalStudents}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Students</div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: '#16a34a',
                borderRadius: '8px',
                padding: '8px'
              }}>
                <FaUserCheck size={16} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                  {stats.presentToday}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Present Today</div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: '#dc2626',
                borderRadius: '8px',
                padding: '8px'
              }}>
                <FaUserTimes size={16} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                  {stats.absentToday}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Absent Today</div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: '#f59e0b',
                borderRadius: '8px',
                padding: '8px'
              }}>
                <FaChartBar size={16} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                  {stats.attendanceRate}%
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Attendance Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Class-specific View */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '18px',
            color: '#1f2937',
            fontWeight: '600'
          }}>
            Class Attendance Details
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#374151',
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
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  fontSize: '14px'
                }}
              >
                <option value="">Select a class...</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name || `${cls.level_display || cls.level}${cls.section ? ` ${cls.section}` : ''}`}
                  </option>
                ))}
                {classes.length === 0 && !loading && (
                  <option disabled>No classes available</option>
                )}
                {loading && (
                  <option disabled>Loading classes...</option>
                )}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#374151',
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
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {selectedClass && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
              padding: '16px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
                  {classStats.total}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Total</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>
                  {classStats.present}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Present</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
                  {classStats.absent}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Absent</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {classStats.rate}%
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Rate</div>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Loading attendance data...
            </div>
          ) : attendanceData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              No attendance data found for selected class and date.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px'
            }}>
              {attendanceData.map(record => (
                <div
                  key={record.id}
                  style={{
                    background: record.status === 'present' ? '#f0fdf4' : '#fef2f2',
                    borderRadius: '8px',
                    padding: '12px',
                    border: `1px solid ${record.status === 'present' ? '#bbf7d0' : '#fecaca'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '4px'
                    }}>
                      {record.student?.name || record.student?.full_name || 
                       `${record.student?.first_name || ''} ${record.student?.last_name || ''}`.trim()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      ID: {record.student?.student_id}
                    </div>
                  </div>
                  <div style={{
                    background: record.status === 'present' ? '#16a34a' : '#dc2626',
                    color: 'white',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {record.status === 'present' ? 'Present' : 'Absent'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}