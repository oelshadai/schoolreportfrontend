import { useEffect, useState } from 'react'
import api from '../utils/api'
import { FaChalkboardTeacher, FaPlus, FaSync, FaEnvelope, FaTimes } from 'react-icons/fa'
import { useAuth } from '../state/AuthContext'

export default function Teachers() {
  const { user } = useAuth()
  const [teachers, setTeachers] = useState([])
  const [form, setForm] = useState({ 
    email: '', 
    first_name: '', 
    last_name: '', 
    password: '', 
    password_confirm: '', 
    employee_id: '',
    phone_number: '',
    hire_date: new Date().toISOString().split('T')[0],
    qualification: '',
    experience_years: 0,
    emergency_contact: '',
    address: '',
    specializations: [],
    class_id: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  
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

  useEffect(() => {
    if (showCreate && screenSize.width <= 768) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [showCreate, screenSize.width])

  const isMobile = screenSize.width <= 768
  const isTablet = screenSize.width <= 1024

  const load = async () => {
    try {
      setError('')
      const [teachersRes, classesRes, subjectsRes] = await Promise.all([
        api.get('/teachers/'),
        api.get('/schools/classes/'),
        api.get('/schools/subjects/')
      ])
      
      setTeachers(teachersRes.data.results || teachersRes.data)
      setClasses(classesRes.data.results || classesRes.data)
      setSubjects(subjectsRes.data.results || subjectsRes.data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to load teachers')
    }
  }

  useEffect(() => { load() }, [])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    if (type === 'number') {
      setForm((f) => ({ ...f, [name]: parseInt(value) || 0 }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0]
    setForm({
      email: '', 
      first_name: '', 
      last_name: '', 
      password: '', 
      password_confirm: '', 
      employee_id: '',
      phone_number: '',
      hire_date: today,
      qualification: '',
      experience_years: 0,
      emergency_contact: '',
      address: '',
      specializations: [],
      class_id: ''
    })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    
    const errors = []
    
    if (!form.email?.trim()) {
      errors.push('Email is required')
    }
    
    if (!form.first_name?.trim()) {
      errors.push('First name is required')
    }
    
    if (!form.last_name?.trim()) {
      errors.push('Last name is required')
    }
    
    if (!form.password?.trim()) {
      errors.push('Password is required')
    }
    
    if (form.password !== form.password_confirm) {
      errors.push('Passwords do not match')
    }
    
    if (!form.hire_date) {
      errors.push('Hire date is required')
    }

    if (!form.employee_id?.trim()) {
      errors.push('Employee ID is required')
    }
    
    if (errors.length > 0) {
      setError(errors.join(', '))
      return
    }
    
    setLoading(true)
    
    try {
      const teacherData = {
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        password: form.password,
        employee_id: form.employee_id.trim(),
        phone_number: form.phone_number?.trim() || null,
        hire_date: form.hire_date,
        qualification: form.qualification?.trim() || null,
        experience_years: parseInt(form.experience_years) || 0,
        emergency_contact: form.emergency_contact?.trim() || null,
        address: form.address?.trim() || null,
        specializations: Array.isArray(form.specializations) ? form.specializations : [],
        class_id: form.class_id ? parseInt(form.class_id) : null,
        school: user?.school_id || user?.school || 1
      }
      
      Object.keys(teacherData).forEach(key => {
        if (teacherData[key] === null || teacherData[key] === '') {
          delete teacherData[key]
        }
      })
      
      const response = await api.post('/teachers/', teacherData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      resetForm()
      await load()
      setMessage('Teacher created successfully!')
      setShowCreate(false)
      
    } catch (error) {
      let errorMessage = 'Failed to create teacher'
      
      if (error?.response?.status === 400) {
        const errorData = error?.response?.data
        if (errorData && typeof errorData === 'object') {
          const fieldErrors = []
          Object.entries(errorData).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              fieldErrors.push(`${field}: ${messages.join(', ')}`)
            } else if (typeof messages === 'string') {
              fieldErrors.push(`${field}: ${messages}`)
            }
          })
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('\n')
          }
        } else if (errorData?.detail) {
          errorMessage = errorData.detail
        }
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: isMobile ? '20px 12px' : isTablet ? '24px 16px' : '32px 20px',
        paddingTop: isMobile ? '90px' : '100px',
        paddingBottom: isMobile ? '20px' : '40px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh',
        height: '100%',
        color: '#1f2937',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'auto'
      }}
    >
      <style>
        {`
          * {
            -webkit-tap-highlight-color: transparent;
          }
          
          @media screen and (max-width: 768px) {
            .container { 
              padding: 20px 12px !important; 
              padding-top: 90px !important; 
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
            .desktop-table { display: none !important; }
            .mobile-cards { display: block !important; }
          }
          
          @media screen and (min-width: 769px) {
            .desktop-table { display: block !important; }
            .mobile-cards { display: none !important; }
          }
        `}
      </style>

      <div className="page-header" style={{
        background: 'white',
        backdropFilter: 'blur(16px)',
        borderRadius: isMobile ? 16 : 20,
        padding: isMobile ? '20px 16px' : isTablet ? '24px 20px' : '28px 24px',
        marginBottom: isMobile ? 20 : 24,
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            borderRadius: 12,
            padding: isMobile ? '12px' : '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
          }}>
            <FaChalkboardTeacher size={isMobile ? 20 : 24} color="white" />
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
            }}>Teachers</h1>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: isMobile ? 13 : 14,
              color: '#374151',
              fontWeight: 500
            }}>
              {teachers.length} {teachers.length === 1 ? 'teacher' : 'teachers'} registered
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 12 : 8,
          width: isMobile ? '100%' : 'auto'
        }}>
          <button
            className="btn primary"
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: isMobile ? '14px 18px' : '12px 16px',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              border: 'none',
              borderRadius: 10,
              color: 'white',
              fontWeight: 600,
              fontSize: isMobile ? 14 : 15,
              minHeight: isMobile ? 48 : 44,
              justifyContent: 'center',
              width: isMobile ? '100%' : 'auto',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
              cursor: 'pointer'
            }}
          >
            <FaPlus size={isMobile ? 16 : 14} />
            New Teacher
          </button>
          <button
            className="btn"
            onClick={load}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: isMobile ? '14px 18px' : '12px 16px',
              background: 'rgba(22, 163, 74, 0.05)',
              border: '1px solid rgba(22, 163, 74, 0.2)',
              borderRadius: 10,
              color: '#16a34a',
              fontWeight: 600,
              fontSize: isMobile ? 14 : 15,
              minHeight: isMobile ? 48 : 44,
              justifyContent: 'center',
              width: isMobile ? '100%' : 'auto',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
          >
            <FaSync size={isMobile ? 16 : 14} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 20,
          color: '#fca5a5',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          ⚠️ {error}
        </div>
      )}
      {message && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 20,
          color: '#86efac',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          ✅ {message}
        </div>
      )}

      <div className="desktop-table" style={{
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: 24
      }}>
        <table className="table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f3f4f6' }}>
            <tr>
              <th style={{ padding: '16px 20px', color: 'black', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: 13, borderBottom: '2px solid #e5e7eb' }}>📧 Email</th>
              <th style={{ padding: '16px 20px', color: 'black', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: 13, borderBottom: '2px solid #e5e7eb' }}>👤 Full Name</th>
              <th style={{ padding: '16px 20px', color: 'black', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: 13, textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>🎯 Role</th>
              <th style={{ padding: '16px 20px', color: 'black', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: 13, textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>⚡ Status</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t, index) => (
              <tr key={t.id} style={{ 
                borderBottom: '1px solid #e5e7eb',
                background: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                transition: 'all 0.3s ease'
              }}>
                <td style={{ padding: '16px 20px', color: '#374151', fontSize: 14, fontWeight: 500 }}>{t.email}</td>
                <td style={{ padding: '16px 20px', color: '#1f2937', fontWeight: 600, fontSize: 14 }}>{t.first_name} {t.last_name}</td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                  }}>
                    {t.role || 'Teacher'}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <span style={{
                    background: t.is_active !== false ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>
                    {t.is_active !== false ? '✓ Active' : '✗ Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!teachers.length && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280' }}>
            👩🏫 No teachers registered yet.
          </div>
        )}
      </div>

      <div className="mobile-cards" style={{
        display: 'grid',
        gap: 16,
        marginTop: 20
      }}>
        {teachers.map(t => (
          <div
            key={t.id}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: 16,
              padding: '20px 16px',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              marginBottom: 12
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                borderRadius: 10,
                padding: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaChalkboardTeacher size={16} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'white',
                  marginBottom: 4
                }}>
                  {t.first_name} {t.last_name}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: 13,
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <FaEnvelope size={12} />
                  {t.email}
                </p>
              </div>
              <span style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                padding: '6px 10px',
                borderRadius: 8,
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {t.role || 'Teacher'}
              </span>
            </div>
          </div>
        ))}
        {!teachers.length && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: 16,
            padding: '40px 20px',
            textAlign: 'center',
            color: '#64748b',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            backdropFilter: 'blur(12px)'
          }}>
            👩🏫 No teachers registered yet.
          </div>
        )}
      </div>

      {showCreate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? '20px' : '40px'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            borderRadius: 20,
            padding: isMobile ? '24px' : '32px',
            width: '100%',
            maxWidth: isMobile ? '100%' : '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24
            }}>
              <h2 style={{
                margin: 0,
                fontSize: isMobile ? 20 : 24,
                fontWeight: 700,
                color: '#22c55e'
              }}>Create New Teacher</h2>
              <button
                onClick={() => setShowCreate(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: 20,
                  cursor: 'pointer',
                  padding: 8,
                  borderRadius: 8,
                  transition: 'all 0.3s ease'
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleCreate} style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, color: '#e2e8f0', fontWeight: 500 }}>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid rgba(71, 85, 105, 0.5)',
                      background: 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, color: '#e2e8f0', fontWeight: 500 }}>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid rgba(71, 85, 105, 0.5)',
                      background: 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#e2e8f0', fontWeight: 500 }}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#e2e8f0', fontWeight: 500 }}>Employee ID *</label>
                <input
                  type="text"
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, color: '#e2e8f0', fontWeight: 500 }}>Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid rgba(71, 85, 105, 0.5)',
                      background: 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, color: '#e2e8f0', fontWeight: 500 }}>Confirm Password *</label>
                  <input
                    type="password"
                    name="password_confirm"
                    value={form.password_confirm}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid rgba(71, 85, 105, 0.5)',
                      background: 'rgba(30, 41, 59, 0.8)',
                      color: 'white',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 10,
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Creating...' : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}