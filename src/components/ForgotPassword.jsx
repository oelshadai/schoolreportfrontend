import { useState } from 'react'
import { FaEnvelope, FaUser, FaTimes } from 'react-icons/fa'
import api from '../utils/api'

export default function ForgotPassword({ isOpen, onClose, userType = 'admin' }) {
  const [formData, setFormData] = useState({ username: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const endpoint = userType === 'student' 
        ? '/students/auth/forgot-password/' 
        : '/auth/forgot-password/'
      
      const response = await api.post(endpoint, formData)
      setMessage(response.data.message)
      
      // Show temp password if email failed
      if (response.data.temp_password) {
        setMessage(`${response.data.message}. Temporary password: ${response.data.temp_password}`)
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        width: '100%',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--gray-500)'
          }}
        >
          <FaTimes />
        </button>

        <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Forgot Password</h2>
        <p style={{ margin: '0 0 20px 0', color: 'var(--gray-600)', fontSize: '14px' }}>
          Enter your username or email to reset your password
        </p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {message && (
          <div className="alert alert-success" style={{ marginBottom: '16px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="Enter your username"
                style={{ paddingLeft: '40px' }}
              />
              <FaUser style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray-400)'
              }} />
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '12px 0', color: 'var(--gray-500)' }}>
            OR
          </div>

          <div className="form-group">
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email"
                style={{ paddingLeft: '40px' }}
              />
              <FaEnvelope style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray-400)'
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || (!formData.username && !formData.email)}
            >
              {loading ? <div className="loading-spinner" /> : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}