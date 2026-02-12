// Simple test to verify auth store behavior
const axios = require('axios');

// Test the login endpoint
async function testAuthFlow() {
  try {
    console.log('Testing auth flow...');
    
    // Test login with demo candidate
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'candidate@demo.com',
      password: 'demo123'
    });
    
    console.log('Login successful:', {
      hasToken: !!loginResponse.data.token,
      user: loginResponse.data.user?.email,
      role: loginResponse.data.user?.role
    });
    
    // Test auth/me endpoint with token
    const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('Auth/me successful:', {
      user: meResponse.data.user?.email,
      role: meResponse.data.user?.role
    });
    
    console.log('✅ Auth flow test passed!');
    
  } catch (error) {
    console.error('❌ Auth flow test failed:', error.response?.data || error.message);
  }
}

testAuthFlow();
