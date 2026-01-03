import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeft, FaTrophy, FaClock, FaUser, FaCheckCircle } from 'react-icons/fa'

export default function AssignmentReview() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [assignment, setAssignment] = useState(null)
  const isMobile = window.innerWidth <= 768

  useEffect(() => {
    // Load assignment from localStorage or API
    const storedAssignment = localStorage.getItem('review_assignment')
    if (storedAssignment) {
      setAssignment(JSON.parse(storedAssignment))
    }
  }, [id])

  const getGradeColor = (score) => {
    if (score >= 90) return '#10b981'
    if (score >= 80) return '#3b82f6'
    if (score >= 70) return '#f59e0b'
    return '#ef4444'
  }

  const getLetterGrade = (score) => {
    if (score >= 97) return 'A+'
    if (score >= 93) return 'A'
    if (score >= 90) return 'A-'
    if (score >= 87) return 'B+'
    if (score >= 83) return 'B'
    if (score >= 80) return 'B-'
    if (score >= 77) return 'C+'
    if (score >= 73) return 'C'
    if (score >= 70) return 'C-'
    return 'F'
  }

  if (!assignment) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        Loading assignment details...
      </div>
    )
  }

  const bestScore = Math.max(...assignment.attempts.map(a => a.score || 0))

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: isMobile ? '16px' : '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px',
              background: 'rgba(71, 85, 105, 0.6)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <FaArrowLeft />
          </button>
          <h1 style={{
            margin: 0,
            color: 'white',
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700'
          }}>
            Assignment Review
          </h1>
        </div>

        {/* Assignment Details */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(71, 85, 105, 0.3)'
        }}>
          <h2 style={{ margin: '0 0 16px 0', color: 'white', fontSize: '20px' }}>
            {assignment.title}
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ color: '#94a3b8' }}>
              <p style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaUser /> <strong>Teacher:</strong> {assignment.teacher}
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Subject:</strong> {assignment.subject}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Type:</strong> {assignment.assignment_type}
              </p>
            </div>
            <div style={{ color: '#94a3b8' }}>
              <p style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaClock /> <strong>Completed:</strong> {new Date(assignment.completed_at).toLocaleDateString()}
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Max Score:</strong> {assignment.max_score} points
              </p>
              <p style={{ margin: 0 }}>
                <strong>Attempts Used:</strong> {assignment.attempts_count}/{assignment.max_attempts}
              </p>
            </div>
          </div>

          {/* Best Score Display */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <FaTrophy style={{ color: getGradeColor(bestScore), fontSize: '32px', marginBottom: '8px' }} />
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              color: getGradeColor(bestScore),
              marginBottom: '4px'
            }}>
              {bestScore.toFixed(1)}%
            </div>
            <div style={{
              fontSize: '18px',
              color: getGradeColor(bestScore),
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Grade: {getLetterGrade(bestScore)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>
              Best Score Achieved
            </div>
          </div>
        </div>

        {/* Attempt Details */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(71, 85, 105, 0.3)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: 'white', fontSize: '18px' }}>
            Attempt History
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {assignment.attempts.map((attempt, index) => (
              <div key={index} style={{
                background: 'rgba(30, 41, 59, 0.6)',
                borderRadius: '12px',
                padding: '20px',
                border: attempt.score === bestScore ? `2px solid ${getGradeColor(bestScore)}` : '1px solid rgba(71, 85, 105, 0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <h4 style={{ margin: 0, color: 'white', fontSize: '16px' }}>
                    Attempt {attempt.attempt_number}
                    {attempt.score === bestScore && (
                      <span style={{ color: getGradeColor(bestScore), marginLeft: '8px' }}>
                        <FaCheckCircle size={16} />
                      </span>
                    )}
                  </h4>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: getGradeColor(attempt.score || 0)
                  }}>
                    {(attempt.score || 0).toFixed(1)}%
                  </div>
                </div>
                
                <p style={{ margin: '0 0 12px 0', color: '#94a3b8', fontSize: '14px' }}>
                  Submitted: {new Date(attempt.submitted_at).toLocaleString()}
                </p>
                
                {attempt.teacher_feedback && (
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginTop: '12px'
                  }}>
                    <h5 style={{ margin: '0 0 8px 0', color: '#60a5fa', fontSize: '14px' }}>
                      Teacher Feedback:
                    </h5>
                    <p style={{ margin: 0, color: '#93c5fd', fontSize: '14px' }}>
                      {attempt.teacher_feedback}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}