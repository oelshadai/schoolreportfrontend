import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { FaUser, FaTimes, FaSave, FaEye, FaEyeSlash, FaUserGraduate, FaUserShield } from 'react-icons/fa'
import ImageCaptureInput from './ImageCaptureInput'

const AddStudentForm = React.memo(({ 
  isOpen, 
  onClose, 
  onSubmit, 
  classes = [], 
  userRole, 
  teacherClasses = [],
  isSubmitting = false 
}) => {
  const initialFormData = useMemo(() => ({
    student_id: '',
    first_name: '',
    last_name: '',
    other_names: '',
    gender: 'M',
    date_of_birth: '',
    current_class: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    guardian_address: '',
    admission_date: new Date().toISOString().split('T')[0],
    photo: null
  }), [])

  const [formData, setFormData] = useState(initialFormData)

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [generatedCredentials, setGeneratedCredentials] = useState(null)

  // Memoized smart defaults
  const smartDefaults = useMemo(() => {
    if (!isOpen) return initialFormData
    
    const today = new Date().toISOString().split('T')[0]
    const teacherClassId = userRole === 'TEACHER' && teacherClasses.length === 1 
      ? String(teacherClasses[0].id) 
      : ''
    
    // Generate suggested student ID
    const currentYear = new Date().getFullYear()
    const classLevel = teacherClasses.length === 1 ? teacherClasses[0].level : ''
    const nextNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const suggestedId = `${currentYear}${classLevel}${nextNumber}`

    return {
      ...initialFormData,
      student_id: suggestedId,
      current_class: teacherClassId,
      admission_date: today
    }
  }, [isOpen, userRole, teacherClasses, initialFormData])

  // Initialize form with smart defaults
  useEffect(() => {
    if (isOpen) {
      setFormData(smartDefaults)
      setErrors({})
      setGeneratedCredentials(null)
    }
  }, [isOpen, smartDefaults])

  const validateField = useCallback((name, value) => {
    const newErrors = { ...errors }
    
    switch (name) {
      case 'student_id':
        if (!value?.trim()) newErrors.student_id = 'Student ID is required'
        else delete newErrors.student_id
        break
      case 'first_name':
        if (!value?.trim()) newErrors.first_name = 'First name is required'
        else delete newErrors.first_name
        break
      case 'last_name':
        if (!value?.trim()) newErrors.last_name = 'Last name is required'
        else delete newErrors.last_name
        break
      case 'date_of_birth':
        if (!value) newErrors.date_of_birth = 'Date of birth is required'
        else delete newErrors.date_of_birth
        break
      case 'guardian_name':
        if (!value?.trim()) newErrors.guardian_name = 'Guardian name is required'
        else delete newErrors.guardian_name
        break
      case 'guardian_phone':
        if (!value?.trim()) newErrors.guardian_phone = 'Guardian phone is required'
        else delete newErrors.guardian_phone
        break
      case 'guardian_address':
        if (!value?.trim()) newErrors.guardian_address = 'Guardian address is required'
        else delete newErrors.guardian_address
        break
      case 'guardian_email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.guardian_email = 'Please enter a valid email address'
        } else {
          delete newErrors.guardian_email
        }
        break
    }
    
    setErrors(newErrors)
  }, [errors])

  const handleInputChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
  }, [validateField])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    // Validate all required fields
    const requiredFields = ['student_id', 'first_name', 'last_name', 'date_of_birth', 
                           'guardian_name', 'guardian_phone', 'guardian_address', 'admission_date']
    const newErrors = {}
    
    requiredFields.forEach(field => {
      if (!formData[field] || !formData[field].toString().trim()) {
        newErrors[field] = `${field.replace('_', ' ')} is required`
      }
    })
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Generate login credentials
    const credentials = {
      username: formData.student_id,
      password: `${formData.first_name.toLowerCase()}123`
    }
    setGeneratedCredentials(credentials)

    // Submit form
    await onSubmit({ ...formData, ...credentials })
  }, [formData, onSubmit])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay add-student-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', width: '95%', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <FaUserGraduate size={16} className="text-white" />
            </div>
            <div>
              <h3 className="modal-title">Add New Student</h3>
              <p className="text-sm text-secondary mt-1">Create a new student profile with auto-generated credentials</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="modal-close"
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Form */}
        <div className="modal-body" style={{ overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
          <form onSubmit={handleSubmit} className="add-student-form">
            <div className="form-container">
              {/* Student ID */}
              <div className="form-field">
                <label className="form-label">
                  Student ID <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.student_id ? 'error' : ''}`}
                  value={formData.student_id}
                  onChange={(e) => handleInputChange('student_id', e.target.value)}
                  placeholder="Enter student ID"
                  disabled={isSubmitting}
                />
                {errors.student_id && (
                  <span className="form-error">{errors.student_id}</span>
                )}
              </div>

              {/* First Name */}
              <div className="form-field">
                <label className="form-label">
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.first_name ? 'error' : ''}`}
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                  disabled={isSubmitting}
                />
                {errors.first_name && (
                  <span className="form-error">{errors.first_name}</span>
                )}
              </div>

              {/* Last Name */}
              <div className="form-field">
                <label className="form-label">
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.last_name ? 'error' : ''}`}
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                  disabled={isSubmitting}
                />
                {errors.last_name && (
                  <span className="form-error">{errors.last_name}</span>
                )}
              </div>

              {/* Other Names */}
              <div className="form-field">
                <label className="form-label">Other Names</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.other_names}
                  onChange={(e) => handleInputChange('other_names', e.target.value)}
                  placeholder="Enter other names (optional)"
                  disabled={isSubmitting}
                />
              </div>

              {/* Gender */}
              <div className="form-field">
                <label className="form-label">
                  Gender <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="form-field">
                <label className="form-label">
                  Date of Birth <span className="required">*</span>
                </label>
                <input
                  type="date"
                  className={`form-input ${errors.date_of_birth ? 'error' : ''}`}
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.date_of_birth && (
                  <span className="form-error">{errors.date_of_birth}</span>
                )}
              </div>

              {/* Class Selection */}
              <div className="form-field full-width">
                <label className="form-label">Class</label>
                <select
                  className="form-select"
                  value={formData.current_class}
                  onChange={(e) => handleInputChange('current_class', e.target.value)}
                  disabled={isSubmitting || (userRole === 'TEACHER' && teacherClasses.length === 1)}
                >
                  <option value="">Select class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={String(cls.id)}>
                      {cls.level_display || cls.level}{cls.section ? ` ${cls.section}` : ''}
                    </option>
                  ))}
                </select>
                {userRole === 'TEACHER' && teacherClasses.length === 1 && (
                  <span className="form-help">
                    Automatically assigned to your class
                  </span>
                )}
              </div>

              {/* Guardian Information Section */}
              <div className="section-header">
                <div className="section-icon">
                  <FaUserShield size={14} />
                </div>
                <h4 className="section-title">Guardian Information</h4>
              </div>

              {/* Guardian Name */}
              <div className="form-field">
                <label className="form-label">
                  Guardian Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.guardian_name ? 'error' : ''}`}
                  value={formData.guardian_name}
                  onChange={(e) => handleInputChange('guardian_name', e.target.value)}
                  placeholder="Enter guardian name"
                  disabled={isSubmitting}
                />
                {errors.guardian_name && (
                  <span className="form-error">{errors.guardian_name}</span>
                )}
              </div>

              {/* Guardian Phone */}
              <div className="form-field">
                <label className="form-label">
                  Guardian Phone <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  className={`form-input ${errors.guardian_phone ? 'error' : ''}`}
                  value={formData.guardian_phone}
                  onChange={(e) => handleInputChange('guardian_phone', e.target.value)}
                  placeholder="Enter phone number"
                  disabled={isSubmitting}
                />
                {errors.guardian_phone && (
                  <span className="form-error">{errors.guardian_phone}</span>
                )}
              </div>

              {/* Guardian Email */}
              <div className="form-field">
                <label className="form-label">Guardian Email</label>
                <input
                  type="email"
                  className={`form-input ${errors.guardian_email ? 'error' : ''}`}
                  value={formData.guardian_email}
                  onChange={(e) => handleInputChange('guardian_email', e.target.value)}
                  placeholder="Enter email address (optional)"
                  disabled={isSubmitting}
                />
                {errors.guardian_email && (
                  <span className="form-error">{errors.guardian_email}</span>
                )}
              </div>

              {/* Admission Date */}
              <div className="form-field">
                <label className="form-label">
                  Admission Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  className={`form-input ${errors.admission_date ? 'error' : ''}`}
                  value={formData.admission_date}
                  onChange={(e) => handleInputChange('admission_date', e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.admission_date && (
                  <span className="form-error">{errors.admission_date}</span>
                )}
              </div>

              {/* Guardian Address */}
              <div className="form-field full-width">
                <label className="form-label">
                  Guardian Address <span className="required">*</span>
                </label>
                <textarea
                  className={`form-textarea ${errors.guardian_address ? 'error' : ''}`}
                  value={formData.guardian_address}
                  onChange={(e) => handleInputChange('guardian_address', e.target.value)}
                  placeholder="Enter complete address"
                  rows={3}
                  disabled={isSubmitting}
                />
                {errors.guardian_address && (
                  <span className="form-error">{errors.guardian_address}</span>
                )}
              </div>

              {/* Photo Upload */}
              <div className="form-field full-width">
                <label className="form-label">Student Photo</label>
                <div className="photo-upload">
                  <ImageCaptureInput
                    onImageCapture={(file) => handleInputChange('photo', file)}
                    currentImage={formData.photo}
                    disabled={isSubmitting}
                  />
                </div>
                <span className="form-help">
                  Upload a clear photo of the student (optional)
                </span>
              </div>

              {/* Generated Credentials Preview */}
              {generatedCredentials && (
                <div className="credentials-preview">
                  <div className="credentials-header">
                    <h5 className="credentials-title">Login Credentials Generated</h5>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="credentials-toggle"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                    </button>
                  </div>
                  <div className="credentials-item">
                    <div className="credentials-label">Username:</div>
                    <div className="credentials-value">
                      {generatedCredentials.username}
                    </div>
                  </div>
                  <div className="credentials-item">
                    <div className="credentials-label">Password:</div>
                    <div className="credentials-value">
                      {showPassword ? generatedCredentials.password : '••••••••'}
                    </div>
                  </div>
                  <p className="form-help">
                    These credentials will be used for student portal access
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={isSubmitting || Object.keys(errors).length > 0}
          >
            {isSubmitting ? (
              <>
                <div className="spinner" />
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
      </div>
    </div>
  )
})

AddStudentForm.displayName = 'AddStudentForm'

export default AddStudentForm