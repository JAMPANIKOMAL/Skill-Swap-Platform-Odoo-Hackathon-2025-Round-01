const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function testIntegration() {
  console.log('🚀 Testing Frontend-Backend Integration...\n');

  const results = {
    backend: false,
    frontend: false,
    database: false,
    websocket: false,
    auth: false
  };

  try {
    // 1. Test Backend Health
    console.log('1. Testing Backend Health...');
    try {
      const healthResponse = await fetch('http://localhost:5000/health');
      if (healthResponse.ok) {
        console.log('✅ Backend is running');
        results.backend = true;
      } else {
        console.log('❌ Backend health check failed');
      }
    } catch (error) {
      console.log('❌ Backend is not running');
      console.log('   Start backend with: cd backend && npm start');
    }

    // 2. Test Database Connection
    console.log('\n2. Testing Database Connection...');
    try {
      const skillsResponse = await fetch(`${API_BASE_URL}/skills/popular`);
      if (skillsResponse.ok) {
        console.log('✅ Database connection working');
        results.database = true;
      } else {
        console.log('❌ Database connection failed');
      }
    } catch (error) {
      console.log('❌ Database connection error');
    }

    // 3. Test Authentication
    console.log('\n3. Testing Authentication...');
    try {
      const testUser = {
        name: 'Integration Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        location: 'Test City',
        skillsOffered: ['JavaScript', 'React'],
        skillsWanted: ['Python', 'Machine Learning'],
        availability: 'Flexible'
      };

      // Register user
      const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });

      if (registerResponse.ok) {
        console.log('✅ User registration working');
        
        // Login user
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testUser.email,
            password: testUser.password,
          }),
        });

        if (loginResponse.ok) {
          console.log('✅ User login working');
          results.auth = true;
        } else {
          console.log('❌ User login failed');
        }
      } else {
        console.log('❌ User registration failed');
      }
    } catch (error) {
      console.log('❌ Authentication test failed');
    }

    // 4. Test API Endpoints
    console.log('\n4. Testing API Endpoints...');
    try {
      const endpoints = [
        { name: 'Users', url: `${API_BASE_URL}/users` },
        { name: 'Skills', url: `${API_BASE_URL}/skills/popular` },
        { name: 'Categories', url: `${API_BASE_URL}/skills/categories` }
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url);
          if (response.ok) {
            console.log(`✅ ${endpoint.name} endpoint working`);
          } else {
            console.log(`❌ ${endpoint.name} endpoint failed`);
          }
        } catch (error) {
          console.log(`❌ ${endpoint.name} endpoint error`);
        }
      }
    } catch (error) {
      console.log('❌ API endpoints test failed');
    }

    // 5. Test Frontend (if running)
    console.log('\n5. Testing Frontend...');
    try {
      const frontendResponse = await fetch('http://localhost:5173');
      if (frontendResponse.ok) {
        console.log('✅ Frontend is running');
        results.frontend = true;
      } else {
        console.log('❌ Frontend is not responding');
      }
    } catch (error) {
      console.log('❌ Frontend is not running');
      console.log('   Start frontend with: npm run dev');
    }

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
  }

  // Summary
  console.log('\n📊 Integration Test Summary:');
  console.log('=============================');
  console.log(`Backend:     ${results.backend ? '✅' : '❌'}`);
  console.log(`Frontend:    ${results.frontend ? '✅' : '❌'}`);
  console.log(`Database:    ${results.database ? '✅' : '❌'}`);
  console.log(`WebSocket:   ${results.websocket ? '✅' : '❌'}`);
  console.log(`Auth:        ${results.auth ? '✅' : '❌'}`);

  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Your application is ready to use.');
    console.log('\nNext steps:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Click the user icon to create an account');
    console.log('3. Start exploring the application!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
    console.log('\nTroubleshooting:');
    console.log('1. Ensure MongoDB is running');
    console.log('2. Start backend: cd backend && npm start');
    console.log('3. Start frontend: npm run dev');
    console.log('4. Check environment variables in backend/.env');
  }

  console.log('\n🏁 Integration testing completed!');
}

// Run the integration test
testIntegration(); 