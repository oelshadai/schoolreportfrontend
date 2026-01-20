import { useState, useEffect } from 'react'
import { FaBell, FaCheck, FaTimes, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa'
import notificationService from '../utils/notificationService'

export default function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe(({ type, data }) => {
      if (type === 'update') {
        setNotifications(data)
      } else if (type === 'read') {
        setNotifications(prev => 
          prev.map(n => n.id === data ? { ...n, read: true } : n)
        )
      } else if (type === 'readAll') {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      }
    })

    return unsubscribe
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await notificationService.getNotifications()
      setNotifications(data)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    await notificationService.markAsRead(notificationId)
  }

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead()
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle style={{ color: '#10b981' }} />
      case 'warning':
        return <FaExclamationTriangle style={{ color: '#f59e0b' }} />
      case 'error':
        return <FaTimesCircle style={{ color: '#ef4444' }} />
      default:
        return <FaInfoCircle style={{ color: '#3b82f6' }} />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return { bg: '#f0fdf4', border: '#bbf7d0' }
      case 'warning':
        return { bg: '#fffbeb', border: '#fed7aa' }
      case 'error':
        return { bg: '#fef2f2', border: '#fecaca' }
      default:
        return { bg: '#eff6ff', border: '#bfdbfe' }
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: '64px',
      right: '20px',
      width: '360px',
      maxHeight: '500px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid #e5e7eb',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#f9fafb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaBell style={{ color: '#6b7280' }} />
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Notifications
          </h3>
          {notifications.filter(n => !n.read).length > 0 && (
            <span style={{
              background: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '4px'
              }}
              title="Mark all as read"
            >
              <FaCheck size={12} />
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <FaTimes size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {loading ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12px'
            }} />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <FaBell size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '14px' }}>No notifications yet</p>
          </div>
        ) : (
          <div style={{ padding: '8px 0' }}>
            {notifications.map(notification => {
              const colors = getNotificationColor(notification.type)
              return (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: notification.read ? 'default' : 'pointer',
                    background: notification.read ? 'white' : colors.bg,
                    borderLeft: `4px solid ${notification.read ? '#e5e7eb' : colors.border}`,
                    opacity: notification.read ? 0.7 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <div style={{ marginTop: '2px' }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        margin: '0 0 4px 0',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        {notification.title}
                      </h4>
                      <p style={{
                        margin: '0 0 8px 0',
                        fontSize: '13px',
                        color: '#6b7280',
                        lineHeight: '1.4'
                      }}>
                        {notification.message}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{
                          fontSize: '11px',
                          color: '#9ca3af'
                        }}>
                          {formatTime(notification.created_at)}
                        </span>
                        {!notification.read && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#3b82f6'
                          }} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}