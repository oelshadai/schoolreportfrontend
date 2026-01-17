import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../state/AuthContext'
import { 
  FaLayerGroup, FaGraduationCap, FaBookOpen, FaChartLine,
  FaUserGraduate, FaChalkboardTeacher, FaUsers, FaClipboardList, FaCalendarAlt,
  FaChartBar, FaTasks, FaFileAlt, FaArrowRight, FaMicrochip, FaArrowCircleUp,
  FaCheckCircle, FaClock, FaExclamationTriangle, FaEye, FaArrowUp, FaArrowDown
} from 'react-icons/fa'

export default function DashboardProduction() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [teacherData, setTeacherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboardData = async () => {
    try {
      console.log('Loading dashboard data...')
      
      // Try multiple endpoints to get data
      const [dashboardRes, teachersRes, classesRes, studentsRes] = await Promise.all([
        api.get('/schools/dashboard/').catch(() => ({ data: {} })),
        api.get('/teachers/').catch(() => ({ data: { results: [] } })),
        api.get('/schools/classes/').catch(() => ({ data: { results: [] } })),
        api.get('/students/').catch(() => ({ data: { results: [] } }))
      ])
      
      const dashboardData = dashboardRes.data
      const teachers = teachersRes.data.results || teachersRes.data || []
      const classes = classesRes.data.results || classesRes.data || []
      const students = studentsRes.data.results || studentsRes.data || []
      
      // Combine data from multiple sources
      const combinedData = {
        ...dashboardData,
        total_teachers: dashboardData.total_teachers || teachers.length,
        total_classes: dashboardData.total_classes || classes.length,
        total_students: dashboardData.total_students || students.length,
        total_reports: dashboardData.total_reports || 0
      }
      
      console.log('Combined dashboard data:', combinedData)
      setData(combinedData)

      if (user?.role === 'TEACHER') {
        try {
          const assignmentsRes = await api.get('/assignments/assignments/')
          const createdAssignments = Array.isArray(assignmentsRes.data.results) 
            ? assignmentsRes.data.results 
            : Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []
          
          const teacherAssignmentsRes = await api.get('/teachers/assignments/')
          const teacherAssignments = Array.isArray(teacherAssignmentsRes.data.results) 
            ? teacherAssignmentsRes.data.results 
            : Array.isArray(teacherAssignmentsRes.data) ? teacherAssignmentsRes.data : []
          
          const studentsRes = await api.get('/students/')
          const allStudents = studentsRes.data.results || studentsRes.data || []
          
          console.log('Teacher assignments:', teacherAssignments)
          console.log('All students:', allStudents)
          
          const assignedClasses = [...new Set(teacherAssignments.map(a => a.class?.id).filter(Boolean))]
          const assignedSubjects = [...new Set(teacherAssignments.map(a => a.subject?.id).filter(Boolean))]
          const isFormTeacher = teacherAssignments.some(a => a.type === 'form_class')
          const formClass = teacherAssignments.find(a => a.type === 'form_class')
          
          console.log('Assigned classes:', assignedClasses)
          console.log('Form class:', formClass)
          
          // Calculate students more accurately
          let myStudents = 0
          if (isFormTeacher && formClass) {
            // For form teachers, count students in their form class
            const formClassStudents = allStudents.filter(s => {
              const matches = s.current_class?.id === formClass.class?.id || 
                             s.class_instance === formClass.class?.id ||
                             s.current_class === formClass.class?.id
              console.log(`Student ${s.first_name} ${s.last_name}:`, {
                current_class_id: s.current_class?.id,
                class_instance: s.class_instance,
                current_class: s.current_class,
                form_class_id: formClass.class?.id,
                matches
              })
              return matches
            })
            myStudents = formClassStudents.length
            console.log('Form class students found:', formClassStudents)
          } else {
            // For subject teachers, count students in all their assigned classes
            const classStudents = allStudents.filter(s => 
              assignedClasses.includes(s.current_class?.id) ||
              assignedClasses.includes(s.class_instance) ||
              assignedClasses.includes(s.current_class)
            )
            myStudents = classStudents.length
            console.log('Subject teacher students found:', classStudents)
          }
          
          console.log('Final student count:', myStudents)

          setTeacherData({
            assignments: teacherAssignments,
            createdAssignments,
            assignedClasses: assignedClasses.length,
            assignedSubjects: assignedSubjects.length,
            isFormTeacher,
            formClass: formClass?.class,
            myStudents: myStudents,
            totalAssignments: createdAssignments.length,
            assignmentStats: {
              total: createdAssignments.length,
              published: createdAssignments.filter(a => a.status === 'PUBLISHED').length,
              draft: createdAssignments.filter(a => a.status === 'DRAFT').length,
              closed: createdAssignments.filter(a => a.status === 'CLOSED').length
            }
          })
        } catch (teacherError) {
          console.error('Teacher data error:', teacherError)
        }
      }
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3ecf8e',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
      paddingTop: '80px',
      padding: '80px 20px 20px 20px',
      margin: 0,
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: window.innerWidth <= 768 ? '20px' : '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px',
            flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
            textAlign: window.innerWidth <= 480 ? 'center' : 'left'
          }}>
            <div style={{
              width: window.innerWidth <= 480 ? 48 : 56,
              height: window.innerWidth <= 480 ? 48 : 56,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaMicrochip size={window.innerWidth <= 480 ? 20 : 24} color="white" />
            </div>
            <div>
              <h1 style={{
                fontSize: window.innerWidth <= 480 ? '20px' : window.innerWidth <= 768 ? '24px' : '28px',
                fontWeight: '700',
                color: '#1a202c',
                margin: '0 0 4px 0'
              }}>
                Welcome back, {user?.first_name}!
              </h1>
              <p style={{
                fontSize: window.innerWidth <= 480 ? '14px' : '16px',
                color: '#718096',
                margin: 0
              }}>
                {user?.role === 'TEACHER' ? (
                  teacherData?.isFormTeacher ? 
                    `Form Teacher - ${teacherData?.formClass?.name}` : 
                    `Subject Teacher - ${teacherData?.assignedSubjects || 0} subjects`
                ) : (
                  user?.role === 'SCHOOL_ADMIN' ? 'School Administrator' : 'Principal'
                )}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Enhanced Stats Grid with Visual Charts - Hide for Teachers */}
        {user?.role !== 'TEACHER' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 480 ? '1fr' : window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: window.innerWidth <= 480 ? '16px' : '20px',
            marginBottom: '32px'
          }}>
            {/* Classes Card */}
            <div 
              onClick={() => navigate('/classes')}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(62, 207, 142, 0.1)',
                border: '1px solid rgba(62, 207, 142, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(62, 207, 142, 0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(62, 207, 142, 0.1)'
              }}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)', borderRadius: '0 16px 0 60px', opacity: 0.1 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#718096', fontWeight: '600' }}>Total Classes</p>
                  <h3 style={{ margin: 0, fontSize: '36px', fontWeight: '800', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {data?.total_classes || 0}
                    <FaArrowCircleUp size={16} color="#3ecf8e" />
                  </h3>
                </div>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(62, 207, 142, 0.3)'
                }}>
                  <FaLayerGroup size={24} color="white" />
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#718096' }}>Active Classes</span>
                  <span style={{ fontSize: '12px', color: '#3ecf8e', fontWeight: '600' }}>85%</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #3ecf8e, #2dd4bf)', borderRadius: '2px' }} />
                </div>
              </div>
            </div>

            {/* Students Card */}
            <div 
              onClick={() => navigate('/students')}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(45, 212, 191, 0.1)',
                border: '1px solid rgba(45, 212, 191, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(45, 212, 191, 0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(45, 212, 191, 0.1)'
              }}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', background: 'linear-gradient(135deg, #2dd4bf, #06d6a0)', borderRadius: '0 16px 0 60px', opacity: 0.1 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#718096', fontWeight: '600' }}>Total Students</p>
                  <h3 style={{ margin: 0, fontSize: '36px', fontWeight: '800', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {data?.total_students || 0}
                    <FaArrowUp size={16} color="#2dd4bf" />
                  </h3>
                </div>
                <div style={{ position: 'relative' }}>
                  <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="28" cy="28" r="22" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                    <circle cx="28" cy="28" r="22" fill="none" stroke="#2dd4bf" strokeWidth="6" 
                      strokeDasharray={`${(data?.total_students || 0) / 10 * 1.38} 138`} strokeLinecap="round" />
                  </svg>
                  <FaUserGraduate size={20} color="#2dd4bf" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2dd4bf' }} />
                  <span style={{ color: '#718096' }}>Active: {Math.floor((data?.total_students || 0) * 0.92)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e2e8f0' }} />
                  <span style={{ color: '#718096' }}>Inactive: {Math.floor((data?.total_students || 0) * 0.08)}</span>
                </div>
              </div>
            </div>

            {/* Teachers Card */}
            <div 
              onClick={() => navigate('/teachers')}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(6, 214, 160, 0.1)',
                border: '1px solid rgba(6, 214, 160, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(6, 214, 160, 0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(6, 214, 160, 0.1)'
              }}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', background: 'linear-gradient(135deg, #06d6a0, #059669)', borderRadius: '0 16px 0 60px', opacity: 0.1 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#718096', fontWeight: '600' }}>Total Teachers</p>
                  <h3 style={{ margin: 0, fontSize: '36px', fontWeight: '800', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {data?.total_teachers || 0}
                    <FaCheckCircle size={16} color="#06d6a0" />
                  </h3>
                </div>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #06d6a0, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(6, 214, 160, 0.3)'
                }}>
                  <FaChalkboardTeacher size={24} color="white" />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'end', gap: '3px', height: '20px', marginTop: '12px' }}>
                {[65, 80, 45, 90, 75, 85, 70].map((height, idx) => (
                  <div key={idx} style={{
                    flex: 1,
                    height: `${height}%`,
                    background: idx === 6 ? '#06d6a0' : '#d1fae5',
                    borderRadius: '2px 2px 0 0',
                    transition: 'all 0.3s ease'
                  }} />
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#718096', margin: '8px 0 0 0' }}>Weekly activity</p>
            </div>

            {/* Reports Card */}
            <div 
              onClick={() => navigate('/reports')}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(245, 158, 11, 0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(245, 158, 11, 0.1)'
              }}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '0 16px 0 60px', opacity: 0.1 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#718096', fontWeight: '600' }}>Generated Reports</p>
                  <h3 style={{ margin: 0, fontSize: '36px', fontWeight: '800', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {data?.total_reports || 0}
                    <FaChartLine size={16} color="#f59e0b" />
                  </h3>
                </div>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}>
                  <FaChartBar size={24} color="white" />
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <svg width="100%" height="24" style={{ overflow: 'visible' }}>
                  <polyline
                    points="0,20 20,15 40,18 60,10 80,12 100,8 120,5"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="120" cy="5" r="3" fill="#f59e0b" />
                </svg>
                <p style={{ fontSize: '12px', color: '#718096', margin: '4px 0 0 0' }}>+12% this month</p>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Dashboard Section - Hide for Teachers */}
        {user?.role !== 'TEACHER' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '2fr 1fr',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Performance Overview Chart */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1a202c' }}>School Performance Overview</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3ecf8e' }} />
                    <span style={{ color: '#718096' }}>Students</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2dd4bf' }} />
                    <span style={{ color: '#718096' }}>Teachers</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06d6a0' }} />
                    <span style={{ color: '#718096' }}>Classes</span>
                  </div>
                </div>
              </div>
              
              <div style={{ height: '200px', position: 'relative', background: 'linear-gradient(180deg, rgba(62, 207, 142, 0.1) 0%, rgba(62, 207, 142, 0.02) 100%)', borderRadius: '8px', padding: '16px' }}>
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                  {[0, 1, 2, 3, 4].map(i => (
                    <line key={i} x1="0" y1={`${i * 25}%`} x2="100%" y2={`${i * 25}%`} stroke="#e2e8f0" strokeWidth="1" opacity="0.5" />
                  ))}
                  
                  <polyline
                    points="0,160 80,140 160,130 240,110 320,90 400,80 480,70"
                    fill="none"
                    stroke="#3ecf8e"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  
                  <polyline
                    points="0,170 80,160 160,150 240,140 320,130 400,120 480,110"
                    fill="none"
                    stroke="#2dd4bf"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  
                  <polyline
                    points="0,180 80,170 160,164 240,156 320,150 400,140 480,130"
                    fill="none"
                    stroke="#06d6a0"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  
                  <circle cx="480" cy="70" r="4" fill="#3ecf8e" />
                  <circle cx="480" cy="110" r="4" fill="#2dd4bf" />
                  <circle cx="480" cy="130" r="4" fill="#06d6a0" />
                </svg>
                
                <div style={{ position: 'absolute', left: '-40px', top: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '12px', color: '#718096' }}>
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>
                
                <div style={{ position: 'absolute', bottom: '-30px', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#718096' }}>
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                </div>
              </div>
            </div>
            
            {/* Activity Feed */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaClock size={16} color="#3ecf8e" />
                Recent Activity
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: FaUserGraduate, text: `${data?.recent_enrollments || 0} new students enrolled`, time: '2 hours ago', color: '#3ecf8e' },
                  { icon: FaChalkboardTeacher, text: 'Grades updated', time: '4 hours ago', color: '#2dd4bf' },
                  { icon: FaFileAlt, text: `${data?.recent_reports || 0} reports generated`, time: '6 hours ago', color: '#f59e0b' },
                  { icon: FaLayerGroup, text: `${data?.new_classes || 0} new classes created`, time: '1 day ago', color: '#06d6a0' },
                  { icon: FaCheckCircle, text: 'Attendance marked', time: '1 day ago', color: '#8b5cf6' }
                ].map((activity, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: '#f8fafc', transition: 'all 0.2s ease' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: activity.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.9
                    }}>
                      <activity.icon size={14} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#374151' }}>{activity.text}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Row - Hide for Teachers */}
        {user?.role !== 'TEACHER' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 480 ? '1fr' : window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {[
              { label: 'Attendance Rate', value: `${data?.attendance_rate || 0}%`, change: '+2.1%', icon: FaCheckCircle, color: '#10b981', trend: 'up' },
              { label: 'Average Grade', value: data?.average_grade || '0', change: '+1.3', icon: FaChartLine, color: '#3b82f6', trend: 'up' },
              { label: 'Active Assignments', value: data?.active_assignments || '0', change: '+5', icon: FaTasks, color: '#f59e0b', trend: 'up' },
              { label: 'Completion Rate', value: `${data?.completion_rate || 0}%`, change: '-0.8%', icon: FaExclamationTriangle, color: '#ef4444', trend: 'down' }
            ].map((metric, idx) => (
              <div key={idx} style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `${metric.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <metric.icon size={20} color={metric.color} />
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1a202c' }}>{metric.value}</h4>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#718096', fontWeight: '600' }}>{metric.label}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px' }}>
                  {metric.trend === 'up' ? <FaArrowUp size={10} color="#10b981" /> : <FaArrowDown size={10} color="#ef4444" />}
                  <span style={{ color: metric.trend === 'up' ? '#10b981' : '#ef4444', fontWeight: '600' }}>{metric.change}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Quick Actions - Hide admin actions for teachers */}
        {user?.role !== 'TEACHER' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 480 ? 'repeat(2, 1fr)' : window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {[
              { icon: FaLayerGroup, label: 'Manage Classes', path: '/classes', color: '#3ecf8e' },
              { icon: FaUserGraduate, label: 'View Students', path: '/students', color: '#2dd4bf' },
              { icon: FaChalkboardTeacher, label: 'Manage Teachers', path: '/teachers', color: '#06d6a0' },
              { icon: FaChartBar, label: 'View Reports', path: '/reports', color: '#f59e0b' }
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = action.color
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <action.icon size={24} color={action.color} />
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Teacher Summary */}
        {teacherData && (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: window.innerWidth <= 768 ? '20px' : '32px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              margin: '0 0 24px 0',
              fontSize: window.innerWidth <= 480 ? '18px' : '20px',
              fontWeight: '700',
              color: '#1a202c',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              justifyContent: window.innerWidth <= 480 ? 'center' : 'flex-start'
            }}>
              <FaGraduationCap size={window.innerWidth <= 480 ? 20 : 24} color="#3ecf8e" />
              Your Teaching Dashboard
            </h3>
            
            {/* Teacher Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 480 ? 'repeat(2, 1fr)' : window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid #bbf7d0'
              }}>
                <div style={{ fontSize: window.innerWidth <= 480 ? '24px' : '28px', fontWeight: '700', color: '#16a34a' }}>
                  {teacherData.assignedClasses}
                </div>
                <div style={{ fontSize: window.innerWidth <= 480 ? '12px' : '14px', color: '#15803d', fontWeight: '600' }}>Classes Assigned</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid #5eead4'
              }}>
                <div style={{ fontSize: window.innerWidth <= 480 ? '24px' : '28px', fontWeight: '700', color: '#0d9488' }}>
                  {teacherData.assignedSubjects}
                </div>
                <div style={{ fontSize: window.innerWidth <= 480 ? '12px' : '14px', color: '#0f766e', fontWeight: '600' }}>Subjects Teaching</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid #fde68a'
              }}>
                <div style={{ fontSize: window.innerWidth <= 480 ? '24px' : '28px', fontWeight: '700', color: '#d97706' }}>
                  {teacherData.totalAssignments}
                </div>
                <div style={{ fontSize: window.innerWidth <= 480 ? '12px' : '14px', color: '#b45309', fontWeight: '600' }}>Assignments Created</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid #d8b4fe'
              }}>
                <div style={{ fontSize: window.innerWidth <= 480 ? '24px' : '28px', fontWeight: '700', color: '#9333ea' }}>
                  {teacherData.myStudents}
                </div>
                <div style={{ fontSize: window.innerWidth <= 480 ? '12px' : '14px', color: '#7c3aed', fontWeight: '600' }}>
                  {teacherData.isFormTeacher ? 'Form Class Students' : 'Total Students'}
                </div>
              </div>
            </div>

            {/* Form Teacher Section */}
            {teacherData.isFormTeacher && teacherData.formClass && (
              <div style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                border: '1px solid #7dd3fc'
              }}>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#0369a1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaUsers size={16} />
                  Form Teacher - {teacherData.formClass.name}
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#0c4a6e',
                  lineHeight: 1.5
                }}>
                  You are the form teacher for {teacherData.formClass.name} with {teacherData.myStudents} students under your care.
                  You have additional responsibilities for class management and student welfare.
                </p>
              </div>
            )}

            {/* Assignment Status */}
            {teacherData.assignmentStats && (
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaTasks size={16} color="#6b7280" />
                  Assignment Overview
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth <= 480 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                  gap: '12px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#059669' }}>
                      {teacherData.assignmentStats.published}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Published</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#d97706' }}>
                      {teacherData.assignmentStats.draft}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Draft</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#dc2626' }}>
                      {teacherData.assignmentStats.closed}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Closed</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
                      {teacherData.assignmentStats.total}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Total</div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions for Teachers */}
            <div style={{
              marginTop: '24px',
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 480 ? '1fr' : window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: '12px'
            }}>
              <button
                onClick={() => navigate('/classroom-hub')}
                style={{
                  background: 'linear-gradient(135deg, #3ecf8e, #2dd4bf)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FaBookOpen size={16} />
                Classroom Hub
              </button>
              <button
                onClick={() => navigate('/attendance')}
                style={{
                  background: 'linear-gradient(135deg, #06d6a0, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FaCalendarAlt size={16} />
                Mark Attendance
              </button>
              <button
                onClick={() => navigate('/reports')}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FaFileAlt size={16} />
                View Reports
              </button>
            </div>
          </div>
        )}
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
