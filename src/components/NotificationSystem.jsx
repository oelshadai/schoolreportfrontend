import { useState, useEffect, createContext, useContext } from 'react'
import { FaBell, FaTimes, FaCheck, FaExclamationTriangle, FaInfo } from 'react-icons/fa'
import { useAuth } from '../state/AuthContext'
import { apiGet, apiPatch } from '../utils/apiWithRetry'

const NotificationContext = createContext()

export const useNotifications = () => useContext(NotificationContext)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadNotifications()
      const interval = setInterval(loadNotifications, 30000) // Check every 30s
      return () => clearInterval(interval)
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      // Skip notification loading if no backend server is available
      if (!user || window.location.hostname === 'localhost') {
        return
      }
      const response = await apiGet('/notifications/')
      const notifs = response.data.results || response.data
      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.read).length)
    } catch (error) {
      console.error('Error loading notifications:', error.normalizedMessage || error.message)
      // Don't show error to user for background notification loading
    }
  }

  const markAsRead = async (id) => {
    try {
      await apiPatch(`/notifications/${id}/`, { read: true })
      setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error.normalizedMessage || error.message)
    }
  }

  const addNotification = (notification) => {
    const newNotif = {
      id: Date.now(),
      ...notification,
      created_at: new Date().toISOString(),
      read: false
    }
    setNotifications(prev => [newNotif, ...prev])
    setUnreadCount(prev => prev + 1)
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      addNotification,
      loadNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export default function NotificationSystem() {
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [showPanel, setShowPanel] = useState(false)
  const [isMobile] = useState(window.innerWidth <= 768)

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <FaCheck style={{ color: '#10b981' }} />
      case 'warning': return <FaExclamationTriangle style={{ color: '#f59e0b' }} />
      case 'error': return <FaExclamationTriangle style={{ color: '#ef4444' }} />
      default: return <FaInfo style={{ color: '#3b82f6' }} />
    }
  }

  return (
    <>
      {/* Notification Bell */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowPanel(!showPanel)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            position: 'relative',
            transition: 'all 0.2s ease'
          }}
        >
          <FaBell size={18} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#ef4444',
              color: 'white',
              borderRadius: '10px',
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: '600',
              minWidth: '16px',
              textAlign: 'center'
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {showPanel && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: isMobile ? '300px' : '350px',
            maxHeight: '400px',
            background: 'var(--card)',
            border: '1px solid var(--gray-200)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1000,
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid var(--gray-200)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--gray-50)'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                Notifications
              </h3>
              <button
                onClick={() => setShowPanel(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--gray-500)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Notifications List */}
            <div style={{
              maxHeight: '320px',
              overflowY: 'auto'
            }}>
              {notifications.length === 0 ? (
                <div style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  color: 'var(--gray-500)',
                  fontSize: '14px'
                }}>
                  No notifications
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--gray-100)',
                      cursor: notification.read ? 'default' : 'pointer',
                      background: notification.read ? 'transparent' : 'rgba(79, 70, 229, 0.05)',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ marginTop: '2px' }}>
                        {getIcon(notification.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: notification.read ? '400' : '600',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          {notification.title}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: 'var(--gray-600)',
                          marginBottom: '6px'
                        }}>
                          {notification.message}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--gray-500)'
                        }}>
                          {new Date(notification.created_at).toLocaleString()}
                        </div>
                      </div>
                      {!notification.read && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          marginTop: '6px'
                        }} />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {showPanel && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999
          }}
          onClick={() => setShowPanel(false)}
        />
      )}
    </>
  )
}