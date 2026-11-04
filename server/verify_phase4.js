const mongoose = require('mongoose');
const http = require('http');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/.env' });

const app = require('./index');
const User = require('./models/User');
const Question = require('./models/Question');
const QuestionProgress = require('./models/QuestionProgress');
const PracticeSession = require('./models/PracticeSession');

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

async function runPhase4Verification() {
  console.log('========================================================');
  console.log('--- STARTING PHASE 4 PRACTICE SESSION VERIFICATION ---');
  console.log('========================================================');

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api`;
    console.log(`[Test Server] Running on ephemeral port ${port}`);

    const userA_Email = `phase4_usera_${Date.now()}@prepai.dev`;
    const userB_Email = `phase4_userb_${Date.now()}@prepai.dev`;
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

      // 1. Setup: Register User A and User B
      console.log('\n[Step 1] Registering test users (Alice & Bob)...');
      const regA = await makeRequest(
        `${baseUrl}/auth/register`,
        'POST',
        JSON.stringify({ name: 'Alice Phase4', email: userA_Email, password })
      );
      if (regA.status !== 201 || !regA.body.token) throw new Error('Registration for User A failed');
      const tokenA = regA.body.token;
      const headersA = { Authorization: `Bearer ${tokenA}` };

      const regB = await makeRequest(
        `${baseUrl}/auth/register`,
        'POST',
        JSON.stringify({ name: 'Bob Phase4', email: userB_Email, password })
      );
      if (regB.status !== 201 || !regB.body.token) throw new Error('Registration for User B failed');
      const tokenB = regB.body.token;
      const headersB = { Authorization: `Bearer ${tokenB}` };
      console.log('✅ Both test users registered successfully on MongoDB Atlas.');

      // 2. Test Authentication Protection
      console.log('\n[Step 2] Testing unauthenticated access (MUST return 401)...');
      const unauthStart = await makeRequest(`${baseUrl}/practice/start`, 'POST', JSON.stringify({ mode: 'mixed' }));
      if (unauthStart.status !== 401) throw new Error(`Expected 401 for unauth start, got ${unauthStart.status}`);

      const unauthActive = await makeRequest(`${baseUrl}/practice/active`, 'GET');
      if (unauthActive.status !== 401) throw new Error(`Expected 401 for unauth active, got ${unauthActive.status}`);

      const unauthHistory = await makeRequest(`${baseUrl}/practice/history`, 'GET');
      if (unauthHistory.status !== 401) throw new Error(`Expected 401 for unauth history, got ${unauthHistory.status}`);
      console.log('✅ All practice endpoints strictly require authentication.');

      // 3. Test Session Creation
      console.log('\n[Step 3] Creating a practice session for User A...');
      const startRes = await makeRequest(
        `${baseUrl}/practice/start`,
        'POST',
        JSON.stringify({
          mode: 'topic',
          category: 'DSA',
          difficulty: 'All',
          questionCount: 3,
          timeLimitMinutes: 15,
        }),
        headersA
      );

      if (startRes.status !== 201 || !startRes.body.session) {
        throw new Error('Failed to create practice session: ' + JSON.stringify(startRes.body));
      }

      const sessionA = startRes.body.session;
      const sessionIdA = sessionA._id;
      if (sessionA.status !== 'in-progress' || sessionA.totalQuestions !== 3) {
        throw new Error(`Session state mismatch: status=${sessionA.status}, count=${sessionA.totalQuestions}`);
      }
      console.log(`✅ Session created successfully: ID=${sessionIdA}, Mode=${sessionA.mode}, Questions=${sessionA.totalQuestions}`);

      // 4. Test Solution Visibility Rules (Security Sanitization)
      console.log('\n[Step 4] Verifying sensitive fields are hidden in active session...');
      sessionA.questions.forEach((q, idx) => {
        if (q.correctAnswerIndex !== undefined || q.sampleAnswer !== undefined || q.explanation !== undefined) {
          throw new Error(`SECURITY BREACH: Sensitive fields exposed on Question #${idx + 1} in active session!`);
        }
      });
      console.log('✅ Security verified: correctAnswerIndex, sampleAnswer, and explanation strictly hidden.');

      // 5. Test Multi-User Isolation
      console.log('\n[Step 5] Testing Multi-User Isolation (User B cannot access or modify User A session)...');
      const crossGet = await makeRequest(`${baseUrl}/practice/${sessionIdA}`, 'GET', null, headersB);
      if (crossGet.status !== 403) {
        throw new Error(`Expected 403 Forbidden for User B accessing User A session, got ${crossGet.status}`);
      }

      const crossAnswer = await makeRequest(
        `${baseUrl}/practice/${sessionIdA}/answer`,
        'POST',
        JSON.stringify({ questionId: sessionA.questions[0]._id, selectedAnswerIndex: 0 }),
        headersB
      );
      if (crossAnswer.status !== 403) {
        throw new Error(`Expected 403 Forbidden for User B answering User A session, got ${crossAnswer.status}`);
      }
      console.log('✅ Multi-user authorization verified: cross-user access rejected with 403 Forbidden.');

      // 6. Test Active Session Retrieval & Restoration
      console.log('\n[Step 6] Testing Active Session restoration (GET /api/practice/active)...');
      const activeResA = await makeRequest(`${baseUrl}/practice/active`, 'GET', null, headersA);
      if (activeResA.status !== 200 || !activeResA.body.session || activeResA.body.session._id !== sessionIdA) {
        throw new Error('Active session retrieval failed for User A: ' + JSON.stringify(activeResA.body));
      }

      const activeResB = await makeRequest(`${baseUrl}/practice/active`, 'GET', null, headersB);
      if (activeResB.status !== 200 || activeResB.body.session !== null) {
        throw new Error('User B should have null active session: ' + JSON.stringify(activeResB.body));
      }
      console.log('✅ Active session state correctly restored for User A and isolated from User B.');

      // 7. Test Answer Submission & QuestionProgress Synchronization
      console.log('\n[Step 7] Testing Answer Submission & QuestionProgress sync...');
      const q1Id = sessionA.questions[0]._id;
      const q1Db = await Question.findById(q1Id).select('+correctAnswerIndex');
      const q1Correct = q1Db.correctAnswerIndex ?? 0;
      const q1Wrong = (q1Correct + 1) % 4;

      // Submit incorrect answer for Question 1
      console.log(`Submitting wrong answer (index ${q1Wrong}) for Q1...`);
      const ans1Res = await makeRequest(
        `${baseUrl}/practice/${sessionIdA}/answer`,
        'POST',
        JSON.stringify({ questionId: q1Id, selectedAnswerIndex: q1Wrong, timeSpentSeconds: 35 }),
        headersA
      );
      if (ans1Res.status !== 200 || ans1Res.body.isCorrect !== false) {
        throw new Error('Incorrect answer evaluation failed: ' + JSON.stringify(ans1Res.body));
      }
      if (ans1Res.body.sessionStats.score !== 0 || ans1Res.body.sessionStats.accuracy !== 0) {
        throw new Error('Session stats mismatch on wrong answer: ' + JSON.stringify(ans1Res.body.sessionStats));
      }

      // Verify QuestionProgress was updated
      const prog1 = await QuestionProgress.findOne({ user: regA.body.user._id, question: q1Id });
      if (!prog1 || prog1.attempts !== 1 || prog1.incorrectAttempts !== 1 || prog1.status !== 'attempted') {
        throw new Error('QuestionProgress sync failed on wrong answer: ' + JSON.stringify(prog1));
      }
      console.log('✅ Wrong answer recorded, score=0, QuestionProgress synced with attempts=1, incorrectAttempts=1.');

      // Submit correct answer for Question 2
      const q2Id = sessionA.questions[1]._id;
      const q2Db = await Question.findById(q2Id).select('+correctAnswerIndex');
      const q2Correct = q2Db.correctAnswerIndex ?? 0;

      console.log(`Submitting correct answer (index ${q2Correct}) for Q2...`);
      const ans2Res = await makeRequest(
        `${baseUrl}/practice/${sessionIdA}/answer`,
        'POST',
        JSON.stringify({ questionId: q2Id, selectedAnswerIndex: q2Correct, timeSpentSeconds: 40 }),
        headersA
      );
      if (ans2Res.status !== 200 || ans2Res.body.isCorrect !== true) {
        throw new Error('Correct answer evaluation failed: ' + JSON.stringify(ans2Res.body));
      }
      if (ans2Res.body.sessionStats.score !== 20 || ans2Res.body.sessionStats.accuracy !== 50) {
        throw new Error('Session stats mismatch on correct answer: ' + JSON.stringify(ans2Res.body.sessionStats));
      }
      console.log('✅ Correct answer recorded, score=20, accuracy=50% (1/2 correct).');

      // 8. Prevent Duplicate Scoring on Repeated Answer Submissions
      console.log('\n[Step 8] Testing Duplicate Submissions (updating Q1 to correct answer)...');
      const ans1UpdateRes = await makeRequest(
        `${baseUrl}/practice/${sessionIdA}/answer`,
        'POST',
        JSON.stringify({ questionId: q1Id, selectedAnswerIndex: q1Correct, timeSpentSeconds: 20 }),
        headersA
      );
      if (ans1UpdateRes.status !== 200 || ans1UpdateRes.body.isCorrect !== true) {
        throw new Error('Answer update failed: ' + JSON.stringify(ans1UpdateRes.body));
      }
      if (ans1UpdateRes.body.sessionStats.score !== 40 || ans1UpdateRes.body.sessionStats.accuracy !== 100) {
        throw new Error('Score/accuracy double-counting bug: ' + JSON.stringify(ans1UpdateRes.body.sessionStats));
      }

      // Verify answers array in session has exactly 2 entries (no duplicates!)
      const sessionDocAfterUpdate = await PracticeSession.findById(sessionIdA);
      if (sessionDocAfterUpdate.answers.length !== 2) {
        throw new Error(`Expected 2 answers in session, found ${sessionDocAfterUpdate.answers.length} (duplicate created!)`);
      }
      console.log('✅ No duplicate answer entries created; score updated cleanly to 40, accuracy to 100%.');

      // 9. Test Mark For Review Flag
      console.log('\n[Step 9] Testing Mark for Review flag...');
      const q3Id = sessionA.questions[2]._id;
      const reviewRes = await makeRequest(
        `${baseUrl}/practice/${sessionIdA}/review`,
        'PUT',
        JSON.stringify({ questionId: q3Id, markedForReview: true }),
        headersA
      );
      if (reviewRes.status !== 200 || reviewRes.body.markedForReview !== true) {
        throw new Error('Mark for review failed: ' + JSON.stringify(reviewRes.body));
      }
      console.log('✅ Question flagged for review successfully.');

      // 10. Test Session Completion & Post-Completion Solution Reveal
      console.log('\n[Step 10] Finishing practice session (POST /api/practice/:id/finish)...');
      const finishRes = await makeRequest(`${baseUrl}/practice/${sessionIdA}/finish`, 'POST', null, headersA);
      if (finishRes.status !== 200 || finishRes.body.session.status !== 'completed') {
        throw new Error('Finish session failed: ' + JSON.stringify(finishRes.body));
      }

      const finishedSession = finishRes.body.session;
      if (finishedSession.score !== 40 || finishedSession.accuracy !== 100) {
        throw new Error('Final score mismatch: ' + JSON.stringify(finishedSession));
      }

      // Check solution reveal on finished session
      const finishedQ1 = finishedSession.questions.find((q) => q._id.toString() === q1Id.toString());
      if (!finishedQ1.explanation || !finishedQ1.sampleAnswer || finishedQ1.correctAnswerIndex === undefined) {
        throw new Error('Solutions were NOT revealed after session completion!');
      }
      console.log('✅ Session finished: status=completed, score=40, accuracy=100%, solutions revealed for review.');

      // Verify User.stats prepScore updated
      const userDocAfter = await User.findById(regA.body.user._id);
      if (userDocAfter.stats.prepScore < 40) {
        throw new Error(`User prepScore not updated: ${userDocAfter.stats.prepScore}`);
      }
      console.log(`✅ User preparation score updated in user model: ${userDocAfter.stats.prepScore}`);

      // 11. Test Practice History Endpoint
      console.log('\n[Step 11] Testing Practice History (GET /api/practice/history)...');
      const historyA = await makeRequest(`${baseUrl}/practice/history`, 'GET', null, headersA);
      if (historyA.status !== 200 || historyA.body.sessions.length !== 1) {
        throw new Error('User A history mismatch: ' + JSON.stringify(historyA.body));
      }

      const historyB = await makeRequest(`${baseUrl}/practice/history`, 'GET', null, headersB);
      if (historyB.status !== 200 || historyB.body.sessions.length !== 0) {
        throw new Error('User B should have 0 history sessions: ' + JSON.stringify(historyB.body));
      }
      // 12. Test Question Count Flow: Validation, 3, 5, 10 Questions, and Insufficient Question Handling
      console.log('\n[Step 12] Testing Question Count Validation & Dynamic Counts (3, 5, 10 Qs)...');

      // 12a. Validate questionCount must be a positive integer
      const invalidCounts = [0, -3, 'invalid', 4.5];
      for (const badCount of invalidCounts) {
        const badRes = await makeRequest(
          `${baseUrl}/practice/start`,
          'POST',
          JSON.stringify({ mode: 'mixed', questionCount: badCount, forceNew: true }),
          headersA
        );
        if (badRes.status !== 400 || !badRes.body.message.includes('positive integer')) {
          throw new Error(`Expected 400 for bad questionCount (${badCount}), got ${badRes.status}: ${JSON.stringify(badRes.body)}`);
        }
      }
      console.log('✅ Positive integer validation verified: 0, negative numbers, floats, and non-numeric inputs rejected with 400.');

      // 12b. Test selecting 3 questions
      const res3 = await makeRequest(
        `${baseUrl}/practice/start`,
        'POST',
        JSON.stringify({ mode: 'topic', category: 'DSA', questionCount: 3, forceNew: true }),
        headersA
      );
      if (res3.status !== 201 || res3.body.session.totalQuestions !== 3 || res3.body.session.questions.length !== 3) {
        throw new Error(`Expected 3 questions in session, got ${res3.body.session?.totalQuestions}: ${JSON.stringify(res3.body)}`);
      }
      if (res3.body.isPartial !== false || res3.body.availableCount < 3) {
        throw new Error(`Expected isPartial=false for 3 questions in DSA, got ${res3.body.isPartial}`);
      }
      console.log(`✅ Selecting 3 questions verified: Created session with exactly 3 questions (DSA).`);

      // 12c. Test selecting 5 questions (Mixed mode has 16 questions in DB)
      const res5 = await makeRequest(
        `${baseUrl}/practice/start`,
        'POST',
        JSON.stringify({ mode: 'mixed', questionCount: 5, forceNew: true }),
        headersA
      );
      if (res5.status !== 201 || res5.body.session.totalQuestions !== 5 || res5.body.session.questions.length !== 5) {
        throw new Error(`Expected 5 questions in session, got ${res5.body.session?.totalQuestions}: ${JSON.stringify(res5.body)}`);
      }
      if (res5.body.isPartial !== false || res5.body.requestedCount !== 5) {
        throw new Error(`Expected isPartial=false for 5 questions in Mixed mode, got ${res5.body.isPartial}`);
      }
      console.log(`✅ Selecting 5 questions verified: Created session with exactly 5 questions (Mixed mode).`);

      // 12d. Test selecting 10 questions (Mixed mode has 16 questions in DB)
      const res10 = await makeRequest(
        `${baseUrl}/practice/start`,
        'POST',
        JSON.stringify({ mode: 'mixed', questionCount: 10, forceNew: true }),
        headersA
      );
      if (res10.status !== 201 || res10.body.session.totalQuestions !== 10 || res10.body.session.questions.length !== 10) {
        throw new Error(`Expected 10 questions in session, got ${res10.body.session?.totalQuestions}: ${JSON.stringify(res10.body)}`);
      }
      if (res10.body.isPartial !== false || res10.body.requestedCount !== 10) {
        throw new Error(`Expected isPartial=false for 10 questions in Mixed mode, got ${res10.body.isPartial}`);
      }
      console.log(`✅ Selecting 10 questions verified: Created session with exactly 10 questions (Mixed mode).`);

      // 12e. Test Insufficient Questions Case (requesting more questions than available in DSA)
      const totalDSA = await Question.countDocuments({ category: 'DSA' });
      const requestedMoreThanAvailable = Math.min(50, totalDSA + 5);
      const resInsufficient = await makeRequest(
        `${baseUrl}/practice/start`,
        'POST',
        JSON.stringify({ mode: 'topic', category: 'DSA', questionCount: requestedMoreThanAvailable, forceNew: true }),
        headersA
      );
      if (resInsufficient.status !== 201) {
        throw new Error(`Expected 201 for insufficient questions start, got ${resInsufficient.status}`);
      }
      const insufficientSession = resInsufficient.body.session;
      if (insufficientSession.totalQuestions !== totalDSA || insufficientSession.questions.length !== totalDSA) {
        throw new Error(`Expected ${totalDSA} questions in partial session, got ${insufficientSession.totalQuestions}`);
      }
      if (
        resInsufficient.body.isPartial !== true ||
        resInsufficient.body.requestedCount !== requestedMoreThanAvailable ||
        resInsufficient.body.availableCount !== totalDSA ||
        !resInsufficient.body.message.includes(`only ${totalDSA} eligible questions`)
      ) {
        throw new Error(`Expected transparent isPartial metadata, got: ${JSON.stringify(resInsufficient.body)}`);
      }
      console.log(`✅ Insufficient-question case verified: Requested ${requestedMoreThanAvailable} in DSA (${totalDSA} available) -> returned ${totalDSA} questions with isPartial=true, requestedCount=${requestedMoreThanAvailable}, availableCount=${totalDSA}, and transparent user message.`);

      // Discard active session before checking history & cleanup
      await makeRequest(`${baseUrl}/practice/abandon`, 'POST', null, headersA);

      // 13. Verify Existing Auth & Question Bank APIs Remain 100% Intact
      console.log('\n[Step 13] Verifying Phase 1-3 APIs remain healthy...');
      const meRes = await makeRequest(`${baseUrl}/auth/me`, 'GET', null, headersA);
      if (meRes.status !== 200 || meRes.body.user.email !== userA_Email) {
        throw new Error('Auth /me regression!');
      }
      const qListRes = await makeRequest(`${baseUrl}/questions`, 'GET', null, headersA);
      if (qListRes.status !== 200 || !Array.isArray(qListRes.body.questions)) {
        throw new Error('Question bank listing regression!');
      }
      console.log('✅ Phase 1-3 Auth & Question Bank endpoints working flawlessly.');

      // Cleanup
      console.log('\n[Cleanup] Cleaning up test records from Atlas...');
      await User.deleteOne({ email: userA_Email });
      await User.deleteOne({ email: userB_Email });
      await QuestionProgress.deleteMany({ user: { $in: [regA.body.user._id, regB.body.user._id] } });
      await PracticeSession.deleteMany({ user: { $in: [regA.body.user._id, regB.body.user._id] } });
      console.log('✅ Test cleanup completed.');

      console.log('\n========================================================');
      console.log('🎉 ALL PHASE 4 BACKEND REQUIREMENTS VERIFIED SUCCESSFULLY!');
      console.log('========================================================');

      server.close(() => process.exit(0));
    } catch (err) {
      console.error('\n❌ PHASE 4 VERIFICATION FAILED:', err.message);
      server.close(() => process.exit(1));
    }
  });
}

runPhase4Verification();
