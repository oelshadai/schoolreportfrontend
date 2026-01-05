import { useEffect, useState } from 'react'
import api from '../utils/api'
import { FaFileInvoice, FaPlay, FaCalculator, FaListOl, FaEye, FaDownload, FaChartLine, FaUsers, FaFileAlt, FaGraduationCap, FaSync } from 'react-icons/fa'
import ReportPreviewModal from '../components/ReportPreviewModal'
import { useAuth } from '../state/AuthContext'

export default function Reports() {
  const { user } = useAuth()
  const [studentId, setStudentId] = useState('')
  const [termId, setTermId] = useState('')
  const [classId, setClassId] = useState('')
  const [result, setResult] = useState(null)
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [terms, setTerms] = useState([])
  const [reportCards, setReportCards] = useState([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [schoolInfo, setSchoolInfo] = useState(null)

  // Enhanced responsive state management
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })
  
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Enhanced responsive design constants
  const isSmallMobile = screenSize.width <= 480
  const isMobile = screenSize.width <= 768
  const isTablet = screenSize.width <= 1024
  const isDesktop = screenSize.width > 1024

  const isAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'PRINCIPAL'
  const isClassTeacher = user?.role === 'TEACHER'

  useEffect(() => {
    loadInitialData()
  }, [user])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [cls, trm, school] = await Promise.all([
        api.get('/schools/classes/'),
        api.get('/schools/terms/'),
        api.get('/schools/school-info/').catch(() => ({ data: null })) // Optional school info
      ])
      
      const allClasses = cls.data.results || cls.data
      const allTerms = trm.data.results || trm.data
      
      // Store school information
      if (school.data) {
        setSchoolInfo(school.data)
      }
      
      // Filter classes for class teachers
      if (isClassTeacher) {
        const teacherClasses = allClasses.filter(c => c.class_teacher === user.id)
        setClasses(teacherClasses)
        
        // Auto-select teacher's class if only one
        if (teacherClasses.length === 1) {
          setClassId(String(teacherClasses[0].id))
        }
      } else {
        setClasses(allClasses)
      }
      
      setTerms(allTerms)
      
      // Auto-select current term
      const currentTerm = allTerms.find(t => t.is_current) || allTerms[0]
      if (currentTerm) {
        setTermId(String(currentTerm.id))
      }
    } catch (e) {
      console.error('Failed to load initial data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    (async () => {
      if (!classId) { setStudents([]); return }
      try {
        const res = await api.get(`/students/?class_id=${classId}`)
        setStudents(res.data.results || res.data)
      } catch {}
    })()
  }, [classId])

  // Load generated reports for selected term (and filter by class client-side when selected)
  useEffect(() => {
    (async () => {
      if (!termId) { setReportCards([]); return }
      try {
        setLoadingReports(true)
        const [reportsRes, studentsRes] = await Promise.all([
          api.get(`/reports/report-cards/?term_id=${termId}`),
          api.get(classId ? `/students/?class_id=${classId}` : '/students/')
        ])
        const reps = reportsRes.data.results || reportsRes.data
        const studs = studentsRes.data.results || studentsRes.data
        const studentMap = new Map(studs.map(s => [s.id, s]))
        // If classId is provided, reps are already filtered via studs; otherwise show all
        const enriched = reps.filter(rc => {
          if (classId) return studentMap.has(rc.student)
          return true
        }).map(rc => ({
          ...rc,
          student_obj: studentMap.get(rc.student),
        }))
        setReportCards(enriched)
      } catch {}
      finally { setLoadingReports(false) }
    })()
  }, [termId, classId])

  // Load statistics when term changes
  useEffect(() => {
    if (termId && classId) {
      loadStats()
    }
  }, [termId, classId])

  const loadStats = async () => {
    try {
      const studentsRes = await api.get(`/students/?class_id=${classId}`)
      const reportsRes = await api.get(`/reports/report-cards/?term_id=${termId}${classId ? `&class_id=${classId}` : ''}`)
      
      const totalStudents = (studentsRes.data.results || studentsRes.data).length
      const generatedReports = (reportsRes.data.results || reportsRes.data).filter(r => r.status === 'GENERATED').length
      const completionRate = totalStudents > 0 ? Math.round((generatedReports / totalStudents) * 100) : 0
      
      setStats({
        totalStudents,
        generatedReports,
        completionRate
      })
    } catch (e) {
      console.error('Failed to load stats:', e)
    }
  }

  const handleGenerate = async () => {
    setResult(null)
    try {
      // Ensure we have all necessary data before generating
      const selectedStudent = students.find(s => s.id === Number(studentId))
      const selectedTerm = terms.find(t => t.id === Number(termId))
      const selectedClass = classes.find(c => c.id === Number(classId))
      
      if (!selectedStudent || !selectedTerm) {
        setResult({ error: 'Missing required student or term information' })
        return
      }
      
      // Include additional context data for the report
      const reportData = {
        student_id: Number(studentId),
        term_id: Number(termId),
        class_id: classId ? Number(classId) : null,
        // Auto-populate student details
        student_context: {
          full_name: selectedStudent.full_name,
          student_id: selectedStudent.student_id,
          class_name: selectedStudent.class_name,
          date_of_birth: selectedStudent.date_of_birth,
          gender: selectedStudent.gender,
          guardian_name: selectedStudent.guardian_name,
          guardian_phone: selectedStudent.guardian_phone
        },
        // Auto-populate term details
        term_context: {
          name: selectedTerm.name_display || selectedTerm.name,
          academic_year: selectedTerm.academic_year,
          start_date: selectedTerm.start_date,
          end_date: selectedTerm.end_date
        },
        // Auto-populate class details if available
        class_context: selectedClass ? {
          level: selectedClass.level_display || selectedClass.level,
          section: selectedClass.section,
          class_teacher_name: selectedClass.class_teacher_name
        } : null,
        // Auto-populate school information
        school_context: schoolInfo ? {
          name: schoolInfo.name,
          address: schoolInfo.address,
          phone: schoolInfo.phone,
          email: schoolInfo.email,
          logo: schoolInfo.logo,
          motto: schoolInfo.motto,
          principal_name: schoolInfo.principal_name
        } : null
      }
      
      const res = await api.post('/reports/report-cards/generate_report/', reportData)
      setResult(res.data)
    } catch (e) {
      setResult({ error: e?.response?.data?.error || 'Failed to generate' })
    }
  }

  const handleBulkGenerate = async () => {
    setResult(null)
    try {
      const selectedTerm = terms.find(t => t.id === Number(termId))
      const selectedClass = classes.find(c => c.id === Number(classId))
      
      if (!selectedTerm) {
        setResult({ error: 'Missing required term information' })
        return
      }
      
      // Include context data for bulk generation
      const bulkData = {
        term_id: Number(termId),
        class_id: classId ? Number(classId) : undefined,
        // Auto-populate term details
        term_context: {
          name: selectedTerm.name_display || selectedTerm.name,
          academic_year: selectedTerm.academic_year,
          start_date: selectedTerm.start_date,
          end_date: selectedTerm.end_date
        },
        // Auto-populate class details if available
        class_context: selectedClass ? {
          level: selectedClass.level_display || selectedClass.level,
          section: selectedClass.section,
          class_teacher_name: selectedClass.class_teacher_name
        } : null,
        // Include all students data for context
        students_context: students.map(student => ({
          id: student.id,
          full_name: student.full_name,
          student_id: student.student_id,
          class_name: student.class_name,
          date_of_birth: student.date_of_birth,
          gender: student.gender,
          guardian_name: student.guardian_name,
          guardian_phone: student.guardian_phone
        })),
        // Auto-populate school information
        school_context: schoolInfo ? {
          name: schoolInfo.name,
          address: schoolInfo.address,
          phone: schoolInfo.phone,
          email: schoolInfo.email,
          logo: schoolInfo.logo,
          motto: schoolInfo.motto,
          principal_name: schoolInfo.principal_name
        } : null
      }
      
      const res = await api.post('/reports/report-cards/bulk_generate/', bulkData)
      setResult(res.data)
    } catch (e) {
      setResult({ error: e?.response?.data?.error || 'Failed to bulk generate' })
    }
  }

  const handleComputeResults = async () => {
    setResult(null)
    try {
      const res = await api.post('/scores/manage/compute-term-results/', { term_id: Number(termId), class_id: classId ? Number(classId) : undefined })
      setResult(res.data)
    } catch (e) {
      setResult({ error: e?.response?.data?.error || 'Failed to compute term results' })
    }
  }

  const handleCalculatePositions = async () => {
    setResult(null)
    if (!termId || !classId) { setResult({ error: 'Select term and class to calculate positions' }); return }
    try {
      const res = await api.post('/scores/term-results/calculate-positions/', { term_id: Number(termId), class_id: Number(classId) })
      setResult(res.data)
    } catch (e) {
      setResult({ error: e?.response?.data?.error || 'Failed to calculate positions' })
    }
  }

  const handlePreviewTemplate = async () => {
    setLoadingPreview(true)
    setResult(null) // Clear any previous results
    try {
      // First try to get preview data to validate the endpoint
      const response = await api.get('/reports/report-cards/preview_data/')
      setPreviewData(response.data)
      setShowPreview(true)
      
      // Show success message
      setResult({ 
        message: 'Template preview loaded successfully! You can now view your report template with sample data.',
        preview_loaded: true
      })
    } catch (error) {
      console.error('Error loading preview:', error)
      
      // Provide detailed error information
      let errorMessage = 'Failed to load template preview'
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.'
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to preview templates.'
        } else if (error.response.status === 404) {
          errorMessage = 'Preview endpoint not found. Please contact support.'
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error
        } else {
          errorMessage = `Server error (${error.response.status}): ${error.response.statusText}`
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your internet connection and try again.'
      } else {
        // Other error
        errorMessage = error.message || 'An unexpected error occurred'
      }
      
      setResult({ 
        error: errorMessage,
        error_details: {
          status: error.response?.status,
          message: error.message,
          endpoint: '/reports/report-cards/preview_data/'
        }
      })
    } finally {
      setLoadingPreview(false)
    }
  }

  return (
    <div 
      className="container" 
      style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: isMobile ? '20px 12px' : isTablet ? '24px 16px' : '32px 20px',
        paddingTop: isMobile ? '60px' : '80px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        minHeight: '100vh',
        color: 'white',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Enhanced mobile-specific style injection */}
      <style>
        {`
          @media screen and (max-width: 480px) {
            .container { 
              padding: 16px 10px !important; 
              padding-top: 85px !important;
            }
            .page-header {
              padding: 16px 14px !important;
              gap: 14px !important;
            }
            .btn {
              min-height: 50px !important;
              font-size: 15px !important;
            }
          }
          
          @media screen and (max-width: 768px) {
            .container { 
              padding: 20px 12px !important; 
              padding-top: 55px !important; 
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
              color: white !important;
            }
            .page-header { 
              flex-direction: column !important; 
              background: rgba(15, 23, 42, 0.8) !important;
              border-radius: 16px !important;
              padding: 20px 16px !important;
              gap: 16px !important;
            }
            .btn { 
              width: 100% !important; 
              min-height: 48px !important;
              font-size: 16px !important;
              margin-bottom: 12px !important;
            }
            .stats-grid { 
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }
            .form-grid {
              grid-template-columns: 1fr !important;
              gap: 16px !important;
            }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      {/* Enhanced Header with Mobile-First Design */}
      <div className="page-header" style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(16px)',
        borderRadius: isMobile ? 16 : 20,
        padding: isMobile ? '20px 16px' : isTablet ? '24px 20px' : '28px 24px',
        marginBottom: isMobile ? 20 : 24,
        border: '1px solid rgba(34, 197, 94, 0.2)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? 16 : 12
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 12 : 16
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            borderRadius: 12,
            padding: isMobile ? '12px' : '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(34, 197, 94, 0.4)'
          }}>
            <FaGraduationCap size={isMobile ? 20 : 24} color="white" />
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: isMobile ? 22 : isTablet ? 26 : 32,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #86efac, #22c55e)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2
            }}>Report Generation</h1>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: isMobile ? 13 : 14,
              color: '#94a3b8',
              fontWeight: 500
            }}>
              Generate and manage student reports
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 12 : 8,
          width: isMobile ? '100%' : 'auto',
          flexWrap: 'wrap'
        }}>
          <button 
            className="btn" 
            onClick={handlePreviewTemplate} 
            disabled={loadingPreview}
            title="Preview how your report template will look with sample data"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: isMobile ? '14px 18px' : '12px 16px',
              background: loadingPreview 
                ? 'rgba(107, 114, 128, 0.3)' 
                : 'rgba(139, 92, 246, 0.1)',
              border: loadingPreview 
                ? '1px solid rgba(107, 114, 128, 0.5)' 
                : '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 10,
              color: loadingPreview ? '#9ca3af' : '#c4b5fd',
              fontWeight: 600,
              fontSize: isMobile ? 14 : 15,
              minHeight: isMobile ? 48 : 44,
              justifyContent: 'center',
              width: isMobile ? '100%' : 'auto',
              transition: 'all 0.3s ease',
              cursor: loadingPreview ? 'not-allowed' : 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!loadingPreview) {
                e.target.style.background = 'rgba(139, 92, 246, 0.2)'
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'
                e.target.style.color = '#ddd6fe'
              }
            }}
            onMouseLeave={(e) => {
              if (!loadingPreview) {
                e.target.style.background = 'rgba(139, 92, 246, 0.1)'
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                e.target.style.color = '#c4b5fd'
              }
            }}
          >
            {loadingPreview ? (
              <>
                <div 
                  style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(156, 163, 175, 0.3)',
                    borderTop: '2px solid #9ca3af',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                />
                Loading...
              </>
            ) : (
              <>
                <FaEye size={isMobile ? 16 : 14} />
                {isMobile ? 'Preview' : 'Preview Template'}
              </>
            )}
          </button>
          
          {isAdmin && (
            <>
              <button 
                className="btn" 
                onClick={handleComputeResults}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: isMobile ? '14px 18px' : '12px 16px',
                  background: 'rgba(5, 150, 105, 0.1)',
                  border: '1px solid rgba(5, 150, 105, 0.3)',
                  borderRadius: 10,
                  color: '#6ee7b7',
                  fontWeight: 600,
                  fontSize: isMobile ? 14 : 15,
                  minHeight: isMobile ? 48 : 44,
                  justifyContent: 'center',
                  width: isMobile ? '100%' : 'auto',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaCalculator size={isMobile ? 16 : 14} />
                Compute Results
              </button>
              
              <button 
                className="btn" 
                onClick={handleCalculatePositions}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: isMobile ? '14px 18px' : '12px 16px',
                  background: 'rgba(14, 165, 233, 0.1)',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                  borderRadius: 10,
                  color: '#7dd3fc',
                  fontWeight: 600,
                  fontSize: isMobile ? 14 : 15,
                  minHeight: isMobile ? 48 : 44,
                  justifyContent: 'center',
                  width: isMobile ? '100%' : 'auto',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaListOl size={isMobile ? 16 : 14} />
                Class Positions
              </button>
            </>
          )}
          
          <button 
            className="btn primary" 
            onClick={handleBulkGenerate}
            disabled={!termId || loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: isMobile ? '14px 18px' : '12px 16px',
              background: !termId || loading ? 'rgba(107, 114, 128, 0.5)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: 'none',
              borderRadius: 10,
              color: 'white',
              fontWeight: 600,
              fontSize: isMobile ? 14 : 15,
              minHeight: isMobile ? 48 : 44,
              justifyContent: 'center',
              width: isMobile ? '100%' : 'auto',
              transition: 'all 0.3s ease',
              boxShadow: !termId || loading ? 'none' : '0 4px 12px rgba(34, 197, 94, 0.3)',
              cursor: !termId || loading ? 'not-allowed' : 'pointer'
            }}
          >
            <FaPlay size={isMobile ? 16 : 14} />
            {isClassTeacher ? 'Generate Class Reports' : 'Bulk Generate'}
          </button>
          
          <button
            className="btn"
            onClick={loadInitialData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: isMobile ? '14px 18px' : '12px 16px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 10,
              color: '#86efac',
              fontWeight: 600,
              fontSize: isMobile ? 14 : 15,
              minHeight: isMobile ? 48 : 44,
              justifyContent: 'center',
              width: isMobile ? '100%' : 'auto',
              transition: 'all 0.3s ease'
            }}
          >
            <FaSync size={isMobile ? 16 : 14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: isMobile ? 12 : 16,
          marginBottom: isMobile ? 12 : 24
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: isMobile ? 14 : 16,
            padding: isMobile ? '16px 14px' : '20px 16px',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <FaUsers style={{fontSize: isMobile ? 20 : 24, marginBottom: 8, color: '#60a5fa'}}/>
            <div style={{fontSize: isMobile ? 20 : 24, fontWeight: 'bold', color: 'white'}}>{stats.totalStudents}</div>
            <div style={{fontSize: isMobile ? 12 : 14, color: '#94a3b8'}}>Total Students</div>
          </div>
          
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: isMobile ? 14 : 16,
            padding: isMobile ? '16px 14px' : '20px 16px',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <FaFileAlt style={{fontSize: isMobile ? 20 : 24, marginBottom: 8, color: '#34d399'}}/>
            <div style={{fontSize: isMobile ? 20 : 24, fontWeight: 'bold', color: 'white'}}>{stats.generatedReports}</div>
            <div style={{fontSize: isMobile ? 12 : 14, color: '#94a3b8'}}>Generated Reports</div>
          </div>
          
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: isMobile ? 14 : 16,
            padding: isMobile ? '16px 14px' : '20px 16px',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <FaChartLine style={{fontSize: isMobile ? 20 : 24, marginBottom: 8, color: '#f87171'}}/>
            <div style={{fontSize: isMobile ? 20 : 24, fontWeight: 'bold', color: 'white'}}>{stats.completionRate}%</div>
            <div style={{fontSize: isMobile ? 12 : 14, color: '#94a3b8'}}>Completion Rate</div>
          </div>
        </div>
      )}

      {/* Report Generation Form */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{
          margin: '0 0 20px 0',
          color: '#e2e8f0',
          fontSize: '18px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaFileInvoice style={{color: '#22c55e'}}/>
          {isClassTeacher ? 'Generate Individual Student Report' : 'Report Generation Settings'}
        </h3>
        
        <div className="form-grid" style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isAdmin ? 'repeat(3, 1fr) auto' : 'repeat(2, 1fr) auto',
          gap: isMobile ? 16 : 20,
          alignItems: 'end'
        }}>
          {(isAdmin || classes.length > 1) && (
            <div className="field">
              <label style={{color: '#e2e8f0', fontWeight: '500', marginBottom: '6px', display: 'block'}}>
                Class {isClassTeacher && '(Your Classes)'}
              </label>
              <select 
                value={classId} 
                onChange={(e) => setClassId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid rgba(71, 85, 105, 0.4)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: 'white'
                }}
              >
                <option value="">{isAdmin ? 'All classes' : 'Select class'}</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.level_display || c.level}{c.section ? ` ${c.section}` : ''}
                    {c.class_teacher_name && ` (${c.class_teacher_name})`}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="field">
            <label style={{color: '#e2e8f0', fontWeight: '500', marginBottom: '6px', display: 'block'}}>
              Student (Optional)
            </label>
            <select 
              value={studentId} 
              onChange={(e) => setStudentId(e.target.value)}
              disabled={!classId && isClassTeacher}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid rgba(71, 85, 105, 0.4)',
                borderRadius: '8px',
                fontSize: '14px',
                background: !classId && isClassTeacher ? 'rgba(71, 85, 105, 0.3)' : 'rgba(30, 41, 59, 0.8)',
                color: 'white'
              }}
            >
              <option value="">Select for individual report</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>
          
          <div className="field">
            <label style={{color: '#e2e8f0', fontWeight: '500', marginBottom: '6px', display: 'block'}}>
              Term
            </label>
            <select 
              value={termId} 
              onChange={(e) => setTermId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid rgba(71, 85, 105, 0.4)',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'rgba(30, 41, 59, 0.8)',
                color: 'white'
              }}
            >
              <option value="">Select term</option>
              {terms.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name_display || t.name} {t.is_current && '(Current)'}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={!studentId || !termId || loading}
            style={{
              background: !studentId || !termId || loading ? 'rgba(107, 114, 128, 0.5)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: isMobile ? '12px 16px' : '10px 14px',
              fontSize: isMobile ? 14 : 13,
              fontWeight: '600',
              cursor: !studentId || !termId || loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minHeight: isMobile ? 44 : 40,
              whiteSpace: 'nowrap'
            }}
          >
            <FaDownload size={12}/>
            {isMobile ? 'Generate' : 'PDF'}
          </button>
        </div>
      </div>
      {/* Results Display */}
      {result && (
        <div style={{
          background: result.error ? 'linear-gradient(135deg, #fef2f2, #fee2e2)' : 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          border: `1px solid ${result.error ? '#fca5a5' : '#86efac'}`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          {result.error ? (
            <div style={{color: '#dc2626'}}>
              <h4 style={{margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span style={{fontSize: '20px'}}>⚠️</span>
                Error
              </h4>
              <p style={{margin: '0 0 8px 0'}}>{result.error}</p>
              
              {result.error_details && (
                <details style={{marginTop: '12px'}}>
                  <summary style={{cursor: 'pointer', fontSize: '14px', color: '#7f1d1d'}}>
                    Technical Details
                  </summary>
                  <div style={{marginTop: '8px', padding: '8px', background: 'rgba(220, 38, 38, 0.1)', borderRadius: '6px', fontSize: '13px'}}>
                    <div><strong>Status:</strong> {result.error_details.status || 'Unknown'}</div>
                    <div><strong>Message:</strong> {result.error_details.message}</div>
                    <div><strong>Endpoint:</strong> {result.error_details.endpoint}</div>
                  </div>
                </details>
              )}
            </div>
          ) : (
            <div style={{color: '#166534'}}>
              <h4 style={{margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span style={{fontSize: '20px'}}>✅</span>
                {result.preview_loaded ? 'Preview Ready' : 'Success'}
              </h4>
              
              {result.message && <p style={{margin: '0 0 12px 0'}}>{result.message}</p>}
              
              {result.preview_loaded && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '12px'
                }}>
                  <div style={{fontSize: '14px', fontWeight: '500', marginBottom: '8px'}}>
                    📋 Preview Features:
                  </div>
                  <ul style={{margin: '0', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6'}}>
                    <li>View both PDF and HTML formats</li>
                    <li>Sample data shows your current school settings</li>
                    <li>Mobile-responsive preview modal</li>
                    <li>Open in new tab for detailed review</li>
                  </ul>
                </div>
              )}
              
              {result.generated_count !== undefined && (
                <div style={{marginBottom: '12px'}}>
                  <strong>Generated:</strong> {result.generated_count} reports
                  {result.errors && result.errors.length > 0 && (
                    <div style={{marginTop: '8px'}}>
                      <strong>Errors:</strong>
                      <ul style={{margin: '4px 0 0 20px', padding: 0}}>
                        {result.errors.map((error, index) => (
                          <li key={index} style={{color: '#dc2626', fontSize: '14px'}}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {result.pdf_url && (
                <button
                  onClick={() => window.open(result.pdf_url, '_blank')}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FaDownload/>
                  Download PDF
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Generated Reports List */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{
          margin: '0 0 20px 0',
          color: '#e2e8f0',
          fontSize: '18px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaFileAlt style={{color: '#22c55e'}}/>
          Generated Reports {termId && reportCards.length > 0 && `(${reportCards.length})`}
        </h3>
        
        {!termId && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#94a3b8',
            fontSize: '16px'
          }}>
            📋 Select a term to view generated reports
          </div>
        )}
        
        {termId && (
          loadingReports ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#94a3b8'
            }}>
              <div>Loading reports...</div>
            </div>
          ) : reportCards.length ? (
            <div style={{overflowX: 'auto'}}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{
                    borderBottom: '2px solid rgba(71, 85, 105, 0.3)'
                  }}>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: '#e2e8f0'}}>Student</th>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: '#e2e8f0'}}>Class</th>
                    <th style={{padding: '12px', textAlign: 'center', fontWeight: '600', color: '#e2e8f0'}}>Status</th>
                    <th style={{padding: '12px', textAlign: 'center', fontWeight: '600', color: '#e2e8f0'}}>Generated</th>
                    <th style={{padding: '12px', textAlign: 'center', fontWeight: '600', color: '#e2e8f0'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reportCards.map(rc => (
                    <tr key={rc.id} style={{
                      borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = 'rgba(30, 41, 59, 0.5)'}
                    onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = 'transparent'}}
                    >
                      <td style={{padding: '12px', fontWeight: '500', color: '#e2e8f0'}}>
                        {rc.student_obj?.full_name || `Student ID: ${rc.student}`}
                      </td>
                      <td style={{padding: '12px', color: '#94a3b8'}}>
                        {rc.student_obj?.class_name || '-'}
                      </td>
                      <td style={{padding: '12px', textAlign: 'center'}}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: rc.status === 'GENERATED' ? '#dcfce7' : rc.status === 'DRAFT' ? '#fef3c7' : '#fee2e2',
                          color: rc.status === 'GENERATED' ? '#166534' : rc.status === 'DRAFT' ? '#92400e' : '#dc2626'
                        }}>
                          {rc.status}
                        </span>
                      </td>
                      <td style={{padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '12px'}}>
                        {rc.generated_at ? new Date(rc.generated_at).toLocaleDateString() : '-'}
                      </td>
                      <td style={{padding: '12px', textAlign: 'center'}}>
                        {rc.pdf_file ? (
                          <button
                            onClick={() => window.open(rc.pdf_file, '_blank')}
                            style={{
                              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              margin: '0 auto'
                            }}
                          >
                            <FaDownload style={{fontSize: '10px'}}/>
                            Download
                          </button>
                        ) : (
                          <span style={{color: '#6b7280', fontSize: '12px'}}>Not available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#94a3b8',
              fontSize: '16px'
            }}>
              📄 No reports found for this selection
              <div style={{fontSize: '14px', marginTop: '8px', opacity: 0.8}}>
                Generate reports using the form above
              </div>
            </div>
          )
        )}
      </div>

      {/* Report Preview Modal */}
      <ReportPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        previewData={previewData}
      />
    </div>
  )
}
