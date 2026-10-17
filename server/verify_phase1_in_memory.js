const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config({ path: __dirname + '/.env' });

const User = require('./models/User');
const Question = require('./models/Question');
const QuestionProgress = require('./models/QuestionProgress');
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const seedDatabase = require('./services/seedService');

async function runCompleteTestBattery() {
  console.log('====================================================');
  console.log('--- STARTING PHASE 1 COMPLETE TEST BATTERY ---');
  console.log('====================================================');

  let mongoServer;
  try {
    // 1. Spin up MongoMemoryServer for isolated verification
    console.log('\n[1/8] Starting isolated test MongoDB instance...');
    mongoServer = await MongoMemoryServer.create({
      instance: { dbName: 'test_prepai' },
      binary: { version: '6.0.5' },
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected in-memory at:', uri);

    // 2. Initialize test Express app
    console.log('\n[2/8] Setting up Express app & auth routes...');
    const app = express();
    app.use(express.json());
    app.get('/api/health', (req, res) => res.json({ success: true, message: 'PrepAI API is running' }));
    app.use('/api/auth', authRoutes);
    app.use(errorHandler);

    const server = app.listen(5099);
    console.log('✅ Test server listening on port 5099');

    const request = (path, method = 'GET', body = null, token = null) => {
      return new Promise((resolve, reject) => {
        const req = http.request(
          `http://localhost:5099${path}`,
          {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                resolve({ status: res.statusCode, body: JSON.parse(data) });
              } catch (e) {
                resolve({ status: res.statusCode, body: data });
              }
            });
          }
        );
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
      });
    };

    // 3. Test Health Endpoint
    console.log('\n[3/8] Testing Health Endpoint GET /api/health...');
    const health = await request('/api/health');
    console.log(`Status: ${health.status}, Body:`, health.body);
    if (health.status !== 200 || !health.body.success) throw new Error('Health check failed');
    console.log('✅ Health endpoint verified!');

    // 4. Test User Registration & Password Hashing / Security
    console.log('\n[4/8] Testing User Registration POST /api/auth/register...');
    const regRes = await request('/api/auth/register', 'POST', {
      name: 'Test Student',
      email: 'student@example.com',
      password: 'SecurePassword123!',
    });
    console.log(`Status: ${regRes.status}, User ID: ${regRes.body.user?._id}`);
    if (regRes.status !== 201 || !regRes.body.token) throw new Error('Registration failed');
    if (regRes.body.user.password) throw new Error('Password field exposed in registration response!');
    console.log('✅ Registration success! Password is not exposed. Token received.');

    // 5. Test Duplicate Email Rejection
    console.log('\n[5/8] Testing Duplicate Email Rejection...');
    const dupRes = await request('/api/auth/register', 'POST', {
      name: 'Duplicate Student',
      email: 'student@example.com',
      password: 'SecurePassword123!',
    });
    console.log(`Status: ${dupRes.status}, Message: "${dupRes.body.message}"`);
    if (dupRes.status !== 400) throw new Error('Duplicate registration should return 400');
    console.log('✅ Duplicate email rejected cleanly with 400!');

    // 6. Test Login & Invalid Credentials
    console.log('\n[6/8] Testing Login & Invalid Credentials...');
    const invalidLogin = await request('/api/auth/login', 'POST', {
      email: 'student@example.com',
      password: 'wrongpassword',
    });
    console.log(`Invalid Password Status: ${invalidLogin.status} (Expected 401)`);
    if (invalidLogin.status !== 401) throw new Error('Invalid login should return 401');

    const validLogin = await request('/api/auth/login', 'POST', {
      email: 'student@example.com',
      password: 'SecurePassword123!',
    });
    console.log(`Valid Login Status: ${validLogin.status}, Token: ${validLogin.body.token ? 'Present' : 'Missing'}`);
    if (validLogin.status !== 200 || !validLogin.body.token) throw new Error('Valid login failed');
    if (validLogin.body.user.password) throw new Error('Password field exposed in login response!');
    console.log('✅ Login verified! Invalid credentials rejected, valid credentials issued JWT.');

    const token = validLogin.body.token;

    // 7. Test Protected GET /api/auth/me
    console.log('\n[7/8] Testing Protected GET /api/auth/me...');
    const meRes = await request('/api/auth/me', 'GET', null, token);
    console.log(`Status: ${meRes.status}, Name: ${meRes.body.user?.name}, Role: ${meRes.body.user?.role}`);
    if (meRes.status !== 200 || meRes.body.user?.email !== 'student@example.com') throw new Error('GET /api/auth/me failed');
    if (meRes.body.user.password) throw new Error('Password field exposed in /api/auth/me!');
    console.log('✅ Protected endpoint verified! JWT validation & user attachment working.');

    // 8. Test Database Seeder & Question Model Security (Select: false)
    console.log('\n[8/8] Testing Database Seeder & Question Protection...');
    await seedDatabase({ skipDisconnect: true });
    const questionCount = await Question.countDocuments();
    const categories = await Question.distinct('category');
    console.log(`Seeded Questions Count: ${questionCount}`);
    console.log(`Seeded Categories (${categories.length}):`, categories.join(', '));

    const sampleQ = await Question.findOne({ title: 'Two Sum Problem' });
    console.log('Queried Question sample (public fields):', {
      title: sampleQ.title,
      category: sampleQ.category,
      sampleAnswer: sampleQ.sampleAnswer, // Should be undefined because select: false
      explanation: sampleQ.explanation,   // Should be undefined because select: false
    });

    if (sampleQ.sampleAnswer !== undefined || sampleQ.explanation !== undefined) {
      throw new Error('Answer security violation: select: false failed on Question model!');
    }
    console.log('✅ Question answer protection verified! Answer fields are hidden by default.');

    console.log('\n====================================================');
    console.log('🎉 ALL PHASE 1 TEST BATTERY CHECKS PASSED 100%! 🎉');
    console.log('====================================================');

    server.close();
    await mongoose.disconnect();
    await mongoServer.stop();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ PHASE 1 TEST FAILED:', err.message);
    if (mongoServer) await mongoServer.stop();
    process.exit(1);
  }
}

runCompleteTestBattery();
