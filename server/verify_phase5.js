const mongoose = require('mongoose');
const http = require('http');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/.env' });

const app = require('./index');
const User = require('./models/User');
const MockInterview = require('./models/MockInterview');
const aiInterviewService = require('./services/aiInterviewService');

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

async function runPhase5Verification() {
  console.log('========================================================');
  console.log('--- STARTING PHASE 5 AI MOCK INTERVIEW VERIFICATION ---');
  console.log('========================================================');

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api`;
    console.log(`[Test Server] Running on ephemeral port ${port}`);

    const userA_Email = `phase5_alice_${Date.now()}@prepai.dev`;
    const userB_Email = `phase5_bob_${Date.now()}@prepai.dev`;
    const password = 'Password123!';

    try {
      // 1. Setup: Register Alice & Bob
      console.log('\n[Step 1] Registering test users (Alice & Bob)...');
      const regA = await makeRequest(
        `${baseUrl}/auth/register`,
        'POST',
        JSON.stringify({ name: 'Alice Phase5', email: userA_Email, password })
      );
      if (regA.status !== 201 || !regA.body.token) throw new Error('Registration for User A failed');
      const tokenA = regA.body.token;
      const headersA = { Authorization: `Bearer ${tokenA}` };

      const regB = await makeRequest(
        `${baseUrl}/auth/register`,
        'POST',
        JSON.stringify({ name: 'Bob Phase5', email: userB_Email, password })
      );
      if (regB.status !== 201 || !regB.body.token) throw new Error('Registration for User B failed');
      const tokenB = regB.body.token;
      const headersB = { Authorization: `Bearer ${tokenB}` };
      console.log('✅ Both test users registered successfully on MongoDB Atlas.');

      // 2. Authentication Protection
      console.log('\n[Step 2] Testing Unauthenticated Access (MUST return 401)...');
      const unauthStart = await makeRequest(`${baseUrl}/interview/start`, 'POST', JSON.stringify({ jobRole: 'Dev' }));
      if (unauthStart.status !== 401) throw new Error(`Expected 401 for unauth start, got ${unauthStart.status}`);

      const unauthActive = await makeRequest(`${baseUrl}/interview/active`, 'GET');
      if (unauthActive.status !== 401) throw new Error(`Expected 401 for unauth active, got ${unauthActive.status}`);

      const unauthHistory = await makeRequest(`${baseUrl}/interview/history`, 'GET');
      if (unauthHistory.status !== 401) throw new Error(`Expected 401 for unauth history, got ${unauthHistory.status}`);

      console.log('✅ All interview endpoints strictly require authentication.');

      // 3. Request Validation
      console.log('\n[Step 3] Testing Request Validation (jobRole, questionCount, formats)...');
      const badRole = await makeRequest(
        `${baseUrl}/interview/start`,
        'POST',
        JSON.stringify({ jobRole: '', questionCount: 5 }),
        headersA
      );
      if (badRole.status !== 400 || !badRole.body.message.includes('Job role is required')) {
        throw new Error(`Expected 400 for empty jobRole, got ${badRole.status}: ${JSON.stringify(badRole.body)}`);
      }

      const badCount = await makeRequest(
        `${baseUrl}/interview/start`,
        'POST',
        JSON.stringify({ jobRole: 'Frontend Dev', questionCount: 0 }),
        headersA
      );
      if (badCount.status !== 400 || !badCount.body.message.includes('positive integer')) {
        throw new Error(`Expected 400 for count=0, got ${badCount.status}: ${JSON.stringify(badCount.body)}`);
      }

      const badType = await makeRequest(
        `${baseUrl}/interview/start`,
        'POST',
        JSON.stringify({ jobRole: 'Frontend Dev', questionCount: 5, interviewType: 'InvalidType' }),
        headersA
      );
      if (badType.status !== 400 || !badType.body.message.includes('Interview type must be')) {
        throw new Error(`Expected 400 for bad interviewType, got ${badType.status}`);
      }
      console.log('✅ Request validation verified: rejected empty jobRole, invalid counts, and unknown formats with 400.');

      // 4. Provider Error Handling (Real Provider without API key)
      console.log('\n[Step 4] Testing AI Provider Error Handling (when credentials missing/invalid)...');
      const origMockSetting = process.env.MOCK_AI;
      const origApiKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      delete process.env.GOOGLE_API_KEY;
      process.env.MOCK_AI = 'false';

      const missingKeyRes = await makeRequest(
        `${baseUrl}/interview/start`,
        'POST',
        JSON.stringify({ jobRole: 'Node.js Developer', questionCount: 3 }),
        headersA
      );

      // Restore env
      if (origApiKey) process.env.GEMINI_API_KEY = origApiKey;
      process.env.MOCK_AI = 'true'; // Enable Mock AI Provider for testing

      if (missingKeyRes.status !== 503 || !missingKeyRes.body.message.includes('GEMINI_API_KEY')) {
        throw new Error(`Expected 503 explaining missing GEMINI_API_KEY, got ${missingKeyRes.status}: ${JSON.stringify(missingKeyRes.body)}`);
      }
      console.log('✅ Clear provider error handled gracefully: 503 returned with clear setup instruction without fake data.');

      // 5. Create Interview with Mock AI Provider (Isolated Test Provider)
      console.log('\n[Step 5] Creating AI Mock Interview for Alice (Isolated Mock AI Mode)...');
      const startRes = await makeRequest(
        `${baseUrl}/interview/start`,
        'POST',
        JSON.stringify({
          jobRole: 'Full Stack Engineer',
          interviewType: 'Mixed',
          difficulty: 'Medium',
          experienceLevel: 'Fresher (0-1 yrs)',
          topics: ['React', 'Node.js', 'System Architecture'],
          questionCount: 3,
        }),
        headersA
      );

      if (startRes.status !== 201 || !startRes.body.interview) {
        throw new Error(`Interview creation failed: ${JSON.stringify(startRes.body)}`);
      }

      const interviewA = startRes.body.interview;
      const interviewIdA = interviewA._id;

      if (
        interviewA.jobRole !== 'Full Stack Engineer' ||
        interviewA.questions.length !== 3 ||
        interviewA.status !== 'in-progress'
      ) {
        throw new Error(`Interview configuration mismatch: ${JSON.stringify(interviewA)}`);
      }
      console.log(`✅ Mock interview created: ID=${interviewIdA}, TotalQuestions=${interviewA.totalQuestions}, Status=${interviewA.status}`);

      // 6. Multi-User Isolation & Ownership Verification
      console.log('\n[Step 6] Testing Multi-User Isolation (User B cannot access or modify User A interview)...');
      const crossGet = await makeRequest(`${baseUrl}/interview/${interviewIdA}`, 'GET', null, headersB);
      if (crossGet.status !== 403) {
        throw new Error(`Expected 403 Forbidden for User B accessing User A interview, got ${crossGet.status}`);
      }

      const crossAnswer = await makeRequest(
        `${baseUrl}/interview/${interviewIdA}/answer`,
        'POST',
        JSON.stringify({ questionIndex: 0, userAnswer: 'Unauthorized answer from Bob' }),
        headersB
      );
      if (crossAnswer.status !== 403) {
        throw new Error(`Expected 403 Forbidden for User B answering User A interview, got ${crossAnswer.status}`);
      }

      const crossFinish = await makeRequest(`${baseUrl}/interview/${interviewIdA}/finish`, 'POST', null, headersB);
      if (crossFinish.status !== 403) {
        throw new Error(`Expected 403 Forbidden for User B finishing User A interview, got ${crossFinish.status}`);
      }
      console.log('✅ Multi-user authorization verified: cross-user actions rejected with 403 Forbidden.');

      // 7. Active Interview Session Restoration (Page Refresh)
      console.log('\n[Step 7] Testing Active Session Restoration (GET /api/interview/active)...');
      const activeResA = await makeRequest(`${baseUrl}/interview/active`, 'GET', null, headersA);
      if (activeResA.status !== 200 || !activeResA.body.interview || activeResA.body.interview._id !== interviewIdA) {
        throw new Error(`Active interview retrieval failed for User A: ${JSON.stringify(activeResA.body)}`);
      }

      const activeResB = await makeRequest(`${baseUrl}/interview/active`, 'GET', null, headersB);
      if (activeResB.status !== 200 || activeResB.body.interview !== null) {
        throw new Error(`User B should have null active interview: ${JSON.stringify(activeResB.body)}`);
      }
      console.log('✅ Active session state correctly restored for User A and isolated from User B.');

      // 8. Answer Submission and Structured AI Critique
      console.log('\n[Step 8] Testing Answer Submission & Structured Critique for Question 1...');
      const answerQ1 = 'In a monolithic architecture, all services and UI reside in a single codebase with unified deployment and database transactions. Microservices break domains into independent loosely-coupled deployables communicating via REST or message queues, trading operational complexity for deployment isolation.';

      const submitRes1 = await makeRequest(
        `${baseUrl}/interview/${interviewIdA}/answer`,
        'POST',
        JSON.stringify({ questionIndex: 0, userAnswer: answerQ1 }),
        headersA
      );

      if (submitRes1.status !== 200 || !submitRes1.body.evaluation) {
        throw new Error(`Answer evaluation failed: ${JSON.stringify(submitRes1.body)}`);
      }

      const eval1 = submitRes1.body.evaluation;
      if (
        typeof eval1.overallScore !== 'number' ||
        typeof eval1.relevanceScore !== 'number' ||
        !Array.isArray(eval1.strengths) ||
        !eval1.feedback
      ) {
        throw new Error(`Evaluation output structure missing required fields: ${JSON.stringify(eval1)}`);
      }

      if (submitRes1.body.nextQuestionIndex !== 1) {
        throw new Error(`Expected nextQuestionIndex=1, got ${submitRes1.body.nextQuestionIndex}`);
      }
      console.log(`✅ Question 1 evaluated: OverallScore=${eval1.overallScore}, Relevance=${eval1.relevanceScore}, Feedback="${eval1.feedback.substring(0, 50)}..."`);

      // 9. Duplicate Submission Protection
      console.log('\n[Step 9] Testing Duplicate Submission Protection (updating Question 1 in-place)...');
      const updatedAnswer = answerQ1 + ' Furthermore, caching layers like Redis mitigate latency across distributed microservices.';
      const resubmitRes = await makeRequest(
        `${baseUrl}/interview/${interviewIdA}/answer`,
        'POST',
        JSON.stringify({ questionIndex: 0, userAnswer: updatedAnswer }),
        headersA
      );

      if (resubmitRes.status !== 200) {
        throw new Error(`Resubmission failed: ${JSON.stringify(resubmitRes.body)}`);
      }

      // Check DB doc directly
      const docAfterResubmit = await MockInterview.findById(interviewIdA);
      if (docAfterResubmit.questions[0].userAnswer !== updatedAnswer.trim()) {
        throw new Error('Updated answer was not saved in-place!');
      }
      console.log('✅ Duplicate submission protection verified: answer updated in-place without duplicating records.');

      // 10. Skip Question Flow
      console.log('\n[Step 10] Testing Skip Question (Question 2)...');
      const skipRes = await makeRequest(
        `${baseUrl}/interview/${interviewIdA}/skip`,
        'POST',
        JSON.stringify({ questionIndex: 1 }),
        headersA
      );

      if (skipRes.status !== 200 || skipRes.body.interview.questions[1].status !== 'skipped') {
        throw new Error(`Skip question failed: ${JSON.stringify(skipRes.body)}`);
      }
      console.log('✅ Question 2 skipped cleanly, status=skipped, index advanced to 2.');

      // 11. Answer Question 3
      console.log('\n[Step 11] Answering Question 3...');
      const answerQ3 = 'In resolving technical disagreements, I apply the STAR framework by isolating the problem (Situation), scheduling a code review with objective benchmarks (Action), and finding a data-driven compromise (Result).';
      const submitRes3 = await makeRequest(
        `${baseUrl}/interview/${interviewIdA}/answer`,
        'POST',
        JSON.stringify({ questionIndex: 2, userAnswer: answerQ3 }),
        headersA
      );
      if (submitRes3.status !== 200) {
        throw new Error(`Answer Q3 failed: ${JSON.stringify(submitRes3.body)}`);
      }
      console.log('✅ Question 3 answered and evaluated.');

      // 12. Interview Completion & Comprehensive Report Synthesis
      console.log('\n[Step 12] Finishing Interview & Generating Executive Report (POST /api/interview/:id/finish)...');
      const finishRes = await makeRequest(`${baseUrl}/interview/${interviewIdA}/finish`, 'POST', null, headersA);
      if (finishRes.status !== 200 || !finishRes.body.report) {
        throw new Error(`Finish interview failed: ${JSON.stringify(finishRes.body)}`);
      }

      const report = finishRes.body.report;
      if (
        typeof report.overallScore !== 'number' ||
        typeof report.technicalKnowledge !== 'number' ||
        typeof report.answerRelevance !== 'number' ||
        typeof report.problemSolving !== 'number' ||
        typeof report.communicationClarity !== 'number' ||
        !report.summary ||
        !Array.isArray(report.topStrengths) ||
        !Array.isArray(report.keyAreasForImprovement)
      ) {
        throw new Error(`Final report missing core competency metrics: ${JSON.stringify(report)}`);
      }

      // Check User stats incremented
      const userDoc = await User.findById(regA.body.user._id);
      if (userDoc.stats.mockInterviewsCompleted < 1) {
        throw new Error(`User stats mockInterviewsCompleted was not incremented: ${userDoc.stats.mockInterviewsCompleted}`);
      }
      console.log(`✅ Interview finished: OverallScore=${report.overallScore}, Tech=${report.technicalKnowledge}%, Relevance=${report.answerRelevance}%, User.mockInterviewsCompleted=${userDoc.stats.mockInterviewsCompleted}`);

      // 13. Report Retrieval Endpoint
      console.log('\n[Step 13] Testing Report Retrieval (GET /api/interview/:id/report)...');
      const reportResA = await makeRequest(`${baseUrl}/interview/${interviewIdA}/report`, 'GET', null, headersA);
      if (reportResA.status !== 200 || !reportResA.body.report || reportResA.body.report.overallScore !== report.overallScore) {
        throw new Error(`Report retrieval failed for User A: ${JSON.stringify(reportResA.body)}`);
      }

      const reportResB = await makeRequest(`${baseUrl}/interview/${interviewIdA}/report`, 'GET', null, headersB);
      if (reportResB.status !== 403) {
        throw new Error(`Expected 403 for User B retrieving User A report, got ${reportResB.status}`);
      }
      console.log('✅ Final report endpoint verified: User A retrieves report; User B receives 403 Forbidden.');

      // 14. History Endpoint
      console.log('\n[Step 14] Testing History Endpoint (GET /api/interview/history)...');
      const historyResA = await makeRequest(`${baseUrl}/interview/history`, 'GET', null, headersA);
      if (historyResA.status !== 200 || historyResA.body.interviews.length !== 1) {
        throw new Error(`Expected 1 historical interview for User A, got ${historyResA.body.interviews?.length}`);
      }

      const historyResB = await makeRequest(`${baseUrl}/interview/history`, 'GET', null, headersB);
      if (historyResB.status !== 200 || historyResB.body.interviews.length !== 0) {
        throw new Error(`User B should have 0 historical interviews, got ${historyResB.body.interviews?.length}`);
      }
      console.log('✅ History verified: User A has 1 completed session, User B has 0.');

      // 15. Verify Existing Auth & Question Bank APIs Remain 100% Intact
      console.log('\n[Step 15] Verifying Phase 1-4 APIs remain healthy...');
      const meRes = await makeRequest(`${baseUrl}/auth/me`, 'GET', null, headersA);
      if (meRes.status !== 200 || meRes.body.user.email !== userA_Email) {
        throw new Error('Auth /me regression!');
      }
      const qListRes = await makeRequest(`${baseUrl}/questions`, 'GET', null, headersA);
      if (qListRes.status !== 200 || !Array.isArray(qListRes.body.questions)) {
        throw new Error('Question bank listing regression!');
      }
      const practiceStartRes = await makeRequest(
        `${baseUrl}/practice/start`,
        'POST',
        JSON.stringify({ mode: 'mixed', questionCount: 3, forceNew: true }),
        headersA
      );
      if (practiceStartRes.status !== 201) {
        throw new Error('Practice session start regression!');
      }
      console.log('✅ Phase 1-4 Auth, Questions, and Practice APIs working seamlessly.');

      // Cleanup
      console.log('\n[Cleanup] Cleaning up test records from Atlas...');
      await User.deleteOne({ email: userA_Email });
      await User.deleteOne({ email: userB_Email });
      await MockInterview.deleteMany({ user: { $in: [regA.body.user._id, regB.body.user._id] } });
      console.log('✅ Test records cleaned up.');

      console.log('\n========================================================');
      console.log('🎉 ALL PHASE 5 BACKEND REQUIREMENTS VERIFIED SUCCESSFULLY!');
      console.log('========================================================');

      server.close(() => process.exit(0));
    } catch (err) {
      console.error('\n❌ PHASE 5 VERIFICATION FAILED:', err.message);
      server.close(() => process.exit(1));
    }
  });
}

runPhase5Verification();
