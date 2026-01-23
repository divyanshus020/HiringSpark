// Quick test script to verify backend API is working
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testBackend() {
    console.log('🧪 Testing Backend API...\n');

    // Test 1: Check if server is running
    try {
        console.log('1️⃣ Testing server health...');
        const response = await axios.get('http://localhost:5000/');
        console.log('✅ Server is running!');
        console.log('   Response:', response.data);
    } catch (error) {
        console.log('❌ Server is not responding');
        console.log('   Error:', error.message);
        return;
    }

    console.log('\n');

    // Test 2: Test registration endpoint
    try {
        console.log('2️⃣ Testing registration endpoint...');
        const testUser = {
            fullName: 'Test User',
            email: `test${Date.now()}@example.com`,
            phone: '9876543210',
            password: 'Test@123',
            companyName: 'Test Company',
            address: 'Test Address'
        };

        const response = await axios.post(`${API_URL}/auth/register`, testUser);
        console.log('✅ Registration successful!');
        console.log('   User ID:', response.data.user.id);
        console.log('   Token received:', response.data.token ? 'Yes' : 'No');
    } catch (error) {
        console.log('❌ Registration failed');
        console.log('   Status:', error.response?.status);
        console.log('   Message:', error.response?.data?.message);
        console.log('   Error:', error.response?.data?.error);
    }

    console.log('\n✨ Test completed!\n');
}

testBackend();
