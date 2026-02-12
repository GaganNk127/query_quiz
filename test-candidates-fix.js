// Test script to verify the candidate listing fix
const axios = require('axios');

async function testCandidateListing() {
  try {
    console.log('🧪 Testing Candidate Listing Fix\n');
    
    // First login as recruiter
    console.log('1. Logging in as recruiter...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'recruiter@demo.com',
      password: 'demo123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test candidate listing
    console.log('\n2. Fetching candidates for recruiter...');
    const candidatesResponse = await axios.get('http://localhost:5000/api/candidates', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Candidates fetched successfully');
    console.log(`📊 Found ${candidatesResponse.data.candidates.length} candidates`);
    console.log(`📄 Pagination: ${candidatesResponse.data.pagination.total} total candidates`);
    
    // Display first few candidates
    if (candidatesResponse.data.candidates.length > 0) {
      console.log('\n📋 Sample candidates:');
      candidatesResponse.data.candidates.slice(0, 3).forEach((candidate, index) => {
        console.log(`${index + 1}. ${candidate.user?.name || 'Unknown'} - ${candidate.user?.email || 'No email'}`);
        if (candidate.appliedJobs && candidate.appliedJobs.length > 0) {
          console.log(`   Applied to: ${candidate.appliedJobs.map(app => app.job?.title || 'Unknown').join(', ')}`);
        }
        console.log(`   ATS Score: ${candidate.atsScore || 'N/A'}`);
      });
    }
    
    console.log('\n✅ Candidate listing test passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testCandidateListing();
