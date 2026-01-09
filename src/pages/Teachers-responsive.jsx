import { useEffect, useState, useCallback } from 'react'
import api from '../utils/api'
import { FaChalkboardUser, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa'
import { useAuth } from '../state/AuthContext'
import ResponsiveDataTable from '../components/ResponsiveDataTable'
import ResponsiveForm from '../components/ResponsiveForm'
import '../styles/responsive-layout.css'

/**
 * Teachers Page - Mobile-First Responsive
 */
export default function Teachers() {
  const { user } = useAuth()
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    fetchTeachers()
    fetchSubjects()
  }, [])

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/teachers/')
      setTeachers(Array.isArray(response.data) ? response.data : response.data.results || [])
      setError(null)
    } catch (err) {
      setError('Failed to load teachers')
      setTeachers([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await api.get('/subjects/')
      setSubjects(Array.isArray(response.data) ? response.data : response.data.results || [])
    } catch (err) {
      console.error('Failed to load subjects:', err)
    }
  }, [])

  const handleAddTeacher = async (formData) => {
    try {
      setSubmitting(true)
      const response = await api.post('/teachers/', formData)
      setTeachers([...teachers, response.data])
      setShowAddModal(false)
      setSuccessMessage('Teacher added successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add teacher')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditTeacher = async (formData) => {
    try {
      setSubmitting(true)
      const response = await api.patch(`/teachers/${editingTeacher.id}/`, formData)
      setTeachers(teachers.map(t => t.id === editingTeacher.id ? response.data : t))
      setShowEditModal(false)
      setEditingTeacher(null)
      setSuccessMessage('Teacher updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update teacher')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTeacher = async (teacherId) => {
    try {
      setSubmitting(true)
      await api.delete(`/teachers/${teacherId}/`)
      setTeachers(teachers.filter(t => t.id !== teacherId))
      setDeleteConfirm(null)
      setSuccessMessage('Teacher deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError('Failed to delete teacher')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    { key: 'first_name', label: 'First Name', type: 'text' },
    { key: 'last_name', label: 'Last Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'tel' },
  ]

  const actions = [
    {
      id: 'edit',
      label: 'Edit',
      onClick: (teacher) => {
        setEditingTeacher(teacher)
        setShowEditModal(true)
      },
      color: 'primary',
    },
    {
      id: 'delete',
      label: 'Delete',
      onClick: (teacher) => setDeleteConfirm(teacher),
      color: 'error',
    },
  ]

  const formFields = [
    { name: 'first_name', label: 'First Name', type: 'text', required: true },
    { name: 'last_name', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'subjects', label: 'Subjects', type: 'select', multiple: true, options: subjects.map(s => ({ value: s.id, label: s.name })) },
  ]

  if (loading) {
    return <div className="responsive-container py-8 text-center">Loading teachers...</div>
  }

  return (
    <div className="responsive-container section">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Teachers</h1>
          <p className="text-secondary">Manage teaching staff</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2 touch-target"
        >
          <FaPlus /> Add Teacher
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-4 bg-success/10 text-success rounded-lg">{successMessage}</div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-error/10 text-error rounded-lg">{error}</div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white dark:bg-card w-full md:w-96 rounded-t-lg md:rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Delete Teacher?</h3>
            <p className="text-secondary mb-6">
              Are you sure you want to delete {deleteConfirm.first_name} {deleteConfirm.last_name}?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDeleteTeacher(deleteConfirm.id)} disabled={submitting} className="btn btn-error flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-card w-full md:w-2xl rounded-t-lg md:rounded-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Add New Teacher</h2>
              <button onClick={() => setShowAddModal(false)}><FaTimes size={24} /></button>
            </div>
            <ResponsiveForm fields={formFields} onSubmit={handleAddTeacher} submitLabel="Add Teacher" loading={submitting} />
          </div>
        </div>
      )}

      {showEditModal && editingTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-card w-full md:w-2xl rounded-t-lg md:rounded-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Edit Teacher</h2>
              <button onClick={() => { setShowEditModal(false); setEditingTeacher(null) }}><FaTimes size={24} /></button>
            </div>
            <ResponsiveForm fields={formFields} initialValues={editingTeacher} onSubmit={handleEditTeacher} submitLabel="Update Teacher" loading={submitting} />
          </div>
        </div>
      )}

      <ResponsiveDataTable
        columns={columns}
        data={teachers}
        actions={actions}
        searchable={true}
        searchFields={['first_name', 'last_name', 'email']}
        emptyState={{
          icon: FaChalkboardUser,
          title: 'No Teachers Found',
          description: 'Add teachers to start managing your school.',
          action: { label: 'Add Teacher', onClick: () => setShowAddModal(true) },
        }}
      />
    </div>
  )
}
