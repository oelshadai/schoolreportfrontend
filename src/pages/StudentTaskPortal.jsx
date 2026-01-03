import { useState, useEffect } from 'react'
import { FaClock, FaPlay, FaCheck, FaTimes, FaChartBar } from 'react-icons/fa'
import api from '../utils/api'
import TaskAttempt from '../components/TaskAttempt'

export default function StudentTaskPortal() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [taskResult, setTaskResult] = useState(null)
  
  const isMobile = window.innerWidth <= 768

  useEffect(() => {
    loadTasks()
    const interval = setInterval(loadTasks, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadTasks = async () => {
    try {
      const response = await api.get('/assignments/tasks/available/')
      setTasks(response.data)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const startTask = (task) => {
    if (task.is_available) {
      setSelectedTask(task)
    }
  }

  const handleTaskComplete = (score) => {
    setTaskResult({ score, task: selectedTask })
    setSelectedTask(null)
    setShowResults(true)
    loadTasks() // Refresh task list
  }

  const closeTask = () => {
    setSelectedTask(null)
    loadTasks()
  }

  const formatTimeRemaining = (endTime) => {
    const now = new Date()
    const end = new Date(endTime)
    const diff = end - now
    
    if (diff <= 0) return 'Expired'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    }
    return `${minutes}m remaining`
  }

  if (selectedTask) {
    return (
      <TaskAttempt
        task={selectedTask}
        onComplete={handleTaskComplete}
        onClose={closeTask}
      />
    )
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div>Loading tasks...</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      padding: isMobile ? '20px 12px' : '24px 20px',
      paddingTop: isMobile ? '120px' : '80px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(16px)',
          borderRadius: 20,
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          textAlign: 'center'
        }}>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: isMobile ? 24 : 32,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #a78bfa, #6366f1)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <FaClock />
            Available Tasks
          </h1>
          <p style={{ margin: 0, color: '#94a3b8' }}>
            Complete your assigned tasks within the time limit
          </p>
        </div>

        {/* Results Modal */}
        {showResults && taskResult && (
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
            padding: '20px'
          }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.95)',
              borderRadius: 16,
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
              border: '1px solid rgba(148, 163, 184, 0.2)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: taskResult.score >= 70 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>
                {taskResult.score >= 70 ? <FaCheck size={32} /> : <FaChartBar size={32} />}
              </div>
              
              <h3 style={{ margin: '0 0 12px 0', color: '#e2e8f0' }}>
                Task Completed!
              </h3>
              
              <p style={{ margin: '0 0 20px 0', color: '#94a3b8' }}>
                {taskResult.task.title}
              </p>
              
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: taskResult.score >= 70 ? '#10b981' : '#f59e0b',
                marginBottom: '20px'
              }}>
                {taskResult.score}%
              </div>
              
              <p style={{ margin: '0 0 24px 0', color: '#94a3b8', fontSize: '14px' }}>
                {taskResult.score >= 70 ? 'Great job! You passed the task.' : 'Keep practicing to improve your score.'}
              </p>
              
              <button
                onClick={() => setShowResults(false)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Tasks Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {tasks.map(task => (
            <div key={task.id} style={{
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: 16,
              padding: '20px',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Status Badge */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                padding: '4px 8px',
                borderRadius: 12,
                fontSize: '12px',
                fontWeight: '600',
                background: task.attempt_status === 'SUBMITTED' || task.attempt_status === 'AUTO_SUBMITTED'
                  ? 'rgba(16, 185, 129, 0.2)'
                  : task.is_available
                    ? 'rgba(59, 130, 246, 0.2)'
                    : 'rgba(107, 114, 128, 0.2)',
                color: task.attempt_status === 'SUBMITTED' || task.attempt_status === 'AUTO_SUBMITTED'
                  ? '#10b981'
                  : task.is_available
                    ? '#3b82f6'
                    : '#6b7280',
                border: `1px solid ${task.attempt_status === 'SUBMITTED' || task.attempt_status === 'AUTO_SUBMITTED'
                  ? 'rgba(16, 185, 129, 0.3)'
                  : task.is_available
                    ? 'rgba(59, 130, 246, 0.3)'
                    : 'rgba(107, 114, 128, 0.3)'}`
              }}>
                {task.attempt_status === 'SUBMITTED' || task.attempt_status === 'AUTO_SUBMITTED'
                  ? 'Completed'
                  : task.is_available
                    ? 'Available'
                    : 'Expired'}
              </div>

              <div style={{ marginBottom: '16px', paddingRight: '80px' }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  color: '#e2e8f0',
                  fontSize: '18px'
                }}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p style={{
                    margin: '0 0 12px 0',
                    color: '#94a3b8',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}>
                    {task.description}
                  </p>
                )}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '16px',
                fontSize: '12px'
              }}>
                <div style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#10b981', fontWeight: '600' }}>
                    {task.duration} min
                  </div>
                  <div style={{ color: '#94a3b8' }}>Duration</div>
                </div>
                
                <div style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#8b5cf6', fontWeight: '600' }}>
                    {new Date(task.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ color: '#94a3b8' }}>Start Time</div>
                </div>
              </div>

              {task.is_available && (
                <div style={{
                  marginBottom: '16px',
                  padding: '8px 12px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: 8,
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#60a5fa'
                }}>
                  <FaClock size={12} style={{ marginRight: '6px' }} />
                  {formatTimeRemaining(task.end_time)}
                </div>
              )}

              {task.score !== null && (
                <div style={{
                  marginBottom: '16px',
                  padding: '12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: 8,
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#10b981',
                    marginBottom: '4px'
                  }}>
                    {task.score}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Your Score
                  </div>
                </div>
              )}

              <button
                onClick={() => startTask(task)}
                disabled={!task.is_available || (task.attempt_status === 'SUBMITTED' || task.attempt_status === 'AUTO_SUBMITTED')}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: task.is_available && !(task.attempt_status === 'SUBMITTED' || task.attempt_status === 'AUTO_SUBMITTED')
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'rgba(71, 85, 105, 0.3)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: task.is_available && !(task.attempt_status === 'SUBMITTED' || task.attempt_status === 'AUTO_SUBMITTED') ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {task.attempt_status === 'SUBMITTED' || task.attempt_status === 'AUTO_SUBMITTED' ? (
                  <>
                    <FaCheck size={14} />
                    Completed
                  </>
                ) : task.is_available ? (
                  <>
                    <FaPlay size={14} />
                    Start Task
                  </>
                ) : (
                  <>
                    <FaTimes size={14} />
                    Expired
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: 16,
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}>
            <FaClock size={64} style={{ marginBottom: '20px', opacity: 0.3 }} />
            <h3 style={{ margin: '0 0 12px 0', color: '#e2e8f0' }}>
              No Tasks Available
            </h3>
            <p style={{ margin: 0, color: '#94a3b8' }}>
              Check back later for new assignments from your teachers.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}