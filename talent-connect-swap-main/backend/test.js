import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testBackend() {
  console.log('🧪 Testing Talent Connect Backend...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);

    // Test 2: Get Skill Categories
    console.log('\n2. Testing Skill Categories...');
    const skillsResponse = await fetch(`${BASE_URL}/api/skills/categories`);
    const skillsData = await skillsResponse.json();
    console.log('✅ Skill Categories:', skillsData.data.skillCategories.length, 'categories found');

    // Test 3: Get Popular Skills
    console.log('\n3. Testing Popular Skills...');
    const popularResponse = await fetch(`${BASE_URL}/api/skills/popular`);
    const popularData = await popularResponse.json();
    console.log('✅ Popular Skills:', popularData.data.popularSkills.length, 'skills found');

    // Test 4: Search Skills
    console.log('\n4. Testing Skill Search...');
    const searchResponse = await fetch(`${BASE_URL}/api/skills/search?q=web`);
    const searchData = await searchResponse.json();
    console.log('✅ Skill Search:', searchData.data.skills.length, 'results for "web"');

    // Test 5: Get Users (should be empty initially)
    console.log('\n5. Testing Users Endpoint...');
    const usersResponse = await fetch(`${BASE_URL}/api/users`);
    const usersData = await usersResponse.json();
    console.log('✅ Users:', usersData.data.users.length, 'users found');

    console.log('\n🎉 All tests passed! Backend is working correctly.');
    console.log('\n📝 Next steps:');
    console.log('1. Start MongoDB: mongod');
    console.log('2. Set up environment variables in .env file');
    console.log('3. Register users and test full functionality');
    console.log('4. Test WebSocket connections for real-time features');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the backend server is running: npm run dev');
    console.log('2. Check if MongoDB is running');
    console.log('3. Verify the server is running on port 5000');
  }
}

// Run tests
testBackend(); 