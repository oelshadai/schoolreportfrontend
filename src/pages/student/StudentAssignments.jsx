import { useState, useEffect } from 'react'
import { FaEye, FaUpload, FaRedo, FaBan, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import api from '../../utils/api'

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      const response = await api.get('/assignments/current/')
      setAssignments(response.data.results)
    } catch (error) {
      console.error('Error loading assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const startAssignment = async (assignmentId) => {
    try {
      await api.post(`/assignments/${assignmentId}/start-attempt/`)
      loadAssignments()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to start assignment')
    }
  }

  const getStatusColor = (assignment) => {
    if (assignment.status === 'GRADED') return '#10b981'
    if (assignment.status === 'SUBMITTED') return '#3b82f6'
    if (assignment.is_overdue) return '#ef4444'
    if (!assignment.can_attempt) return '#6b7280'
    return '#f59e0b'
  }

  const getStatusText = (assignment) => {
    if (assignment.status === 'GRADED') return 'Graded'
    if (assignment.status === 'SUBMITTED') return 'Submitted'
    if (assignment.is_overdue) return 'Overdue'
    if (!assignment.can_attempt) return 'Max Attempts'
    return 'Available'
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
        Loading assignments...
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.9)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid rgba(71, 85, 105, 0.3)'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: 'white', fontSize: '18px', fontWeight: '700' }}>
        My Assignments
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {assignments.map(assignment => (
          <div key={assignment.id} style={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '16px', fontWeight: '600' }}>
                  {assignment.title}
                </h4>
                <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '13px' }}>
                  {assignment.subject} • {assignment.assignment_type}
                </p>
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span style={{
                    background: getStatusColor(assignment),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {assignment.status === 'GRADED' && <FaCheckCircle size={10} />}
                    {assignment.is_overdue && <FaExclamationTriangle size={10} />}
                    {!assignment.can_attempt && assignment.status !== 'GRADED' && <FaBan size={10} />}
                    {getStatusText(assignment)}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>
                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </span>
                  {assignment.final_score !== null && (
                    <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '600' }}>
                      Score: {assignment.final_score.toFixed(1)}%
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaRedo size={10} />
                    Attempts: {assignment.attempts_count}/{assignment.max_attempts}
                  </span>
                  {assignment.attempts_remaining > 0 && assignment.status !== 'GRADED' && (
                    <span style={{ color: '#10b981' }}>
                      {assignment.attempts_remaining} remaining
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#60a5fa',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <FaEye size={10} />
                  View
                </button>
                
                {assignment.can_attempt && assignment.status !== 'GRADED' && !assignment.is_overdue && (
                  <button 
                    onClick={() => startAssignment(assignment.id)}
                    style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FaUpload size={10} />
                    {assignment.attempts_count === 0 ? 'Start' : 'Retry'}
                  </button>
                )}
                
                {!assignment.can_attempt && assignment.status !== 'GRADED' && (
                  <div style={{
                    background: 'rgba(107, 114, 128, 0.2)',
                    border: '1px solid rgba(107, 114, 128, 0.3)',
                    color: '#9ca3af',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <FaBan size={10} />
                    No Attempts Left
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}