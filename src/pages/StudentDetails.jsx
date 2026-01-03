import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'
import { 
  FaUser, FaCalendarCheck, FaHeart, FaComments, 
  FaSave, FaSearch, FaEdit, FaCheck 
} from 'react-icons/fa'

export default function StudentDetails() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [terms, setTerms] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Form data
  const [attendanceData, setAttendanceData] = useState({
    days_present: '',
    days_absent: '',
    times_late: ''
  })
  
  const [behaviorData, setBehaviorData] = useState({
    conduct: 'GOOD',
    attitude: 'GOOD',
    interest: '',
    punctuality: 'GOOD',
    remarks: ''
  })

  const ratingOptions = [
    { value: 'EXCELLENT', label: 'Excellent' },
    { value: 'VERY_GOOD', label: 'Very Good' },
    { value: 'GOOD', label: 'Good' },
    { value: 'SATISFACTORY', label: 'Satisfactory' },
    { value: 'NEEDS_IMPROVEMENT', label: 'Needs Improvement' }
  ]

  // Responsive design constants
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

  const isSmallMobile = screenSize.width <= 480
  const isMobile = screenSize.width <= 768
  const isTablet = screenSize.width <= 1024
  const isDesktop = screenSize.width > 1024

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedStudent && selectedTerm) {
      loadStudentData()
    }
  }, [selectedStudent, selectedTerm])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [studentsRes, termsRes] = await Promise.all([
        api.get('/students/'),
        api.get('/schools/terms/')
      ])
      
      setStudents(studentsRes.data.results || studentsRes.data)
      setTerms(termsRes.data.results || termsRes.data)
      
      // Auto-select current term
      const currentTerm = (termsRes.data.results || termsRes.data).find(t => t.is_current)
      if (currentTerm) {
        setSelectedTerm(String(currentTerm.id))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStudentData = async () => {
    try {
      const [attendanceRes, behaviorRes] = await Promise.all([
        api.get(`/students/attendance/?student_id=${selectedStudent}&term_id=${selectedTerm}`).catch(() => ({ data: { results: [] } })),
        api.get(`/students/behaviour/?student_id=${selectedStudent}&term_id=${selectedTerm}`).catch(() => ({ data: { results: [] } }))
      ])
      
      const attendanceRecord = (attendanceRes.data.results || attendanceRes.data)[0]
      const behaviorRecord = (behaviorRes.data.results || behaviorRes.data)[0]
      
      if (attendanceRecord) {
        setAttendanceData({
          days_present: attendanceRecord.days_present || '',
          days_absent: attendanceRecord.days_absent || '',
          times_late: attendanceRecord.times_late || ''
        })
      } else {
        setAttendanceData({ days_present: '', days_absent: '', times_late: '' })
      }
      
      if (behaviorRecord) {
        setBehaviorData({
          conduct: behaviorRecord.conduct || 'GOOD',
          attitude: behaviorRecord.attitude || 'GOOD',
          interest: behaviorRecord.interest || '',
          punctuality: behaviorRecord.punctuality || 'GOOD',
          remarks: behaviorRecord.remarks || ''
        })
      } else {
        setBehaviorData({
          conduct: 'GOOD',
          attitude: 'GOOD', 
          interest: '',
          punctuality: 'GOOD',
          remarks: ''
        })
      }
    } catch (error) {
      console.error('Error loading student data:', error)
    }
  }

  const handleSave = async () => {
    if (!selectedStudent || !selectedTerm) {
      alert('Please select a student and term')
      return
    }

    try {
      setSaving(true)
      
      // Save attendance
      await api.post('/students/attendance/', {
        student: parseInt(selectedStudent),
        term: parseInt(selectedTerm),
        days_present: parseInt(attendanceData.days_present) || 0,
        days_absent: parseInt(attendanceData.days_absent) || 0,
        times_late: parseInt(attendanceData.times_late) || 0
      })
      
      // Save behavior
      await api.post('/students/behaviour/', {
        student: parseInt(selectedStudent),
        term: parseInt(selectedTerm),
        ...behaviorData
      })
      
      alert('Student details saved successfully!')
    } catch (error) {
      console.error('Error saving data:', error)
      alert('Error saving data. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedStudentObj = students.find(s => s.id === parseInt(selectedStudent))

  return (
    <div className="container" style={{
      maxWidth: 1400,
      margin: '0 auto',
      padding: isMobile ? '20px 12px' : isTablet ? '24px 16px' : '32px 20px',
      paddingTop: isMobile ? '60px' : '120px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white',
      width: '100%',
      boxSizing: 'border-box'
    }}>
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
          }
        `}
      </style>
      
      {/* Enhanced Header with Mobile-First Design */}
      <div className="page-header" style={{ 
        marginBottom: isMobile ? 20 : 24,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        borderRadius: isMobile ? 16 : 20,
        padding: isMobile ? '20px 16px' : isTablet ? '24px 20px' : '28px 24px',
        border: '1px solid rgba(102, 126, 234, 0.2)',
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
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: 12,
            padding: isMobile ? '12px' : '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
          }}>
            <FaUser size={isMobile ? 20 : 24} color="white" />
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
            }}>Student Details</h1>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: isMobile ? 13 : 14,
              color: '#1f2937',
              fontWeight: 500
            }}>
              Enter attendance, behavior, and additional information
            </p>
          </div>
        </div>
      </div>

      {/* Selection Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: isMobile ? 12 : 16,
        padding: isMobile ? '16px 12px' : isTablet ? '20px 16px' : '24px 20px',
        marginBottom: isMobile ? 20 : 24,
        border: '1px solid rgba(71, 85, 105, 0.3)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 style={{ 
          fontSize: isMobile ? 16 : 18, 
          fontWeight: '600', 
          marginBottom: isMobile ? 12 : 16,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#1f2937'
        }}>
          <FaSearch />
          Select Student & Term
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 12 : 16,
          marginBottom: isMobile ? 12 : 16
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: isMobile ? 13 : 14, 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1f2937'
            }}>
              Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              style={{
                width: '100%',
                padding: isMobile ? '14px' : '10px',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: isMobile ? 10 : 6,
                fontSize: isMobile ? 16 : 14,
                background: 'rgba(255, 255, 255, 0.8)',
                color: '#1f2937',
                minHeight: isMobile ? 48 : 'auto'
              }}
            >
              <option value="">Select Term</option>
              {terms.map(term => (
                <option key={term.id} value={term.id}>
                  {term.name} - {term.academic_year}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: isMobile ? 13 : 14, 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1f2937'
            }}>
              Search Student
            </label>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: isMobile ? '14px' : '10px',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: isMobile ? 10 : 6,
                fontSize: isMobile ? 16 : 14,
                background: 'rgba(255, 255, 255, 0.8)',
                color: '#1f2937',
                minHeight: isMobile ? 48 : 'auto'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            fontSize: isMobile ? 13 : 14, 
            fontWeight: '600', 
            marginBottom: '8px',
            color: '#1f2937'
          }}>
            Student
          </label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            style={{
              width: '100%',
              padding: isMobile ? '14px' : '10px',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: isMobile ? 10 : 6,
              fontSize: isMobile ? 16 : 14,
              background: 'rgba(255, 255, 255, 0.8)',
              color: '#1f2937',
              minHeight: isMobile ? 48 : 'auto'
            }}
          >
            <option value="">Select Student</option>
            {filteredStudents.map(student => (
              <option key={student.id} value={student.id}>
                {student.student_id} - {student.full_name} ({student.class_name})
              </option>
            ))}
          </select>
        </div>

        {selectedStudentObj && (
          <div style={{
            marginTop: isMobile ? 12 : 16,
            padding: isMobile ? '10px' : '12px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: isMobile ? 10 : 8,
            fontSize: isMobile ? 13 : 14,
            border: '1px solid rgba(59, 130, 246, 0.2)',
            color: '#1f2937'
          }}>
            <strong>Selected:</strong> {selectedStudentObj.full_name} - Class: {selectedStudentObj.class_name}
          </div>
        )}
      </div>

      {selectedStudent && selectedTerm && (
        <>
          {/* Attendance Section */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: isMobile ? 12 : 16,
            padding: isMobile ? '16px 12px' : isTablet ? '20px 16px' : '24px 20px',
            marginBottom: isMobile ? 20 : 24,
            border: '1px solid rgba(71, 85, 105, 0.3)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ 
              fontSize: isMobile ? 16 : 18, 
              fontWeight: '600', 
              marginBottom: isMobile ? 12 : 16,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'white'
            }}>
              <FaCalendarCheck />
              Attendance
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: isMobile ? 12 : 16
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: isMobile ? 13 : 14, 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Days Present
                </label>
                <input
                  type="number"
                  min="0"
                  value={attendanceData.days_present}
                  onChange={(e) => setAttendanceData({
                    ...attendanceData,
                    days_present: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px' : '10px',
                    border: '2px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: isMobile ? 10 : 6,
                    fontSize: isMobile ? 16 : 14,
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    minHeight: isMobile ? 48 : 'auto'
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: isMobile ? 13 : 14, 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Days Absent
                </label>
                <input
                  type="number"
                  min="0"
                  value={attendanceData.days_absent}
                  onChange={(e) => setAttendanceData({
                    ...attendanceData,
                    days_absent: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px' : '10px',
                    border: '2px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: isMobile ? 10 : 6,
                    fontSize: isMobile ? 16 : 14,
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    minHeight: isMobile ? 48 : 'auto'
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: isMobile ? 13 : 14, 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Times Late
                </label>
                <input
                  type="number"
                  min="0"
                  value={attendanceData.times_late}
                  onChange={(e) => setAttendanceData({
                    ...attendanceData,
                    times_late: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px' : '10px',
                    border: '2px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: isMobile ? 10 : 6,
                    fontSize: isMobile ? 16 : 14,
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    minHeight: isMobile ? 48 : 'auto'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Behavior Section */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: isMobile ? 12 : 16,
            padding: isMobile ? '16px 12px' : isTablet ? '20px 16px' : '24px 20px',
            marginBottom: isMobile ? 20 : 24,
            border: '1px solid rgba(71, 85, 105, 0.3)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ 
              fontSize: isMobile ? 16 : 18, 
              fontWeight: '600', 
              marginBottom: isMobile ? 12 : 16,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'white'
            }}>
              <FaHeart />
              Behavior & Conduct
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: isMobile ? 12 : 16,
              marginBottom: isMobile ? 12 : 16
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: isMobile ? 13 : 14, 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Conduct
                </label>
                <select
                  value={behaviorData.conduct}
                  onChange={(e) => setBehaviorData({
                    ...behaviorData,
                    conduct: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px' : '10px',
                    border: '2px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: isMobile ? 10 : 6,
                    fontSize: isMobile ? 16 : 14,
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    minHeight: isMobile ? 48 : 'auto'
                  }}
                >
                  {ratingOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: isMobile ? 13 : 14, 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Attitude
                </label>
                <select
                  value={behaviorData.attitude}
                  onChange={(e) => setBehaviorData({
                    ...behaviorData,
                    attitude: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px' : '10px',
                    border: '2px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: isMobile ? 10 : 6,
                    fontSize: isMobile ? 16 : 14,
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    minHeight: isMobile ? 48 : 'auto'
                  }}
                >
                  {ratingOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: isMobile ? 13 : 14, 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Interest
                </label>
                <input
                  type="text"
                  placeholder="e.g., Reading, Dancing, Drama, Sports..."
                  value={behaviorData.interest}
                  onChange={(e) => setBehaviorData({
                    ...behaviorData,
                    interest: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px' : '10px',
                    border: '2px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: isMobile ? 10 : 6,
                    fontSize: isMobile ? 16 : 14,
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    minHeight: isMobile ? 48 : 'auto'
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: isMobile ? 13 : 14, 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#e2e8f0'
                }}>
                  Punctuality
                </label>
                <select
                  value={behaviorData.punctuality}
                  onChange={(e) => setBehaviorData({
                    ...behaviorData,
                    punctuality: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px' : '10px',
                    border: '2px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: isMobile ? 10 : 6,
                    fontSize: isMobile ? 16 : 14,
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    minHeight: isMobile ? 48 : 'auto'
                  }}
                >
                  {ratingOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: isMobile ? 13 : 14, 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#e2e8f0'
              }}>
                Teacher's Remarks
              </label>
              <textarea
                value={behaviorData.remarks}
                onChange={(e) => setBehaviorData({
                  ...behaviorData,
                  remarks: e.target.value
                })}
                placeholder="Enter additional comments about the student's behavior, interests, or performance..."
                rows={4}
                style={{
                  width: '100%',
                  padding: isMobile ? '14px' : '10px',
                  border: '2px solid rgba(71, 85, 105, 0.4)',
                  borderRadius: isMobile ? 10 : 6,
                  fontSize: isMobile ? 16 : 14,
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: 'white',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  minHeight: isMobile ? 80 : 60
                }}
              />
            </div>
          </div>

          {/* Save Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: saving ? 'rgba(107, 114, 128, 0.5)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: isMobile ? 12 : 8,
                padding: isMobile ? '16px 24px' : '12px 24px',
                fontSize: isMobile ? 15 : 16,
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                margin: '0 auto',
                minHeight: isMobile ? 54 : 44,
                boxShadow: saving ? 'none' : '0 6px 16px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              {saving ? <FaEdit /> : <FaSave />}
              {saving ? 'Saving...' : 'Save Student Details'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}