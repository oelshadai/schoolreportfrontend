import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaUserGraduate, FaChalkboardTeacher, FaArrowLeft, FaSchool } from 'react-icons/fa'
import EliteLogo from '../components/EliteLogo'
import LoginSelector from '../components/LoginSelector'

export default function LoginSelection() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
        `,
        animation: 'pulse 4s ease-in-out infinite'
      }} />
      
      <div style={{
        width: '100%',
        maxWidth: '500px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Top Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          {/* Elite Logo - Top Left */}
          <EliteLogo size={48} />
          
          {/* Back to Home - Top Right */}
          <Link 
            to="/" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)'
              e.currentTarget.style.color = '#94a3b8'
            }}
          >
            <FaArrowLeft size={12} />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#60a5fa',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '16px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <FaSchool size={14} />
            Choose Your Portal
          </div>
          
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: '700',
            color: 'white',
            lineHeight: '1.2'
          }}>Select Login Type</h1>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#94a3b8',
            fontWeight: '400',
            lineHeight: '1.5'
          }}>Choose the appropriate portal based on your role</p>
        </div>

        {/* Login Selection */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: isMobile ? '24px' : '32px',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)',
          marginBottom: '24px'
        }}>
          <LoginSelector isMobile={isMobile} />
          
          {/* Help Text */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px',
              fontSize: '13px',
              color: '#94a3b8'
            }}>
              <div>
                <div style={{ 
                  color: '#10b981', 
                  fontWeight: '600', 
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <FaUserGraduate size={12} />
                  Student Portal
                </div>
                <div>For students to access assignments, grades, and virtual classes</div>
              </div>
              <div>
                <div style={{ 
                  color: '#3b82f6', 
                  fontWeight: '600', 
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <FaChalkboardTeacher size={12} />
                  Staff Portal
                </div>
                <div>For teachers, admins, and principals to manage school operations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <p style={{ margin: 0 }}>
            Need help? Contact your school administrator
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}