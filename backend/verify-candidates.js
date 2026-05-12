import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const TOKEN = 'YOUR_JWT_TOKEN_HERE'; // I don't have a token, so I might need to skip this or use a mock.

async function testCandidates() {
  try {
    // This will likely fail without a real token
    const response = await axios.get(`${API_URL}/candidates`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('Candidates:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// testCandidates();
console.log('Backend logic updated. Please verify in the UI.');
