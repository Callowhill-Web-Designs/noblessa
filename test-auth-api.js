// API Test Script for Partner Resources Authentication
// Run this with: node test-auth-api.js

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Test credentials
const testCredentials = {
  valid: { username: 'ambassador', password: 'noblessa2024' },
  invalid: { username: 'invalid', password: 'wrong' }
};

async function testAPI() {
  console.log('🧪 Testing Partner Resources Authentication API\n');

  try {
    // Test 1: Invalid login
    console.log('1️⃣ Testing invalid login...');
    const invalidResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCredentials.invalid)
    });
    const invalidResult = await invalidResponse.json();
    console.log(`   Status: ${invalidResponse.status}`);
    console.log(`   Result: ${invalidResult.success ? '✅' : '❌'} ${invalidResult.message}`);

    // Test 2: Valid login
    console.log('\n2️⃣ Testing valid login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCredentials.valid)
    });
    const loginResult = await loginResponse.json();
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Result: ${loginResult.success ? '✅' : '❌'} ${loginResult.message}`);
    
    if (loginResult.success) {
      console.log(`   User: ${loginResult.user.username} (${loginResult.user.role})`);
      console.log(`   Permissions: ${loginResult.user.permissions.join(', ')}`);
    }

    // Extract session cookie for subsequent requests
    const cookies = loginResponse.headers.get('set-cookie');
    const sessionCookie = cookies ? cookies.split(';')[0] : '';

    // Test 3: Session check with valid session
    console.log('\n3️⃣ Testing session check with valid session...');
    const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: { 'Cookie': sessionCookie }
    });
    const sessionResult = await sessionResponse.json();
    console.log(`   Status: ${sessionResponse.status}`);
    console.log(`   Authenticated: ${sessionResult.authenticated ? '✅' : '❌'}`);
    
    if (sessionResult.authenticated) {
      console.log(`   User: ${sessionResult.user.username} (${sessionResult.user.role})`);
    }

    // Test 4: Protected route access
    console.log('\n4️⃣ Testing protected route access...');
    const protectedResponse = await fetch(`${BASE_URL}/api/partner/resources`, {
      headers: { 'Cookie': sessionCookie }
    });
    const protectedResult = await protectedResponse.json();
    console.log(`   Status: ${protectedResponse.status}`);
    console.log(`   Result: ${protectedResult.success ? '✅' : '❌'} ${protectedResult.message}`);

    // Test 5: Logout
    console.log('\n5️⃣ Testing logout...');
    const logoutResponse = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Cookie': sessionCookie }
    });
    const logoutResult = await logoutResponse.json();
    console.log(`   Status: ${logoutResponse.status}`);
    console.log(`   Result: ${logoutResult.success ? '✅' : '❌'} ${logoutResult.message}`);

    // Test 6: Session check after logout
    console.log('\n6️⃣ Testing session check after logout...');
    const postLogoutResponse = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: { 'Cookie': sessionCookie }
    });
    const postLogoutResult = await postLogoutResponse.json();
    console.log(`   Status: ${postLogoutResponse.status}`);
    console.log(`   Authenticated: ${postLogoutResult.authenticated ? '✅' : '❌'}`);

    console.log('\n🎉 API testing completed!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\n💡 Make sure the server is running with: npm start');
  }
}

// Run the test
testAPI();
