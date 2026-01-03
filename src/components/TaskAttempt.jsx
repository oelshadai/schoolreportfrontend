import { useState, useEffect } from 'react'
import { FaArrowLeft, FaArrowRight, FaClock, FaCheck, FaPlay } from 'react-icons/fa'
import api from '../utils/api'

export default function TaskAttempt({ task, onComplete, onClose }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attemptId, setAttemptId] = useState(null)
  const [taskData, setTaskData] = useState(null)
  
  const isMobile = window.innerWidth <= 768

  useEffect(() => {
    startTaskAttempt()
  }, [])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeLeft])

  const startTaskAttempt = async () => {
    try {
      const response = await api.post(`/assignments/tasks/${task.id}/start/`)
      setAttemptId(response.data.attempt_id)
      setTaskData(response.data.task)
      setTimeLeft(response.data.time_remaining)
    } catch (error) {
      console.error('Error starting task:', error)
      onClose()
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = async (questionIndex, answerIndex) => {
    setAnswers({
      ...answers,
      [questionIndex]: answerIndex
    })

    // Save answer to backend
    try {
      await api.post(`/assignments/attempts/${attemptId}/answer/`, {
        question_id: taskData.questions[questionIndex].id,
        selected_option: answerIndex
      })
    } catch (error) {
      console.error('Error saving answer:', error)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const response = await api.post(`/assignments/attempts/${attemptId}/submit/`)
      onComplete(response.data.score)
    } catch (error) {
      console.error('Error submitting task:', error)
      setIsSubmitting(false)
    }
  }

  const handleAutoSubmit = async () => {
    if (isSubmitting || !attemptId) return
    
    setIsSubmitting(true)
    try {
      const response = await api.post(`/assignments/attempts/${attemptId}/submit/`)
      onComplete(response.data.score)
    } catch (error) {
      console.error('Error auto-submitting task:', error)
    }
  }

  if (!taskData) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <FaPlay size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <div>Starting task...</div>
        </div>
      </div>
    )
  }

  const isLastQuestion = currentQuestion === taskData.questions.length - 1
  const allAnswered = taskData.questions.every((_, index) => answers[index] !== undefined)

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{taskData.title}</h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
            Question {currentQuestion + 1} of {taskData.questions.length}
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: timeLeft < 300 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            padding: '8px 12px',
            borderRadius: '8px',
            border: `1px solid ${timeLeft < 300 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
          }}>
            <FaClock size={14} />
            <span style={{ fontWeight: '600' }}>{formatTime(timeLeft)}</span>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'rgba(71, 85, 105, 0.3)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              color: '#94a3b8',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Exit
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        padding: '12px 20px'
      }}>
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(71, 85, 105, 0.3)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${((currentQuestion + 1) / taskData.questions.length) * 100}%`,
            height: '100%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '3px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Question Content */}
      <div style={{
        flex: 1,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(71, 85, 105, 0.3)'
        }}>
          <h3 style={{
            margin: '0 0 24px 0',
            fontSize: isMobile ? '18px' : '20px',
            lineHeight: '1.4',
            color: '#e2e8f0'
          }}>
            {taskData.questions[currentQuestion].question}
          </h3>

          <div style={{
            display: 'grid',
            gap: '12px',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)'
          }}>
            {taskData.questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion, index)}
                style={{
                  padding: '16px',
                  background: answers[currentQuestion] === index 
                    ? 'linear-gradient(135deg, #10b981, #059669)' 
                    : 'rgba(30, 41, 59, 0.6)',
                  border: `1px solid ${answers[currentQuestion] === index 
                    ? 'rgba(16, 185, 129, 0.5)' 
                    : 'rgba(71, 85, 105, 0.3)'}`,
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: answers[currentQuestion] === index 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : 'rgba(71, 85, 105, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)',
        padding: '16px 20px',
        borderTop: '1px solid rgba(71, 85, 105, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          style={{
            padding: '12px 20px',
            background: currentQuestion === 0 
              ? 'rgba(71, 85, 105, 0.3)' 
              : 'rgba(59, 130, 246, 0.2)',
            border: `1px solid ${currentQuestion === 0 
              ? 'rgba(71, 85, 105, 0.5)' 
              : 'rgba(59, 130, 246, 0.3)'}`,
            color: currentQuestion === 0 ? '#6b7280' : '#60a5fa',
            borderRadius: '8px',
            cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px'
          }}
        >
          <FaArrowLeft size={12} />
          Previous
        </button>

        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          {taskData.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: answers[index] !== undefined 
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : index === currentQuestion 
                    ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                    : 'rgba(71, 85, 105, 0.3)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {isLastQuestion && allAnswered ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: 'white',
              borderRadius: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <FaCheck size={12} />
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(Math.min(taskData.questions.length - 1, currentQuestion + 1))}
            disabled={currentQuestion === taskData.questions.length - 1}
            style={{
              padding: '12px 20px',
              background: currentQuestion === taskData.questions.length - 1 
                ? 'rgba(71, 85, 105, 0.3)' 
                : 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: 'white',
              borderRadius: '8px',
              cursor: currentQuestion === taskData.questions.length - 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            Next
            <FaArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  )
}