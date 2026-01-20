import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { FaClock, FaPlay, FaArrowLeft, FaArrowRight, FaFlag } from 'react-icons/fa'
import api from '../utils/api'

export default function AssignmentView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [assignment, setAssignment] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [examStarted, setExamStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [examCompleted, setExamCompleted] = useState(false)
  const [examResults, setExamResults] = useState(null)
  const [canRetake, setCanRetake] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false)

  useEffect(() => {
    console.log('Assignment view loading for ID:', id)
    loadAssignment()
  }, [id])

  useEffect(() => {
    let timer
    if (examStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [examStarted, timeLeft])

  const loadAssignment = async () => {
    try {
      // Check if assignment is already submitted
      const submittedKey = `assignment_submitted_${id}`
      const isSubmitted = localStorage.getItem(submittedKey) === 'true'
      
      if (isSubmitted) {
        // Show completed assignment from history
        const completedAssignments = JSON.parse(localStorage.getItem('completed_assignments') || '[]')
        const completedAssignment = completedAssignments.find(a => a.id === id)
        
        if (completedAssignment) {
          setExamResults({
            score: completedAssignment.score,
            correctAnswers: completedAssignment.correctAnswers,
            totalQuestions: completedAssignment.totalQuestions,
            results: completedAssignment.results,
            submissionTime: new Date(completedAssignment.completedAt),
            timeUsed: completedAssignment.timeUsed
          })
          setExamCompleted(true)
          setLoading(false)
          return
        }
      }
      
      setLoading(false)
      
      // First try to get from localStorage (passed from dashboard)
      const storedAssignment = localStorage.getItem('current_assignment')
      
      if (storedAssignment && storedAssignment !== 'undefined') {
        const assignmentData = JSON.parse(storedAssignment)
        const assignment = assignmentData.assignment
        if (assignment && assignment.questions && assignment.questions.length > 0) {
          setAssignment({
            title: assignment.title || 'Assignment',
            description: assignment.description || 'Complete this assignment',
            subject: assignment.class_subject || assignment.subject || 'General',
            teacher: assignment.created_by_name || 'Teacher',
            duration: assignment.time_limit || 30,
            questions: assignment.questions
          })
          return
        }
      }
      
      // Use fallback data
      setAssignment({
        title: 'Science Assignment',
        description: 'Complete this assignment about atoms and molecules.',
        subject: 'Science',
        teacher: 'osei elshadai',
        duration: 30,
        questions: [
          {
            id: 2,
            question_text: 'How many legs have an ant',
            question_type: 'MULTIPLE_CHOICE',
            points: 1,
            order: 0,
            expected_answer: '',
            case_sensitive: false,
            options: [
              { id: 3, option_text: '2', is_correct: false, order: 0 },
              { id: 4, option_text: '4', is_correct: true, order: 0 }
            ]
          }
        ]
      })
    } catch (error) {
      console.error('Error loading assignment:', error)
      setAssignment({
        title: `Assignment ${id}`,
        description: 'This is a sample assignment. Please complete all questions.',
        subject: 'Mathematics',
        teacher: 'Class Teacher',
        duration: 30,
        questions: [
          {
            id: 1,
            question_text: 'What is 2 + 2?',
            options: [
              { option_text: '2', is_correct: false },
              { option_text: '3', is_correct: false },
              { option_text: '4', is_correct: true },
              { option_text: '5', is_correct: false }
            ]
          }
        ]
      })
    }
  }

  const startExam = () => {
    setExamStarted(true)
    setTimeLeft(assignment.duration * 60) // Convert minutes to seconds
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const nextQuestion = () => {
    if (currentQuestion < assignment.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const calculateGrade = (answers, questions) => {
    let correctAnswers = 0
    const results = []
    
    questions.forEach(question => {
      const studentAnswer = answers[question.id]
      const correctOption = question.options?.find(opt => opt.is_correct)
      const correctAnswer = correctOption ? String.fromCharCode(65 + question.options.indexOf(correctOption)) : null
      
      const isCorrect = studentAnswer === correctAnswer
      if (isCorrect) correctAnswers++
      
      results.push({
        question: question.question_text,
        studentAnswer: studentAnswer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect
      })
    })
    
    const score = Math.round((correctAnswers / questions.length) * 100)
    return { score, correctAnswers, totalQuestions: questions.length, results }
  }

  const handleSubmit = async () => {
    // Mark assignment as submitted
    const submittedKey = `assignment_submitted_${id}`
    localStorage.setItem(submittedKey, 'true')
    
    // Calculate grade automatically
    const gradeResult = calculateGrade(answers, assignment.questions)
    
    // Set results and mark exam as completed
    const results = {
      score: gradeResult.score,
      correctAnswers: gradeResult.correctAnswers,
      totalQuestions: gradeResult.totalQuestions,
      results: gradeResult.results,
      submissionTime: new Date(),
      timeUsed: assignment.duration * 60 - timeLeft
    }
    
    setExamResults(results)
    setExamCompleted(true)
    
    // Save to completed assignments history
    const completedAssignments = JSON.parse(localStorage.getItem('completed_assignments') || '[]')
    const assignmentRecord = {
      id: id,
      title: assignment.title,
      subject: assignment.subject,
      teacher: assignment.teacher,
      score: gradeResult.score,
      correctAnswers: gradeResult.correctAnswers,
      totalQuestions: gradeResult.totalQuestions,
      results: gradeResult.results,
      completedAt: new Date().toISOString(),
      timeUsed: assignment.duration * 60 - timeLeft
    }
    
    // Update or add assignment record
    const existingIndex = completedAssignments.findIndex(a => a.id === id)
    if (existingIndex >= 0) {
      completedAssignments[existingIndex] = assignmentRecord
    } else {
      completedAssignments.push(assignmentRecord)
    }
    
    localStorage.setItem('completed_assignments', JSON.stringify(completedAssignments))
    
    // ALSO save to student_submissions for GradeBook compatibility
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    const studentSubmissions = JSON.parse(localStorage.getItem('student_submissions') || '[]')
    
    const submissionData = {
      id: Date.now(),
      assignment_id: parseInt(id) || id,
      student_id: currentUser.id || 1,
      submission_text: `Quiz completed with ${gradeResult.correctAnswers}/${gradeResult.totalQuestions} correct answers`,
      submitted_at: new Date().toISOString(),
      status: 'SUBMITTED',
      is_graded: true,
      score: gradeResult.score,
      feedback: 'Auto-graded by system'
    }
    
    studentSubmissions.push(submissionData)
    localStorage.setItem('student_submissions', JSON.stringify(studentSubmissions))
    
    console.log('🎯 Quiz submission saved to localStorage:', submissionData)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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
        Loading assignment...
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
        Assignment not found
      </div>
    )
  }

  // Task Details View (before exam starts)
  if (!examStarted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          background: 'rgba(15, 23, 42, 0.9)',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 24px 0', color: '#e2e8f0', fontSize: '28px' }}>
            {assignment.title}
          </h1>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#10b981' }}>Subject</h3>
              <p style={{ margin: 0, fontSize: '18px' }}>{assignment.subject}</p>
            </div>
            
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#8b5cf6' }}>Teacher</h3>
              <p style={{ margin: 0, fontSize: '18px' }}>{assignment.teacher || 'Class Teacher'}</p>
            </div>
            
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#f59e0b' }}>Duration</h3>
              <p style={{ margin: 0, fontSize: '18px' }}>
                <FaClock style={{ marginRight: '8px' }} />
                {assignment.duration} minutes
              </p>
            </div>
            
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#3b82f6' }}>Questions</h3>
              <p style={{ margin: 0, fontSize: '18px' }}>{assignment.questions.length}</p>
            </div>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#e2e8f0' }}>Description</h3>
            <p style={{ margin: 0, color: '#94a3b8', lineHeight: '1.6' }}>
              {assignment.description}
            </p>
          </div>

          <button
            onClick={startExam}
            style={{
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '0 auto'
            }}
          >
            <FaPlay /> Start Attempt
          </button>
        </div>
      </div>
    )
  }

  // Results View
  if (examCompleted && examResults) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'rgba(15, 23, 42, 0.9)',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: examResults.score >= 70 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '32px',
            fontWeight: '700'
          }}>
            {examResults.score}%
          </div>
          
          <h1 style={{ margin: '0 0 16px 0', fontSize: '28px' }}>
            {examResults.score >= 70 ? 'Excellent Work!' : 'Keep Practicing!'}
          </h1>
          
          <p style={{ margin: '0 0 32px 0', color: '#94a3b8', fontSize: '16px' }}>
            You scored {examResults.correctAnswers} out of {examResults.totalQuestions} questions correctly
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              padding: '20px',
              borderRadius: '12px'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#10b981' }}>Score</h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>{examResults.score}%</p>
            </div>
            
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              padding: '20px',
              borderRadius: '12px'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#3b82f6' }}>Time Used</h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                {Math.floor(examResults.timeUsed / 60)}:{(examResults.timeUsed % 60).toString().padStart(2, '0')}
              </p>
            </div>
            
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              padding: '20px',
              borderRadius: '12px'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#8b5cf6' }}>Correct</h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                {examResults.correctAnswers}/{examResults.totalQuestions}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/student-dashboard')}
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
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '20px'
    }}>
      {/* Timer Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(15, 23, 42, 0.95)',
        padding: '16px',
        borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, color: 'white' }}>{assignment.title}</h2>
        <div style={{
          background: timeLeft < 300 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
          color: timeLeft < 300 ? '#ef4444' : '#10b981',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          <FaClock style={{ marginRight: '8px' }} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question Content */}
      <div style={{
        maxWidth: '800px',
        margin: '80px auto 0',
        background: 'rgba(15, 23, 42, 0.9)',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: 0, color: '#94a3b8' }}>
            Question {currentQuestion + 1} of {assignment.questions.length}
          </h3>
          <div style={{
            background: 'rgba(59, 130, 246, 0.2)',
            color: '#60a5fa',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px'
          }}>
            {Object.keys(answers).length} / {assignment.questions.length} answered
          </div>
        </div>

        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: 'white', lineHeight: '1.4' }}>
            {assignment.questions[currentQuestion]?.question_text || assignment.questions[currentQuestion]?.question}
          </h2>
          
          {assignment.questions[currentQuestion]?.options ? assignment.questions[currentQuestion].options.map((option, optIndex) => (
            <label key={optIndex} style={{
              display: 'block',
              padding: '12px 16px',
              margin: '8px 0',
              background: answers[assignment.questions[currentQuestion].id] === String.fromCharCode(65 + optIndex) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.5)',
              border: `1px solid ${answers[assignment.questions[currentQuestion].id] === String.fromCharCode(65 + optIndex) ? '#10b981' : 'rgba(71, 85, 105, 0.3)'}`,
              borderRadius: '8px',
              color: '#e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <input
                type="radio"
                name={`question_${assignment.questions[currentQuestion].id}`}
                value={String.fromCharCode(65 + optIndex)}
                checked={answers[assignment.questions[currentQuestion].id] === String.fromCharCode(65 + optIndex)}
                onChange={(e) => handleAnswerChange(assignment.questions[currentQuestion].id, e.target.value)}
                style={{ marginRight: '12px' }}
              />
              <strong>{String.fromCharCode(65 + optIndex)}.</strong> {option.option_text || option}
            </label>
          )) : (
            <textarea
              placeholder="Type your answer here..."
              value={answers[assignment.questions[currentQuestion]?.id] || ''}
              onChange={(e) => handleAnswerChange(assignment.questions[currentQuestion].id, e.target.value)}
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '16px',
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          )}
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            style={{
              padding: '12px 20px',
              background: currentQuestion === 0 ? 'rgba(71, 85, 105, 0.3)' : 'rgba(71, 85, 105, 0.6)',
              color: currentQuestion === 0 ? '#64748b' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaArrowLeft /> Previous
          </button>

          <button
            onClick={handleSubmit}
            disabled={false}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600'
            }}
          >
            <FaFlag /> Submit Exam
          </button>

          <button
            onClick={nextQuestion}
            disabled={currentQuestion === assignment.questions.length - 1}
            style={{
              padding: '12px 20px',
              background: currentQuestion === assignment.questions.length - 1 ? 'rgba(71, 85, 105, 0.3)' : 'rgba(16, 185, 129, 0.6)',
              color: currentQuestion === assignment.questions.length - 1 ? '#64748b' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: currentQuestion === assignment.questions.length - 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Next <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  )
}