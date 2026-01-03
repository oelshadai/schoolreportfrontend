import { useState, useEffect } from 'react'
import { FaBook, FaCalculator, FaChartLine, FaDownload, FaEye } from 'react-icons/fa'
import api from '../utils/api'

export default function GradeBook() {
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [students, setStudents] = useState([])
  const [grades, setGrades] = useState({})
  const [assessments, setAssessments] = useState([])
  const [showAddAssessment, setShowAddAssessment] = useState(false)
  const [newAssessment, setNewAssessment] = useState({
    name: '',
    type: 'QUIZ',
    max_score: 100,
    weight: 1
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadClasses()
    loadSubjects()
  }, [])

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      loadStudents()
      loadAssessments()
      loadGrades()
    }
  }, [selectedClass, selectedSubject])

  const loadClasses = async () => {
    try {
      const response = await api.get('/schools/classes/')
      setClasses(response.data.results || response.data)
    } catch (error) {
      console.error('Error loading classes:', error)
    }
  }

  const loadSubjects = async () => {
    try {
      const response = await api.get('/schools/subjects/')
      setSubjects(response.data.results || response.data)
    } catch (error) {
      console.error('Error loading subjects:', error)
    }
  }

  const loadStudents = async () => {
    try {
      const response = await api.get(`/schools/classes/${selectedClass}/students/`)
      setStudents(response.data)
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const loadAssessments = async () => {
    try {
      const response = await api.get(`/gradebook/assessments/?class=${selectedClass}&subject=${selectedSubject}`)
      setAssessments(response.data)
    } catch (error) {
      console.error('Error loading assessments:', error)
    }
  }

  const loadGrades = async () => {
    try {
      const response = await api.get(`/gradebook/grades/?class=${selectedClass}&subject=${selectedSubject}`)
      const gradeData = {}
      response.data.forEach(grade => {
        if (!gradeData[grade.student_id]) {
          gradeData[grade.student_id] = {}
        }
        gradeData[grade.student_id][grade.assessment_id] = grade.score
      })
      setGrades(gradeData)
    } catch (error) {
      console.error('Error loading grades:', error)
    }
  }

  const addAssessment = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/gradebook/assessments/', {
        ...newAssessment,
        class_id: selectedClass,
        subject_id: selectedSubject
      })
      setShowAddAssessment(false)
      setNewAssessment({ name: '', type: 'QUIZ', max_score: 100, weight: 1 })
      loadAssessments()
    } catch (error) {
      console.error('Error adding assessment:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateGrade = async (studentId, assessmentId, score) => {
    try {
      await api.post('/gradebook/grades/', {
        student_id: studentId,
        assessment_id: assessmentId,
        score: parseFloat(score) || 0
      })
      
      setGrades(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [assessmentId]: parseFloat(score) || 0
        }
      }))
    } catch (error) {
      console.error('Error updating grade:', error)
    }
  }

  const calculateAverage = (studentId) => {
    const studentGrades = grades[studentId] || {}
    const scores = Object.values(studentGrades).filter(score => score !== undefined && score !== null)
    if (scores.length === 0) return 0
    return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)
  }

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return '#10b981' // Green
    if (percentage >= 80) return '#3b82f6' // Blue
    if (percentage >= 70) return '#f59e0b' // Yellow
    if (percentage >= 60) return '#f97316' // Orange
    return '#ef4444' // Red
  }

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <div className="page-header">
        <div className="page-title">
          <div className="page-title-icon">
            <FaBook />
          </div>
          <div>
            <h1>Grade Book</h1>
            <p>Manage student grades and assessments</p>
          </div>
        </div>
        <div className="actions">
          <button onClick={() => setShowAddAssessment(true)} className="btn btn-primary">
            Add Assessment
          </button>
        </div>
      </div>

      <div className="card">
        <div className="form-row">
          <div className="form-group">
            <label>Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Choose a class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.level} {cls.section}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">Choose a subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedClass && selectedSubject && (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ minWidth: '150px' }}>Student</th>
                  {assessments.map(assessment => (
                    <th key={assessment.id} style={{ minWidth: '100px', textAlign: 'center' }}>
                      <div>{assessment.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                        {assessment.type} ({assessment.max_score}pts)
                      </div>
                    </th>
                  ))}
                  <th style={{ minWidth: '100px', textAlign: 'center' }}>Average</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>
                        {student.first_name} {student.last_name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                        {student.student_id}
                      </div>
                    </td>
                    {assessments.map(assessment => (
                      <td key={assessment.id} style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          max={assessment.max_score}
                          value={grades[student.id]?.[assessment.id] || ''}
                          onChange={(e) => updateGrade(student.id, assessment.id, e.target.value)}
                          style={{
                            width: '70px',
                            textAlign: 'center',
                            padding: '4px 8px',
                            border: '1px solid var(--gray-300)',
                            borderRadius: '4px'
                          }}
                          placeholder="0"
                        />
                      </td>
                    ))}
                    <td style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          fontWeight: '700',
                          color: getGradeColor(calculateAverage(student.id)),
                          fontSize: '16px'
                        }}
                      >
                        {calculateAverage(student.id)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Assessment Modal */}
      {showAddAssessment && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Assessment</h2>
              <button
                onClick={() => setShowAddAssessment(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={addAssessment}>
                <div className="form-group">
                  <label>Assessment Name</label>
                  <input
                    type="text"
                    value={newAssessment.name}
                    onChange={(e) => setNewAssessment({...newAssessment, name: e.target.value})}
                    required
                    placeholder="e.g., Quiz 1, Midterm Exam"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={newAssessment.type}
                      onChange={(e) => setNewAssessment({...newAssessment, type: e.target.value})}
                    >
                      <option value="QUIZ">Quiz</option>
                      <option value="TEST">Test</option>
                      <option value="EXAM">Exam</option>
                      <option value="ASSIGNMENT">Assignment</option>
                      <option value="PROJECT">Project</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Max Score</label>
                    <input
                      type="number"
                      min="1"
                      value={newAssessment.max_score}
                      onChange={(e) => setNewAssessment({...newAssessment, max_score: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowAddAssessment(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
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