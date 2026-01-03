import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'
import { FaPoll, FaPlay, FaStop, FaCheck, FaTimes, FaChartBar } from 'react-icons/fa'

export default function VirtualQuiz({ sessionId, isTeacher }) {
  const { user } = useAuth()
  const [quizzes, setQuizzes] = useState([])
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [responses, setResponses] = useState([])
  const [userAnswer, setUserAnswer] = useState('')
  const [isMobile] = useState(window.innerWidth <= 768)
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    time_limit: 30
  })

  useEffect(() => {
    if (sessionId) {
      loadQuizzes()
    }
  }, [sessionId])

  const loadQuizzes = async () => {
    try {
      const response = await api.get(`/virtual-sessions/${sessionId}/quizzes/`)
      setQuizzes(response.data)
    } catch (error) {
      console.error('Error loading quizzes:', error)
    }
  }

  const createQuiz = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/virtual-sessions/${sessionId}/quizzes/`, formData)
      setShowCreateModal(false)
      setFormData({
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        time_limit: 30
      })
      loadQuizzes()
    } catch (error) {
      console.error('Error creating quiz:', error)
    }
  }

  const startQuiz = async (quizId) => {
    try {
      const response = await api.post(`/virtual-sessions/${sessionId}/quizzes/${quizId}/start/`)
      setActiveQuiz(response.data)
      loadResponses(quizId)
    } catch (error) {
      console.error('Error starting quiz:', error)
    }
  }

  const submitAnswer = async () => {
    if (!userAnswer) return
    
    try {
      await api.post(`/virtual-sessions/${sessionId}/quizzes/${activeQuiz.id}/respond/`, {
        answer: userAnswer
      })
      setUserAnswer('')
      loadResponses(activeQuiz.id)
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  const loadResponses = async (quizId) => {
    try {
      const response = await api.get(`/virtual-sessions/${sessionId}/quizzes/${quizId}/responses/`)
      setResponses(response.data)
    } catch (error) {
      console.error('Error loading responses:', error)
    }
  }

  const endQuiz = async () => {
    try {
      await api.post(`/virtual-sessions/${sessionId}/quizzes/${activeQuiz.id}/end/`)
      setActiveQuiz(null)
      setResponses([])
      loadQuizzes()
    } catch (error) {
      console.error('Error ending quiz:', error)
    }
  }

  if (activeQuiz) {
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderRadius: '16px',
        padding: isMobile ? '16px' : '24px',
        margin: isMobile ? '12px 0' : '20px 0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: 0, color: 'white' }}>Live Quiz</h3>
          {isTeacher && (
            <button
              onClick={endQuiz}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              <FaStop /> End Quiz
            </button>
          )}
        </div>

        <div style={{
          background: 'rgba(30, 41, 59, 0.8)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 16px 0', color: 'white', fontSize: '18px' }}>
            {activeQuiz.question}
          </h4>
          
          {!isTeacher && (
            <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
              {activeQuiz.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setUserAnswer(index)}
                  style={{
                    background: userAnswer === index ? '#3b82f6' : 'rgba(71, 85, 105, 0.3)',
                    color: 'white',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              ))}
              
              <button
                onClick={submitAnswer}
                disabled={userAnswer === ''}
                style={{
                  background: userAnswer !== '' ? '#10b981' : '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: userAnswer !== '' ? 'pointer' : 'not-allowed',
                  marginTop: '8px'
                }}
              >
                Submit Answer
              </button>
            </div>
          )}
        </div>

        {isTeacher && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaChartBar /> Responses ({responses.length})
            </h4>
            
            <div style={{ display: 'grid', gap: '8px' }}>
              {activeQuiz.options.map((option, index) => {
                const count = responses.filter(r => r.answer === index).length
                const percentage = responses.length > 0 ? (count / responses.length) * 100 : 0
                
                return (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    borderRadius: '6px',
                    background: index === activeQuiz.correct_answer ? 'rgba(16, 185, 129, 0.2)' : 'rgba(71, 85, 105, 0.2)'
                  }}>
                    <div style={{ minWidth: '20px', color: 'white' }}>
                      {String.fromCharCode(65 + index)}.
                    </div>
                    <div style={{ flex: 1, color: 'white' }}>{option}</div>
                    <div style={{ minWidth: '60px', textAlign: 'right', color: 'white' }}>
                      {count} ({percentage.toFixed(0)}%)
                    </div>
                    {index === activeQuiz.correct_answer && (
                      <FaCheck style={{ color: '#10b981' }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.8)',
      borderRadius: '16px',
      padding: '20px',
      margin: '20px 0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaPoll /> Interactive Quizzes
        </h3>
        {isTeacher && (
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Create Quiz
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {quizzes.map(quiz => (
          <div key={quiz.id} style={{
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ color: 'white', fontWeight: '500' }}>{quiz.question}</div>
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                {quiz.options.length} options • {quiz.time_limit}s
              </div>
            </div>
            {isTeacher && quiz.status === 'DRAFT' && (
              <button
                onClick={() => startQuiz(quiz.id)}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaPlay /> Start
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: 'white' }}>Create Quiz</h3>
            
            <form onSubmit={createQuiz} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px' }}>
                  Question
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  required
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '12px', color: 'white', fontSize: '14px' }}>
                  Options
                </label>
                {formData.options.map((option, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="radio"
                      name="correct"
                      checked={formData.correct_answer === index}
                      onChange={() => setFormData({...formData, correct_answer: index})}
                      style={{ marginTop: '12px' }}
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.options]
                        newOptions[index] = e.target.value
                        setFormData({...formData, options: newOptions})
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      required
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        background: 'rgba(30, 41, 59, 0.8)',
                        color: 'white'
                      }}
                    />
                  </div>
                ))}
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                  Select the radio button next to the correct answer
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '14px' }}>
                  Time Limit (seconds)
                </label>
                <input
                  type="number"
                  value={formData.time_limit}
                  onChange={(e) => setFormData({...formData, time_limit: e.target.value})}
                  min="10"
                  max="300"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    background: 'rgba(71, 85, 105, 0.3)',
                    color: '#94a3b8',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    cursor: 'pointer'
                  }}
                >
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}