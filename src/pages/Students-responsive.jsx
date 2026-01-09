import { useEffect, useState, useCallback } from 'react'
import api from '../utils/api'
import { FaUserGraduate, FaPlus, FaSearch, FaTimes, FaEdit, FaTrash, FaEye, FaEyeSlash, FaCopy, FaCheck, FaTimes as FaX } from 'react-icons/fa'
import { useAuth } from '../state/AuthContext'
import ResponsiveDataTable from '../components/ResponsiveDataTable'
import ResponsiveForm from '../components/ResponsiveForm'
import '../styles/responsive-layout.css'

/**
 * Students Page - Mobile-First Responsive
 * 
 * Features:
 * - ResponsiveDataTable (tables on desktop, cards on mobile)
 * - ResponsiveForm for add/edit student
 * - Mobile-friendly layout (single column on mobile, multi-column on desktop)
 * - Touch-optimized buttons and inputs
 * - Full WCAG AAA accessibility
 */
export default function Students() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [classes, setClasses] = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch students and classes on mount
  useEffect(() => {
    fetchStudents()
    fetchClasses()
  }, [])

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/students/')
      setStudents(Array.isArray(response.data) ? response.data : response.data.results || [])
      setError(null)
    } catch (err) {
      setError('Failed to load students. Please try again.')
      setStudents([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchClasses = useCallback(async () => {
    try {
      const response = await api.get('/classes/')
      setClasses(Array.isArray(response.data) ? response.data : response.data.results || [])
    } catch (err) {
      console.error('Failed to load classes:', err)
    }
  }, [])

  const handleAddStudent = async (formData) => {
    try {
      setSubmitting(true)
      const payload = {
        student_id: formData.student_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        other_names: formData.other_names || '',
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        current_class: formData.current_class,
        guardian_name: formData.guardian_name,
        guardian_phone: formData.guardian_phone,
        guardian_email: formData.guardian_email,
        guardian_address: formData.guardian_address || '',
        admission_date: formData.admission_date,
      }
      
      const response = await api.post('/students/', payload)
      setStudents([...students, response.data])
      setShowAddModal(false)
      setSuccessMessage('Student added successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add student')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditStudent = async (formData) => {
    try {
      setSubmitting(true)
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        other_names: formData.other_names || '',
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        current_class: formData.current_class,
        guardian_name: formData.guardian_name,
        guardian_phone: formData.guardian_phone,
        guardian_email: formData.guardian_email,
        guardian_address: formData.guardian_address || '',
      }
      
      const response = await api.patch(`/students/${editingStudent.id}/`, payload)
      setStudents(students.map(s => s.id === editingStudent.id ? response.data : s))
      setShowEditModal(false)
      setEditingStudent(null)
      setSuccessMessage('Student updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update student')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteStudent = async (studentId) => {
    try {
      setSubmitting(true)
      await api.delete(`/students/${studentId}/`)
      setStudents(students.filter(s => s.id !== studentId))
      setDeleteConfirm(null)
      setSuccessMessage('Student deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError('Failed to delete student')
    } finally {
      setSubmitting(false)
    }
  }

  // ResponsiveDataTable configuration
  const columns = [
    { key: 'student_id', label: 'Student ID', type: 'text' },
    { key: 'first_name', label: 'First Name', type: 'text' },
    { key: 'last_name', label: 'Last Name', type: 'text' },
    { key: 'current_class', label: 'Class', type: 'text' },
    { key: 'guardian_email', label: 'Guardian Email', type: 'email' },
  ]

  const actions = [
    {
      id: 'view',
      label: 'View',
      icon: FaEye,
      onClick: (student) => {
        setEditingStudent(student)
        setShowEditModal(true)
      },
      color: 'primary',
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: FaEdit,
      onClick: (student) => {
        setEditingStudent(student)
        setShowEditModal(true)
      },
      color: 'primary',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: FaTrash,
      onClick: (student) => {
        setDeleteConfirm(student)
      },
      color: 'error',
    },
  ]

  // Add student form fields
  const addStudentFields = [
    { name: 'student_id', label: 'Student ID', type: 'text', required: true, placeholder: 'e.g., STU001' },
    { name: 'first_name', label: 'First Name', type: 'text', required: true },
    { name: 'last_name', label: 'Last Name', type: 'text', required: true },
    { name: 'other_names', label: 'Other Names', type: 'text' },
    { name: 'gender', label: 'Gender', type: 'select', required: true, options: [
      { value: 'M', label: 'Male' },
      { value: 'F', label: 'Female' },
      { value: 'O', label: 'Other' },
    ]},
    { name: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
    { name: 'current_class', label: 'Class', type: 'select', required: true, options: classes.map(c => ({ value: c.id, label: c.name })) },
    { name: 'admission_date', label: 'Admission Date', type: 'date', required: true },
    { name: 'guardian_name', label: 'Guardian Name', type: 'text', required: true },
    { name: 'guardian_phone', label: 'Guardian Phone', type: 'tel', required: true },
    { name: 'guardian_email', label: 'Guardian Email', type: 'email', required: true },
    { name: 'guardian_address', label: 'Guardian Address', type: 'textarea' },
  ]

  const editStudentFields = addStudentFields.filter(f => f.name !== 'student_id')

  if (loading) {
    return (
      <div className="responsive-container py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <FaUserGraduate className="text-4xl text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-secondary">Loading students...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="responsive-container section">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Students</h1>
          <p className="text-secondary">Manage and view all students</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2 touch-target"
        >
          <FaPlus /> Add Student
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-success/10 text-success rounded-lg flex items-center gap-2 border border-success/20">
          <FaCheck /> {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-error/10 text-error rounded-lg flex items-center gap-2 border border-error/20">
          <FaX /> {error}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white dark:bg-card w-full md:w-96 rounded-t-lg md:rounded-lg p-6 md:shadow-lg">
            <h3 className="text-lg font-bold mb-4">Delete Student?</h3>
            <p className="text-secondary mb-6">
              Are you sure you want to delete {deleteConfirm.first_name} {deleteConfirm.last_name}? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={submitting}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStudent(deleteConfirm.id)}
                disabled={submitting}
                className="btn btn-error flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-card w-full md:w-2xl rounded-t-lg md:rounded-lg p-6 md:shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Add New Student</h2>
              <button onClick={() => setShowAddModal(false)} className="text-secondary hover:text-primary">
                <FaTimes size={24} />
              </button>
            </div>
            <ResponsiveForm
              fields={addStudentFields}
              onSubmit={handleAddStudent}
              submitLabel="Add Student"
              loading={submitting}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-card w-full md:w-2xl rounded-t-lg md:rounded-lg p-6 md:shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Edit Student</h2>
              <button onClick={() => {
                setShowEditModal(false)
                setEditingStudent(null)
              }} className="text-secondary hover:text-primary">
                <FaTimes size={24} />
              </button>
            </div>
            <ResponsiveForm
              fields={editStudentFields}
              initialValues={editingStudent}
              onSubmit={handleEditStudent}
              submitLabel="Update Student"
              loading={submitting}
              onCancel={() => {
                setShowEditModal(false)
                setEditingStudent(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Students Table */}
      <ResponsiveDataTable
        columns={columns}
        data={students}
        actions={actions}
        searchable={true}
        searchFields={['first_name', 'last_name', 'student_id', 'guardian_email']}
        emptyState={{
          icon: FaUserGraduate,
          title: 'No Students Found',
          description: 'Start by adding your first student to the system.',
          action: { label: 'Add Student', onClick: () => setShowAddModal(true) },
        }}
      />
    </div>
  )
}
