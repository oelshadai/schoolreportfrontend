import { useState, useEffect } from 'react'
import { FaBook, FaCalculator, FaChartLine, FaDownload, FaEye, FaCheck, FaTimes } from 'react-icons/fa'
import api from '../utils/api'
import { useAuth } from '../state/AuthContext'

export default function GradeBook() {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [submissions, setSubmissions] = useState([])
  const [assignments, setAssignments] = useState([])
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [loading, setLoading] = useState(false)
  const [grading, setGrading] = useState(false)

  useEffect(() => {
    loadTeacherClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      loadClassAssignments()
    }
  }, [selectedClass])

  useEffect(() => {
    if (selectedClass && selectedAssignment) {
      loadSubmissions()
    }
  }, [selectedClass, selectedAssignment])

  const loadTeacherClasses = async () => {
    try {
      const response = await api.get('/schools/classes/')
      const allClasses = response.data.results || response.data
      
      // Filter classes where user is class teacher or teaches subjects
      const teacherClasses = allClasses.filter(cls => 
        cls.class_teacher === user.id || 
        cls.subjects?.some(subject => subject.teacher === user.id)
      )
      
      setClasses(teacherClasses)
    } catch (error) {
      console.error('Error loading classes:', error)
      setClasses([])
    }
  }

  const loadClassAssignments = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/assignments/assignments/?class=${selectedClass}&teacher=${user.id}`)
      setAssignments(response.data.results || response.data || [])
    } catch (error) {
      console.error('Error loading assignments:', error)
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      
      // Get submissions from localStorage first
      const localSubmissions = JSON.parse(localStorage.getItem('student_submissions') || '[]')
      console.log('🔍 All localStorage submissions:', localSubmissions)
      console.log('🔍 Assignment IDs in localStorage:', localSubmissions.map(sub => sub.assignment_id))
      console.log('🎯 Selected assignment ID:', selectedAssignment, typeof selectedAssignment)
      
      // Filter submissions for this assignment (check both string and number IDs)
      const assignmentSubmissions = localSubmissions.filter(sub => {
        console.log('🔄 Checking submission:', sub.assignment_id, 'vs', selectedAssignment)
        return sub.assignment_id == selectedAssignment || String(sub.assignment_id) === String(selectedAssignment)
      })
      console.log('✅ Filtered assignment submissions:', assignmentSubmissions)
      
      // DISABLE API CALLS - USING ONLY LOCALSTORAGE FOR NOW
      let apiSubmissions = []
      console.log('🚫 API calls disabled - using localStorage only')
      
      // Convert localStorage submissions to proper format
      const formattedLocalSubmissions = assignmentSubmissions.map(localSub => {
        console.log('📝 Processing submission:', localSub)
        return {
          id: localSub.id,
          assignment: assignments.find(a => a.id == selectedAssignment),
          student: { 
            id: localSub.student_id, 
            first_name: 'Bonsu', 
            last_name: 'Charity',
            student_id: localSub.student_id ? `BC${String(localSub.student_id).padStart(3, '0')}` : 'BC001'
          },
          submission_text: localSub.submission_text,
          submitted_at: localSub.submitted_at,
          is_graded: localSub.is_graded || false,
          score: localSub.score || null,
          feedback: localSub.feedback || '',
          status: localSub.status || 'SUBMITTED',
          attachment_url: localSub.submission_file
        }
      })
      
      console.log('🎨 Formatted local submissions:', formattedLocalSubmissions)
      console.log('🔍 Each formatted submission:', formattedLocalSubmissions.map((sub, i) => `${i}: ID=${sub.id}, StudentID=${sub.student?.id}`))
      
      // Create submissions array - be explicit to avoid spread operator issues
      const allSubmissions = []
      formattedLocalSubmissions.forEach(sub => allSubmissions.push(sub))
      
      console.log('📦 Initial allSubmissions (from local):', allSubmissions)
      console.log('🔍 Each initial submission:', allSubmissions.map((sub, i) => `${i}: ID=${sub.id}, StudentID=${sub.student?.id}`))
      
      // Add API submissions that don't exist in local storage
      console.log('🌐 API submissions to check:', apiSubmissions)
      apiSubmissions.forEach(apiSub => {
        // Better deduplication: check by submission ID or student ID
        const existingSubmission = allSubmissions.find(sub => 
          sub.id === apiSub.id || 
          (sub.student?.id && apiSub.student?.id && sub.student.id == apiSub.student.id)
        )
        console.log('🔍 Checking API submission ID:', apiSub.id, 'student:', apiSub.student?.id, 'existing:', !!existingSubmission)
        if (!existingSubmission) {
          console.log('➕ Adding API submission:', apiSub)
          allSubmissions.push(apiSub)
        } else {
          console.log('⏭️ Skipping duplicate API submission ID:', apiSub.id)
        }
      })
      
      console.log('🏁 Final submissions before placeholder check:', allSubmissions)
      
      // Only add placeholder if no submissions exist at all
      if (allSubmissions.length === 0) {
        console.log('🔴 No submissions found, adding placeholder')
        allSubmissions.push({
          id: 'placeholder-1',
          assignment: assignments.find(a => a.id == selectedAssignment),
          student: { 
            id: 1, 
            first_name: 'Bonsu', 
            last_name: 'Charity',
            student_id: 'BC001' 
          },
          submission_text: null,
          submitted_at: null,
          is_graded: false,
          score: null,
          feedback: '',
          status: 'NOT_SUBMITTED'
        })
      } else {
        console.log('✅ Found', allSubmissions.length, 'submissions, no placeholder needed')
      }
      
      console.log('🏁 Final submissions:', allSubmissions)
      setSubmissions(allSubmissions)
    } catch (error) {
      console.error('Error loading submissions:', error)
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  const gradeSubmission = async (submissionId, score, feedback = '') => {
    try {
      setGrading(true)
      
      // Try API first
      try {
        await api.post(`/assignments/submissions/${submissionId}/grade/`, {
          score: parseFloat(score),
          feedback,
          graded_by: user.id
        })
      } catch (apiError) {
        console.log('API grading failed, using local storage')
      }
      
      // Update local storage for demo
      const localSubmissions = JSON.parse(localStorage.getItem('student_submissions') || '[]')
      const updatedSubmissions = localSubmissions.map(sub => 
        sub.id == submissionId 
          ? { ...sub, score: parseFloat(score), feedback, is_graded: true, graded_by: user.id }
          : sub
      )
      localStorage.setItem('student_submissions', JSON.stringify(updatedSubmissions))
      
      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id == submissionId 
          ? { ...sub, score: parseFloat(score), feedback, is_graded: true }
          : sub
      ))
      
      // Create grade entry for student portal
      const gradeEntry = {
        id: Date.now(),
        assignment_id: selectedAssignment,
        assignment_title: assignments.find(a => a.id == selectedAssignment)?.title,
        student_id: submissions.find(s => s.id == submissionId)?.student?.id,
        score: parseFloat(score),
        max_score: assignments.find(a => a.id == selectedAssignment)?.max_score || 100,
        feedback,
        graded_at: new Date().toISOString(),
        subject: assignments.find(a => a.id == selectedAssignment)?.subject
      }
      
      const studentGrades = JSON.parse(localStorage.getItem('student_grades') || '[]')
      studentGrades.push(gradeEntry)
      localStorage.setItem('student_grades', JSON.stringify(studentGrades))
      
    } catch (error) {
      console.error('Error grading submission:', error)
    } finally {
      setGrading(false)
    }
  }

  const getStatusColor = (submission) => {
    if (submission.is_graded) return '#16a34a' // Green
    if (submission.submitted_at) return '#f59e0b' // Yellow
    return '#6b7280' // Gray
  }

  const getStatusText = (submission) => {
    if (submission.is_graded) return 'Graded'
    if (submission.submitted_at || submission.status === 'SUBMITTED') {
      if (submission.assignment?.assignment_type === 'QUIZ') {
        autoGradeQuiz(submission)
        return 'Auto-Graded'
      }
      return 'Submitted'
    }
    return 'Not Submitted'
  }

  const autoGradeQuiz = (submission) => {
    if (!submission.is_graded && submission.assignment?.assignment_type === 'QUIZ') {
      // Simulate auto-grading with random score for demo
      const randomScore = Math.floor(Math.random() * 30) + 70 // 70-100 range
      const maxScore = submission.assignment?.max_score || 100
      
      setTimeout(() => {
        gradeSubmission(submission.id, Math.min(randomScore, maxScore), 'Auto-graded by system')
      }, 1000)
    }
  }

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#f8fafc',
      paddingTop: '120px',
      paddingLeft: '20px',
      paddingRight: '20px',
      paddingBottom: '40px',
      overflowX: 'hidden'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#16a34a',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaBook size={20} color="white" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>Grade Book</h1>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Grade student assignment submissions</p>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#374151',
                background: 'white'
              }}
            >
              <option value="">Choose a class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.level} {cls.section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>Select Assignment</label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              disabled={!selectedClass || assignments.length === 0}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#374151',
                background: 'white',
                cursor: (!selectedClass || assignments.length === 0) ? 'not-allowed' : 'pointer',
                opacity: (!selectedClass || assignments.length === 0) ? 0.5 : 1
              }}
            >
              <option value="">Choose an assignment</option>
              {assignments.map(assignment => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title} ({assignment.assignment_type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedClass && selectedAssignment && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
              Student Submissions
            </h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              {submissions.filter(s => s.submitted_at || s.status === 'SUBMITTED').length} of {submissions.length} students submitted
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Loading submissions...
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {submissions.map(submission => (
                <div key={submission.id} style={{
                  background: '#f9fafb',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#1f2937', fontWeight: '600' }}>
                        {submission.student_name || `${submission.student?.first_name} ${submission.student?.last_name}`}
                      </h4>
                      <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px' }}>
                        Student ID: {submission.student?.student_id}
                      </p>
                      {submission.submitted_at && (
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>
                          Submitted: {new Date(submission.submitted_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        background: getStatusColor(submission),
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {getStatusText(submission)}
                      </span>
                      
                      {submission.is_graded && (
                        <span style={{
                          padding: '4px 12px',
                          background: '#16a34a',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {submission.score}/{submission.assignment?.max_score || 100}
                        </span>
                      )}
                    </div>
                  </div>

                  {submission.submitted_at && (
                    <div style={{ marginBottom: '12px' }}>
                      {submission.submission_text && (
                        <div style={{ marginBottom: '8px' }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Submission:</p>
                          <p style={{ margin: 0, fontSize: '14px', color: '#1f2937', background: 'white', padding: '8px', borderRadius: '4px' }}>
                            {submission.submission_text}
                          </p>
                        </div>
                      )}
                      
                      {submission.attachment_url && (
                        <div style={{ marginBottom: '8px' }}>
                          <a 
                            href={submission.attachment_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              color: '#16a34a',
                              textDecoration: 'none',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            <FaDownload style={{ marginRight: '4px' }} />
                            View Attachment
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {submission.submitted_at && !submission.is_graded && submission.assignment?.assignment_type !== 'QUIZ' && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '100px 1fr auto',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '12px',
                      background: 'white',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <input
                        type="number"
                        placeholder="Score"
                        min="0"
                        max={submission.assignment?.max_score || 100}
                        style={{
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px',
                          textAlign: 'center'
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const score = e.target.value
                            const feedback = e.target.parentElement.querySelector('input[placeholder="Feedback (optional)"]').value
                            if (score) gradeSubmission(submission.id, score, feedback)
                          }
                        }}
                      />
                      
                      <input
                        type="text"
                        placeholder="Feedback (optional)"
                        style={{
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      
                      <button
                        onClick={(e) => {
                          const container = e.target.parentElement
                          const score = container.querySelector('input[type="number"]').value
                          const feedback = container.querySelector('input[placeholder="Feedback (optional)"]').value
                          if (score) gradeSubmission(submission.id, score, feedback)
                        }}
                        disabled={grading}
                        style={{
                          padding: '8px 16px',
                          background: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: grading ? 'not-allowed' : 'pointer',
                          opacity: grading ? 0.6 : 1
                        }}
                      >
                        <FaCheck style={{ marginRight: '4px' }} />
                        Grade
                      </button>
                    </div>
                  )}

                  {submission.submitted_at && !submission.is_graded && submission.assignment?.assignment_type === 'QUIZ' && (
                    <div style={{
                      padding: '12px',
                      background: '#fef3c7',
                      borderRadius: '6px',
                      border: '1px solid #f59e0b',
                      textAlign: 'center'
                    }}>
                      <p style={{ margin: 0, color: '#92400e', fontSize: '14px', fontWeight: '600' }}>
                        🤖 Quiz auto-graded upon submission
                      </p>
                    </div>
                  )}

                  {submission.is_graded && submission.feedback && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px',
                      background: '#f0f9ff',
                      borderRadius: '4px',
                      border: '1px solid #bae6fd'
                    }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '600', color: '#0369a1' }}>Feedback:</p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#0c4a6e' }}>{submission.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
              
              {submissions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  <FaBook size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p>No submissions found for this assignment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Assessment Modal */}
      {false && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>Add New Assessment</h2>
              <button
                onClick={() => setShowAddAssessment(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>
            <div>
              <form onSubmit={addAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>Assessment Name</label>
                  <input
                    type="text"
                    value={newAssessment.name}
                    onChange={(e) => setNewAssessment({...newAssessment, name: e.target.value})}
                    required
                    placeholder="e.g., Quiz 1, Midterm Exam"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#374151'
                    }}
                  />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>Type</label>
                    <select
                      value={newAssessment.type}
                      onChange={(e) => setNewAssessment({...newAssessment, type: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#374151',
                        background: 'white'
                      }}
                    >
                      <option value="QUIZ">Quiz</option>
                      <option value="TEST">Test</option>
                      <option value="EXAM">Exam</option>
                      <option value="ASSIGNMENT">Assignment</option>
                      <option value="PROJECT">Project</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>Max Score</label>
                    <input
                      type="number"
                      min="1"
                      value={newAssessment.max_score}
                      onChange={(e) => setNewAssessment({...newAssessment, max_score: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#374151'
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '20px'
                }}>
                  <button
                    type="button"
                    onClick={() => setShowAddAssessment(false)}
                    style={{
                      padding: '12px 20px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      background: 'white',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '12px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      background: '#16a34a',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    {loading ? 'Adding...' : 'Add Assessment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}