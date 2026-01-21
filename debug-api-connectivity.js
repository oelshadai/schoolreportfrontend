// Frontend API Debug Script
// Run this in browser console to test API connectivity

const debugAPI = async () => {
  console.log('🔍 Starting API Debug...');
  
  const baseURL = 'https://school-report-saas.onrender.com/api';
  
  // Test 1: Basic API connectivity
  try {
    console.log('📡 Testing basic API connectivity...');
    const response = await fetch(`${baseURL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`✅ API Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log('📊 API Response:', data);
    }
  } catch (error) {
    console.error('❌ API connectivity failed:', error);
  }
  
  // Test 2: CORS preflight
  try {
    console.log('🌐 Testing CORS configuration...');
    const response = await fetch(`${baseURL}/auth/login/`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization'
      }
    });
    
    console.log(`✅ CORS Status: ${response.status}`);
    console.log('🔧 CORS Headers:', Object.fromEntries(response.headers.entries()));
  } catch (error) {
    console.error('❌ CORS test failed:', error);
  }
  
  // Test 3: Login endpoint
  try {
    console.log('🔐 Testing login endpoint...');
    const response = await fetch(`${baseURL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        password: 'test'
      })
    });
    
    console.log(`✅ Login endpoint status: ${response.status}`);
    if (response.status !== 500) {
      const data = await response.json();
      console.log('📊 Login response:', data);
    }
  } catch (error) {
    console.error('❌ Login test failed:', error);
  }
  
  console.log('🏁 API Debug completed');
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
  debugAPI();
}

// Export for manual use
window.debugAPI = debugAPI;