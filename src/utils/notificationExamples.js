// Add to existing files to trigger notifications

// In Teachers.jsx - when teacher is added
import { useNotifications } from '../components/NotificationSystem'

const { addNotification } = useNotifications()

// After successful teacher creation:
addNotification({
  title: 'Teacher Added',
  message: `${formData.first_name} ${formData.last_name} has been added successfully`,
  type: 'success'
})

// In Students.jsx - when student is added
addNotification({
  title: 'Student Added', 
  message: `${formData.first_name} ${formData.last_name} has been enrolled`,
  type: 'success'
})

// In Reports.jsx - when report is generated
addNotification({
  title: 'Report Generated',
  message: `Report for ${selectedClass} has been generated successfully`,
  type: 'success'
})

// In VirtualClassroom.jsx - when session starts
addNotification({
  title: 'Session Started',
  message: `Virtual classroom "${session.title}" is now live`,
  type: 'info'
})

// In EnterScores.jsx - when scores are saved
addNotification({
  title: 'Scores Saved',
  message: `Scores for ${selectedSubject} have been saved successfully`,
  type: 'success'
})

// Error notifications
addNotification({
  title: 'Error',
  message: 'Failed to save data. Please try again.',
  type: 'error'
})