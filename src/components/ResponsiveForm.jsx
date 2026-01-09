import React, { useState, useEffect } from 'react'
import { FaEye, FaEyeSlash, FaCheckCircle, FaTimes } from 'react-icons/fa'

/**
 * ResponsiveForm Component
 * Mobile-first form handling with:
 * - Touch-optimized inputs (48px+ height)
 * - Mobile keyboard awareness
 * - Responsive layout (1/2 columns on mobile, flexible on desktop)
 * - Validation with visual feedback
 * - Accessible form patterns
 */
export function ResponsiveForm({
  fields = [],
  onSubmit = () => {},
  submitLabel = 'Submit',
  loading = false,
  layout = 'mobile' // 'mobile' | 'desktop' | 'auto'
}) {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [passwordVisibility, setPasswordVisibility] = useState({})
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640)

  useEffect(() => {
    // Initialize form data
    const initial = {}
    fields.forEach(field => {
      initial[field.name] = field.value || ''
    })
    setFormData(initial)
  }, [fields])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }))
    }
  }

  const handleBlur = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }))

    // Validate field
    const field = fields.find(f => f.name === fieldName)
    if (field && field.required && !formData[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: 'This field is required'
      }))
    } else if (field && field.validate) {
      const error = field.validate(formData[fieldName])
      if (error) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: error
        }))
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate all fields
    const newErrors = {}
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = 'This field is required'
      } else if (field.validate) {
        const error = field.validate(formData[field.name])
        if (error) newErrors[field.name] = error
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  const getFieldColumns = () => {
    if (layout === 'mobile') return 1
    if (layout === 'desktop') return 2
    return isMobile ? 1 : 2
  }

  const columns = getFieldColumns()

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'grid',
        gridTemplateColumns: columns === 1 ? '1fr' : 'repeat(2, 1fr)',
        gap: 'var(--space-4)',
        maxWidth: '100%',
        width: '100%'
      }}
      noValidate
    >
      {fields.map(field => {
        const fieldValue = formData[field.name] || ''
        const fieldError = errors[field.name]
        const isFieldTouched = touched[field.name]
        const showError = fieldError && isFieldTouched
        const isPasswordField = field.type === 'password'
        const showPassword = passwordVisibility[field.name]

        // Handle full-width fields (e.g., textarea, file)
        const isFullWidth = field.fullWidth || field.type === 'textarea' || field.type === 'file'

        return (
          <div
            key={field.name}
            style={{
              gridColumn: isFullWidth ? `1 / -1` : 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)'
            }}
          >
            {/* Label */}
            {field.label && (
              <label
                htmlFor={field.name}
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  cursor: 'pointer'
                }}
              >
                {field.label}
                {field.required && (
                  <span style={{ color: '#ef4444' }}>*</span>
                )}
              </label>
            )}

            {/* Input Container */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {/* Text Input / Email Input / Password Input / Number Input */}
              {['text', 'email', 'password', 'number', 'tel', 'url'].includes(field.type) && (
                <input
                  id={field.name}
                  type={isPasswordField && !showPassword ? 'password' : 'text'}
                  name={field.name}
                  value={fieldValue}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  onBlur={() => handleBlur(field.name)}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={field.disabled}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    paddingRight: isPasswordField ? 'var(--space-12)' : 'var(--space-3)',
                    borderRadius: 'var(--radius)',
                    border: showError ? '2px solid #ef4444' : '1px solid var(--border-color)',
                    backgroundColor: field.disabled ? 'var(--surface-bg)' : 'var(--surface-bg)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-base)',
                    fontFamily: 'inherit',
                    transition: 'all var(--transition-fast)',
                    minHeight: '48px',
                    cursor: field.disabled ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#115e3d'
                    e.currentTarget.style.boxShadow = 'var(--focus-ring)'
                  }}
                  onBlurCapture={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    if (showError) {
                      e.currentTarget.style.borderColor = '#ef4444'
                    } else {
                      e.currentTarget.style.borderColor = 'var(--border-color)'
                    }
                  }}
                />
              )}

              {/* Password Toggle Button */}
              {isPasswordField && (
                <button
                  type="button"
                  onClick={() => setPasswordVisibility(prev => ({
                    ...prev,
                    [field.name]: !prev[field.name]
                  }))}
                  style={{
                    position: 'absolute',
                    right: 'var(--space-3)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    padding: 'var(--space-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--text-lg)',
                    minWidth: '44px',
                    minHeight: '44px'
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              )}

              {/* Textarea */}
              {field.type === 'textarea' && (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={fieldValue}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  onBlur={() => handleBlur(field.name)}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={field.disabled}
                  rows={field.rows || 4}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius)',
                    border: showError ? '2px solid #ef4444' : '1px solid var(--border-color)',
                    backgroundColor: field.disabled ? 'var(--surface-bg)' : 'var(--surface-bg)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-base)',
                    fontFamily: 'inherit',
                    transition: 'all var(--transition-fast)',
                    resize: 'vertical',
                    minHeight: '120px',
                    cursor: field.disabled ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#115e3d'
                    e.currentTarget.style.boxShadow = 'var(--focus-ring)'
                  }}
                  onBlurCapture={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    if (showError) {
                      e.currentTarget.style.borderColor = '#ef4444'
                    } else {
                      e.currentTarget.style.borderColor = 'var(--border-color)'
                    }
                  }}
                />
              )}

              {/* Select */}
              {field.type === 'select' && (
                <select
                  id={field.name}
                  name={field.name}
                  value={fieldValue}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  onBlur={() => handleBlur(field.name)}
                  required={field.required}
                  disabled={field.disabled}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius)',
                    border: showError ? '2px solid #ef4444' : '1px solid var(--border-color)',
                    backgroundColor: 'var(--surface-bg)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-base)',
                    fontFamily: 'inherit',
                    transition: 'all var(--transition-fast)',
                    minHeight: '48px',
                    cursor: field.disabled ? 'not-allowed' : 'pointer',
                    appearance: 'none',
                    paddingRight: 'var(--space-10)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#115e3d'
                    e.currentTarget.style.boxShadow = 'var(--focus-ring)'
                  }}
                  onBlurCapture={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    if (showError) {
                      e.currentTarget.style.borderColor = '#ef4444'
                    } else {
                      e.currentTarget.style.borderColor = 'var(--border-color)'
                    }
                  }}
                >
                  <option value="">Select {field.label}</option>
                  {field.options && field.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {/* File Input */}
              {field.type === 'file' && (
                <input
                  id={field.name}
                  type="file"
                  name={field.name}
                  onChange={(e) => handleChange(field.name, e.target.files ? e.target.files[0] : null)}
                  onBlur={() => handleBlur(field.name)}
                  accept={field.accept}
                  required={field.required}
                  disabled={field.disabled}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius)',
                    border: showError ? '2px solid #ef4444' : '1px solid var(--border-color)',
                    backgroundColor: 'var(--surface-bg)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-sm)',
                    transition: 'all var(--transition-fast)',
                    minHeight: '48px',
                    cursor: field.disabled ? 'not-allowed' : 'pointer'
                  }}
                />
              )}

              {/* Checkbox */}
              {field.type === 'checkbox' && (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-primary)',
                    minHeight: '48px'
                  }}
                >
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={fieldValue === true || fieldValue === 'true'}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    onBlur={() => handleBlur(field.name)}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: '#115e3d'
                    }}
                  />
                  <span>{field.checkboxLabel || field.label}</span>
                </label>
              )}

              {/* Radio */}
              {field.type === 'radio' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {field.options && field.options.map(opt => (
                    <label
                      key={opt.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        cursor: 'pointer',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-primary)',
                        minHeight: '44px'
                      }}
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={opt.value}
                        checked={fieldValue === opt.value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: '#115e3d'
                        }}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Success Indicator */}
              {fieldValue && !showError && field.type !== 'checkbox' && field.type !== 'radio' && field.type !== 'file' && (
                <div
                  style={{
                    position: 'absolute',
                    right: isPasswordField ? 'var(--space-12)' : 'var(--space-3)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--text-lg)',
                    opacity: 0.7
                  }}
                >
                  <FaCheckCircle />
                </div>
              )}
            </div>

            {/* Hint Text */}
            {field.hint && !showError && (
              <p
                style={{
                  margin: '0',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-tertiary)',
                  fontWeight: 400
                }}
              >
                {field.hint}
              </p>
            )}

            {/* Error Message */}
            {showError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 'var(--radius)',
                  borderLeft: '4px solid #ef4444',
                  animation: 'slideDown 0.2s ease-out'
                }}
              >
                <FaTimes color="#ef4444" size={14} style={{ flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: '#fca5a5',
                    fontWeight: 500
                  }}
                >
                  {fieldError}
                </span>
              </div>
            )}
          </div>
        )
      })}

      {/* Submit Button - Full Width */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
        style={{
          gridColumn: '1 / -1',
          padding: 'var(--space-3) var(--space-4)',
          minHeight: '48px',
          fontSize: 'var(--text-base)',
          fontWeight: 600,
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all var(--transition-fast)'
        }}
      >
        {loading ? 'Loading...' : submitLabel}
      </button>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </form>
  )
}

export default ResponsiveForm
