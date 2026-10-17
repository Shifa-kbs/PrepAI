const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/.env' });

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('--- STARTING PHASE 1 AUTOMATED VERIFICATION ---');

  // Helper request function
  const makeRequest = (path, method = 'GET', body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const url = new URL(path, BASE_URL);
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }

      const req = http.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });

      req.on('error', (err) => reject(err));
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  try {
    // 1. Health Endpoint Test
    console.log('\n[Test 1] Testing Health Endpoint GET /api/health...');
    const health = await makeRequest('/api/health');
    console.log(`Status: ${health.status}, Response:`, health.body);
    if (health.status !== 200 || !health.body.success) {
      throw new Error('Health endpoint check failed!');
    }

    // 2. User Registration Test
    const testEmail = `student_${Date.now()}@example.com`;
    console.log(`\n[Test 2] Registering new student (${testEmail})...`);
    const regRes = await makeRequest('/api/auth/register', 'POST', {
      name: 'John Doe',
      email: testEmail,
      password: 'password123',
    });
    console.log(`Status: ${regRes.status}`);
    if (regRes.status !== 201 || !regRes.body.token) {
      throw new Error('Registration failed!');
    }
    const userToken = regRes.body.token;
    console.log('Generated JWT Token:', userToken.substring(0, 20) + '...');
    console.log('Returned User object:', regRes.body.user);
    if (regRes.body.user.password) {
      throw new Error('SECURITY VIOLATION: Password field was returned in response!');
    }

    // 3. Duplicate Email Rejection Test
    console.log('\n[Test 3] Testing duplicate email rejection...');
    const dupRes = await makeRequest('/api/auth/register', 'POST', {
      name: 'Duplicate John',
      email: testEmail,
      password: 'password123',
    });
    console.log(`Status: ${dupRes.status}, Message:`, dupRes.body.message);
    if (dupRes.status !== 400) {
      throw new Error('Duplicate email should have been rejected!');
    }

    // 4. User Login Test
    console.log('\n[Test 4] Testing User Login...');
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      email: testEmail,
      password: 'password123',
    });
    console.log(`Status: ${loginRes.status}, Token:`, loginRes.body.token ? 'Present' : 'Missing');
    if (loginRes.status !== 200 || !loginRes.body.token) {
      throw new Error('Login failed!');
    }

    // 5. Invalid Credentials Test
    console.log('\n[Test 5] Testing invalid password login...');
    const invalidLogin = await makeRequest('/api/auth/login', 'POST', {
      email: testEmail,
      password: 'wrongpassword',
    });
    console.log(`Status: ${invalidLogin.status}, Message:`, invalidLogin.body.message);
    if (invalidLogin.status !== 401) {
      throw new Error('Invalid login should be rejected with 401!');
    }

    // 6. Protected /api/auth/me Test
    console.log('\n[Test 6] Testing Protected Route GET /api/auth/me...');
    const meRes = await makeRequest('/api/auth/me', 'GET', null, userToken);
    console.log(`Status: ${meRes.status}, Profile Name:`, meRes.body.user?.name);
    if (meRes.status !== 200 || !meRes.body.user) {
      throw new Error('Protected route GET /api/auth/me failed!');
    }
    if (meRes.body.user.password) {
      throw new Error('SECURITY VIOLATION: Password returned in /api/auth/me!');
    }

    // 7. Forgot Password Test
    console.log('\n[Test 7] Testing POST /api/auth/forgot-password...');
    const forgotRes = await makeRequest('/api/auth/forgot-password', 'POST', { email: testEmail });
    console.log(`Status: ${forgotRes.status}, Message:`, forgotRes.body.message);
    if (forgotRes.status !== 200 || !forgotRes.body.resetToken) {
      throw new Error('Forgot password request failed!');
    }

    console.log('\n====================================================');
    console.log('✅ ALL PHASE 1 AUTOMATED TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ VERIFICATION TEST FAILED:', err.message);
    process.exit(1);
  }
}

// Wait 1.5 seconds for server to boot, then run tests
setTimeout(runTests, 1500);
