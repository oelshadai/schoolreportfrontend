import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaUpload, FaFile, FaCheck, FaClock } from 'react-icons/fa'
import FileUpload from '../components/FileUpload'
import api from '../utils/api'

export default function AssignmentSubmission() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState(null)
  const [submissionText, setSubmissionText] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    loadAssignment()
  }, [id])

  const loadAssignment = async () => {
    try {
      // Get assignment from localStorage or API
      const storedAssignment = localStorage.getItem('current_assignment')
      if (storedAssignment) {
        const assignmentData = JSON.parse(storedAssignment)
        setAssignment(assignmentData.assignment || assignmentData)
      } else {
        // Fallback assignment
        setAssignment({
          id: id,
          title: `Assignment ${id}`,
          description: 'Complete this assignment and submit your work.',
          subject: 'General',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          assignment_type: 'HOMEWORK'
        })
      }
    } catch (error) {
      console.error('Error loading assignment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!submissionText.trim() && !selectedFile) {
      alert('Please provide either text submission or upload a file')
      return
    }

    setSubmitting(true)
    
    try {
      // Get current user from localStorage or context
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      
      // Simulate API submission
      const submissionData = {
        assignment_id: parseInt(id) || id, // Ensure consistent ID format
        student_id: currentUser.id || 1,
        submission_text: submissionText,
        submission_file: selectedFile,
        submitted_at: new Date().toISOString(),
        status: 'SUBMITTED'
      }

      console.log('📤 Submitting assignment with data:', submissionData)

      // Save to localStorage for demo
      const submissions = JSON.parse(localStorage.getItem('student_submissions') || '[]')
      const newSubmission = {
        ...submissionData,
        id: Date.now()
      }
      submissions.push(newSubmission)
      localStorage.setItem('student_submissions', JSON.stringify(submissions))
      
      console.log('💾 Saved submission to localStorage:', newSubmission)
      console.log('📊 All submissions now:', submissions)

      // Auto-grade if it's a quiz
      if (assignment?.assignment_type === 'QUIZ') {
        const randomScore = Math.floor(Math.random() * 30) + 70 // 70-100 range
        const maxScore = assignment?.max_score || 100
        const finalScore = Math.min(randomScore, maxScore)
        
        // Create auto-graded submission
        newSubmission.is_graded = true
        newSubmission.score = finalScore
        newSubmission.feedback = 'Auto-graded by system'
        newSubmission.graded_by = 'system'
        
        // Update submissions with grade
        const updatedSubmissions = submissions.map(sub => 
          sub.id === newSubmission.id ? newSubmission : sub
        )
        localStorage.setItem('student_submissions', JSON.stringify(updatedSubmissions))
        
        // Create grade entry for student portal
        const gradeEntry = {
          id: Date.now() + 1,
          assignment_id: id,
          assignment_title: assignment?.title,
          student_id: currentUser.id || 1,
          score: finalScore,
          max_score: maxScore,
          feedback: 'Auto-graded by system',
          graded_at: new Date().toISOString(),
          subject: assignment?.subject || 'General',
          assignment_type: assignment?.assignment_type
        }
        
        const studentGrades = JSON.parse(localStorage.getItem('student_grades') || '[]')
        studentGrades.push(gradeEntry)
        localStorage.setItem('student_grades', JSON.stringify(studentGrades))
      } else {
        // For non-quiz assignments, create pending grade entry
        const pendingGradeEntry = {
          id: Date.now() + 1,
          assignment_id: id,
          assignment_title: assignment?.title,
          student_id: currentUser.id || 1,
          score: null,
          max_score: assignment?.max_score || 100,
          feedback: '',
          submitted_at: new Date().toISOString(),
          graded_at: null,
          subject: assignment?.subject || 'General',
          assignment_type: assignment?.assignment_type,
          status: 'PENDING_REVIEW'
        }
        
        const studentGrades = JSON.parse(localStorage.getItem('student_grades') || '[]')
        studentGrades.push(pendingGradeEntry)
        localStorage.setItem('student_grades', JSON.stringify(studentGrades))
      }

      // Mark as submitted
      setSubmitted(true)
      
      // Show success message
      setTimeout(() => {
        navigate('/student-dashboard')
      }, 2000)

    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit assignment. Please try again.')
    } finally {
      setSubmitting(false)
    }
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

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          color: 'white',
          maxWidth: '500px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <FaCheck size={32} />
          </div>
          <h2 style={{ margin: '0 0 16px 0' }}>Assignment Submitted!</h2>
          <p style={{ margin: '0 0 24px 0', color: '#94a3b8' }}>
            Your assignment has been submitted successfully. You will be redirected to the dashboard.
          </p>
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
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => navigate('/student-dashboard')}
            style={{
              background: 'rgba(71, 85, 105, 0.3)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              color: '#94a3b8',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <FaArrowLeft />
          </button>
          <h1 style={{ margin: 0, color: 'white' }}>Submit Assignment</h1>
        </div>

        {/* Assignment Info */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          color: 'white'
        }}>
          <h2 style={{ margin: '0 0 16px 0' }}>{assignment?.title}</h2>
          <p style={{ margin: '0 0 16px 0', color: '#94a3b8' }}>
            {assignment?.description}
          </p>
          <div style={{
            display: 'flex',
            gap: '24px',
            fontSize: '14px',
            color: '#94a3b8'
          }}>
            <span>Subject: {assignment?.subject}</span>
            <span>Type: {assignment?.assignment_type}</span>
            <span>
              <FaClock style={{ marginRight: '4px' }} />
              Due: {assignment?.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
            </span>
          </div>
        </div>

        {/* Submission Form */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 20px 0' }}>Your Submission</h3>

          {/* Text Submission */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              Written Response
            </label>
            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Type your assignment response here..."
              style={{
                width: '100%',
                minHeight: '200px',
                padding: '16px',
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* File Upload */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              File Attachment (Optional)
            </label>
            <FileUpload onFileSelect={setSelectedFile} />
          </div>

          {/* Submit Button */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={() => navigate('/student-dashboard')}
              style={{
                padding: '12px 24px',
                background: 'rgba(71, 85, 105, 0.3)',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                color: '#94a3b8',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || (!submissionText.trim() && !selectedFile)}
              style={{
                padding: '12px 24px',
                background: submitting ? 'rgba(71, 85, 105, 0.3)' : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600'
              }}
            >
              {submitting ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Submitting...
                </>
              ) : (
                <>
                  <FaUpload />
                  Submit Assignment
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}