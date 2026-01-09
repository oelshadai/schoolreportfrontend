import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import ResponsiveForm from '../components/ResponsiveForm'
import ForgotPassword from '../components/ForgotPassword'
import { FaArrowLeft } from 'react-icons/fa'
import '../styles/responsive-layout.css'

/**
 * Login Page - Mobile-First Responsive
 */
export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleSubmit = async (formData) => {
    setError('')
    const res = await login(formData.email, formData.password)
    if (res.ok) {
      navigate(from, { replace: true })
    } else {
      setError(res.message)
    }
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => setShowForgotPassword(false)}
            className="flex items-center gap-2 text-primary hover:text-primary-light mb-6"
          >
            <FaArrowLeft /> Back to Login
          </button>
          <ForgotPassword />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Elite Tech</h1>
          <p className="text-gray-400">School Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 mb-6">Sign in to your account</p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <ResponsiveForm
            fields={[
              {
                name: 'email',
                label: 'Email Address',
                type: 'email',
                required: true,
                placeholder: 'your@email.com',
              },
              {
                name: 'password',
                label: 'Password',
                type: 'password',
                required: true,
                placeholder: '••••••••',
              },
            ]}
            onSubmit={handleSubmit}
            submitLabel={loading ? 'Signing in...' : 'Sign In'}
            loading={loading}
            autoComplete={{
              email: 'email',
              password: 'current-password',
            }}
          />

          {/* Forgot Password Link */}
          <button
            onClick={() => setShowForgotPassword(true)}
            className="w-full mt-4 text-sm text-gray-400 hover:text-primary transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link to="/register-school" className="text-primary hover:text-primary-light font-medium">
              Register your school
            </Link>
          </p>
        </div>

        {/* Alternative Login Link */}
        <div className="text-center mt-4">
          <Link to="/login-select" className="text-sm text-gray-400 hover:text-primary flex items-center justify-center gap-2">
            <FaArrowLeft size={12} /> Login as Student
          </Link>
        </div>
      </div>
    </div>
  )
}
