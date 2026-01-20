import React, { useState, useEffect } from 'react'
import { FaUser, FaCamera, FaTimes, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa'
import ImageCaptureInput from './ImageCaptureInput'

const AddStudentForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  classes = [], 
  userRole, 
  teacherClasses = [],
  isSubmitting = false 
}) => {
  const [formData, setFormData] = useState({
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
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [generatedCredentials, setGeneratedCredentials] = useState(null)

  // Initialize form with smart defaults
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0]
      const teacherClassId = userRole === 'TEACHER' && teacherClasses.length === 1 
        ? String(teacherClasses[0].id) 
        : ''
      
      // Generate suggested student ID
      const currentYear = new Date().getFullYear()
      const classLevel = teacherClasses.length === 1 ? teacherClasses[0].level : ''
      const nextNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      const suggestedId = `${currentYear}${classLevel}${nextNumber}`

      setFormData({
        student_id: suggestedId,
        first_name: '',
        last_name: '',
        other_names: '',
        gender: 'M',
        date_of_birth: '',
        current_class: teacherClassId,
        guardian_name: '',
        guardian_phone: '',
        guardian_email: '',
        guardian_address: '',
        admission_date: today,
        photo: null
      })
      setErrors({})
      setGeneratedCredentials(null)
    }
  }, [isOpen, userRole, teacherClasses])

  const validateField = (name, value) => {
    const newErrors = { ...errors }
    
    switch (name) {
      case 'student_id':
        if (!value.trim()) newErrors.student_id = 'Student ID is required'
        else delete newErrors.student_id
        break
      case 'first_name':
        if (!value.trim()) newErrors.first_name = 'First name is required'
        else delete newErrors.first_name
        break
      case 'last_name':
        if (!value.trim()) newErrors.last_name = 'Last name is required'
        else delete newErrors.last_name
        break
      case 'date_of_birth':
        if (!value) newErrors.date_of_birth = 'Date of birth is required'
        else delete newErrors.date_of_birth
        break
      case 'guardian_name':
        if (!value.trim()) newErrors.guardian_name = 'Guardian name is required'
        else delete newErrors.guardian_name
        break
      case 'guardian_phone':
        if (!value.trim()) newErrors.guardian_phone = 'Guardian phone is required'
        else delete newErrors.guardian_phone
        break
      case 'guardian_address':
        if (!value.trim()) newErrors.guardian_address = 'Guardian address is required'
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
  }

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const handleSubmit = async (e) => {
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
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <FaUser size={16} className="text-white" />
            </div>
            <div>
              <h3 className="modal-title">Add New Student</h3>
              <p className="text-sm text-secondary mt-1">Create a new student profile</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close">
            <FaTimes size={14} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student ID */}
            <div className="form-group">
              <label className="form-label">
                Student ID <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.student_id ? 'form-error' : ''}`}
                value={formData.student_id}
                onChange={(e) => handleInputChange('student_id', e.target.value)}
                placeholder="Enter student ID"
              />
              {errors.student_id && (
                <span className="form-error-text">{errors.student_id}</span>
              )}
            </div>

            {/* First Name */}
            <div className="form-group">
              <label className="form-label">
                First Name <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.first_name ? 'form-error' : ''}`}
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter first name"
              />
              {errors.first_name && (
                <span className="form-error-text">{errors.first_name}</span>
              )}
            </div>

            {/* Last Name */}
            <div className="form-group">
              <label className="form-label">
                Last Name <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.last_name ? 'form-error' : ''}`}
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter last name"
              />
              {errors.last_name && (
                <span className="form-error-text">{errors.last_name}</span>
              )}
            </div>

            {/* Other Names */}
            <div className="form-group">
              <label className="form-label">Other Names</label>
              <input
                type="text"
                className="form-input"
                value={formData.other_names}
                onChange={(e) => handleInputChange('other_names', e.target.value)}
                placeholder="Enter other names (optional)"
              />
            </div>

            {/* Gender */}
            <div className="form-group">
              <label className="form-label">
                Gender <span className="text-error-500">*</span>
              </label>
              <select
                className="form-select"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div className="form-group">
              <label className="form-label">
                Date of Birth <span className="text-error-500">*</span>
              </label>
              <input
                type="date"
                className={`form-input ${errors.date_of_birth ? 'form-error' : ''}`}
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              />
              {errors.date_of_birth && (
                <span className="form-error-text">{errors.date_of_birth}</span>
              )}
            </div>

            {/* Class Selection */}
            <div className="form-group md:col-span-2">
              <label className="form-label">Class</label>
              <select
                className="form-select"
                value={formData.current_class}
                onChange={(e) => handleInputChange('current_class', e.target.value)}
                disabled={userRole === 'TEACHER' && teacherClasses.length === 1}
              >
                <option value="">Select class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={String(cls.id)}>
                    {cls.level_display || cls.level}{cls.section ? ` ${cls.section}` : ''}
                  </option>
                ))}
              </select>
              {userRole === 'TEACHER' && teacherClasses.length === 1 && (
                <span className="form-help-text">
                  Automatically assigned to your class
                </span>
              )}
            </div>

            {/* Guardian Information */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-primary-100 rounded-md flex items-center justify-center">
                  <FaUser size={12} className="text-primary-600" />
                </div>
                Guardian Information
              </h4>
            </div>

            {/* Guardian Name */}
            <div className="form-group">
              <label className="form-label">
                Guardian Name <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.guardian_name ? 'form-error' : ''}`}
                value={formData.guardian_name}
                onChange={(e) => handleInputChange('guardian_name', e.target.value)}
                placeholder="Enter guardian name"
              />
              {errors.guardian_name && (
                <span className="form-error-text">{errors.guardian_name}</span>
              )}
            </div>

            {/* Guardian Phone */}
            <div className="form-group">
              <label className="form-label">
                Guardian Phone <span className="text-error-500">*</span>
              </label>
              <input
                type="tel"
                className={`form-input ${errors.guardian_phone ? 'form-error' : ''}`}
                value={formData.guardian_phone}
                onChange={(e) => handleInputChange('guardian_phone', e.target.value)}
                placeholder="Enter phone number"
              />
              {errors.guardian_phone && (
                <span className="form-error-text">{errors.guardian_phone}</span>
              )}
            </div>

            {/* Guardian Email */}
            <div className="form-group">
              <label className="form-label">Guardian Email</label>
              <input
                type="email"
                className={`form-input ${errors.guardian_email ? 'form-error' : ''}`}
                value={formData.guardian_email}
                onChange={(e) => handleInputChange('guardian_email', e.target.value)}
                placeholder="Enter email address (optional)"
              />
              {errors.guardian_email && (
                <span className="form-error-text">{errors.guardian_email}</span>
              )}
            </div>

            {/* Admission Date */}
            <div className="form-group">
              <label className="form-label">
                Admission Date <span className="text-error-500">*</span>
              </label>
              <input
                type="date"
                className={`form-input ${errors.admission_date ? 'form-error' : ''}`}
                value={formData.admission_date}
                onChange={(e) => handleInputChange('admission_date', e.target.value)}
              />
              {errors.admission_date && (
                <span className="form-error-text">{errors.admission_date}</span>
              )}
            </div>

            {/* Guardian Address */}
            <div className="form-group md:col-span-2">
              <label className="form-label">
                Guardian Address <span className="text-error-500">*</span>
              </label>
              <textarea
                className={`form-textarea ${errors.guardian_address ? 'form-error' : ''}`}
                value={formData.guardian_address}
                onChange={(e) => handleInputChange('guardian_address', e.target.value)}
                placeholder="Enter complete address"
                rows={3}
              />
              {errors.guardian_address && (
                <span className="form-error-text">{errors.guardian_address}</span>
              )}
            </div>

            {/* Photo Upload */}
            <div className="form-group md:col-span-2">
              <label className="form-label">Student Photo</label>
              <ImageCaptureInput
                onImageCapture={(file) => handleInputChange('photo', file)}
                currentImage={formData.photo}
              />
              <span className="form-help-text">
                Upload a clear photo of the student (optional)
              </span>
            </div>

            {/* Generated Credentials Preview */}
            {generatedCredentials && (
              <div className="md:col-span-2">
                <div className="card bg-success-50 border-success-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-success-800">Login Credentials Generated</h5>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="btn-ghost btn-sm text-success-600"
                    >
                      {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-success-700">Username:</span>
                      <div className="font-mono text-sm bg-white px-2 py-1 rounded border">
                        {generatedCredentials.username}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-success-700">Password:</span>
                      <div className="font-mono text-sm bg-white px-2 py-1 rounded border">
                        {showPassword ? generatedCredentials.password : '••••••••'}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-success-600 mt-2">
                    These credentials will be used for student portal access
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>

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
            disabled={isSubmitting}
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
}

export default AddStudentForm