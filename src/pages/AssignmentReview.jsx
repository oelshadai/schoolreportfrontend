import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa'

export default function AssignmentReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAssignmentReview()
  }, [id])

  const loadAssignmentReview = () => {
    const reviewData = localStorage.getItem('review_assignment')
    if (reviewData) {
      setAssignment(JSON.parse(reviewData))
    }
    setLoading(false)
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
        Loading review...
      </div>
    )
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
        Assignment review not found
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '20px'
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
            onClick={() => navigate('/student/assignment-history')}
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
          <div>
            <h1 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '24px' }}>
              {assignment.title} - Review
            </h1>
            <p style={{ margin: 0, color: '#94a3b8' }}>
              Score: {assignment.score}% • {assignment.correctAnswers}/{assignment.totalQuestions} correct
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(71, 85, 105, 0.3)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            color: 'white'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                {assignment.score}%
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>Final Score</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                {Math.floor(assignment.timeUsed / 60)}:{(assignment.timeUsed % 60).toString().padStart(2, '0')}
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>Time Used</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>
                {assignment.attempts}/2
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>Attempts</div>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div style={{ display: 'grid', gap: '16px' }}>
          {assignment.results?.map((result, index) => (
            <div key={index} style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '16px',
              padding: '24px',
              border: `1px solid ${result.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: 'white'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: result.isCorrect ? '#10b981' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {result.isCorrect ? <FaCheckCircle size={12} /> : <FaTimesCircle size={12} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
                    Question {index + 1}: {result.question}
                  </h3>
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#94a3b8' }}>Your Answer: </strong>
                      <span style={{ color: result.isCorrect ? '#10b981' : '#ef4444' }}>
                        {result.studentAnswer || 'Not answered'}
                      </span>
                    </div>
                    {!result.isCorrect && (
                      <div>
                        <strong style={{ color: '#94a3b8' }}>Correct Answer: </strong>
                        <span style={{ color: '#10b981' }}>
                          {result.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button
            onClick={() => navigate('/student/assignment-history')}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Back to History
          </button>
        </div>
      </div>
    </div>
  )
}