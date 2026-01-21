// Debug script to check API configuration
console.log('Environment variables:')
console.log('VITE_API_BASE:', import.meta.env.VITE_API_BASE)
console.log('NODE_ENV:', import.meta.env.NODE_ENV)
console.log('PROD:', import.meta.env.PROD)
console.log('DEV:', import.meta.env.DEV)

console.log('\nWindow location:')
console.log('hostname:', window.location.hostname)
console.log('origin:', window.location.origin)

// Test API base URL logic
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE.replace(/\/$/, '')
  }
  
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  const isProduction = hostname.includes('onrender.com') || 
                      hostname.includes('netlify.app') || 
                      hostname.includes('vercel.app') || 
                      import.meta.env.PROD
  
  if (isProduction) {
    return 'https://school-report-saas.onrender.com/api'
  }
  
  return 'http://localhost:8000/api'
}

console.log('\nCalculated API base URL:', getApiBaseUrl())