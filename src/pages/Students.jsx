import { useEffect, useState, useCallback, useMemo } from 'react'
import api from '../utils/api'
import { FaUserGraduate, FaPlus, FaUpload, FaSync, FaSearch, FaTimes, FaSave, FaUser, FaEye, FaEyeSlash, FaCopy } from 'react-icons/fa'
import { useAuth } from '../state/AuthContext'
import ScrollableSelect from '../components/ScrollableSelect'
import ImageCaptureInput from '../components/ImageCaptureInput'

export default function Students() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [error, setError] = useState(null)
  const [classes, setClasses] = useState([])
  const [classFilter, setClassFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [bulkMessage, setBulkMessage] = useState('')
  const [bulkFile, setBulkFile] = useState(null)
  const [addForm, setAddForm] = useState({
    student_id: '', first_name: '', last_name: '', other_names: '', gender: 'M', date_of_birth: '',
    current_class: '', guardian_name: '', guardian_phone: '', guardian_email: '', guardian_address: '',
    admission_date: '', photo: null
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdStudent, setCreatedStudent] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showClassDropdown, setShowClassDropdown] = useState(false)
  const [showCredentials, setShowCredentials] = useState(null)
  const [credentialsVisible, setCredentialsVisible] = useState({})

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showClassDropdown && !event.target.closest('.class-dropdown')) {
        setShowClassDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showClassDropdown])

  // Enhanced responsive design constants
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

  // Enhanced mobile keyboard handling with comprehensive viewport management
  useEffect(() => {
    if (showAdd && isMobile) {
      // Store original scroll position
      const scrollY = window.scrollY
      
      // Prevent background scroll with better positioning
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none' // Prevent pull-to-refresh
      
      // Enhanced viewport height handling for mobile keyboards
      const setViewportHeight = () => {
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
        // Also set a safe area for notched devices
        document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top, 0px)')
        document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0px)')
      }
      
      setViewportHeight()
      
      // Listen for viewport changes (keyboard appearance/disappearance)
      const handleResize = () => {
        setViewportHeight()
        // Dispatch custom event for form components to adjust
        window.dispatchEvent(new CustomEvent('viewportHeightChange', {
          detail: { innerHeight: window.innerHeight }
        }))
      }
      
      const handleOrientationChange = () => {
        // Delay to ensure orientation change is complete
        setTimeout(() => {
          setViewportHeight()
        }, 100)
      }
      
      window.addEventListener('resize', handleResize, { passive: true })
      window.addEventListener('orientationchange', handleOrientationChange)
      
      return () => {
        // Restore original scroll position and styles
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        document.body.style.touchAction = ''
        
        window.scrollTo(0, scrollY)
        
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('orientationchange', handleOrientationChange)
      }
    }
  }, [showAdd])

  const teacherClasses = useMemo(() => {
    if (user?.role !== 'TEACHER') return []
    return (classes || []).filter(c => String(c.class_teacher) === String(user.id))
  }, [classes, user])

  const isClassTeacher = (student) => {
    if (user?.role !== 'TEACHER') return false
    if (!student.current_class) return false
    
    // Debug logging
    console.log('Checking class teacher for student:', student.student_id)
    console.log('Student current_class:', student.current_class)
    console.log('Teacher classes:', teacherClasses.map(c => c.id))
    console.log('User ID:', user.id)
    
    const isTeacher = teacherClasses.some(c => String(c.id) === String(student.current_class))
    console.log('Is class teacher:', isTeacher)
    
    return isTeacher
  }

  // Auto-fill defaults for new form
  const initializeForm = () => {
    const today = new Date().toISOString().split('T')[0]
    const teacherClassId = user?.role === 'TEACHER' && teacherClasses.length === 1 
      ? String(teacherClasses[0].id) 
      : ''
    
    // Generate suggested student ID
    const currentYear = new Date().getFullYear()
    const classLevel = teacherClasses.length === 1 ? teacherClasses[0].level : ''
    const nextNumber = (students.length + 1).toString().padStart(3, '0')
    const suggestedId = `${currentYear}${classLevel}${nextNumber}`
    
    setAddForm({
      student_id: suggestedId, first_name: '', last_name: '', other_names: '', gender: 'M', 
      date_of_birth: '', current_class: teacherClassId, guardian_name: '', 
      guardian_phone: '', guardian_email: '', guardian_address: '', 
      admission_date: today, photo: null
    })
    setFormErrors({})
    setSubmitting(false)
  }

  // Validation helper
  const validateField = (name, value) => {
    const errors = { ...formErrors }
    
    switch (name) {
      case 'student_id':
        if (!value.trim()) errors.student_id = 'Student ID is required'
        else delete errors.student_id
        break
      case 'first_name':
        if (!value.trim()) errors.first_name = 'First name is required'
        else delete errors.first_name
        break
      case 'last_name':
        if (!value.trim()) errors.last_name = 'Last name is required'
        else delete errors.last_name
        break
      case 'date_of_birth':
        if (!value) errors.date_of_birth = 'Date of birth is required'
        else delete errors.date_of_birth
        break
      case 'guardian_name':
        if (!value.trim()) errors.guardian_name = 'Guardian name is required'
        else delete errors.guardian_name
        break
      case 'guardian_phone':
        if (!value.trim()) errors.guardian_phone = 'Guardian phone is required'
        else delete errors.guardian_phone
        break
      case 'guardian_address':
        if (!value.trim()) errors.guardian_address = 'Guardian address is required'
        else delete errors.guardian_address
        break
      case 'admission_date':
        if (!value) errors.admission_date = 'Admission date is required'
        else delete errors.admission_date
        break
      case 'guardian_email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.guardian_email = 'Please enter a valid email address'
        } else {
          delete errors.guardian_email
        }
        break
    }
    
    setFormErrors(errors)
  }

  const load = useCallback(async () => {
    try {
      setError(null)
      const [studRes, classRes] = await Promise.all([
        api.get(classFilter ? `/students/?class_id=${classFilter}` : '/students/'),
        api.get('/schools/classes/')
      ])
      const data = studRes.data.results || studRes.data
      const cls = classRes.data.results || classRes.data
      setStudents(data)
      setFiltered(data)
      setClasses(cls)
      if (user?.role === 'TEACHER') {
        const mine = (cls || []).find(c => String(c.class_teacher) === String(user.id))
        if (mine && String(classFilter) !== String(mine.id)) {
          setClassFilter(String(mine.id))
        }
      }
    } catch (e) {
      setError(e.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [classFilter, user])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!query) { setFiltered(students); return }
    const q = query.toLowerCase()
    setFiltered(students.filter(s => (
      (s.full_name || '').toLowerCase().includes(q) ||
      (s.student_id || '').toLowerCase().includes(q) ||
      (s.class_name || '').toLowerCase().includes(q)
    )))
  }, [query, students])

  if (loading) return <div className="container"><p>Loading…</p></div>

  const openAdd = () => {
    setError('') // Clear any previous errors
    initializeForm() // Initialize form with defaults
    if (user?.role === 'TEACHER') {
      if (teacherClasses.length === 1) {
        setShowAdd(true)
        return
      }
      if (teacherClasses.length === 0) {
        alert('You are not assigned as class teacher to any class yet.')
        return
      }
      // multiple classes – require explicit selection
      setShowAdd(true)
      return
    }
    setShowAdd(true)
  }

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
            .student-table { 
              display: none !important;
            }
            .student-cards { 
              display: grid !important;
              grid-template-columns: 1fr !important;
              gap: 12px !important;
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
            <FaUserGraduate size={isMobile ? 20 : 24} color="white" />
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
            }}>Students</h1>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: isMobile ? 13 : 14,
              color: '#1f2937',
              fontWeight: 500
            }}>
              ({filtered.length} {filtered.length === 1 ? 'student' : 'students'})
            </p>
          </div>
        </div>
        <div className="actions" style={{ 
          gap: isMobile ? 12 : 8,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          width: isMobile ? '100%' : 'auto',
          flexWrap: 'wrap'
        }}>
          <button 
            className="btn primary quick-action-btn" 
            onClick={openAdd}
            style={{ 
              minWidth: isMobile ? '100%' : 'auto',
              fontSize: isMobile ? 14 : 16,
              padding: isMobile ? '14px 18px' : '12px 16px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: 10,
              color: 'white',
              fontWeight: 600,
              minHeight: isMobile ? 48 : 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            <FaPlus size={isMobile ? 16 : 14} />
            {isMobile ? 'Add Student' : 'Add Student'}
          </button>
          {user?.role !== 'TEACHER' && (
            <button 
              className="btn" 
              onClick={() => setShowBulk(true)}
              style={{ 
                fontSize: isMobile ? 14 : 16,
                padding: isMobile ? '14px 18px' : '12px 16px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 10,
                color: '#60a5fa',
                fontWeight: 600,
                minHeight: isMobile ? 48 : 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minWidth: isMobile ? '100%' : 'auto',
                transition: 'all 0.3s ease'
              }}
            >
              <FaUpload size={isMobile ? 16 : 14} />
              {isMobile ? 'Bulk Upload' : 'Bulk Upload'}
            </button>
          )}
        </div>
      </div>
      
      {/* Enhanced Toolbar */}
      <div className="toolbar" style={{
        gap: 12, 
        flexWrap: 'wrap',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: isMobile ? 12 : 16,
        padding: isMobile ? '16px 12px' : isTablet ? '20px 16px' : '24px 20px',
        marginBottom: isMobile ? 20 : 24,
        border: '1px solid rgba(71, 85, 105, 0.3)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center'
      }}>
        <div className="input-with-icon" style={{ 
          minWidth: isMobile ? '100%' : 280,
          position: 'relative',
          flex: isMobile ? 'none' : 1,
          maxWidth: isMobile ? '100%' : 400
        }}>
          <FaSearch style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b',
            fontSize: 14,
            zIndex: 2
          }} />
          <input
            placeholder={isMobile ? "Search students..." : "Search by name, ID or class"}
            value={query}
            onChange={e=>setQuery(e.target.value)}
            style={{ 
              width: '100%',
              padding: isMobile ? '16px 16px 16px 44px' : '14px 14px 14px 42px',
              fontSize: 16,
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.8)',
              color: '#1f2937',
              outline: 'none',
              transition: 'all 0.3s ease',
              fontWeight: 500
            }}
          />
        </div>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 12 : 8,
          flex: isMobile ? 'none' : 'initial',
          width: isMobile ? '100%' : 'auto'
        }}>
          <ScrollableSelect
            value={classFilter}
            onChange={(v)=>{ setClassFilter(v); setLoading(true) }}
            disabled={user?.role==='TEACHER'}
            options={[{value:'',label:'All classes'}, ...classes.map(c=>({
              value:String(c.id),
              label:`${c.level_display || c.level}${c.section?` ${c.section}`:''}`
            }))]}
            sizeThreshold={10}
            style={{
              minWidth: isMobile ? '100%' : 160,
              height: isMobile ? 48 : 44
            }}
          />
          <button 
            className="btn" 
            onClick={()=>{setLoading(true); load()}} 
            style={{ 
              minHeight: isMobile ? 48 : 44,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: isMobile ? '16px 18px' : '12px 16px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 10,
              color: '#60a5fa',
              fontWeight: 600,
              fontSize: isMobile ? 14 : 15,
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
      {user?.role==='TEACHER' && classFilter && (
        <div style={{
          marginTop: -6, 
          marginBottom: 16,
          color: '#94a3b8',
          fontSize: isMobile ? 13 : 14,
          fontStyle: 'italic',
          background: 'rgba(59, 130, 246, 0.1)',
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          📚 You are viewing students in your class only.
        </div>
      )}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 20,
          color: '#fca5a5',
          fontSize: 14
        }}>
          ⚠️ {error}
        </div>
      )}
      
      {/* Desktop Table View */}
      {!isMobile && (
        <div className="student-table" style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          marginBottom: '24px',
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{ overflowX: 'auto', maxHeight: '70vh', overflowY: 'auto' }}>
            <table className="table" style={{ margin: 0, borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                  <th style={{ padding: '16px 12px', color: 'black', fontWeight: '600', fontSize: '13px', textAlign: 'left', borderBottom: '2px solid #1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</th>
                  <th style={{ padding: '16px 12px', color: 'black', fontWeight: '600', fontSize: '13px', textAlign: 'left', borderBottom: '2px solid #1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                  <th style={{ padding: '16px 12px', color: 'black', fontWeight: '600', fontSize: '13px', textAlign: 'center', borderBottom: '2px solid #1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Class</th>
                  <th style={{ padding: '16px 12px', color: 'black', fontWeight: '600', fontSize: '13px', textAlign: 'center', borderBottom: '2px solid #1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gender</th>
                  <th style={{ padding: '16px 12px', color: 'black', fontWeight: '600', fontSize: '13px', textAlign: 'center', borderBottom: '2px solid #1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '16px 12px', color: 'black', fontWeight: '600', fontSize: '13px', textAlign: 'center', borderBottom: '2px solid #1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, index) => (
                  <tr 
                    key={s.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e0f2fe'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9fafb'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <td style={{ padding: '16px 12px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>{s.student_id}</td>
                    <td style={{ padding: '16px 12px', color: '#1f2937', fontSize: '14px', fontWeight: '500' }}>{s.full_name}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                      <span style={{
                        background: s.class_name ? 'linear-gradient(135deg, #10b981, #059669)' : '#ef4444',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-block',
                        minWidth: '60px'
                      }}>
                        {s.class_name || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                      <span style={{
                        background: s.gender === 'M' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'linear-gradient(135deg, #ec4899, #db2777)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-block',
                        minWidth: '50px'
                      }}>
                        {s.gender === 'M' ? 'Male' : 'Female'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                      <span style={{
                        background: s.is_active ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-block',
                        minWidth: '60px'
                      }}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {(user?.role === 'TEACHER' && teacherClasses.some(c => String(c.id) === String(s.current_class))) && (
                          <button
                            onClick={() => setShowCredentials(s)}
                            style={{
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              marginRight: '4px'
                            }}
                            title="View login credentials"
                          >
                            View Login
                          </button>
                        )}
                        {(user?.role !== 'TEACHER' || (user?.role === 'TEACHER' && teacherClasses.some(c => String(c.id) === String(s.current_class)))) ? (
                          <button
                            onClick={() => setDeleteConfirm(s)}
                            style={{
                              background: user?.role === 'TEACHER' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            title={user?.role === 'TEACHER' ? (s.is_active ? 'Deactivate student' : 'Activate student') : 'Delete student'}
                          >
                            {user?.role === 'TEACHER' ? (s.is_active ? 'Deactivate' : 'Activate') : 'Delete'}
                          </button>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>
                            Class teacher only
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      <div 
        className="student-cards" 
        style={{ 
          display: isMobile ? 'grid' : 'none',
          gridTemplateColumns: '1fr',
          gap: '12px',
          marginTop: '20px'
        }}
      >
        {filtered.map(s => (
          <div 
            className="student-card" 
            key={'mobile-card-'+s.id}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: 'white', 
                  marginBottom: '8px',
                  lineHeight: 1.3
                }}>
                  {s.full_name}
                </div>
                <div style={{ 
                  fontSize: '13px', 
                  color: '#94a3b8', 
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ fontWeight: '600', color: '#cbd5e1' }}>ID:</span> 
                  <span style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {s.student_id}
                  </span>
                </div>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                alignItems: 'flex-end'
              }}>
                <span style={{
                  background: s.is_active ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {s.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#94a3b8', 
                  marginBottom: '4px',
                  fontWeight: '500'
                }}>
                  Class
                </div>
                <span style={{
                  background: s.class_name ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: s.class_name ? '#6ee7b7' : '#fca5a5',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  {s.class_name || 'Unassigned'}
                </span>
              </div>
              
              <div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#94a3b8', 
                  marginBottom: '4px',
                  fontWeight: '500'
                }}>
                  Gender
                </div>
                <span style={{
                  background: s.gender === 'M' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(236, 72, 153, 0.2)',
                  color: s.gender === 'M' ? '#60a5fa' : '#f472b6',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  {s.gender === 'M' ? 'Male' : 'Female'}
                </span>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '8px',
              borderTop: '1px solid rgba(71, 85, 105, 0.3)'
            }}>
              {(user?.role === 'TEACHER' && teacherClasses.some(c => String(c.id) === String(s.current_class))) && (
                <button
                  onClick={() => setShowCredentials(s)}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  View Login
                </button>
              )}
              <div style={{ marginLeft: 'auto' }}>
                {(user?.role !== 'TEACHER' || (user?.role === 'TEACHER' && teacherClasses.some(c => String(c.id) === String(s.current_class)))) ? (
                  <button
                    onClick={() => setDeleteConfirm(s)}
                    style={{
                      background: user?.role === 'TEACHER' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {user?.role === 'TEACHER' ? (s.is_active ? 'Deactivate' : 'Activate') : 'Delete'}
                  </button>
                ) : (
                  <span style={{ 
                    color: '#64748b', 
                    fontSize: '11px', 
                    fontStyle: 'italic',
                    padding: '8px 0'
                  }}>
                    Class teacher only
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {!filtered.length && <p>No students found.</p>}

      {/* Add Student Modal */}
      {showAdd && (
        <div className="modal" onClick={() => setShowAdd(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'center',
          padding: isMobile ? '0' : '16px',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(12px)',
          overflow: 'hidden'
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            width: isMobile ? '100vw' : '90%',
            height: isMobile ? '100vh' : 'auto',
            maxWidth: isMobile ? 'none' : '700px',
            maxHeight: isMobile ? '100vh' : '90vh',
            background: isMobile ? 'rgba(15, 23, 42, 1)' : 'rgba(15, 23, 42, 0.95)',
            border: isMobile ? 'none' : '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: isMobile ? 0 : 16,
            backdropFilter: 'blur(20px)',
            color: 'white',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: isMobile ? '20px 20px 16px' : '20px 24px 16px',
              borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
              background: isMobile ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
              backdropFilter: 'blur(8px)',
              position: isMobile ? 'sticky' : 'static',
              top: 0,
              zIndex: 10
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  borderRadius: 8,
                  padding: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaUser size={16} color="white" />
                </div>
                <h3 style={{
                  margin: 0,
                  fontSize: isMobile ? 18 : 20,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Add New Student</h3>
              </div>
              <button 
                onClick={() => setShowAdd(false)}
                style={{
                  background: 'rgba(71, 85, 105, 0.1)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  color: '#94a3b8',
                  padding: '6px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              if (submitting) return
              
              const requiredFields = ['student_id', 'first_name', 'last_name', 'date_of_birth', 'guardian_name', 'guardian_phone', 'guardian_address', 'admission_date']
              const errors = {}
              
              requiredFields.forEach(field => {
                if (!addForm[field] || !addForm[field].toString().trim()) {
                  errors[field] = `${field.replace('_', ' ')} is required`
                }
              })
              
              if (Object.keys(errors).length > 0) {
                setFormErrors(errors)
                return
              }
              
              setSubmitting(true)
              try {
                const formData = new FormData()
                Object.keys(addForm).forEach(key => {
                  if (addForm[key] !== null && addForm[key] !== '') {
                    formData.append(key, addForm[key])
                  }
                })
                
                const res = await api.post('/students/', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                })
                
                setCreatedStudent(res.data)
                setShowSuccess(true)
                setShowAdd(false)
                initializeForm()
                await load()
                
                // Notify teacher dashboard to refresh if user is a teacher
                if (user?.role === 'TEACHER') {
                  // Dispatch custom event for dashboard refresh
                  window.dispatchEvent(new CustomEvent('studentCreated', {
                    detail: { student: res.data }
                  }))
                  
                  // Also call global refresh function if available
                  if (typeof window.refreshTeacherDashboard === 'function') {
                    window.refreshTeacherDashboard()
                  }
                }
              } catch (err) {
                const errorMsg = err?.response?.data?.error || err?.response?.data?.detail || 'Failed to create student'
                setError(errorMsg)
              } finally {
                setSubmitting(false)
              }
            }} style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              height: isMobile ? 'calc(100vh - 140px)' : 'auto',
              overflow: 'hidden'
            }}>
              <div style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: isMobile ? '16px 20px' : '20px 24px',
                display: isMobile ? 'flex' : 'grid',
                flexDirection: isMobile ? 'column' : 'row',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? 16 : 20,
                alignContent: 'start',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(59, 130, 246, 0.3) transparent',
                scrollBehavior: 'smooth'
              }}>
                {/* Student ID */}
                <div className="field">
                  <label style={{
                    display: 'block',
                    marginBottom: isMobile ? 12 : 8,
                    fontSize: isMobile ? 15 : 14,
                    fontWeight: 600,
                    color: '#e2e8f0',
                    letterSpacing: '0.025em'
                  }}>Student ID <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    value={addForm.student_id}
                    onChange={(e) => {
                      setAddForm({...addForm, student_id: e.target.value})
                      validateField('student_id', e.target.value)
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '16px' : '12px',
                      fontSize: isMobile ? 16 : 15,
                      border: formErrors.student_id ? '2px solid rgba(239, 68, 68, 0.4)' : '2px solid rgba(71, 85, 105, 0.4)',
                      borderRadius: isMobile ? 12 : 8,
                      background: isMobile ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      minHeight: isMobile ? '52px' : 'auto',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.student_id && <span style={{ color: '#fca5a5', fontSize: '12px' }}>{formErrors.student_id}</span>}
                </div>
                
                {/* First Name */}
                <div className="field">
                  <label style={{
                    display: 'block',
                    marginBottom: isMobile ? 12 : 8,
                    fontSize: isMobile ? 15 : 14,
                    fontWeight: 600,
                    color: '#e2e8f0',
                    letterSpacing: '0.025em'
                  }}>First Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    value={addForm.first_name}
                    onChange={(e) => {
                      setAddForm({...addForm, first_name: e.target.value})
                      validateField('first_name', e.target.value)
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '16px' : '12px',
                      fontSize: isMobile ? 16 : 15,
                      border: formErrors.first_name ? '2px solid rgba(239, 68, 68, 0.4)' : '2px solid rgba(71, 85, 105, 0.4)',
                      borderRadius: isMobile ? 12 : 8,
                      background: isMobile ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      minHeight: isMobile ? '52px' : 'auto',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.first_name && <span style={{ color: '#fca5a5', fontSize: '12px' }}>{formErrors.first_name}</span>}
                </div>
                
                {/* Last Name */}
                <div className="field">
                  <label style={{
                    display: 'block',
                    marginBottom: isMobile ? 12 : 8,
                    fontSize: isMobile ? 15 : 14,
                    fontWeight: 600,
                    color: '#e2e8f0',
                    letterSpacing: '0.025em'
                  }}>Last Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    value={addForm.last_name}
                    onChange={(e) => {
                      setAddForm({...addForm, last_name: e.target.value})
                      validateField('last_name', e.target.value)
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '16px' : '12px',
                      fontSize: isMobile ? 16 : 15,
                      border: formErrors.last_name ? '2px solid rgba(239, 68, 68, 0.4)' : '2px solid rgba(71, 85, 105, 0.4)',
                      borderRadius: isMobile ? 12 : 8,
                      background: isMobile ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      minHeight: isMobile ? '52px' : 'auto',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.last_name && <span style={{ color: '#fca5a5', fontSize: '12px' }}>{formErrors.last_name}</span>}
                </div>
                
                {/* Other Names */}
                <div className="field">
                  <label style={{
                    display: 'block',
                    marginBottom: isMobile ? 12 : 8,
                    fontSize: isMobile ? 15 : 14,
                    fontWeight: 600,
                    color: '#e2e8f0',
                    letterSpacing: '0.025em'
                  }}>Other Names</label>
                  <input
                    type="text"
                    value={addForm.other_names}
                    onChange={(e) => setAddForm({...addForm, other_names: e.target.value})}
                    style={{
                      width: '100%',
                      padding: isMobile ? '16px' : '12px',
                      fontSize: isMobile ? 16 : 15,
                      border: '2px solid rgba(71, 85, 105, 0.4)',
                      borderRadius: isMobile ? 12 : 8,
                      background: isMobile ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      minHeight: isMobile ? '52px' : 'auto',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                {/* Gender */}
                <div className="field">
                  <label style={{
                    display: 'block',
                    marginBottom: isMobile ? 12 : 8,
                    fontSize: isMobile ? 15 : 14,
                    fontWeight: 600,
                    color: '#e2e8f0',
                    letterSpacing: '0.025em'
                  }}>Gender <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    value={addForm.gender}
                    onChange={(e) => setAddForm({...addForm, gender: e.target.value})}
                    style={{
                      width: '100%',
                      padding: isMobile ? '16px' : '12px',
                      fontSize: isMobile ? 16 : 15,
                      border: '2px solid rgba(71, 85, 105, 0.4)',
                      borderRadius: isMobile ? 12 : 8,
                      background: isMobile ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      minHeight: isMobile ? '52px' : 'auto',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                
                {/* Date of Birth */}
                <div className="field">
                  <label style={{
                    display: 'block',
                    marginBottom: isMobile ? 12 : 8,
                    fontSize: isMobile ? 15 : 14,
                    fontWeight: 600,
                    color: '#e2e8f0',
                    letterSpacing: '0.025em'
                  }}>Date of Birth <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="date"
                    value={addForm.date_of_birth}
                    onChange={(e) => {
                      setAddForm({...addForm, date_of_birth: e.target.value})
                      validateField('date_of_birth', e.target.value)
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '16px' : '12px',
                      fontSize: isMobile ? 16 : 15,
                      border: formErrors.date_of_birth ? '2px solid rgba(239, 68, 68, 0.4)' : '2px solid rgba(71, 85, 105, 0.4)',
                      borderRadius: isMobile ? 12 : 8,
                      background: isMobile ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      minHeight: isMobile ? '52px' : 'auto',
                      boxSizing: 'border-box',
                      colorScheme: 'dark'
                    }}
                  />
                  {formErrors.date_of_birth && <span style={{ color: '#fca5a5', fontSize: '12px' }}>{formErrors.date_of_birth}</span>}
                </div>
                
                {/* Class */}
                <div className="field" style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#d1d5db'
                  }}>Class</label>
                  <div className="class-dropdown" style={{ position: 'relative' }}>
                    <div
                      onClick={() => setShowClassDropdown(!showClassDropdown)}
                      style={{
                        width: '100%',
                        padding: isMobile ? '16px' : '12px',
                        fontSize: isMobile ? 16 : 15,
                        border: '2px solid rgba(71, 85, 105, 0.4)',
                        borderRadius: isMobile ? 12 : 8,
                        background: isMobile ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.8)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        minHeight: isMobile ? '52px' : '44px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <span>{addForm.current_class ? classes.find(c => String(c.id) === addForm.current_class)?.level_display || classes.find(c => String(c.id) === addForm.current_class)?.level : 'Select class'}</span>
                      <span style={{ transform: showClassDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                    </div>
                    {showClassDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'rgba(30, 41, 59, 0.95)',
                        border: '2px solid rgba(71, 85, 105, 0.4)',
                        borderRadius: 8,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        marginTop: 4
                      }}>
                        <div
                          onClick={() => {
                            setAddForm({...addForm, current_class: ''})
                            setShowClassDropdown(false)
                          }}
                          style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
                            color: '#94a3b8'
                          }}
                        >
                          Select class
                        </div>
                        {classes.map(c => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setAddForm({...addForm, current_class: String(c.id)})
                              setShowClassDropdown(false)
                            }}
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
                              backgroundColor: String(c.id) === addForm.current_class ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                              color: 'white'
                            }}
                          >
                            {c.level_display || c.level}{c.section ? ` ${c.section}` : ''}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Guardian Name */}
                <div className="field">
                  <label style={{
                    display: 'block',
                    marginBottom: isMobile ? 12 : 8,
                    fontSize: isMobile ? 15 : 14,
                    fontWeight: 600,
                    color: '#e2e8f0',
                    letterSpacing: '0.025em'
                  }}>Guardian Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    value={addForm.guardian_name}
                    onChange={(e) => {
                      setAddForm({...addForm, guardian_name: e.target.value})
                      validateField('guardian_name', e.target.value)
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '16px' : '12px',
                      fontSize: isMobile ? 16 : 15,
                      border: formErrors.guardian_name ? '2px solid rgba(239, 68, 68, 0.4)' : '2px solid rgba(71, 85, 105, 0.4)',
                      borderRadius: isMobile ? 12 : 8,
                      background: isMobile ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      minHeight: isMobile ? '52px' : 'auto',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.guardian_name && <span style={{ color: '#fca5a5', fontSize: '12px' }}>{formErrors.guardian_name}</span>}
                </div>
                
                {/* Guardian Phone */}
                <div className="field">
                  <label style={{
                    display: 'block',
                    marginBottom: isMobile ? 12 : 8,
                    fontSize: isMobile ? 15 : 14,
                    fontWeight: 600,
                    color: '#e2e8f0',
                    letterSpacing: '0.025em'
                  }}>Guardian Phone <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="tel"
                    value={addForm.guardian_phone}
                    onChange={(e) => {
                      setAddForm({...addForm, guardian_phone: e.target.value})
                      validateField('guardian_phone', e.target.value)
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '16px' : '12px',
                      fontSize: isMobile ? 16 : 15,
                      border: formErrors.guardian_phone ? '2px solid rgba(239, 68, 68, 0.4)' : '2px solid rgba(71, 85, 105, 0.4)',
                      borderRadius: isMobile ? 12 : 8,
                      background: isMobile ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      minHeight: isMobile ? '52px' : 'auto',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.guardian_phone && <span style={{ color: '#fca5a5', fontSize: '12px' }}>{formErrors.guardian_phone}</span>}
                </div>
                
                {/* Guardian Email */}
                <div className="field">
                  <label style={{
                    display: 'block',
                    marginBottom: isMobile ? 12 : 8,
                    fontSize: isMobile ? 15 : 14,
                    fontWeight: 600,
                    color: '#e2e8f0',
                    letterSpacing: '0.025em'
                  }}>Guardian Email</label>
                  <input
                    type="email"
                    value={addForm.guardian_email}
                    onChange={(e) => {
                      setAddForm({...addForm, guardian_email: e.target.value})
                      validateField('guardian_email', e.target.value)
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '16px' : '12px',
                      fontSize: isMobile ? 16 : 15,
                      border: formErrors.guardian_email ? '2px solid rgba(239, 68, 68, 0.4)' : '2px solid rgba(71, 85, 105, 0.4)',
                      borderRadius: isMobile ? 12 : 8,
                      background: isMobile ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      minHeight: isMobile ? '52px' : 'auto',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.guardian_email && <span style={{ color: '#fca5a5', fontSize: '12px' }}>{formErrors.guardian_email}</span>}
                </div>
                
                {/* Admission Date */}
                <div className="field">
                  <label style={{
                    display: 'block',
                    marginBottom: isMobile ? 12 : 8,
                    fontSize: isMobile ? 15 : 14,
                    fontWeight: 600,
                    color: '#e2e8f0',
                    letterSpacing: '0.025em'
                  }}>Admission Date <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="date"
                    value={addForm.admission_date}
                    onChange={(e) => {
                      setAddForm({...addForm, admission_date: e.target.value})
                      validateField('admission_date', e.target.value)
                    }}
                    style={{
                      width: '100%',
                      padding: isMobile ? '16px' : '12px',
                      fontSize: isMobile ? 16 : 15,
                      border: formErrors.admission_date ? '2px solid rgba(239, 68, 68, 0.4)' : '2px solid rgba(71, 85, 105, 0.4)',
                      borderRadius: isMobile ? 12 : 8,
                      background: isMobile ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      minHeight: isMobile ? '52px' : 'auto',
                      boxSizing: 'border-box',
                      colorScheme: 'dark'
                    }}
                  />
                  {formErrors.admission_date && <span style={{ color: '#fca5a5', fontSize: '12px' }}>{formErrors.admission_date}</span>}
                </div>
                
                {/* Guardian Address - Full Width */}
                <div className="field" style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: isMobile ? 12 : 8,
                    fontSize: isMobile ? 15 : 14,
                    fontWeight: 600,
                    color: '#e2e8f0',
                    letterSpacing: '0.025em'
                  }}>Guardian Address <span style={{ color: '#ef4444' }}>*</span></label>
                  <textarea
                    value={addForm.guardian_address}
                    onChange={(e) => {
                      setAddForm({...addForm, guardian_address: e.target.value})
                      validateField('guardian_address', e.target.value)
                    }}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: isMobile ? '16px' : '12px',
                      fontSize: isMobile ? 16 : 15,
                      border: formErrors.guardian_address ? '2px solid rgba(239, 68, 68, 0.4)' : '2px solid rgba(71, 85, 105, 0.4)',
                      borderRadius: isMobile ? 12 : 8,
                      background: isMobile ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      minHeight: isMobile ? '80px' : '60px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                  {formErrors.guardian_address && <span style={{ color: '#fca5a5', fontSize: '12px' }}>{formErrors.guardian_address}</span>}
                </div>
                
                {/* Photo Upload */}
                <div className="field" style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: isMobile ? 12 : 8,
                    fontSize: isMobile ? 15 : 14,
                    fontWeight: 600,
                    color: '#e2e8f0',
                    letterSpacing: '0.025em'
                  }}>Student Photo</label>
                  <ImageCaptureInput
                    onImageCapture={(file) => setAddForm({...addForm, photo: file})}
                    currentImage={addForm.photo}
                  />
                </div>
              </div>
              
              <div className="modal-actions" style={{
                display: 'flex',
                flexDirection: isMobile ? 'column-reverse' : 'row',
                gap: isMobile ? 16 : 8,
                padding: isMobile ? '20px 20px 24px' : '16px 24px 20px',
                borderTop: '2px solid rgba(71, 85, 105, 0.3)',
                background: isMobile 
                  ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.8))' 
                  : 'rgba(15, 23, 42, 0.3)',
                justifyContent: 'flex-end',
                backdropFilter: 'blur(8px)',
                position: isMobile ? 'sticky' : 'static',
                bottom: 0,
                zIndex: 10
              }}>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  style={{
                    padding: isMobile ? '16px 20px' : '10px 16px',
                    background: 'rgba(107, 114, 128, 0.15)',
                    border: '2px solid rgba(107, 114, 128, 0.4)',
                    borderRadius: isMobile ? 12 : 8,
                    color: '#cbd5e1',
                    fontWeight: 600,
                    fontSize: isMobile ? 15 : 15,
                    minHeight: isMobile ? 54 : 40,
                    width: isMobile ? '40%' : 'auto',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: isMobile ? '16px 22px' : '10px 20px',
                    background: submitting 
                      ? 'rgba(107, 114, 128, 0.5)' 
                      : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    border: 'none',
                    borderRadius: isMobile ? 12 : 8,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: isMobile ? 15 : 15,
                    minHeight: isMobile ? 54 : 40,
                    width: isMobile ? '100%' : 'auto',
                    transition: 'all 0.3s ease',
                    boxShadow: submitting ? 'none' : '0 6px 16px rgba(59, 130, 246, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? (
                    <>
                      <div style={{
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaSave size={14} />
                      Create Student
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Success Modal */}
      {showSuccess && createdStudent && (
        <div className="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }} onClick={() => setShowSuccess(false)}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <FaUser size={24} color="white" />
            </div>
            <h3 style={{ color: 'white', marginBottom: '8px' }}>Student Created Successfully!</h3>
            <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
              {createdStudent.full_name} has been added to the system.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }} onClick={() => setDeleteConfirm(null)}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: 'white', marginBottom: '16px' }}>
              {user?.role === 'TEACHER' ? 
                (deleteConfirm.is_active ? 'Deactivate Student?' : 'Activate Student?') : 
                'Delete Student?'
              }
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
              {user?.role === 'TEACHER' ? 
                (deleteConfirm.is_active ? 
                  `Are you sure you want to deactivate ${deleteConfirm.full_name}?` :
                  `Are you sure you want to activate ${deleteConfirm.full_name}?`
                ) :
                `Are you sure you want to delete ${deleteConfirm.full_name}? This action cannot be undone.`
              }
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  background: 'rgba(71, 85, 105, 0.1)',
                  color: '#94a3b8',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    if (user?.role === 'TEACHER') {
                      // Toggle active status
                      await api.patch(`/students/${deleteConfirm.id}/`, {
                        is_active: !deleteConfirm.is_active
                      })
                    } else {
                      // Delete student
                      await api.delete(`/students/${deleteConfirm.id}/`)
                    }
                    setDeleteConfirm(null)
                    await load()
                  } catch (err) {
                    setError(err?.response?.data?.error || 'Operation failed')
                    setDeleteConfirm(null)
                  }
                }}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: user?.role === 'TEACHER' ? 
                    'linear-gradient(135deg, #f59e0b, #d97706)' : 
                    'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {user?.role === 'TEACHER' ? 
                  (deleteConfirm.is_active ? 'Deactivate' : 'Activate') : 
                  'Delete'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Login Credentials Modal */}
      {showCredentials && (
        <div className="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }} onClick={() => setShowCredentials(null)}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: 'white', margin: 0 }}>Student Login Credentials</h3>
              <button
                onClick={() => setShowCredentials(null)}
                style={{
                  background: 'rgba(71, 85, 105, 0.1)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  color: '#94a3b8',
                  padding: '6px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '4px' }}>Student Name</div>
                <div style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                  {showCredentials.full_name}
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '4px' }}>Username</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(71, 85, 105, 0.3)'
                }}>
                  <span style={{ color: 'white', fontSize: '16px', fontWeight: '500', flex: 1 }}>
                    {showCredentials.username || showCredentials.student_id}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(showCredentials.username || showCredentials.student_id)
                    }}
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#60a5fa',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FaCopy size={12} /> Copy
                  </button>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '4px' }}>Password</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(71, 85, 105, 0.3)'
                }}>
                  <span style={{ color: 'white', fontSize: '16px', fontWeight: '500', flex: 1 }}>
                    {credentialsVisible[showCredentials.id] ? 
                      (showCredentials.password || 'password123') : 
                      '••••••••••'
                    }
                  </span>
                  <button
                    onClick={() => {
                      setCredentialsVisible(prev => ({
                        ...prev,
                        [showCredentials.id]: !prev[showCredentials.id]
                      }))
                    }}
                    style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#fbbf24',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {credentialsVisible[showCredentials.id] ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                    {credentialsVisible[showCredentials.id] ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(showCredentials.password || 'password123')
                    }}
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#60a5fa',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FaCopy size={12} /> Copy
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ color: '#60a5fa', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                📱 Student Portal Access
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '13px' }}>
                Students can use these credentials to log into the student portal and view their reports, assignments, and attendance.
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCredentials(null)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulk && (
        <div className="modal" onClick={() => setShowBulk(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div className="modal-content" onClick={(e)=>e.stopPropagation()} style={{
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: 'white', margin: 0 }}>Bulk Upload Students (Excel)</h3>
              <button onClick={() => setShowBulk(false)} style={{
                background: 'rgba(71, 85, 105, 0.1)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                color: '#94a3b8',
                padding: '6px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}><FaTimes/></button>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: 16 }}>Upload an .xlsx file with columns: student_id, first_name, last_name, other_names, gender, date_of_birth (YYYY-MM-DD), current_class_id, guardian_name, guardian_phone, guardian_email, guardian_address, admission_date (YYYY-MM-DD).</div>
            <div style={{display:'flex', gap:10, alignItems:'center', marginBottom: 16}}>
              <input type="file" accept=".xlsx,.xls" onChange={(e)=>setBulkFile(e.target.files?.[0] || null)} style={{
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                background: 'rgba(30, 41, 59, 0.8)',
                color: 'white',
                flex: 1
              }} />
              <button onClick={async ()=>{
                setBulkMessage('')
                if (!bulkFile) { setBulkMessage('Choose a file'); return }
                try {
                  const fd = new FormData(); fd.append('file', bulkFile)
                  const res = await api.post('/students/bulk_upload/', fd)
                  setBulkMessage(res.data?.message || 'Uploaded')
                  setLoading(true); await load()
                } catch (err) {
                  const msg = err?.response?.data?.error || err?.response?.data?.detail || 'Failed to upload (install openpyxl on backend to enable)'
                  setBulkMessage(msg)
                }
              }} style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>Upload</button>
            </div>
            {bulkMessage && <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              color: '#60a5fa',
              fontSize: '14px'
            }}>{bulkMessage}</div>}
          </div>
        </div>
      )}
    </div>
  )
}