import { Navigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import StudentPortalNew from './StudentPortalNew'

export default function StudentPortal() {
  const { user } = useAuth()
  
  // If no user is logged in, redirect to student login
  if (!user) {
    return <Navigate to="/student-login" replace />
  }
  
  // If user is not a student, redirect to appropriate login
  if (user.role !== 'STUDENT') {
    return <Navigate to="/login" replace />
  }
  
  // If student is logged in, show new portal
  return <StudentPortalNew />
}