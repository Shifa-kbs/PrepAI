const mongoose = require('mongoose');
const http = require('http');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/.env' });

const app = require('./index');
const User = require('./models/User');
const Question = require('./models/Question');
const QuestionProgress = require('./models/QuestionProgress');

function makeRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqHeaders = { ...headers };
    if (data) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch (e) {
            parsed = body;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runMultiUserVerification() {
  console.log('========================================================');
  console.log('--- STARTING MULTI-USER ISOLATION & SECURITY TEST ---');
  console.log('========================================================');

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api`;
    console.log(`[Test Server] Running on ephemeral port ${port}`);

    const userA_Email = `alice_${Date.now()}@prepai.dev`;
    const userB_Email = `bob_${Date.now()}@prepai.dev`;
    const password = 'Password123!';

    try {
      // Wait for Mongoose connection if currently connecting
      if (mongoose.connection.readyState !== 1) {
        console.log(`[Setup] Waiting for MongoDB connection (current readyState: ${mongoose.connection.readyState})...`);
        await new Promise((resolve, reject) => {
          if (mongoose.connection.readyState === 1) return resolve();
          const timer = setTimeout(() => {
            if (mongoose.connection.readyState === 1) resolve();
            else reject(new Error(`Timed out waiting for MongoDB connection (readyState: ${mongoose.connection.readyState})`));
          }, 8000);
          mongoose.connection.once('connected', () => {
            clearTimeout(timer);
            resolve();
          });
          mongoose.connection.once('error', (err) => {
            clearTimeout(timer);
            reject(err);
          });
        });
        console.log('✅ MongoDB connection ready');
      }

      // 1. Register User A
      console.log('\n[Step 1] Registering User A (Alice)...');
      const regA = await makeRequest(
        `${baseUrl}/auth/register`,
        'POST',
        JSON.stringify({ name: 'Alice Developer', email: userA_Email, password })
      );
      if (regA.status !== 201) throw new Error('Failed to register Alice: ' + JSON.stringify(regA.body));
      const tokenA = regA.body.token;
      const headersA = { Authorization: `Bearer ${tokenA}` };
      console.log('✅ User A registered successfully.');

      // 2. Register User B
      console.log('\n[Step 2] Registering User B (Bob)...');
      const regB = await makeRequest(
        `${baseUrl}/auth/register`,
        'POST',
        JSON.stringify({ name: 'Bob Engineer', email: userB_Email, password })
      );
      if (regB.status !== 201) throw new Error('Failed to register Bob: ' + JSON.stringify(regB.body));
      const tokenB = regB.body.token;
      const headersB = { Authorization: `Bearer ${tokenB}` };
      console.log('✅ User B registered successfully.');

      // 3. User A lists questions
      const listRes = await makeRequest(`${baseUrl}/questions`, 'GET', null, headersA);
      if (!listRes.body.questions || listRes.body.questions.length === 0) {
        throw new Error('No questions found in database');
      }
      const mcqDoc = await Question.findOne({ correctAnswerIndex: { $exists: true, $ne: null } }).select('+correctAnswerIndex +explanation +sampleAnswer');
      const testQ = mcqDoc || listRes.body.questions[0];
      const qId = testQ._id;
      console.log(`\n[Step 3] Picked test question "${testQ.title}" (${qId})`);

      // 4. Verify unattempted detail response strictly omits sensitive fields
      console.log('\n[Step 4] Checking unattempted question security for User A & User B...');
      const detailA = await makeRequest(`${baseUrl}/questions/${qId}`, 'GET', null, headersA);
      if (detailA.body.question.explanation || detailA.body.question.sampleAnswer || detailA.body.question.correctAnswerIndex !== undefined) {
        throw new Error('Sensitive fields leaked in question detail to unattempted user!');
      }
      console.log('✅ Sensitive fields strictly omitted for unattempted user.');

      // 5. User A submits correct answer and adds private note
      console.log('\n[Step 5] User A solves question and saves private note...');
      const dbQ = await Question.findById(qId).select('+correctAnswerIndex +explanation +sampleAnswer');
      const correctIdx = dbQ.correctAnswerIndex ?? 0;

      const submitA = await makeRequest(
        `${baseUrl}/questions/${qId}/submit`,
        'POST',
        JSON.stringify({ selectedAnswerIndex: correctIdx, timeSpentSeconds: 50 }),
        headersA
      );
      if (submitA.status !== 200 || !submitA.body.isCorrect) {
        throw new Error('User A answer submission failed: ' + JSON.stringify(submitA.body));
      }

      const aliceNote = 'Alice private note: Remember to mention hash map buckets.';
      const noteA = await makeRequest(
        `${baseUrl}/questions/${qId}/notes`,
        'PUT',
        JSON.stringify({ notes: aliceNote }),
        headersA
      );
      if (noteA.status !== 200 || noteA.body.notes !== aliceNote) {
        throw new Error('User A note save failed');
      }

      const bmA = await makeRequest(`${baseUrl}/questions/${qId}/bookmark`, 'POST', null, headersA);
      if (bmA.body.isBookmarked !== true) throw new Error('User A bookmark failed');
      console.log('✅ User A successfully solved question, bookmarked it, and attached private notes.');

      // 6. User B accesses the same question - MUST NOT SEE User A's progress, status, bookmark, or notes!
      console.log('\n[Step 6] Testing User B isolation on the same question...');
      const detailB = await makeRequest(`${baseUrl}/questions/${qId}`, 'GET', null, headersB);

      // Verify User B does not see explanation before they attempt it
      if (detailB.body.question.explanation !== undefined) {
        throw new Error('ISOLATION LEAK: User B can see explanation because User A solved it!');
      }

      // Verify User B's progress is pristine (unsolved, 0 attempts, not bookmarked, no notes)
      if (detailB.body.userProgress?.status !== 'unsolved') {
        throw new Error(`ISOLATION LEAK: User B got status "${detailB.body.userProgress?.status}" instead of "unsolved"`);
      }
      if (detailB.body.userProgress?.attempts !== 0) {
        throw new Error(`ISOLATION LEAK: User B got ${detailB.body.userProgress?.attempts} attempts`);
      }
      if (detailB.body.userProgress?.notes) {
        throw new Error(`ISOLATION LEAK: User B saw User A private notes: "${detailB.body.userProgress?.notes}"`);
      }
      if (detailB.body.userProgress?.isBookmarked !== false) {
        throw new Error('ISOLATION LEAK: User B got isBookmarked true from User A');
      }
      console.log('✅ Multi-user isolation verified: User B sees completely isolated progress & no leaked notes.');

      // 7. Check User B's direct progress endpoint
      console.log('\n[Step 7] Checking User B GET /api/questions/:id/progress...');
      const progB = await makeRequest(`${baseUrl}/questions/${qId}/progress`, 'GET', null, headersB);
      if (progB.body.progress.status !== 'unsolved' || progB.body.progress.notes !== '') {
        throw new Error('Progress endpoint leaked another user data: ' + JSON.stringify(progB.body));
      }
      console.log('✅ User B progress endpoint strictly returns isolated empty state.');

      // 8. Test Reveal Action endpoint for User B
      console.log('\n[Step 8] Testing Reveal Solution endpoint (POST /api/questions/:id/reveal)...');
      const revealRes = await makeRequest(
        `${baseUrl}/questions/${qId}/reveal`,
        'POST',
        JSON.stringify({ timeSpentSeconds: 20 }),
        headersB
      );
      if (revealRes.status !== 200 || !revealRes.body.explanation) {
        throw new Error('Reveal endpoint failed: ' + JSON.stringify(revealRes.body));
      }
      if (revealRes.body.progress.attempts !== 1 || revealRes.body.progress.status !== 'attempted') {
        throw new Error('Reveal progress tracking mismatch: ' + JSON.stringify(revealRes.body.progress));
      }
      console.log('✅ Reveal solution verified: explanation revealed and attempt logged in progress.');

      // 9. Retest Atlas Login for both users
      console.log('\n[Step 9] Retesting Login against MongoDB Atlas...');
      const loginA = await makeRequest(`${baseUrl}/auth/login`, 'POST', JSON.stringify({ email: userA_Email, password }));
      if (loginA.status !== 200 || !loginA.body.token) throw new Error('Login A failed');
      const loginB = await makeRequest(`${baseUrl}/auth/login`, 'POST', JSON.stringify({ email: userB_Email, password }));
      if (loginB.status !== 200 || !loginB.body.token) throw new Error('Login B failed');
      console.log('✅ Both users logged in successfully with valid JWTs.');

      // Cleanup
      console.log('\n[Cleanup] Cleaning up test users and progress...');
      const userDocA = await User.findOne({ email: userA_Email });
      const userDocB = await User.findOne({ email: userB_Email });
      if (userDocA) {
        await QuestionProgress.deleteMany({ user: userDocA._id });
        await User.deleteOne({ _id: userDocA._id });
      }
      if (userDocB) {
        await QuestionProgress.deleteMany({ user: userDocB._id });
        await User.deleteOne({ _id: userDocB._id });
      }
      console.log('✅ Cleanup complete.');

      console.log('\n========================================================');
      console.log('🎉 ALL MULTI-USER ISOLATION & SECURITY CHECKS PASSED!');
      console.log('========================================================');

      server.close(() => process.exit(0));
    } catch (err) {
      console.error('\n❌ MULTI-USER VERIFICATION FAILED:', err.message);
      server.close(() => process.exit(1));
    }
  });
}

runMultiUserVerification();
