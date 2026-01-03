import { Link } from 'react-router-dom'
import { FaUserGraduate, FaChalkboardTeacher, FaArrowRight } from 'react-icons/fa'

export default function LoginSelector({ isMobile = false }) {
  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: isMobile ? '16px 20px' : '12px 20px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: isMobile ? 16 : 14,
    minWidth: isMobile ? '100%' : '200px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  }

  const studentStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    marginBottom: isMobile ? '12px' : '0'
  }

  const staffStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #1e40af, #2563eb)',
    color: 'white'
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0' : '16px',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      maxWidth: isMobile ? '100%' : '450px',
      margin: '0 auto'
    }}>
      <Link 
        to="/student-portal" 
        style={studentStyle}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <FaUserGraduate size={isMobile ? 18 : 16} />
        Student Login
        <FaArrowRight size={12} />
      </Link>
      
      <Link 
        to="/login" 
        style={staffStyle}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(30, 64, 175, 0.3)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <FaChalkboardTeacher size={isMobile ? 18 : 16} />
        Staff Login
        <FaArrowRight size={12} />
      </Link>
    </div>
  )
}