import { useEffect, useState } from 'react'
import api from '../utils/api'
import { FaFileInvoice, FaPlay, FaCalculator, FaListOl, FaEye, FaDownload, FaChartLine, FaUsers, FaFileAlt, FaGraduationCap } from 'react-icons/fa'
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
  const [settings, setSettings] = useState(null)
  const [teacherRemarks, setTeacherRemarks] = useState({})

  const isAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'PRINCIPAL'
  const isClassTeacher = user?.role === 'TEACHER'

  useEffect(() => {
    loadInitialData()
  }, [user])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [cls, trm, school, schoolSettings] = await Promise.all([
        api.get('/schools/classes/'),
        api.get('/schools/terms/'),
        api.get('/schools/school-info/').catch(() => ({ data: null })),
        api.get('/schools/settings/').catch(() => ({ data: null }))
      ])
      
      const allClasses = cls.data.results || cls.data
      const allTerms = trm.data.results || trm.data
      
      if (school.data) {
        setSchoolInfo(school.data)
      }
      
      if (schoolSettings.data) {
        setSettings(schoolSettings.data)
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
          api.get(`/reports/?term_id=${termId}`),
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

  useEffect(() => {
    if (classId && termId) {
      loadTeacherRemarks()
    }
  }, [classId, termId])

  const loadTeacherRemarks = async () => {
    if (!classId || !termId) return
    try {
      const response = await api.get(`/teacher-remarks/?class_id=${classId}&term_id=${termId}`)
      const remarksData = response.data.results || response.data
      const remarksObj = {}
      remarksData.forEach(remark => {
        remarksObj[remark.student] = {
          teacher_remarks: remark.teacher_remarks || '',
          student_interests: remark.student_interests || ''
        }
      })
      setTeacherRemarks(remarksObj)
    } catch (error) {
      console.log('No teacher remarks found')
      setTeacherRemarks({})
    }
  }

  const loadStats = async () => {
    try {
      const studentsRes = await api.get(`/students/?class_id=${classId}`)
      const reportsRes = await api.get(`/reports/?term_id=${termId}${classId ? `&class_id=${classId}` : ''}`)
      
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
      const selectedStudent = students.find(s => s.id === Number(studentId))
      const selectedTerm = terms.find(t => t.id === Number(termId))
      const selectedClass = classes.find(c => c.id === Number(classId))
      
      const reportData = {
        student_id: Number(studentId),
        term_id: Number(termId),
        student_context: selectedStudent ? {
          full_name: selectedStudent.full_name,
          student_id: selectedStudent.student_id,
          class_name: selectedStudent.class_name,
          date_of_birth: selectedStudent.date_of_birth,
          gender: selectedStudent.gender,
          guardian_name: selectedStudent.guardian_name,
          guardian_phone: selectedStudent.guardian_phone
        } : null,
        term_context: selectedTerm ? {
          name: selectedTerm.name_display || selectedTerm.name,
          academic_year: selectedTerm.academic_year
        } : null,
        class_context: selectedClass ? {
          level: selectedClass.level_display || selectedClass.level,
          section: selectedClass.section,
          class_teacher_name: selectedClass.class_teacher_name
        } : null,
        school_context: schoolInfo ? {
          name: schoolInfo.name,
          address: schoolInfo.address,
          phone: schoolInfo.phone,
          email: schoolInfo.email,
          logo: schoolInfo.logo,
          motto: schoolInfo.motto,
          principal_name: schoolInfo.principal_name
        } : null,
        settings_context: settings ? {
          show_promotion: settings.show_promotion === true,
          term_closing_date: settings.term_closing_date,
          term_reopening_date: settings.term_reopening_date
        } : null,
        teacher_remarks_context: teacherRemarks[Number(studentId)] || null
      }
      
      const res = await api.post('/reports/generate-report/', reportData)
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
      
      const bulkData = {
        term_id: Number(termId),
        class_id: classId ? Number(classId) : undefined,
        term_context: selectedTerm ? {
          name: selectedTerm.name_display || selectedTerm.name,
          academic_year: selectedTerm.academic_year
        } : null,
        class_context: selectedClass ? {
          level: selectedClass.level_display || selectedClass.level,
          section: selectedClass.section,
          class_teacher_name: selectedClass.class_teacher_name
        } : null,
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
        school_context: schoolInfo ? {
          name: schoolInfo.name,
          address: schoolInfo.address,
          phone: schoolInfo.phone,
          email: schoolInfo.email,
          logo: schoolInfo.logo,
          motto: schoolInfo.motto,
          principal_name: schoolInfo.principal_name
        } : null,
        settings_context: settings ? {
          show_promotion: settings.show_promotion === true,
          term_closing_date: settings.term_closing_date,
          term_reopening_date: settings.term_reopening_date
        } : null,
        teacher_remarks_context: teacherRemarks
      }
      
      const res = await api.post('/reports/bulk-generate/', bulkData)
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
    try {
      const response = await api.get('/reports/preview_data/')
      setPreviewData(response.data)
      setShowPreview(true)
    } catch (error) {
      console.error('Error loading preview:', error)
      setResult({ error: 'Failed to load template preview' })
    } finally {
      setLoadingPreview(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      color: '#f8fafc',
      padding: isMobile ? '20px 12px' : '20px',
      paddingTop: isMobile ? '90px' : '20px'
    }}>
      <div className="container" style={{maxWidth: '1400px', margin: '0 auto'}}>
        <div className="page-header" style={{
          marginBottom: '32px',
          textAlign: 'center'
        }}>
        <h1 style={{
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '16px',
          background: 'linear-gradient(135deg, #60a5fa, #3b82f6, #1d4ed8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '36px',
          fontWeight: '800',
          marginBottom: '24px',
          textShadow: '0 0 30px rgba(59, 130, 246, 0.3)'
        }}>
          <FaGraduationCap style={{color: '#60a5fa', filter: 'drop-shadow(0 0 10px rgba(96, 165, 250, 0.5))'}}/> 
          Report Generation
        </h1>
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '32px'
        }}>
          <button 
            className="btn" 
            onClick={handlePreviewTemplate} 
            disabled={loadingPreview}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
          >
            <FaEye/>
            {loadingPreview ? 'Loading...' : 'Preview Template'}
          </button>
          
          {isAdmin && (
            <>
              <button 
                className="btn" 
                onClick={handleComputeResults}
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 25px rgba(5, 150, 105, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <FaCalculator/>
                Compute Results
              </button>
              
              <button 
                className="btn" 
                onClick={handleCalculatePositions}
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 25px rgba(14, 165, 233, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <FaListOl/>
                Class Positions
              </button>
            </>
          )}
          
          <button 
            className="btn" 
            onClick={handleBulkGenerate}
            disabled={!termId || loading}
            style={{
              background: !termId || loading ? '#9ca3af' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: !termId || loading ? 'none' : '0 8px 25px rgba(220, 38, 38, 0.3)',
              transition: 'all 0.3s ease',
              cursor: !termId || loading ? 'not-allowed' : 'pointer'
            }}
          >
            <FaPlay/>
            {isClassTeacher ? 'Generate Class Reports' : 'Bulk Generate'}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <FaUsers style={{fontSize: '24px', marginBottom: '8px'}}/>
            <div style={{fontSize: '24px', fontWeight: 'bold'}}>{stats.totalStudents}</div>
            <div style={{fontSize: '14px', opacity: 0.9}}>Total Students</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <FaFileAlt style={{fontSize: '24px', marginBottom: '8px'}}/>
            <div style={{fontSize: '24px', fontWeight: 'bold'}}>{stats.generatedReports}</div>
            <div style={{fontSize: '14px', opacity: 0.9}}>Generated Reports</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <FaChartLine style={{fontSize: '24px', marginBottom: '8px'}}/>
            <div style={{fontSize: '24px', fontWeight: 'bold'}}>{stats.completionRate}%</div>
            <div style={{fontSize: '14px', opacity: 0.9}}>Completion Rate</div>
          </div>
        </div>
      )}

      {/* Report Generation Form */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #cbd5e1',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <h3 style={{
          margin: '0 0 20px 0',
          color: '#1e293b',
          fontSize: '18px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaFileInvoice style={{color: '#fb7185'}}/>
          {isClassTeacher ? 'Generate Individual Student Report' : 'Report Generation Settings'}
        </h3>
        
        <div className="form" style={{
          display: 'grid',
          gridTemplateColumns: isAdmin ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
          gap: '16px',
          alignItems: 'end'
        }}>
          {(isAdmin || classes.length > 1) && (
            <div className="field">
              <label style={{color: '#374151', fontWeight: '500', marginBottom: '6px', display: 'block'}}>
                Class {isClassTeacher && '(Your Classes)'}
              </label>
              <select 
                value={classId} 
                onChange={(e) => setClassId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
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
            <label style={{color: '#374151', fontWeight: '500', marginBottom: '6px', display: 'block'}}>
              Student (Optional)
            </label>
            <select 
              value={studentId} 
              onChange={(e) => setStudentId(e.target.value)}
              disabled={!classId && isClassTeacher}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                background: !classId && isClassTeacher ? '#f3f4f6' : 'white'
              }}
            >
              <option value="">Select for individual report</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>
          
          <div className="field">
            <label style={{color: '#374151', fontWeight: '500', marginBottom: '6px', display: 'block'}}>
              Term
            </label>
            <select 
              value={termId} 
              onChange={(e) => setTermId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white'
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
              background: !studentId || !termId || loading ? '#9ca3af' : 'linear-gradient(135deg, #fb7185, #f43f5e)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: !studentId || !termId || loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              minHeight: '44px'
            }}
          >
            <FaDownload/>
            Generate PDF
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
              <p style={{margin: 0}}>{result.error}</p>
            </div>
          ) : (
            <div style={{color: '#166534'}}>
              <h4 style={{margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span style={{fontSize: '20px'}}>✅</span>
                Success
              </h4>
              
              {result.message && <p style={{margin: '0 0 12px 0'}}>{result.message}</p>}
              
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
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <h3 style={{
          margin: '0 0 20px 0',
          color: '#1e293b',
          fontSize: '18px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaFileAlt style={{color: '#059669'}}/>
          Generated Reports {termId && reportCards.length > 0 && `(${reportCards.length})`}
        </h3>
        
        {!termId && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#64748b',
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
              color: '#64748b'
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
                  <tr style={{borderBottom: '2px solid #e2e8f0'}}>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151'}}>Student</th>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151'}}>Class</th>
                    <th style={{padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151'}}>Status</th>
                    <th style={{padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151'}}>Generated</th>
                    <th style={{padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reportCards.map(rc => (
                    <tr key={rc.id} style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = 'transparent'}
                    >
                      <td style={{padding: '12px', fontWeight: '500'}}>
                        {rc.student_obj?.full_name || `Student ID: ${rc.student}`}
                      </td>
                      <td style={{padding: '12px', color: '#64748b'}}>
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
                      <td style={{padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '12px'}}>
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
                          <span style={{color: '#9ca3af', fontSize: '12px'}}>Not available</span>
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
              color: '#64748b',
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
    </div>
  )
} 