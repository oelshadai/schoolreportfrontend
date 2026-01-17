import { useState, useEffect } from 'react'
import { FaWifi, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'
import { checkBackendHealth } from '../utils/apiWithRetry'

export default function NetworkStatus() {
  const [status, setStatus] = useState({ checking: true, healthy: false, error: null })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const checkHealth = async () => {
    setStatus(prev => ({ ...prev, checking: true }))
    try {
      const result = await checkBackendHealth()
      setStatus({
        checking: false,
        healthy: result.healthy,
        error: result.healthy ? null : result.error,
        suggestion: result.suggestion
      })
    } catch (error) {
      setStatus({
        checking: false,
        healthy: false,
        error: error.message,
        suggestion: 'Backend server may not be running. Try starting it with: python manage.py runserver'
      })
    }
  }

  if (status.checking) {
    return (
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        background: 'rgba(59, 130, 246, 0.9)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          border: '2px solid rgba(255,255,255,0.3)',
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        Checking connection...
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )
  }

  if (status.healthy) {
    return (
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        background: 'rgba(16, 185, 129, 0.9)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer'
      }}
      onClick={() => setShowDetails(!showDetails)}>
        <FaCheckCircle size={12} />
        Connected
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      zIndex: 50
    }}>
      <div
        style={{
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}
        onClick={() => setShowDetails(!showDetails)}
      >
        <FaExclamationTriangle size={12} />
        Connection Error
      </div>

      {showDetails && (
        <div style={{
          marginTop: '8px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          maxWidth: '300px',
          lineHeight: 1.4
        }}>
          <div style={{ marginBottom: '8px', fontWeight: '600' }}>
            Backend Connection Failed
          </div>
          <div style={{ marginBottom: '8px', color: '#fca5a5' }}>
            {status.error}
          </div>
          {status.suggestion && (
            <div style={{ color: '#93c5fd' }}>
              💡 {status.suggestion}
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              checkHealth()
            }}
            style={{
              marginTop: '8px',
              background: 'rgba(59, 130, 246, 0.8)',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Retry Connection
          </button>
        </div>
      )}
    </div>
  )
}