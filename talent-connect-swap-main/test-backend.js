const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function testBackend() {
  console.log('🧪 Testing Backend Connectivity...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:5000/health');
    if (healthResponse.ok) {
      console.log('✅ Health check passed');
    } else {
      console.log('❌ Health check failed');
    }

    // Test skills endpoint
    console.log('\n2. Testing skills endpoint...');
    const skillsResponse = await fetch(`${API_BASE_URL}/skills/popular`);
    if (skillsResponse.ok) {
      const skillsData = await skillsResponse.json();
      console.log('✅ Skills endpoint working');
      console.log(`   Found ${skillsData.data.popularSkills.length} popular skills`);
    } else {
      console.log('❌ Skills endpoint failed');
    }

    // Test user registration
    console.log('\n3. Testing user registration...');
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      location: 'Test City',
      skillsOffered: ['JavaScript', 'React'],
      skillsWanted: ['Python', 'Machine Learning'],
      availability: 'Flexible'
    };

    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ User registration working');
      console.log(`   Created user: ${registerData.data.user.name}`);
      
      // Test login
      console.log('\n4. Testing user login...');
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ User login working');
        console.log(`   Logged in as: ${loginData.data.user.name}`);
        
        // Test authenticated endpoint
        console.log('\n5. Testing authenticated endpoint...');
        const usersResponse = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${loginData.data.token}`,
          },
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          console.log('✅ Authenticated endpoint working');
          console.log(`   Found ${usersData.data.users.length} users`);
        } else {
          console.log('❌ Authenticated endpoint failed');
        }
      } else {
        console.log('❌ User login failed');
      }
    } else {
      console.log('❌ User registration failed');
      const errorData = await registerResponse.json();
      console.log(`   Error: ${errorData.error}`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Backend testing completed!');
}

// Run the test
testBackend(); 