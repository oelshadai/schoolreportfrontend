import { useState, useEffect } from 'react'
import { FaCalendarCheck, FaUserCheck, FaUserTimes, FaClock, FaDownload } from 'react-icons/fa'
import api from '../utils/api'

export default function AttendanceTracker() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [students, setStudents] = useState([])
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      loadStudents()
      loadAttendance()
    }
  }, [selectedClass, attendanceDate])

  const loadClasses = async () => {
    try {
      const response = await api.get('/schools/classes/')
      setClasses(response.data.results || response.data)
    } catch (error) {
      console.error('Error loading classes:', error)
    }
  }

  const loadStudents = async () => {
    try {
      const response = await api.get(`/schools/classes/${selectedClass}/students/`)
      setStudents(response.data)
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const loadAttendance = async () => {
    try {
      const response = await api.get(`/attendance/?class=${selectedClass}&date=${attendanceDate}`)
      const attendanceData = {}
      response.data.forEach(record => {
        attendanceData[record.student_id] = record.status
      })
      setAttendance(attendanceData)
    } catch (error) {
      console.error('Error loading attendance:', error)
    }
  }

  const markAttendance = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const saveAttendance = async () => {
    setLoading(true)
    try {
      const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
        student_id: studentId,
        status: status,
        date: attendanceDate
      }))

      await api.post('/attendance/bulk_create/', {
        class_id: selectedClass,
        records: attendanceRecords
      })

      setMessage('Attendance saved successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving attendance:', error)
      setMessage('Failed to save attendance')
    } finally {
      setLoading(false)
    }
  }

  const exportAttendance = async () => {
    try {
      const response = await api.get(`/attendance/export/?class=${selectedClass}&month=${attendanceDate.substring(0, 7)}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `attendance_${selectedClass}_${attendanceDate.substring(0, 7)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error exporting attendance:', error)
    }
  }

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <div className="page-header">
        <div className="page-title">
          <div className="page-title-icon">
            <FaCalendarCheck />
          </div>
          <div>
            <h1>Attendance Tracker</h1>
            <p>Mark and manage student attendance</p>
          </div>
        </div>
        <div className="actions">
          <button onClick={exportAttendance} className="btn btn-secondary">
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <div className="form-row">
          <div className="form-group">
            <label>Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
            >
              <option value="">Choose a class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.level} {cls.section}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      {selectedClass && students.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Mark Attendance - {new Date(attendanceDate).toLocaleDateString()}</h3>
            <button
              onClick={saveAttendance}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.student_id}</td>
                    <td>{student.first_name} {student.last_name}</td>
                    <td>
                      <span className={`badge ${
                        attendance[student.id] === 'PRESENT' ? 'badge-success' :
                        attendance[student.id] === 'ABSENT' ? 'badge-error' :
                        attendance[student.id] === 'LATE' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {attendance[student.id] || 'Not Marked'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => markAttendance(student.id, 'PRESENT')}
                          className={`btn btn-sm ${attendance[student.id] === 'PRESENT' ? 'btn-success' : 'btn-ghost'}`}
                        >
                          <FaUserCheck /> Present
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, 'ABSENT')}
                          className={`btn btn-sm ${attendance[student.id] === 'ABSENT' ? 'btn-danger' : 'btn-ghost'}`}
                        >
                          <FaUserTimes /> Absent
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, 'LATE')}
                          className={`btn btn-sm ${attendance[student.id] === 'LATE' ? 'btn-warning' : 'btn-ghost'}`}
                        >
                          <FaClock /> Late
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}