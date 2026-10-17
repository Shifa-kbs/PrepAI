const mongoose = require('mongoose');
const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config({ path: __dirname + '/.env' });

const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

let server;
let mongoServer;

async function runVerification() {
  console.log('--- Starting Phase 2 End-to-End API & Auth Flow Verification ---');

  mongoServer = await MongoMemoryServer.create({
    instance: { dbName: 'test_prepai_phase2' },
    binary: { version: '6.0.5' },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log('✅ In-memory MongoDB connected at:', uri);

  const testEmail = 'phase2test_' + Date.now() + '@prepai.dev';

  server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api/auth`;
    console.log(`[Test Server] Listening on port ${port}`);

    try {
      // 1. Register User Test
      console.log('\n1. Testing Registration (POST /api/auth/register)...');
      const regData = JSON.stringify({
        name: 'Phase 2 Test User',
        email: testEmail,
        password: 'Password123!',
      });

      const regRes = await makeRequest(`${baseUrl}/register`, 'POST', regData);
      console.log('Registration Status:', regRes.status);
      console.log('Registration User Name:', regRes.body.user?.name);
      console.log('Token Received:', regRes.body.token ? 'YES' : 'NO');
      if (regRes.status !== 201 || !regRes.body.token || !regRes.body.user) {
        throw new Error('Registration failed!');
      }
      const token = regRes.body.token;

      // 2. Duplicate Registration Test
      console.log('\n2. Testing Duplicate Registration Error Handling...');
      const dupRes = await makeRequest(`${baseUrl}/register`, 'POST', regData);
      console.log('Duplicate Reg Status:', dupRes.status);
      console.log('Duplicate Reg Message:', dupRes.body.message);
      if (dupRes.status !== 400) {
        throw new Error('Duplicate registration check failed!');
      }

      // 3. Login User Test
      console.log('\n3. Testing Login (POST /api/auth/login)...');
      const loginData = JSON.stringify({
        email: testEmail,
        password: 'Password123!',
      });
      const loginRes = await makeRequest(`${baseUrl}/login`, 'POST', loginData);
      console.log('Login Status:', loginRes.status);
      console.log('Login User Name:', loginRes.body.user?.name);
      if (loginRes.status !== 200 || !loginRes.body.token) {
        throw new Error('Login failed!');
      }

      // 4. Invalid Password Login Test
      console.log('\n4. Testing Invalid Password Handling...');
      const badLoginData = JSON.stringify({
        email: testEmail,
        password: 'WrongPassword!',
      });
      const badLoginRes = await makeRequest(`${baseUrl}/login`, 'POST', badLoginData);
      console.log('Bad Login Status:', badLoginRes.status);
      console.log('Bad Login Message:', badLoginRes.body.message);
      if (badLoginRes.status !== 401) {
        throw new Error('Invalid credentials check failed!');
      }

      // 5. Auth Persistence / Current User GET /api/auth/me
      console.log('\n5. Testing Session Restoration (GET /api/auth/me)...');
      const meRes = await makeRequest(`${baseUrl}/me`, 'GET', null, {
        Authorization: `Bearer ${token}`,
      });
      console.log('GET /me Status:', meRes.status);
      console.log('GET /me User Email:', meRes.body.user?.email);
      if (meRes.status !== 200 || meRes.body.user.email !== testEmail) {
        throw new Error('GET /api/auth/me failed!');
      }

      // 6. Forgot Password Test
      console.log('\n6. Testing Forgot Password (POST /api/auth/forgot-password)...');
      const forgotData = JSON.stringify({ email: testEmail });
      const forgotRes = await makeRequest(`${baseUrl}/forgot-password`, 'POST', forgotData);
      console.log('Forgot Password Status:', forgotRes.status);
      console.log('Reset Token Generated:', forgotRes.body.resetToken ? 'YES' : 'NO');
      if (forgotRes.status !== 200 || !forgotRes.body.resetToken) {
        throw new Error('Forgot password failed!');
      }
      const resetToken = forgotRes.body.resetToken;

      // 7. Reset Password Test
      console.log('\n7. Testing Reset Password (POST /api/auth/reset-password/:token)...');
      const resetData = JSON.stringify({ password: 'NewSecurePassword123!' });
      const resetRes = await makeRequest(`${baseUrl}/reset-password/${resetToken}`, 'POST', resetData);
      console.log('Reset Password Status:', resetRes.status);
      console.log('Reset Password Message:', resetRes.body.message);
      if (resetRes.status !== 200) {
        throw new Error('Reset password failed!');
      }

      // 8. Verify Login with New Password
      console.log('\n8. Verifying Login with New Password...');
      const newLoginData = JSON.stringify({
        email: testEmail,
        password: 'NewSecurePassword123!',
      });
      const newLoginRes = await makeRequest(`${baseUrl}/login`, 'POST', newLoginData);
      console.log('New Password Login Status:', newLoginRes.status);
      if (newLoginRes.status !== 200) {
        throw new Error('Login with new password failed!');
      }

      console.log('\n======================================================');
      console.log('🎉 ALL PHASE 2 AUTHENTICATION & API FLOW TESTS PASSED!');
      console.log('======================================================\n');
      
      server.close();
      await mongoose.disconnect();
      await mongoServer.stop();
      process.exit(0);
    } catch (err) {
      console.error('\n❌ Verification Failed:', err);
      if (server) server.close();
      if (mongoServer) await mongoServer.stop();
      process.exit(1);
    }
  });
}

function makeRequest(urlStr, method, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (data) {
      reqHeaders['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

runVerification();
