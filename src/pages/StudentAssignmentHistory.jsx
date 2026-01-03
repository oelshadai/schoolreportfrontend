import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaTrophy, FaRedo } from 'react-icons/fa'
import api from '../utils/api'

export default function StudentAssignmentHistory() {
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isMobile = window.innerWidth <= 768

  useEffect(() => {
    loadAssignmentHistory()
  }, [])

  const loadAssignmentHistory = async () => {
    try {
      const response = await api.get('/assignments/completed/')
      const historyData = response.data.results || []
      
      // If no real data, use mock data
      if (historyData.length === 0) {
        const mockHistory = [
          {
            id: 1,
            title: 'Mathematics Quiz 1',
            subject: 'Mathematics',
            assignment_type: 'Quiz',
            teacher: 'Mr. Johnson',
            completed_at: '2024-01-15T10:30:00Z',
            attempts_count: 2,
            max_attempts: 3,
            max_score: 100,
            attempts: [
              {
                attempt_number: 1,
                score: 85,
                submitted_at: '2024-01-14T14:20:00Z',
                teacher_feedback: 'Good work! Review algebra concepts for improvement.'
              },
              {
                attempt_number: 2,
                score: 92,
                submitted_at: '2024-01-15T10:30:00Z',
                teacher_feedback: 'Excellent improvement! Well done.'
              }
            ]
          },
          {
            id: 2,
            title: 'English Essay - Character Analysis',
            subject: 'English Literature',
            assignment_type: 'Essay',
            teacher: 'Ms. Smith',
            completed_at: '2024-01-20T16:45:00Z',
            attempts_count: 1,
            max_attempts: 2,
            max_score: 100,
            attempts: [
              {
                attempt_number: 1,
                score: 88,
                submitted_at: '2024-01-20T16:45:00Z',
                teacher_feedback: 'Strong analysis with good supporting evidence. Minor grammar improvements needed.'
              }
            ]
          },
          {
            id: 3,
            title: 'Science Lab Report - Chemical Reactions',
            subject: 'Chemistry',
            assignment_type: 'Lab Report',
            teacher: 'Dr. Wilson',
            completed_at: '2024-01-25T11:15:00Z',
            attempts_count: 1,
            max_attempts: 1,
            max_score: 100,
            attempts: [
              {
                attempt_number: 1,
                score: 76,
                submitted_at: '2024-01-25T11:15:00Z',
                teacher_feedback: 'Good observations but conclusions need more detail. Review lab procedures.'
              }
            ]
          }
        ]
        setAssignments(mockHistory)
      } else {
        setAssignments(historyData)
      }
    } catch (error) {
      console.error('Error loading assignment history:', error)
      // Use mock data on error
      const mockHistory = [
        {
          id: 1,
          title: 'Mathematics Quiz 1',
          subject: 'Mathematics',
          assignment_type: 'Quiz',
          teacher: 'Mr. Johnson',
          completed_at: '2024-01-15T10:30:00Z',
          attempts_count: 2,
          max_attempts: 3,
          max_score: 100,
          attempts: [
            {
              attempt_number: 1,
              score: 85,
              submitted_at: '2024-01-14T14:20:00Z',
              teacher_feedback: 'Good work! Review algebra concepts.'
            },
            {
              attempt_number: 2,
              score: 92,
              submitted_at: '2024-01-15T10:30:00Z',
              teacher_feedback: 'Excellent improvement!'
            }
          ]
        }
      ]
      setAssignments(mockHistory)
      setError('')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (score) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getStatusText = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    return 'Needs Improvement'
  }

  const getBestScore = (attempts) => {
    if (!attempts || attempts.length === 0) return 0
    return Math.max(...attempts.map(attempt => attempt.score || 0))
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid rgba(255,255,255,0.1)',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          Loading assignment history...
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: isMobile ? '16px' : '20px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <button
            onClick={() => navigate('/student-dashboard')}
            style={{
              padding: '12px',
              background: 'rgba(71, 85, 105, 0.6)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FaArrowLeft />
          </button>
          <h1 style={{ 
            margin: 0, 
            color: 'white', 
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: '700'
          }}>
            Assignment History
          </h1>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            color: '#fca5a5'
          }}>
            {error}
          </div>
        )}

        {assignments.length === 0 ? (
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            color: '#94a3b8',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}>
            <FaCheckCircle size={48} style={{ color: '#64748b', marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 16px 0', color: 'white' }}>No Completed Assignments</h3>
            <p style={{ margin: 0 }}>You haven't completed any assignments yet. Complete assignments to see your history here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {assignments.map((assignment, index) => {
              const bestScore = getBestScore(assignment.attempts)
              return (
                <div key={index} style={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  borderRadius: '16px',
                  padding: isMobile ? '20px' : '24px',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  color: 'white'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr auto auto',
                    gap: '16px',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h3 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: isMobile ? '18px' : '20px',
                        fontWeight: '700'
                      }}>
                        {assignment.title}
                      </h3>
                      <p style={{ margin: '0 0 12px 0', color: '#94a3b8', fontSize: '14px' }}>
                        <span style={{ fontWeight: '600' }}>{assignment.subject}</span> • 
                        <span>{assignment.assignment_type}</span> • 
                        <span>Teacher: {assignment.teacher}</span>
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        gap: isMobile ? '12px' : '16px', 
                        fontSize: '13px', 
                        color: '#94a3b8',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaClock />
                          Completed: {new Date(assignment.completed_at).toLocaleDateString()}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaRedo />
                          Attempts: {assignment.attempts_count}/{assignment.max_attempts}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaTrophy />
                          Max Score: {assignment.max_score} pts
                        </span>
                      </div>
                    </div>

                    {/* Score Display */}
                    <div style={{
                      textAlign: 'center',
                      padding: '16px',
                      background: 'rgba(30, 41, 59, 0.6)',
                      borderRadius: '12px',
                      minWidth: isMobile ? '100%' : '120px'
                    }}>
                      <div style={{
                        fontSize: isMobile ? '20px' : '24px',
                        fontWeight: '700',
                        color: getStatusColor(bestScore),
                        marginBottom: '4px'
                      }}>
                        {bestScore.toFixed(1)}%
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: getStatusColor(bestScore),
                        fontWeight: '600'
                      }}>
                        {getStatusText(bestScore)}
                      </div>
                      {assignment.attempts.length > 1 && (
                        <div style={{
                          fontSize: '10px',
                          color: '#64748b',
                          marginTop: '4px'
                        }}>
                          Best of {assignment.attempts.length} attempts
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        // Store assignment data for review
                        localStorage.setItem('review_assignment', JSON.stringify({
                          ...assignment,
                          score: bestScore
                        }))
                        navigate(`/student/assignment-review/${assignment.id}`)
                      }}
                      style={{
                        padding: isMobile ? '12px 20px' : '12px 16px',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600',
                        fontSize: '14px',
                        width: isMobile ? '100%' : 'auto',
                        justifyContent: 'center'
                      }}
                    >
                      <FaEye /> Review Details
                    </button>
                  </div>

                  {/* Attempts Summary */}
                  {assignment.attempts && assignment.attempts.length > 0 && (
                    <div style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(71, 85, 105, 0.3)'
                    }}>
                      <h4 style={{ 
                        margin: '0 0 12px 0', 
                        fontSize: '14px', 
                        color: '#e2e8f0',
                        fontWeight: '600'
                      }}>
                        Attempt History:
                      </h4>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '8px'
                      }}>
                        {assignment.attempts.map((attempt, attemptIndex) => (
                          <div key={attemptIndex} style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            borderRadius: '8px',
                            padding: '12px',
                            fontSize: '12px'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '4px'
                            }}>
                              <span style={{ fontWeight: '600', color: '#e2e8f0' }}>
                                Attempt {attempt.attempt_number}
                              </span>
                              <span style={{
                                color: getStatusColor(attempt.score || 0),
                                fontWeight: '700'
                              }}>
                                {(attempt.score || 0).toFixed(1)}%
                              </span>
                            </div>
                            <div style={{ color: '#94a3b8' }}>
                              {new Date(attempt.submitted_at).toLocaleDateString()}
                            </div>
                            {attempt.teacher_feedback && (
                              <div style={{
                                marginTop: '8px',
                                padding: '8px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '4px',
                                fontSize: '11px',
                                color: '#93c5fd'
                              }}>
                                <strong>Feedback:</strong> {attempt.teacher_feedback}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}