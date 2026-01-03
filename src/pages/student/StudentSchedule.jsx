export default function StudentSchedule() {
  const isMobile = window.innerWidth <= 768

  const schedule = [
    { time: '08:00 - 09:00', subject: 'Mathematics', teacher: 'Mr. Johnson', room: 'Room 101' },
    { time: '09:00 - 10:00', subject: 'English', teacher: 'Ms. Smith', room: 'Room 205' },
    { time: '10:00 - 11:00', subject: 'Science', teacher: 'Dr. Brown', room: 'Lab 1' },
    { time: '11:00 - 12:00', subject: 'History', teacher: 'Mr. Davis', room: 'Room 302' },
    { time: '12:00 - 13:00', subject: 'Lunch Break', teacher: '', room: 'Cafeteria' },
    { time: '13:00 - 14:00', subject: 'Geography', teacher: 'Ms. Wilson', room: 'Room 201' },
    { time: '14:00 - 15:00', subject: 'Physical Education', teacher: 'Coach Miller', room: 'Gymnasium' }
  ]

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

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(7, 1fr)',
        gap: '8px',
        marginBottom: '20px'
      }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} style={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '8px',
            padding: '8px',
            textAlign: 'center',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}>
            <p style={{
              margin: 0,
              color: 'white',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {day}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {schedule.map((item, index) => (
          <div key={index} style={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '8px' : '0'
            }}>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  margin: '0 0 4px 0',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  {item.subject}
                </h4>
                <p style={{
                  margin: '0 0 2px 0',
                  color: '#94a3b8',
                  fontSize: '13px'
                }}>
                  {item.teacher}
                </p>
                <p style={{
                  margin: 0,
                  color: '#64748b',
                  fontSize: '12px'
                }}>
                  {item.room}
                </p>
              </div>
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {item.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}