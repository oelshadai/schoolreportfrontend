import { useState, useEffect } from 'react'
import { FaUserGraduate, FaTimes, FaBell } from 'react-icons/fa'

export default function TeacherNotifications() {
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const handleStudentCreated = (event) => {
      const { student } = event.detail
      
      // Add notification for new student
      const notification = {
        id: Date.now(),
        type: 'student_added',
        title: 'New Student Added',
        message: `${student.full_name || `${student.first_name} ${student.last_name}`} has been added to your class`,
        timestamp: new Date(),
        read: false
      }
      
      setNotifications(prev => [notification, ...prev.slice(0, 4)]) // Keep only 5 notifications
      setShowNotifications(true)
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id))
      }, 5000)
    }

    window.addEventListener('studentCreated', handleStudentCreated)
    
    return () => {
      window.removeEventListener('studentCreated', handleStudentCreated)
    }
  }, [])

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  if (notifications.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      zIndex: 1000,
      maxWidth: '350px'
    }}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(12px)',
            animation: 'slideInRight 0.3s ease-out',
            position: 'relative'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaUserGraduate size={16} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                {notification.title}
              </div>
              <div style={{
                fontSize: '13px',
                opacity: 0.9,
                lineHeight: 1.4
              }}>
                {notification.message}
              </div>
              <div style={{
                fontSize: '11px',
                opacity: 0.7,
                marginTop: '6px'
              }}>
                {notification.timestamp.toLocaleTimeString()}
              </div>
            </div>
            
            <button
              onClick={() => removeNotification(notification.id)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '6px',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px'
              }}
            >
              <FaTimes size={12} />
            </button>
          </div>
        </div>
      ))}
      
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  )
}