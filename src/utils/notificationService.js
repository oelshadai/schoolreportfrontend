import api from './api'

class NotificationService {
  constructor() {
    this.listeners = []
  }

  // Get notifications for current user
  async getNotifications() {
    try {
      const response = await api.get('/notifications/')
      return response.data.results || response.data || []
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      return []
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await api.patch(`/notifications/${notificationId}/`, { read: true })
      this.notifyListeners('read', notificationId)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      await api.post('/notifications/mark-all-read/')
      this.notifyListeners('readAll')
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  // Subscribe to notification updates
  subscribe(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  // Notify all listeners
  notifyListeners(type, data) {
    this.listeners.forEach(listener => listener({ type, data }))
  }

  // Poll for new notifications (simple polling approach)
  startPolling(interval = 30000) {
    this.pollingInterval = setInterval(async () => {
      const notifications = await this.getNotifications()
      this.notifyListeners('update', notifications)
    }, interval)
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }
}

export default new NotificationService()