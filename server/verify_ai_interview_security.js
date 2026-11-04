const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const aiInterviewService = require('./services/aiInterviewService');
const { errorHandler } = require('./middleware/errorMiddleware');

async function runAIInterviewSecuritySuite() {
  console.log('======================================================================');
  console.log('🧪 Starting Gemini AI Mock Interview & Security Verification Suite');
  console.log('======================================================================');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Model Configuration Check
  console.log('\n[1/4] Checking Gemini Model Configuration & Secret Safeguards...');
  const currentModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  assert(
    ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.5-flash'].includes(currentModel),
    `Supported Gemini model configured: ${currentModel}`
  );

  // 2. In-Memory DB & API Setup
  console.log('\n[2/4] Initializing isolated test environment...');
  const mongoServer = await MongoMemoryServer.create({
    instance: { dbName: 'test_prepai_interview' },
    binary: { version: '6.0.5' },
  });
  await mongoose.connect(mongoServer.getUri());

  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/interview', interviewRoutes);
  app.use(errorHandler);

  const server = app.listen(5299);
  const request = (path, method = 'GET', body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const req = http.request(
        `http://localhost:5299${path}`,
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

  const regRes = await request('/api/auth/register', 'POST', {
    name: 'Interview Candidate',
    email: 'candidate@prepai.test',
    password: 'Password123!',
  });
  assert(regRes.status === 201, 'Test candidate registered');
  const token = regRes.body.token || regRes.body.data.token;

  // 3. Graceful Error Handling When Key Missing / Live Call Without Key
  console.log('\n[3/4] Verifying Graceful Handling of Missing API Key...');
  const savedKey = process.env.GEMINI_API_KEY;
  const savedGoogleKey = process.env.GOOGLE_API_KEY;
  const savedMockAi = process.env.MOCK_AI;

  delete process.env.GEMINI_API_KEY;
  delete process.env.GOOGLE_API_KEY;
  process.env.MOCK_AI = 'false';

  const missingKeyRes = await request(
    '/api/interview/start',
    'POST',
    { jobRole: 'Full Stack Developer', interviewType: 'Technical', questionCount: 3 },
    token
  );

  assert(missingKeyRes.status === 503, 'Missing GEMINI_API_KEY returns HTTP 503');
  assert(
    missingKeyRes.body.message && missingKeyRes.body.message.includes('GEMINI_API_KEY'),
    'Clear setup instructions returned without crashing or inventing fake keys'
  );
  assert(
    !JSON.stringify(missingKeyRes.body).includes('undefined') && !missingKeyRes.body.key,
    'No sensitive internal key data exposed in error response'
  );

  // 4. Mock Mode Verification (Local Testing & Demo Fallback)
  console.log('\n[4/4] Verifying Mock Interview Mode for Local Testing...');
  process.env.MOCK_AI = 'true';

  const mockStartRes = await request(
    '/api/interview/start',
    'POST',
    {
      jobRole: 'Backend Engineer',
      interviewType: 'Technical',
      difficulty: 'Medium',
      questionCount: 3,
      topics: ['Node.js', 'PostgreSQL', 'System Design'],
    },
    token
  );

  assert(mockStartRes.status === 201, 'Mock interview started successfully (HTTP 201)');
  assert(mockStartRes.body.interview && mockStartRes.body.interview.questions.length === 3, 'Generated 3 mock interview questions');
  const interviewId = mockStartRes.body.interview._id;

  // Submit an answer in mock mode
  const answerRes = await request(
    `/api/interview/${interviewId}/answer`,
    'POST',
    {
      questionIndex: 0,
      userAnswer: 'In Node.js, the event loop handles non-blocking I/O operations using libuv, offloading heavy tasks to a worker pool while processing asynchronous callbacks on the main thread.',
    },
    token
  );

  assert(answerRes.status === 200, 'Answer evaluated successfully in mock mode (HTTP 200)');
  assert(typeof answerRes.body.evaluation.overallScore === 'number', 'Overall score calculated');
  assert(answerRes.body.evaluation.feedback && answerRes.body.evaluation.feedback.length > 0, 'Feedback provided');

  // Restore env
  if (savedKey) process.env.GEMINI_API_KEY = savedKey;
  if (savedGoogleKey) process.env.GOOGLE_API_KEY = savedGoogleKey;
  if (savedMockAi !== undefined) process.env.MOCK_AI = savedMockAi;

  // Cleanup
  server.close();
  await mongoose.disconnect();
  await mongoServer.stop();

  console.log('\n======================================================================');
  console.log(`🎉 ALL AI INTERVIEW & SECURITY CHECKS PASSED: ${passed}/${total} (100%)`);
  console.log('======================================================================');
  process.exit(0);
}

runAIInterviewSecuritySuite().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
