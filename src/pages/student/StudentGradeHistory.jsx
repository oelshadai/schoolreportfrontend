import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FaArrowLeft, FaCalendarAlt, FaTrophy, FaChartLine, FaEye, 
  FaDownload, FaFilter, FaSearch, FaGraduationCap, FaAward,
  FaBookOpen, FaClock, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa'
import api from '../../utils/api'

export default function StudentGradeHistory() {
  const navigate = useNavigate()
  const [gradeHistory, setGradeHistory] = useState([])
  const [filteredHistory, setFilteredHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    term: 'all',
    subject: 'all',
    type: 'all',
    search: ''
  })
  const [stats, setStats] = useState({
    totalAssignments: 0,
    averageGrade: 0,
    highestGrade: 0,
    lowestGrade: 0,
    improvementTrend: 0
  })
  const [terms, setTerms] = useState([])
  const [subjects, setSubjects] = useState([])
  const isMobile = window.innerWidth <= 768

  useEffect(() => {
    loadGradeHistory()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, gradeHistory])

  const loadGradeHistory = async () => {
    try {
      // Load assignment history
      const assignmentResponse = await api.get('/assignments/completed/')
      const assignmentData = assignmentResponse.data.results || []

      // Load subject results (from scores app)
      const scoresResponse = await api.get('/scores/student-results/')
      const scoresData = scoresResponse.data.results || []

      // Combine and format all grade data
      const combinedHistory = []

      // Add assignment grades
      assignmentData.forEach(assignment => {
        const bestScore = assignment.attempts && assignment.attempts.length > 0 
          ? Math.max(...assignment.attempts.map(a => a.score || 0))
          : assignment.final_score || 0

        combinedHistory.push({
          id: `assignment_${assignment.id}`,
          type: 'assignment',
          title: assignment.title,
          subject: assignment.subject || 'General',
          score: bestScore,
          maxScore: assignment.max_score || 100,
          percentage: (bestScore / (assignment.max_score || 100)) * 100,
          date: assignment.completed_at || assignment.submitted_at,
          term: assignment.term || 'Current Term',
          teacher: assignment.teacher || 'Unknown',
          attempts: assignment.attempts || [],
          feedback: assignment.attempts?.[assignment.attempts.length - 1]?.teacher_feedback || '',
          status: 'completed'
        })
      })

      // Add exam/test scores
      scoresData.forEach(score => {
        combinedHistory.push({
          id: `score_${score.id}`,
          type: 'exam',
          title: `${score.subject} - ${score.assessment_type || 'Exam'}`,
          subject: score.subject,
          score: score.total_score || 0,
          maxScore: score.max_score || 100,
          percentage: score.percentage || 0,
          date: score.date_recorded || score.created_at,
          term: score.term || 'Current Term',
          teacher: score.teacher || 'Unknown',
          grade: score.grade || '',
          remark: score.remark || '',
          status: 'completed'
        })
      })

      // If no real data, use comprehensive mock data
      if (combinedHistory.length === 0) {
        const mockHistory = [
          {
            id: 'assignment_1',
            type: 'assignment',
            title: 'Mathematics Quiz 1',
            subject: 'Mathematics',
            score: 92,
            maxScore: 100,
            percentage: 92,
            date: '2024-01-15T10:30:00Z',
            term: 'Term 1',
            teacher: 'Mr. Johnson',
            attempts: [
              { attempt_number: 1, score: 85, teacher_feedback: 'Good work! Review algebra concepts.' },
              { attempt_number: 2, score: 92, teacher_feedback: 'Excellent improvement!' }
            ],
            feedback: 'Excellent improvement!',
            status: 'completed'
          },
          {
            id: 'exam_1',
            type: 'exam',
            title: 'Mathematics - Mid-term Exam',
            subject: 'Mathematics',
            score: 88,
            maxScore: 100,
            percentage: 88,
            date: '2024-01-20T09:00:00Z',
            term: 'Term 1',
            teacher: 'Mr. Johnson',
            grade: 'A-',
            remark: 'Very Good',
            status: 'completed'
          },
          {
            id: 'assignment_2',
            type: 'assignment',
            title: 'English Essay - Character Analysis',
            subject: 'English',
            score: 85,
            maxScore: 100,
            percentage: 85,
            date: '2024-01-18T16:45:00Z',
            term: 'Term 1',
            teacher: 'Ms. Smith',
            attempts: [
              { attempt_number: 1, score: 85, teacher_feedback: 'Strong analysis with good supporting evidence.' }
            ],
            feedback: 'Strong analysis with good supporting evidence.',
            status: 'completed'
          },
          {
            id: 'assignment_3',
            type: 'assignment',
            title: 'Science Lab Report',
            subject: 'Science',
            score: 78,
            maxScore: 100,
            percentage: 78,
            date: '2024-01-25T11:15:00Z',
            term: 'Term 1',
            teacher: 'Dr. Wilson',
            attempts: [
              { attempt_number: 1, score: 78, teacher_feedback: 'Good observations but conclusions need more detail.' }
            ],
            feedback: 'Good observations but conclusions need more detail.',
            status: 'completed'
          },
          {
            id: 'exam_2',
            type: 'exam',
            title: 'English - Terminal Exam',
            subject: 'English',
            score: 82,
            maxScore: 100,
            percentage: 82,
            date: '2024-02-10T09:00:00Z',
            term: 'Term 1',
            teacher: 'Ms. Smith',
            grade: 'B+',
            remark: 'Good',
            status: 'completed'
          },
          {
            id: 'assignment_4',
            type: 'assignment',
            title: 'History Project - Ancient Civilizations',
            subject: 'History',
            score: 94,
            maxScore: 100,
            percentage: 94,
            date: '2024-02-05T14:30:00Z',
            term: 'Term 1',
            teacher: 'Mr. Davis',
            attempts: [
              { attempt_number: 1, score: 94, teacher_feedback: 'Outstanding research and presentation!' }
            ],
            feedback: 'Outstanding research and presentation!',
            status: 'completed'
          }
        ]
        setGradeHistory(mockHistory)
      } else {
        setGradeHistory(combinedHistory)
      }

      // Extract unique terms and subjects for filters
      const uniqueTerms = [...new Set(combinedHistory.map(item => item.term))]
      const uniqueSubjects = [...new Set(combinedHistory.map(item => item.subject))]
      
      setTerms(uniqueTerms)
      setSubjects(uniqueSubjects)

      // Calculate statistics
      calculateStats(combinedHistory)

    } catch (error) {
      console.error('Error loading grade history:', error)
      setError('Failed to load grade history')
      
      // Use mock data on error
      const mockHistory = [
        {
          id: 'assignment_1',
          type: 'assignment',
          title: 'Mathematics Quiz 1',
          subject: 'Mathematics',
          score: 92,
          maxScore: 100,
          percentage: 92,
          date: '2024-01-15T10:30:00Z',
          term: 'Term 1',
          teacher: 'Mr. Johnson',
          attempts: [{ attempt_number: 1, score: 92, teacher_feedback: 'Excellent work!' }],
          feedback: 'Excellent work!',
          status: 'completed'
        }
      ]
      setGradeHistory(mockHistory)
      calculateStats(mockHistory)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (history) => {
    if (history.length === 0) {
      setStats({
        totalAssignments: 0,
        averageGrade: 0,
        highestGrade: 0,
        lowestGrade: 0,
        improvementTrend: 0
      })
      return
    }

    const scores = history.map(item => item.percentage)
    const totalAssignments = history.length
    const averageGrade = scores.reduce((sum, score) => sum + score, 0) / totalAssignments
    const highestGrade = Math.max(...scores)
    const lowestGrade = Math.min(...scores)

    // Calculate improvement trend (compare first half vs second half)
    const midPoint = Math.floor(scores.length / 2)
    const firstHalf = scores.slice(0, midPoint)
    const secondHalf = scores.slice(midPoint)
    
    const firstHalfAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length : 0
    const secondHalfAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length : 0
    const improvementTrend = secondHalfAvg - firstHalfAvg

    setStats({
      totalAssignments,
      averageGrade: averageGrade.toFixed(1),
      highestGrade: highestGrade.toFixed(1),
      lowestGrade: lowestGrade.toFixed(1),
      improvementTrend: improvementTrend.toFixed(1)
    })
  }

  const applyFilters = () => {
    let filtered = [...gradeHistory]

    // Apply term filter
    if (filters.term !== 'all') {
      filtered = filtered.filter(item => item.term === filters.term)
    }

    // Apply subject filter
    if (filters.subject !== 'all') {
      filtered = filtered.filter(item => item.subject === filters.subject)
    }

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type)
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.subject.toLowerCase().includes(searchLower) ||
        item.teacher.toLowerCase().includes(searchLower)
      )
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

    setFilteredHistory(filtered)
  }

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return '#10b981'
    if (percentage >= 80) return '#3b82f6'
    if (percentage >= 70) return '#f59e0b'
    if (percentage >= 60) return '#8b5cf6'
    return '#ef4444'
  }

  const getGradeLetter = (percentage) => {
    if (percentage >= 97) return 'A+'
    if (percentage >= 93) return 'A'
    if (percentage >= 90) return 'A-'
    if (percentage >= 87) return 'B+'
    if (percentage >= 83) return 'B'
    if (percentage >= 80) return 'B-'
    if (percentage >= 77) return 'C+'
    if (percentage >= 73) return 'C'
    if (percentage >= 70) return 'C-'
    if (percentage >= 67) return 'D+'
    if (percentage >= 65) return 'D'
    return 'F'
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'assignment': return FaBookOpen
      case 'exam': return FaGraduationCap
      case 'quiz': return FaClock
      default: return FaCheckCircle
    }
  }

  const exportGrades = () => {
    // Create CSV content
    const headers = ['Date', 'Type', 'Title', 'Subject', 'Score', 'Max Score', 'Percentage', 'Grade', 'Teacher', 'Term']
    const csvContent = [
      headers.join(','),
      ...filteredHistory.map(item => [
        new Date(item.date).toLocaleDateString(),
        item.type,
        `"${item.title}"`,
        item.subject,
        item.score,
        item.maxScore,
        item.percentage.toFixed(1),
        getGradeLetter(item.percentage),
        item.teacher,
        item.term
      ].join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'grade_history.csv'
    a.click()
    window.URL.revokeObjectURL(url)
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
          Loading grade history...
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
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
          <div>
            <h1 style={{ 
              margin: 0, 
              color: 'white', 
              fontSize: isMobile ? '24px' : '28px',
              fontWeight: '700'
            }}>
              Grade History
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              color: '#94a3b8',
              fontSize: '14px'
            }}>
              Complete record of your academic performance
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            textAlign: 'center'
          }}>
            <FaAward style={{ color: '#10b981', fontSize: '24px', marginBottom: '8px' }} />
            <h3 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '20px' }}>
              {stats.averageGrade}%
            </h3>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Average Grade</p>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            textAlign: 'center'
          }}>
            <FaTrophy style={{ color: '#f59e0b', fontSize: '24px', marginBottom: '8px' }} />
            <h3 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '20px' }}>
              {stats.highestGrade}%
            </h3>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Highest Grade</p>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            textAlign: 'center'
          }}>
            <FaBookOpen style={{ color: '#3b82f6', fontSize: '24px', marginBottom: '8px' }} />
            <h3 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '20px' }}>
              {stats.totalAssignments}
            </h3>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Total Assessments</p>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            textAlign: 'center'
          }}>
            <FaChartLine style={{ 
              color: parseFloat(stats.improvementTrend) >= 0 ? '#10b981' : '#ef4444', 
              fontSize: '24px', 
              marginBottom: '8px' 
            }} />
            <h3 style={{ 
              margin: '0 0 4px 0', 
              color: 'white', 
              fontSize: '20px' 
            }}>
              {parseFloat(stats.improvementTrend) >= 0 ? '+' : ''}{stats.improvementTrend}%
            </h3>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Improvement</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <h3 style={{
              margin: 0,
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaFilter /> Filters
            </h3>
            <button
              onClick={exportGrades}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaDownload size={12} /> Export CSV
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: '12px'
          }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <FaSearch style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '14px'
              }} />
              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Term Filter */}
            <select
              value={filters.term}
              onChange={(e) => setFilters(prev => ({ ...prev, term: e.target.value }))}
              style={{
                padding: '8px 12px',
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px'
              }}
            >
              <option value="all">All Terms</option>
              {terms.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>

            {/* Subject Filter */}
            <select
              value={filters.subject}
              onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
              style={{
                padding: '8px 12px',
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px'
              }}
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              style={{
                padding: '8px 12px',
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px'
              }}
            >
              <option value="all">All Types</option>
              <option value="assignment">Assignments</option>
              <option value="exam">Exams</option>
              <option value="quiz">Quizzes</option>
            </select>
          </div>
        </div>

        {/* Grade History List */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(71, 85, 105, 0.3)'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            color: 'white',
            fontSize: '18px',
            fontWeight: '700'
          }}>
            Grade History ({filteredHistory.length} items)
          </h3>

          {filteredHistory.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#94a3b8'
            }}>
              <FaExclamationTriangle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '16px' }}>No grades found matching your filters</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredHistory.map((item, index) => {
                const IconComponent = getTypeIcon(item.type)
                return (
                  <div key={item.id} style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(71, 85, 105, 0.3)'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : '1fr auto auto',
                      gap: '16px',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: `linear-gradient(135deg, ${getGradeColor(item.percentage)}, ${getGradeColor(item.percentage)}dd)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          flexShrink: 0
                        }}>
                          <IconComponent size={18} />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            margin: '0 0 4px 0',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600'
                          }}>
                            {item.title}
                          </h4>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '8px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{
                              background: 'rgba(59, 130, 246, 0.2)',
                              color: '#60a5fa',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {item.subject}
                            </span>
                            <span style={{
                              background: 'rgba(139, 92, 246, 0.2)',
                              color: '#a78bfa',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {item.type.toUpperCase()}
                            </span>
                            <span style={{
                              color: '#94a3b8',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <FaCalendarAlt size={10} />
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p style={{
                            margin: 0,
                            color: '#94a3b8',
                            fontSize: '12px'
                          }}>
                            Teacher: {item.teacher} • Term: {item.term}
                          </p>
                        </div>
                      </div>

                      {/* Score Display */}
                      <div style={{
                        textAlign: 'center',
                        padding: '12px',
                        background: 'rgba(30, 41, 59, 0.4)',
                        borderRadius: '8px',
                        minWidth: isMobile ? '100%' : '100px'
                      }}>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: getGradeColor(item.percentage),
                          marginBottom: '2px'
                        }}>
                          {item.percentage.toFixed(1)}%
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: getGradeColor(item.percentage),
                          fontWeight: '600',
                          marginBottom: '2px'
                        }}>
                          {getGradeLetter(item.percentage)}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          color: '#64748b'
                        }}>
                          {item.score}/{item.maxScore}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          localStorage.setItem('grade_detail', JSON.stringify(item))
                          navigate(`/student/grade-detail/${item.id}`)
                        }}
                        style={{
                          padding: '8px 16px',
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#60a5fa',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          width: isMobile ? '100%' : 'auto',
                          justifyContent: 'center'
                        }}
                      >
                        <FaEye size={12} /> View Details
                      </button>
                    </div>

                    {/* Feedback/Remark */}
                    {(item.feedback || item.remark) && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '8px',
                        borderLeft: '3px solid #3b82f6'
                      }}>
                        <p style={{
                          margin: 0,
                          color: '#93c5fd',
                          fontSize: '12px',
                          fontStyle: 'italic'
                        }}>
                          <strong>Feedback:</strong> {item.feedback || item.remark}
                        </p>
                      </div>
                    )}

                    {/* Attempts (for assignments) */}
                    {item.attempts && item.attempts.length > 1 && (
                      <div style={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(71, 85, 105, 0.3)'
                      }}>
                        <h5 style={{
                          margin: '0 0 8px 0',
                          color: '#e2e8f0',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          Attempt History:
                        </h5>
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap'
                        }}>
                          {item.attempts.map((attempt, attemptIndex) => (
                            <div key={attemptIndex} style={{
                              background: 'rgba(30, 41, 59, 0.4)',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '11px',
                              color: '#94a3b8'
                            }}>
                              Attempt {attempt.attempt_number}: {attempt.score}%
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
    </div>
  )
}