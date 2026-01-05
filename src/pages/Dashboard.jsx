import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../state/AuthContext'
import TeacherNotifications from '../components/TeacherNotifications'
import { 
  FaLayerGroup, FaGraduationCap, FaBookOpen, FaChartLine, FaArrowRight,
  FaUserGraduate, FaChalkboardTeacher, FaUsers, FaClipboardList, FaCalendarAlt,
  FaChartBar, FaTasks, FaFileAlt
} from 'react-icons/fa'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [teacherData, setTeacherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [studentCountUpdated, setStudentCountUpdated] = useState(false)

  const loadDashboardData = async () => {
    try {
      const dashboardRes = await api.get('/schools/dashboard/')
      setData(dashboardRes.data)

      if (user?.role === 'TEACHER') {
        try {
          // Get created assignments (homework, quizzes, etc.)
          const assignmentsRes = await api.get('/assignments/assignments/')
          const createdAssignments = Array.isArray(assignmentsRes.data.results) ? assignmentsRes.data.results : 
                                   Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []
          
          console.log('Assignments API response:', assignmentsRes.data)
          console.log('Created assignments:', createdAssignments)
          
          // Get teacher assignments (class/subject assignments)
          const teacherAssignmentsRes = await api.get('/teachers/assignments/')
          const teacherAssignments = Array.isArray(teacherAssignmentsRes.data.results) ? teacherAssignmentsRes.data.results : 
                                    Array.isArray(teacherAssignmentsRes.data) ? teacherAssignmentsRes.data : []
          
          // Get students
          const studentsRes = await api.get('/students/')
          const allStudents = studentsRes.data.results || studentsRes.data || []
          
          console.log('Created assignments:', createdAssignments)
          console.log('Teacher assignments:', teacherAssignments)
          console.log('Students:', allStudents)
          
          const assignedClasses = [...new Set(teacherAssignments.map(a => a.class?.id).filter(Boolean))]
          const assignedSubjects = [...new Set(teacherAssignments.map(a => a.subject?.id).filter(Boolean))]
          const isFormTeacher = teacherAssignments.some(a => a.type === 'form_class')
          const formClass = teacherAssignments.find(a => a.type === 'form_class')
          const myStudents = formClass 
            ? allStudents.filter(s => s.class_instance === formClass.class?.id)
            : []

          const newTeacherData = {
            assignments: teacherAssignments, // Class/subject assignments
            createdAssignments, // Homework/quiz assignments
            assignedClasses: assignedClasses.length,
            assignedSubjects: assignedSubjects.length,
            isFormTeacher,
            formClass: formClass?.class,
            myStudents: myStudents.length,
            totalAssignments: createdAssignments.length, // Use created assignments count
            // Add real assignment stats
            assignmentStats: {
              total: createdAssignments.length,
              published: createdAssignments.filter(a => a.status === 'PUBLISHED').length,
              draft: createdAssignments.filter(a => a.status === 'DRAFT').length,
              closed: createdAssignments.filter(a => a.status === 'CLOSED').length
            }
          }
          
          // Check if student count changed to show update indicator
          if (teacherData && teacherData.myStudents !== newTeacherData.myStudents) {
            setStudentCountUpdated(true)
            setTimeout(() => setStudentCountUpdated(false), 3000) // Hide after 3 seconds
          }
          
          setTeacherData(newTeacherData)
        } catch (teacherError) {
          console.error('Teacher data error:', teacherError)
          setError(`Teacher data: ${teacherError?.response?.data?.detail || teacherError.message}`)
        }
      }
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Expose refresh function globally for other components
  useEffect(() => {
    window.refreshTeacherDashboard = () => {
      if (user?.role === 'TEACHER') {
        loadDashboardData()
      }
    }
    
    return () => {
      delete window.refreshTeacherDashboard
    }
  }, [user])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (mounted) {
        await loadDashboardData()
      }
    })()
    return () => { mounted = false }
  }, [user])

  // Listen for student creation events to refresh dashboard
  useEffect(() => {
    const handleStudentCreated = () => {
      console.log('Student created event received, refreshing dashboard...')
      loadDashboardData()
    }

    // Listen for custom events from student creation
    window.addEventListener('studentCreated', handleStudentCreated)
    
    return () => {
      window.removeEventListener('studentCreated', handleStudentCreated)
    }
  }, [user])

  if (loading) {
    return (
      <>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: 60, 
              height: 60, 
              border: '4px solid #e5e7eb', 
              borderTop: '4px solid #3b82f6', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: '#6b7280', fontSize: 16 }}>Loading dashboard...</p>
          </div>
        </div>
      </>
    )
  }

  if (user?.role === 'TEACHER') {
    const isMobile = window.innerWidth <= 768
    const isSmallMobile = window.innerWidth <= 480
    const isTinyMobile = window.innerWidth <= 320
    
    return (
      <div className="dashboard-page">
        {/* Teacher Notifications */}
        <TeacherNotifications />
        
        <style>{`
          .dashboard-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: ${isTinyMobile ? '4px' : isSmallMobile ? '6px' : isMobile ? '8px' : '16px'};
            padding-top: ${isTinyMobile ? '70px' : isSmallMobile ? '75px' : isMobile ? '80px' : '120px'};
          }
          
          .dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
          }
        `}</style>
        
        <div className="dashboard-container">
        {/* Teacher Hero Section */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: isMobile ? 12 : 16,
          padding: isTinyMobile ? '12px 8px' : isSmallMobile ? '14px 10px' : isMobile ? '16px 12px' : '28px 32px',
          marginBottom: isMobile ? 12 : 24,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute',
            top: isMobile ? -30 : -50,
            right: isMobile ? -30 : -50,
            width: isMobile ? 120 : 200,
            height: isMobile ? 120 : 200,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: isMobile ? -20 : -30,
            left: isMobile ? -20 : -30,
            width: isMobile ? 80 : 150,
            height: isMobile ? 80 : 150,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
            filter: 'blur(30px)'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: isMobile ? 10 : 16, flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{
              width: isTinyMobile ? 40 : isSmallMobile ? 44 : isMobile ? 48 : 64,
              height: isTinyMobile ? 40 : isSmallMobile ? 44 : isMobile ? 48 : 64,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              borderRadius: isMobile ? 12 : 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
              alignSelf: isMobile ? 'center' : 'flex-start'
            }}>
              <FaGraduationCap style={{ fontSize: isTinyMobile ? 16 : isSmallMobile ? 18 : isMobile ? 20 : 28, color: 'white' }} />
            </div>
            <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
              <h1 style={{ 
                margin: 0, 
                fontSize: isTinyMobile ? 16 : isSmallMobile ? 17 : isMobile ? 18 : 28, 
                fontWeight: 700, 
                color: '#1f2937',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}>
                Welcome back, {user.first_name}!
              </h1>
              <p style={{ 
                margin: '6px 0 0', 
                fontSize: isTinyMobile ? 10 : isSmallMobile ? 11 : isMobile ? 12 : 14, 
                color: '#6b7280',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: isMobile ? 'center' : 'flex-start',
                gap: 6,
                flexWrap: 'wrap'
              }}>
                {teacherData?.isFormTeacher ? (
                  <>
                    <span style={{ 
                      background: 'rgba(99, 102, 241, 0.1)', 
                      color: '#6366f1',
                      padding: isMobile ? '3px 8px' : '4px 12px', 
                      borderRadius: 20,
                      fontSize: isMobile ? 10 : 12,
                      fontWeight: 600
                    }}>
                      🏫 Form Teacher
                    </span>
                    <span>{teacherData.formClass?.name}</span>
                  </>
                ) : (
                  <>
                    <span style={{ 
                      background: 'rgba(99, 102, 241, 0.1)', 
                      color: '#6366f1',
                      padding: isMobile ? '3px 8px' : '4px 12px', 
                      borderRadius: 20,
                      fontSize: isMobile ? 10 : 12,
                      fontWeight: 600
                    }}>
                      📚 Subject Teacher
                    </span>
                    <span>{teacherData?.assignedSubjects} subject(s)</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
            fontSize: 14
          }}>
            {error}
          </div>
        )}

        {teacherData && teacherData.assignments && (
          <>
            {/* Stats Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
              gap: isTinyMobile ? 8 : isSmallMobile ? 10 : isMobile ? 12 : 20,
              marginBottom: isTinyMobile ? 16 : isSmallMobile ? 18 : isMobile ? 20 : 32
            }}>
              {teacherData.isFormTeacher && (
                <div style={{
                  background: 'white',
                  borderRadius: isMobile ? 12 : 16,
                  padding: isTinyMobile ? '12px' : isSmallMobile ? '14px' : isMobile ? '16px' : 24,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(59,130,246,0.15)'
                    e.currentTarget.style.transform = 'translateY(-4px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: isTinyMobile ? 8 : isSmallMobile ? 10 : isMobile ? 12 : 16, marginBottom: isMobile ? 8 : 12 }}>
                    <div style={{
                      width: isTinyMobile ? 32 : isSmallMobile ? 36 : isMobile ? 40 : 48,
                      height: isTinyMobile ? 32 : isSmallMobile ? 36 : isMobile ? 40 : 48,
                      borderRadius: isMobile ? 8 : 12,
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaGraduationCap style={{ fontSize: isTinyMobile ? 14 : isSmallMobile ? 16 : isMobile ? 18 : 22, color: 'white' }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: isTinyMobile ? 9 : isSmallMobile ? 10 : isMobile ? 11 : 13, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Form Students</p>
                      <h3 style={{ margin: '4px 0 0', fontSize: isTinyMobile ? 18 : isSmallMobile ? 20 : isMobile ? 24 : 32, fontWeight: 800, color: '#111827' }}>{teacherData.myStudents || 0}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(139,92,246,0.15)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaLayerGroup style={{ fontSize: 22, color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Classes</p>
                    <h3 style={{ margin: '4px 0 0', fontSize: 32, fontWeight: 800, color: '#111827' }}>{teacherData.assignedClasses || 0}</h3>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(236,72,153,0.15)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #ec4899, #db2777)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaBookOpen style={{ fontSize: 22, color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subjects</p>
                    <h3 style={{ margin: '4px 0 0', fontSize: 32, fontWeight: 800, color: '#111827' }}>{teacherData.assignedSubjects || 0}</h3>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(245,158,11,0.15)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaTasks style={{ fontSize: 22, color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assignments</p>
                    <h3 style={{ margin: '4px 0 0', fontSize: 32, fontWeight: 800, color: '#111827' }}>{teacherData.totalAssignments || 0}</h3>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Show message if no teacher data */}
        {!teacherData && !loading && (
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: 32,
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍🏫</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>
              Setting up your dashboard...
            </h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
              Loading your teaching assignments and class information.
            </p>
          </div>
        )}

        {teacherData && (
          <>
            {/* Teaching Load Section */}
            <div style={{
              background: 'white',
              borderRadius: isMobile ? 12 : 20,
              padding: isTinyMobile ? '12px' : isSmallMobile ? '14px' : isMobile ? '16px' : 32,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb',
              marginBottom: isTinyMobile ? 16 : isSmallMobile ? 18 : isMobile ? 20 : 32
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 16 : 24, flexDirection: isTinyMobile ? 'column' : 'row', gap: isTinyMobile ? 8 : 0 }}>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: isTinyMobile ? 16 : isSmallMobile ? 17 : isMobile ? 18 : 22, 
                  fontWeight: 800, 
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 8 : 12
                }}>
                  <span style={{
                    width: isTinyMobile ? 28 : isSmallMobile ? 32 : isMobile ? 36 : 40,
                    height: isTinyMobile ? 28 : isSmallMobile ? 32 : isMobile ? 36 : 40,
                    borderRadius: isMobile ? 8 : 10,
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isTinyMobile ? 12 : isSmallMobile ? 14 : isMobile ? 16 : 18
                  }}>
                    📊
                  </span>
                  My Teaching Load
                </h2>
                <span style={{
                  background: '#f3f4f6',
                  color: '#6b7280',
                  padding: isTinyMobile ? '3px 8px' : isSmallMobile ? '4px 10px' : isMobile ? '5px 12px' : '6px 14px',
                  borderRadius: 20,
                  fontSize: isTinyMobile ? 10 : isSmallMobile ? 11 : isMobile ? 12 : 13,
                  fontWeight: 700
                }}>
                  {teacherData.assignments?.length || 0} Total
                </span>
              </div>
              
              {teacherData.assignments && teacherData.assignments.length > 0 ? (
                <div style={{ display: 'grid', gap: isTinyMobile ? 10 : isSmallMobile ? 12 : isMobile ? 14 : 16 }}>
                  {teacherData.assignments.map((assignment, idx) => (
                    <div key={idx} style={{
                      background: assignment.type === 'form_class' ? '#fef3c7' : '#dbeafe',
                      border: `2px solid ${assignment.type === 'form_class' ? '#fbbf24' : '#60a5fa'}`,
                      borderRadius: 16,
                      padding: isMobile ? '14px' : 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 16,
                      transition: 'all 0.3s ease'
                    }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateX(8px)'
                        e.currentTarget.style.boxShadow = assignment.type === 'form_class' ? '0 8px 30px rgba(251, 191, 36, 0.3)' : '0 8px 30px rgba(96, 165, 250, 0.3)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateX(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 200 }}>
                        <div style={{
                          width: isMobile ? 44 : 56,
                          height: isMobile ? 44 : 56,
                          borderRadius: 14,
                          background: assignment.type === 'form_class' ? 
                            'linear-gradient(135deg, #fbbf24, #f59e0b)' : 
                            'linear-gradient(135deg, #60a5fa, #3b82f6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: isMobile ? 18 : 24,
                          fontWeight: 800,
                          boxShadow: assignment.type === 'form_class' ? 
                            '0 4px 14px rgba(251, 191, 36, 0.4)' : 
                            '0 4px 14px rgba(59, 130, 246, 0.4)'
                        }}>
                          {(assignment.class?.name || 'U').charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: isMobile ? 14 : 18, color: '#111827', marginBottom: 4 }}>
                            {assignment.class?.name || 'Unknown Class'}
                          </div>
                          <div style={{ fontSize: isMobile ? 12 : 14, color: '#6b7280', fontWeight: 600 }}>
                            {assignment.type === 'form_class' ? '🏫 Form Teacher' : `📚 ${assignment.subject?.name || 'Subject Teacher'}`}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        background: assignment.type === 'form_class' ? 
                          'linear-gradient(135deg, #fbbf24, #f59e0b)' : 
                          'linear-gradient(135deg, #60a5fa, #3b82f6)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        boxShadow: assignment.type === 'form_class' ? 
                          '0 4px 14px rgba(251, 191, 36, 0.3)' : 
                          '0 4px 14px rgba(59, 130, 246, 0.3)'
                      }}>
                        {assignment.type === 'form_class' ? 'Primary' : 'Subject'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: 48,
                  background: '#f9fafb',
                  borderRadius: 16,
                  border: '2px dashed #d1d5db'
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: 15, fontWeight: 600 }}>
                    No assignments yet. Contact your administrator.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{
              background: 'white',
              borderRadius: isMobile ? 12 : 20,
              padding: isTinyMobile ? '12px' : isSmallMobile ? '14px' : isMobile ? '16px' : 32,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{ 
                margin: isMobile ? '0 0 16px 0' : '0 0 24px 0', 
                fontSize: isTinyMobile ? 16 : isSmallMobile ? 17 : isMobile ? 18 : 22, 
                fontWeight: 800, 
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isMobile ? 'center' : 'flex-start',
                gap: isMobile ? 8 : 12
              }}>
                <span style={{
                  width: isTinyMobile ? 28 : isSmallMobile ? 32 : isMobile ? 36 : 40,
                  height: isTinyMobile ? 28 : isSmallMobile ? 32 : isMobile ? 36 : 40,
                  borderRadius: isMobile ? 8 : 10,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isTinyMobile ? 12 : isSmallMobile ? 14 : isMobile ? 16 : 18
                }}>
                  ⚡
                </span>
                Quick Actions
              </h2>
              <div style={{ display: 'grid', gap: isTinyMobile ? 10 : isSmallMobile ? 12 : isMobile ? 14 : 16, gridTemplateColumns: '1fr' }}>
                <button
                  onClick={() => navigate('/classes')}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white',
                    border: 'none',
                    borderRadius: isMobile ? 10 : 14,
                    padding: isTinyMobile ? '12px 16px' : isSmallMobile ? '14px 18px' : isMobile ? '16px 20px' : '20px 24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: isTinyMobile ? 13 : isSmallMobile ? 14 : isMobile ? 15 : 16,
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.4)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: isTinyMobile ? 10 : isSmallMobile ? 12 : 14 }}>
                    <FaLayerGroup style={{ fontSize: isTinyMobile ? 18 : isSmallMobile ? 20 : isMobile ? 22 : 24 }} />
                    <div style={{ textAlign: 'left' }}>
                      <div>Select Class</div>
                      <div style={{ fontSize: isTinyMobile ? 10 : isSmallMobile ? 11 : 12, opacity: 0.9, fontWeight: 500 }}>Choose what to work on</div>
                    </div>
                  </div>
                  <FaArrowRight style={{ fontSize: isTinyMobile ? 14 : isSmallMobile ? 16 : 18 }} />
                </button>
                <button
                  onClick={() => navigate('/enter-scores')}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    borderRadius: isMobile ? 10 : 14,
                    padding: isTinyMobile ? '12px 16px' : isSmallMobile ? '14px 18px' : isMobile ? '16px 20px' : '20px 24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: isTinyMobile ? 13 : isSmallMobile ? 14 : isMobile ? 15 : 16,
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: isTinyMobile ? 10 : isSmallMobile ? 12 : 14 }}>
                    <FaChartBar style={{ fontSize: isTinyMobile ? 18 : isSmallMobile ? 20 : isMobile ? 22 : 24 }} />
                    <div style={{ textAlign: 'left' }}>
                      <div>Enter Scores</div>
                      <div style={{ fontSize: isTinyMobile ? 10 : isSmallMobile ? 11 : 12, opacity: 0.9, fontWeight: 500 }}>Direct entry</div>
                    </div>
                  </div>
                  <FaArrowRight style={{ fontSize: isTinyMobile ? 14 : isSmallMobile ? 16 : 18 }} />
                </button>
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    )
  }

  const isMobile = window.innerWidth <= 768
  const isTablet = window.innerWidth <= 1024
  const isDesktop = window.innerWidth > 1024

  return (
    <div className="dashboard-page">
      <style>{`
        .dashboard-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: ${isDesktop ? '24px' : '16px'};
          padding-top: ${isDesktop ? '140px' : '120px'};
        }
        
        .dashboard-container {
          max-width: ${isDesktop ? '1600px' : '1400px'};
          margin: 0 auto;
        }
        
        @media (max-width: 320px) {
          .dashboard-page {
            padding: 4px;
            padding-top: 70px;
          }
        }
        
        @media (min-width: 321px) and (max-width: 480px) {
          .dashboard-page {
            padding: 8px;
            padding-top: 80px;
          }
        }
        
        @media (min-width: 481px) and (max-width: 768px) {
          .dashboard-page {
            padding: 12px;
            padding-top: 100px;
          }
        }
        
        @media (min-width: 1025px) {
          .dashboard-page {
            padding: 24px 32px;
            padding-top: 140px;
          }
        }
        
        @media (min-width: 1440px) {
          .dashboard-page {
            padding: 32px 48px;
            padding-top: 160px;
          }
        }
      `}</style>
      
      <div className="dashboard-container">
      {/* Admin Hero Section */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: isDesktop ? 24 : 16,
        padding: isMobile ? '20px 16px' : isTablet ? '24px 20px' : isDesktop ? '40px 48px' : '28px 32px',
        marginBottom: isMobile ? 16 : isDesktop ? 32 : 24,
        boxShadow: isDesktop ? '0 20px 60px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements - scaled for mobile */}
        <div style={{
          position: 'absolute',
          top: isMobile ? -20 : -40,
          right: isMobile ? -20 : -40,
          width: isMobile ? 120 : 180,
          height: isMobile ? 120 : 180,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: isMobile ? -10 : -20,
          left: isMobile ? -10 : -20,
          width: isMobile ? 80 : 120,
          height: isMobile ? 80 : 120,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
          filter: 'blur(30px)'
        }} />
        
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          display: 'flex', 
          gap: isMobile ? 12 : isDesktop ? 24 : 16, 
          flexDirection: isMobile ? 'column' : 'row', 
          alignItems: isMobile ? 'flex-start' : 'center',
          textAlign: isMobile ? 'left' : 'left'
        }}>
          <div style={{
            width: isMobile ? 56 : isDesktop ? 80 : 64,
            height: isMobile ? 56 : isDesktop ? 80 : 64,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            borderRadius: isMobile ? 14 : isDesktop ? 20 : 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isDesktop ? '0 8px 32px rgba(99, 102, 241, 0.4)' : '0 4px 16px rgba(99, 102, 241, 0.3)',
            flexShrink: 0
          }}>
            <FaUsers style={{ fontSize: isMobile ? 24 : isDesktop ? 36 : 28, color: 'white' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: isMobile ? 20 : isTablet ? 24 : isDesktop ? 36 : 28, 
              fontWeight: 700, 
              color: '#e2e8f0',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              Welcome, {user.first_name}!
            </h1>
            <div style={{ 
              margin: isMobile ? '6px 0 0' : '8px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap'
            }}>
              <span style={{ 
                background: 'rgba(34, 197, 94, 0.2)', 
                color: '#86efac',
                padding: isMobile ? '4px 10px' : isDesktop ? '8px 16px' : '6px 12px', 
                borderRadius: 20,
                fontSize: isMobile ? 11 : isDesktop ? 14 : 12,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}>
                {user.role === 'SCHOOL_ADMIN' ? '🏫 School Administrator' : '👔 Principal'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: 16,
          borderRadius: 12,
          marginBottom: 24,
          fontSize: 14
        }}>
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Overview Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: isMobile ? 16 : isDesktop ? 28 : 20,
            marginBottom: isMobile ? 20 : isDesktop ? 40 : 32
          }}>
            <div style={{
              background: 'white',
              borderRadius: isMobile ? 12 : 16,
              padding: isMobile ? '20px 16px' : isTablet ? '20px' : '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
              onMouseEnter={e => {
                if (!isMobile) {
                  e.currentTarget.style.boxShadow = isDesktop ? '0 20px 60px rgba(59,130,246,0.2)' : '0 10px 40px rgba(59,130,246,0.15)'
                  e.currentTarget.style.transform = isDesktop ? 'translateY(-8px)' : 'translateY(-4px)'
                }
              }}
              onMouseLeave={e => {
                if (!isMobile) {
                  e.currentTarget.style.boxShadow = isDesktop ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: isMobile ? 'flex-start' : 'center', 
                gap: isMobile ? 12 : 16, 
                marginBottom: isMobile ? 8 : 12,
                flexDirection: isMobile ? 'column' : 'row',
                textAlign: isMobile ? 'center' : 'left'
              }}>
                <div style={{
                  width: isMobile ? 44 : isDesktop ? 56 : 48,
                  height: isMobile ? 44 : isDesktop ? 56 : 48,
                  borderRadius: isMobile ? 10 : isDesktop ? 16 : 12,
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: isMobile ? 'center' : 'flex-start'
                }}>
                  <FaUserGraduate style={{ fontSize: isMobile ? 18 : isDesktop ? 26 : 22, color: 'white' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: isMobile ? 11 : 13, 
                    color: '#6b7280', 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}>Total Students</p>
                  <h3 style={{ 
                    margin: '4px 0 0', 
                    fontSize: isMobile ? 24 : isDesktop ? 40 : 32, 
                    fontWeight: 800, 
                    color: '#111827',
                    lineHeight: 1.2
                  }}>{data.counts?.students || 0}</h3>
                </div>
              </div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: isMobile ? 12 : 16,
              padding: isMobile ? '20px 16px' : isTablet ? '20px' : '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
              onMouseEnter={e => {
                if (!isMobile) {
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(16,185,129,0.15)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }
              }}
              onMouseLeave={e => {
                if (!isMobile) {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: isMobile ? 'flex-start' : 'center', 
                gap: isMobile ? 12 : 16, 
                marginBottom: isMobile ? 8 : 12,
                flexDirection: isMobile ? 'column' : 'row',
                textAlign: isMobile ? 'center' : 'left'
              }}>
                <div style={{
                  width: isMobile ? 44 : 48,
                  height: isMobile ? 44 : 48,
                  borderRadius: isMobile ? 10 : 12,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: isMobile ? 'center' : 'flex-start'
                }}>
                  <FaChalkboardTeacher style={{ fontSize: isMobile ? 18 : 22, color: 'white' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: isMobile ? 11 : 13, 
                    color: '#6b7280', 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}>Teachers</p>
                  <h3 style={{ 
                    margin: '4px 0 0', 
                    fontSize: isMobile ? 24 : 32, 
                    fontWeight: 800, 
                    color: '#111827',
                    lineHeight: 1.2
                  }}>{data.counts?.teachers || 0}</h3>
                </div>
              </div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: isMobile ? 12 : 16,
              padding: isMobile ? '20px 16px' : isTablet ? '20px' : '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
              onMouseEnter={e => {
                if (!isMobile) {
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(139,92,246,0.15)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }
              }}
              onMouseLeave={e => {
                if (!isMobile) {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: isMobile ? 'flex-start' : 'center', 
                gap: isMobile ? 12 : 16, 
                marginBottom: isMobile ? 8 : 12,
                flexDirection: isMobile ? 'column' : 'row',
                textAlign: isMobile ? 'center' : 'left'
              }}>
                <div style={{
                  width: isMobile ? 44 : 48,
                  height: isMobile ? 44 : 48,
                  borderRadius: isMobile ? 10 : 12,
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: isMobile ? 'center' : 'flex-start'
                }}>
                  <FaLayerGroup style={{ fontSize: isMobile ? 18 : 22, color: 'white' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: isMobile ? 11 : 13, 
                    color: '#6b7280', 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}>Classes</p>
                  <h3 style={{ 
                    margin: '4px 0 0', 
                    fontSize: isMobile ? 24 : 32, 
                    fontWeight: 800, 
                    color: '#111827',
                    lineHeight: 1.2
                  }}>{data.counts?.classes || 0}</h3>
                </div>
              </div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: isMobile ? 12 : 16,
              padding: isMobile ? '20px 16px' : isTablet ? '20px' : '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
              onMouseEnter={e => {
                if (!isMobile) {
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(236,72,153,0.15)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }
              }}
              onMouseLeave={e => {
                if (!isMobile) {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: isMobile ? 'flex-start' : 'center', 
                gap: isMobile ? 12 : 16, 
                marginBottom: isMobile ? 8 : 12,
                flexDirection: isMobile ? 'column' : 'row',
                textAlign: isMobile ? 'center' : 'left'
              }}>
                <div style={{
                  width: isMobile ? 44 : 48,
                  height: isMobile ? 44 : 48,
                  borderRadius: isMobile ? 10 : 12,
                  background: 'linear-gradient(135deg, #ec4899, #db2777)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: isMobile ? 'center' : 'flex-start'
                }}>
                  <FaBookOpen style={{ fontSize: isMobile ? 18 : 22, color: 'white' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: isMobile ? 11 : 13, 
                    color: '#6b7280', 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}>Subjects</p>
                  <h3 style={{ 
                    margin: '4px 0 0', 
                    fontSize: isMobile ? 24 : 32, 
                    fontWeight: 800, 
                    color: '#111827',
                    lineHeight: 1.2
                  }}>{data.counts?.subjects || 0}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* School Information & Analytics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gap: isMobile ? 16 : isDesktop ? 32 : 24,
            marginBottom: isMobile ? 20 : isDesktop ? 40 : 32
          }}>
            {/* School Info Card */}
            <div style={{
              background: 'white',
              borderRadius: isMobile ? 16 : isDesktop ? 24 : 20,
              padding: isMobile ? '20px 16px' : isTablet ? '24px' : isDesktop ? '40px 36px' : '32px',
              boxShadow: isDesktop ? '0 8px 40px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: isMobile ? 16 : 24,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 12 : 0,
                textAlign: isMobile ? 'center' : 'left'
              }}>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: isMobile ? 18 : isDesktop ? 26 : 22, 
                  fontWeight: 800, 
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 8 : isDesktop ? 16 : 12,
                  flexDirection: isMobile ? 'column' : 'row'
                }}>
                  <span style={{
                    width: isMobile ? 36 : isDesktop ? 48 : 40,
                    height: isMobile ? 36 : isDesktop ? 48 : 40,
                    borderRadius: isMobile ? 8 : isDesktop ? 12 : 10,
                    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? 16 : isDesktop ? 22 : 18
                  }}>
                    🏫
                  </span>
                  School Information
                </h2>
              </div>
              <div style={{ display: 'grid', gap: isMobile ? 12 : 16 }}>
                <div style={{ 
                  background: '#f8fafc', 
                  padding: isMobile ? '14px 12px' : '16px', 
                  borderRadius: isMobile ? 10 : 12,
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ 
                    fontSize: isMobile ? 11 : 13, 
                    color: '#64748b', 
                    fontWeight: 600, 
                    marginBottom: 4, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}>School Name</div>
                  <div style={{ 
                    fontSize: isMobile ? 16 : 18, 
                    fontWeight: 800, 
                    color: '#0f172a',
                    wordBreak: 'break-word'
                  }}>{data.school?.name}</div>
                </div>
                <div style={{ 
                  display: 'grid', 
                  gap: isMobile ? 8 : 12, 
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'
                }}>
                  <div style={{ 
                    background: '#f0f9ff', 
                    padding: isMobile ? '14px 12px' : '16px', 
                    borderRadius: isMobile ? 10 : 12,
                    border: '1px solid #bae6fd'
                  }}>
                    <div style={{ 
                      fontSize: isMobile ? 10 : 12, 
                      color: '#0284c7', 
                      fontWeight: 600, 
                      marginBottom: 4, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em' 
                    }}>Academic Year</div>
                    <div style={{ 
                      fontSize: isMobile ? 14 : 16, 
                      fontWeight: 800, 
                      color: '#0c4a6e' 
                    }}>{data.current?.academic_year || 'Not Set'}</div>
                  </div>
                  <div style={{ 
                    background: '#f0fdf4', 
                    padding: isMobile ? '14px 12px' : '16px', 
                    borderRadius: isMobile ? 10 : 12,
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{ 
                      fontSize: isMobile ? 10 : 12, 
                      color: '#059669', 
                      fontWeight: 600, 
                      marginBottom: 4, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em' 
                    }}>Current Term</div>
                    <div style={{ 
                      fontSize: isMobile ? 14 : 16, 
                      fontWeight: 800, 
                      color: '#064e3b' 
                    }}>{data.current?.term || 'Not Set'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Analytics */}
            <div style={{
              background: 'white',
              borderRadius: isMobile ? 16 : isDesktop ? 24 : 20,
              padding: isMobile ? '20px 16px' : isTablet ? '24px' : isDesktop ? '40px 36px' : '32px',
              boxShadow: isDesktop ? '0 8px 40px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ 
                margin: isMobile ? '0 0 16px 0' : '0 0 20px 0', 
                fontSize: isMobile ? 16 : 18, 
                fontWeight: 800, 
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 6 : 8,
                justifyContent: isMobile ? 'center' : 'flex-start'
              }}>
                📊 Quick Stats
              </h3>
              <div style={{ display: 'grid', gap: isMobile ? 12 : 16 }}>
                <div style={{ 
                  textAlign: 'center', 
                  padding: isMobile ? '14px 12px' : '16px', 
                  background: '#fef3c7', 
                  borderRadius: isMobile ? 10 : 12,
                  border: '1px solid rgba(251, 191, 36, 0.3)'
                }}>
                  <div style={{ 
                    fontSize: isMobile ? 20 : 24, 
                    fontWeight: 800, 
                    color: '#92400e' 
                  }}>
                    {Math.round(((data.counts?.students || 0) / (data.counts?.teachers || 1)) * 10) / 10}
                  </div>
                  <div style={{ 
                    fontSize: isMobile ? 10 : 12, 
                    color: '#92400e', 
                    fontWeight: 600 
                  }}>Student-Teacher Ratio</div>
                </div>
                <div style={{ 
                  textAlign: 'center', 
                  padding: isMobile ? '14px 12px' : '16px', 
                  background: '#e0f2fe', 
                  borderRadius: isMobile ? 10 : 12,
                  border: '1px solid rgba(6, 182, 212, 0.3)'
                }}>
                  <div style={{ 
                    fontSize: isMobile ? 20 : 24, 
                    fontWeight: 800, 
                    color: '#0e7490' 
                  }}>
                    {Math.round(((data.counts?.students || 0) / (data.counts?.classes || 1)) * 10) / 10}
                  </div>
                  <div style={{ 
                    fontSize: isMobile ? 10 : 12, 
                    color: '#0e7490', 
                    fontWeight: 600 
                  }}>Students per Class</div>
                </div>
              </div>
            </div>
          </div>

          {/* Management Actions */}
          <div style={{
            background: 'white',
            borderRadius: isMobile ? 16 : isDesktop ? 24 : 20,
            padding: isMobile ? '20px 16px' : isTablet ? '24px' : isDesktop ? '40px 36px' : '32px',
            boxShadow: isDesktop ? '0 8px 40px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ 
              margin: isMobile ? '0 0 16px 0' : isDesktop ? '0 0 32px 0' : '0 0 24px 0', 
              fontSize: isMobile ? 18 : isDesktop ? 26 : 22, 
              fontWeight: 800, 
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? 8 : isDesktop ? 16 : 12,
              justifyContent: isMobile ? 'center' : 'flex-start',
              flexDirection: isMobile ? 'column' : 'row',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              <span style={{
                width: isMobile ? 36 : isDesktop ? 48 : 40,
                height: isMobile ? 36 : isDesktop ? 48 : 40,
                borderRadius: isMobile ? 8 : isDesktop ? 12 : 10,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? 16 : isDesktop ? 22 : 18
              }}>
                ⚡
              </span>
              Management Center
            </h2>
            <div style={{ 
              display: 'grid', 
              gap: isMobile ? 12 : isDesktop ? 20 : 16, 
              gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? '1fr 1fr' : isDesktop ? 'repeat(4, 1fr)' : 'repeat(4, 1fr)'
            }}>
              <button
                onClick={() => navigate('/students')}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  border: 'none',
                  borderRadius: isMobile ? 12 : isDesktop ? 18 : 14,
                  padding: isMobile ? '16px 12px' : isDesktop ? '28px 24px' : '20px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: isMobile ? 8 : isDesktop ? 16 : 12,
                  fontSize: isMobile ? 12 : isDesktop ? 16 : 14,
                  fontWeight: 700,
                  boxShadow: isDesktop ? '0 8px 32px rgba(59, 130, 246, 0.4)' : '0 4px 14px rgba(59, 130, 246, 0.4)',
                  transition: 'all 0.3s ease',
                  minHeight: isMobile ? '80px' : isDesktop ? '120px' : 'auto',
                  aspectRatio: isMobile ? '1' : 'auto'
                }}
                onMouseEnter={e => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.4)'
                  }
                }}
              >
                <FaUserGraduate style={{ fontSize: isMobile ? 20 : isDesktop ? 32 : 24 }} />
                <span style={{ fontSize: isMobile ? 11 : isDesktop ? 16 : 14 }}>Students</span>
              </button>

              <button
                onClick={() => navigate('/teachers')}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: isMobile ? 12 : 14,
                  padding: isMobile ? '16px 12px' : '20px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: isMobile ? 8 : 12,
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.3s ease',
                  minHeight: isMobile ? '80px' : 'auto',
                  aspectRatio: isMobile ? '1' : 'auto'
                }}
                onMouseEnter={e => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.4)'
                  }
                }}
              >
                <FaChalkboardTeacher style={{ fontSize: isMobile ? 20 : 24 }} />
                <span style={{ fontSize: isMobile ? 11 : 14 }}>Teachers</span>
              </button>

              <button
                onClick={() => navigate('/classes')}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  borderRadius: isMobile ? 12 : 14,
                  padding: isMobile ? '16px 12px' : '20px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: isMobile ? 8 : 12,
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                  transition: 'all 0.3s ease',
                  minHeight: isMobile ? '80px' : 'auto',
                  aspectRatio: isMobile ? '1' : 'auto'
                }}
                onMouseEnter={e => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.5)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.4)'
                  }
                }}
              >
                <FaLayerGroup style={{ fontSize: isMobile ? 20 : 24 }} />
                <span style={{ fontSize: isMobile ? 11 : 14 }}>Classes</span>
              </button>

              <button
                onClick={() => navigate('/reports')}
                style={{
                  background: 'linear-gradient(135deg, #ec4899, #db2777)',
                  color: 'white',
                  border: 'none',
                  borderRadius: isMobile ? 12 : 14,
                  padding: isMobile ? '16px 12px' : '20px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: isMobile ? 8 : 12,
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)',
                  transition: 'all 0.3s ease',
                  minHeight: isMobile ? '80px' : 'auto',
                  aspectRatio: isMobile ? '1' : 'auto'
                }}
                onMouseEnter={e => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.5)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(236, 72, 153, 0.4)'
                  }
                }}
              >
                <FaFileAlt style={{ fontSize: isMobile ? 20 : 24 }} />
                <span style={{ fontSize: isMobile ? 11 : 14 }}>Reports</span>
              </button>
            </div>
          </div>


        </>
      )}
      </div>
    </div>
  )
}