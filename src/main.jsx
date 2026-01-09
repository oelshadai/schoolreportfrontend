import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './state/AuthContext'
import './styles.css'
import './styles/design-system.css'
import './styles/responsive-layout.css'
import './styles/styles-dark-green-theme.css'
import './styles-responsive-system.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

// Register Service Worker for PWA (only in production builds)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = '/sw.js'
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) navigator.serviceWorker.register(swUrl).catch(() => {})
    })
  })
}
