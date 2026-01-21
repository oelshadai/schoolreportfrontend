// Debug script to check URL configuration
console.log('=== URL DEBUG INFO ===')
console.log('window.location.hostname:', window.location.hostname)
console.log('window.location.origin:', window.location.origin)
console.log('import.meta.env.VITE_API_BASE:', import.meta.env.VITE_API_BASE)
console.log('import.meta.env.PROD:', import.meta.env.PROD)

// Test the URL logic from different files
const testApiUrl1 = () => {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE.replace(/\/$/, '')
  }
  
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  
  if (hostname.includes('netlify.app') || 
      hostname.includes('vercel.app') || 
      hostname.includes('render.com') ||
      hostname !== 'localhost') {
    return 'https://school-report-saas.onrender.com/api'
  }
  
  return 'http://localhost:8000/api'
}

console.log('Expected API URL (apiClient logic):', testApiUrl1())

// Check if there's any code using current hostname
const wrongUrl = `https://${window.location.hostname}/api`
console.log('WRONG URL (if using current hostname):', wrongUrl)
console.log('CORRECT URL should be:', 'https://school-report-saas.onrender.com/api')