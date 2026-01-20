import { useState, useEffect } from 'react'
import { useAuth } from '../../state/AuthContext'
import api from '../../utils/api'

export default function StudentSchedule() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const isMobile = window.innerWidth <= 768

  useEffect(() => {
    loadSchedules()
    
    // Listen for schedule updates
    const handleScheduleUpdate = () => {
      console.log('Schedule updated, refreshing...')
      loadSchedules()
    }
    
    window.addEventListener('scheduleUpdated', handleScheduleUpdate)
    
    return () => {
      window.removeEventListener('scheduleUpdated', handleScheduleUpdate)
    }
  }, [user])

  const loadSchedules = async () => {
    try {
      if (!user) {
        console.log('No user found')
        setLoading(false)
        return
      }

      // Try multiple ways to get class ID
      const classId = user.current_class?.id || user.class_instance || user.current_class || 11 // Default to class 11
      console.log('Student user object:', user)
      console.log('Trying class ID:', classId)
      
      if (!classId) {
        console.log('No class information found for student')
        setLoading(false)
        return
      }
      
      // Load from localStorage
      const savedSchedules = localStorage.getItem(`schedules_class_${classId}`)
      console.log('Looking for schedules with key:', `schedules_class_${classId}`)
      console.log('Found in localStorage:', savedSchedules)
      
      const scheduleData = savedSchedules ? JSON.parse(savedSchedules) : []
      
      console.log('Loaded schedules:', scheduleData)
      setSchedules(scheduleData)
    } catch (error) {
      console.error('Error loading schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupSchedulesByDay = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const grouped = {}
    
    days.forEach(day => {
      grouped[day] = schedules.filter(s => s.day_of_week === day)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
    })
    
    return grouped
  }

  const formatTime = (time) => {
    if (!time) return ''
    return time.slice(0, 5) // Remove seconds if present
  }

  const groupedSchedules = groupSchedulesByDay()

  if (loading) {
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)',
        borderRadius: '16px',
        padding: isMobile ? '16px' : '20px',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'white', margin: 0 }}>Loading schedule...</p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.9)',
      borderRadius: '16px',
      padding: isMobile ? '16px' : '20px',
      border: '1px solid rgba(71, 85, 105, 0.3)'
    }}>
      <h3 style={{
        margin: '0 0 20px 0',
        color: 'white',
        fontSize: isMobile ? '16px' : '18px',
        fontWeight: '700'
      }}>
        Class Schedule
      </h3>

      {schedules.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#94a3b8'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            No schedule available yet. Your class teacher will create the schedule soon.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(7, 1fr)',
          gap: '12px'
        }}>
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, dayIndex) => {
            const daySchedules = groupedSchedules[day] || []
            const dayLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIndex]
            
            return (
              <div key={day} style={{
                background: 'rgba(30, 41, 59, 0.6)',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                minHeight: '200px'
              }}>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid rgba(71, 85, 105, 0.3)'
                }}>
                  <p style={{
                    margin: 0,
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {dayLabel}
                  </p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {daySchedules.length === 0 ? (
                    <p style={{
                      margin: 0,
                      color: '#64748b',
                      fontSize: '12px',
                      textAlign: 'center',
                      fontStyle: 'italic'
                    }}>
                      No classes
                    </p>
                  ) : (
                    daySchedules.map((schedule, index) => (
                      <div key={index} style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '8px',
                        padding: '8px',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}>
                        <div style={{
                          marginBottom: '4px'
                        }}>
                          <p style={{
                            margin: 0,
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {schedule.subject}
                          </p>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <p style={{
                            margin: 0,
                            color: '#10b981',
                            fontSize: '10px',
                            fontWeight: '600'
                          }}>
                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          </p>
                          {schedule.room && (
                            <p style={{
                              margin: 0,
                              color: '#64748b',
                              fontSize: '10px'
                            }}>
                              {schedule.room}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}