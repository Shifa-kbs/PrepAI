const mongoose = require('mongoose');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./index');

async function runDBConnectionVerification() {
  console.log('======================================================================');
  console.log('🧪 Starting MongoDB Connection, Fail-Fast & Buffering Timeout Test Suite');
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

  // 1. Verify .env loading and MONGODB_URI presence
  console.log('\n[1/4] Checking .env Loading & MONGODB_URI Configuration...');
  assert(Boolean(process.env.MONGODB_URI), 'process.env.MONGODB_URI is successfully loaded');
  assert(mongoose.get('bufferCommands') === false, 'Mongoose bufferCommands is set to false globally');

  // Start ephemeral test server using index app
  const server = app.listen(0);
  const port = server.address().port;
  console.log(`  [Test Server] Running on ephemeral port ${port}`);

  const request = (path, method = 'GET', body = null) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const req = http.request(
        `http://localhost:${port}${path}`,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            const durationMs = Date.now() - startTime;
            try {
              resolve({ status: res.statusCode, body: JSON.parse(data), durationMs });
            } catch (e) {
              resolve({ status: res.statusCode, body: data, durationMs });
            }
          });
        }
      );
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  // 2. Disconnected State Tests (Fail-Fast Protection)
  console.log('\n[2/4] Testing Disconnected State & Fail-Fast Behavior (Before DB Connection)...');
  // Ensure disconnected
  await mongoose.disconnect();
  assert(mongoose.connection.readyState === 0, 'Mongoose state confirmed disconnected (readyState: 0)');

  // Health endpoint should still return 200 with disconnected DB state
  const healthRes = await request('/api/health', 'GET');
  assert(healthRes.status === 200, 'GET /api/health returns HTTP 200 while DB is disconnected');
  assert(healthRes.body.database?.status === 'disconnected', 'Health response accurately reports database disconnected');

  // Login request should FAIL FAST with HTTP 503 and clear actionable message (NOT hang for 10000ms!)
  const loginRes = await request('/api/auth/login', 'POST', {
    email: 'test@example.com',
    password: 'Password123!',
  });

  assert(loginRes.status === 503, 'POST /api/auth/login immediately returns HTTP 503 Service Unavailable');
  assert(loginRes.durationMs < 1000, `Request returned immediately in ${loginRes.durationMs}ms (no 10000ms freeze)`);
  assert(loginRes.body.code === 'DATABASE_UNAVAILABLE', 'Response returns code DATABASE_UNAVAILABLE');
  assert(
    loginRes.body.message && loginRes.body.message.includes('MongoDB Atlas'),
    'Response message contains actionable Atlas IP whitelist guidance'
  );

  // 3. Connected State Tests
  console.log('\n[3/4] Connecting In-Memory Database to Verify Connected State Flow...');
  const mongoServer = await MongoMemoryServer.create({
    instance: { dbName: 'prepai_test' },
    binary: { version: '6.0.5' },
  });
  await mongoose.connect(mongoServer.getUri(), {
    dbName: 'prepai',
    serverSelectionTimeoutMS: 5000,
  });

  assert(mongoose.connection.readyState === 1, 'Mongoose connected (readyState: 1)');

  const connectedHealth = await request('/api/health', 'GET');
  assert(connectedHealth.status === 200, 'GET /api/health returns HTTP 200');
  assert(connectedHealth.body.database?.status === 'connected', 'Health response reports database connected');

  // Register and Login should now proceed normally
  const registerRes = await request('/api/auth/register', 'POST', {
    name: 'Verified User',
    email: 'verified_db@prepai.test',
    password: 'Password123!',
  });
  assert(registerRes.status === 201, 'POST /api/auth/register succeeds with HTTP 201 once DB is connected');

  const connectedLogin = await request('/api/auth/login', 'POST', {
    email: 'verified_db@prepai.test',
    password: 'Password123!',
  });
  assert(connectedLogin.status === 200, 'POST /api/auth/login succeeds with HTTP 200 once DB is connected');
  assert(connectedLogin.body.token !== undefined, 'Login issues JWT token');

  // 4. Cleanup
  console.log('\n[4/4] Cleaning up test server and in-memory database...');
  server.close();
  await mongoose.disconnect();
  await mongoServer.stop();

  console.log('\n======================================================================');
  console.log(`🎉 ALL DB CONNECTION & FAIL-FAST CHECKS PASSED: ${passed}/${total} (100%)`);
  console.log('======================================================================');
  process.exit(0);
}

runDBConnectionVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
