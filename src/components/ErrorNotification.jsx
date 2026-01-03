import { FaExclamationTriangle, FaTimes } from 'react-icons/fa'

export default function ErrorNotification({ 
  message, 
  onClose, 
  type = 'error',
  showRetry = false,
  onRetry 
}) {
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'rgba(245, 158, 11, 0.1)',
          border: 'rgba(245, 158, 11, 0.3)',
          color: '#fbbf24',
          icon: '#f59e0b'
        }
      case 'info':
        return {
          bg: 'rgba(59, 130, 246, 0.1)',
          border: 'rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          icon: '#3b82f6'
        }
      default: // error
        return {
          bg: 'rgba(239, 68, 68, 0.1)',
          border: 'rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          icon: '#ef4444'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div style={{
      background: styles.bg,
      border: `1px solid ${styles.border}`,
      borderRadius: '8px',
      padding: '12px 16px',
      margin: '8px 0',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      position: 'relative'
    }}>
      <FaExclamationTriangle 
        size={16} 
        style={{ color: styles.icon, marginTop: '2px', flexShrink: 0 }} 
      />
      
      <div style={{ flex: 1 }}>
        <p style={{ 
          margin: 0, 
          color: styles.color, 
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          {message}
        </p>
        
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            style={{
              background: 'none',
              border: `1px solid ${styles.border}`,
              color: styles.color,
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '12px',
              marginTop: '8px'
            }}
          >
            Retry
          </button>
        )}
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: styles.color,
            cursor: 'pointer',
            padding: '2px',
            opacity: 0.7
          }}
        >
          <FaTimes size={12} />
        </button>
      )}
    </div>
  )
}