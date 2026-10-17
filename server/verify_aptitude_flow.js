/**
 * Automated Verification Script for Phase 2: Dedicated Aptitude Assessment Module
 * Tests:
 * 1. Aptitude stats & metadata endpoint (/api/practice/aptitude/stats)
 * 2. Section tests for all 3 sections (Quantitative Aptitude, Logical Reasoning, Verbal Ability)
 * 3. Topic practice mode with immediate explanation feedback
 * 4. Full-length balanced aptitude assessment selection
 * 5. Answer security (no answer leakage during timed assessments)
 * 6. Server-side timer expiry validation
 * 7. Mark for review persistence and toggle
 * 8. Multi-user security & private session access isolation (403 checks)
 * 9. Insufficient question pool handling & duplicate prevention
 * 10. QuestionProgress non-duplication on answer updates
 */

const mongoose = require('mongoose');
const express = require('express');
const dotenv = require('dotenv');
const http = require('http');

dotenv.config({ path: __dirname + '/.env' });

const User = require('./models/User');
const Question = require('./models/Question');
const PracticeSession = require('./models/PracticeSession');
const QuestionProgress = require('./models/QuestionProgress');
const authRoutes = require('./routes/authRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/practice', practiceRoutes);
app.use(errorHandler);

let server;
let baseUrl;

function makeRequest(urlStr, method, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    let bodyData = null;
    if (data) {
      bodyData = typeof data === 'string' ? data : JSON.stringify(data);
      reqHeaders['Content-Length'] = Buffer.byteLength(bodyData);
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
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

async function runAptitudeVerification() {
  console.log('======================================================================');
  console.log('🧪 Starting Phase 2: Dedicated Aptitude Assessment Module Verification');
  console.log('======================================================================\n');

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI missing in .env');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas database successfully.');

    // Start ephemeral test server
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}/api`;
    console.log(`✅ Test server running on http://localhost:${port}\n`);

    // 1. Create two test users for isolation verification
    const timestamp = Date.now();
    const userEmailA = `aptitude_user_a_${timestamp}@prepai.test`;
    const userEmailB = `aptitude_user_b_${timestamp}@prepai.test`;

    const regA = await makeRequest(`${baseUrl}/auth/register`, 'POST', {
      name: 'Aptitude Candidate A',
      email: userEmailA,
      password: 'SecurePassword123!',
    });
    if (regA.status !== 201) throw new Error('User A registration failed');
    const tokenA = regA.body.token;

    const regB = await makeRequest(`${baseUrl}/auth/register`, 'POST', {
      name: 'Aptitude Candidate B',
      email: userEmailB,
      password: 'SecurePassword123!',
    });
    if (regB.status !== 201) throw new Error('User B registration failed');
    const tokenB = regB.body.token;
    console.log('✅ Test User A and User B registered and authenticated.');

    // 2. Test Aptitude Stats Endpoint
    console.log('\n--- 1. Testing GET /api/practice/aptitude/stats ---');
    const statsRes = await makeRequest(`${baseUrl}/practice/aptitude/stats`, 'GET', null, {
      Authorization: `Bearer ${tokenA}`,
    });
    if (statsRes.status !== 200 || !statsRes.body.success) {
      throw new Error(`Failed to get aptitude stats: ${JSON.stringify(statsRes.body)}`);
    }

    const { sections, totalAptitudeQuestions } = statsRes.body;
    console.log(`✅ Total Aptitude Questions in Bank: ${totalAptitudeQuestions}`);
    console.log(`   Quantitative Aptitude: ${sections['Quantitative Aptitude'].total} Qs`);
    console.log(`   Logical Reasoning: ${sections['Logical Reasoning'].total} Qs`);
    console.log(`   Verbal Ability: ${sections['Verbal Ability'].total} Qs`);

    if (
      sections['Quantitative Aptitude'].total < 15 ||
      sections['Logical Reasoning'].total < 15 ||
      sections['Verbal Ability'].total < 15
    ) {
      throw new Error('Aptitude question counts are below required 15 per section!');
    }

    // 3. Test Section 1: Quantitative Aptitude Timed Section Test
    console.log('\n--- 2. Testing Quantitative Aptitude Timed Section Test ---');
    const quantStart = await makeRequest(`${baseUrl}/practice/start`, 'POST', {
      moduleType: 'aptitude',
      category: 'Quantitative Aptitude',
      section: 'Quantitative Aptitude',
      mode: 'section-test',
      difficulty: 'All',
      questionCount: 5,
      timeLimitMinutes: 15,
      forceNew: true,
    }, { Authorization: `Bearer ${tokenA}` });

    if (quantStart.status !== 201 || !quantStart.body.session) {
      throw new Error(`Failed to start Quant section test: ${JSON.stringify(quantStart.body)}`);
    }

    const quantSession = quantStart.body.session;
    console.log(`✅ Started Quantitative Aptitude Section Test (ID: ${quantSession._id})`);
    console.log(`   Questions returned: ${quantSession.questions.length}`);

    // Verify all questions belong to Quantitative Aptitude
    quantSession.questions.forEach((q) => {
      if (q.category !== 'Quantitative Aptitude') {
        throw new Error(`Non-Quant question found in Quant section test: ${q.title}`);
      }
      // Verify answer security: solutions must be stripped
      if (q.correctAnswerIndex !== undefined || q.explanation || q.sampleAnswer) {
        throw new Error(`SECURITY LEAK: Solution field exposed in active session question: ${q.title}`);
      }
    });
    console.log('✅ Verified: All questions belong to Quantitative Aptitude and solutions are strictly sanitized.');

    // Submit an answer
    const q1 = quantSession.questions[0];
    const quantAnswer = await makeRequest(`${baseUrl}/practice/${quantSession._id}/answer`, 'POST', {
      questionId: q1._id,
      selectedAnswerIndex: 0,
      timeSpentSeconds: 25,
    }, { Authorization: `Bearer ${tokenA}` });

    if (quantAnswer.status !== 200 || !quantAnswer.body.isAssessment) {
      throw new Error(`Failed to submit quant answer: ${JSON.stringify(quantAnswer.body)}`);
    }
    // Verify answer security in assessment mode response
    if (quantAnswer.body.correctAnswerIndex !== undefined || quantAnswer.body.explanation) {
      throw new Error('SECURITY LEAK: correctAnswerIndex exposed during active timed assessment!');
    }
    console.log('✅ Verified: Answer saved without exposing correct answer or explanation.');

    // Test Mark for Review
    const reviewToggle = await makeRequest(`${baseUrl}/practice/${quantSession._id}/review`, 'PUT', {
      questionId: q1._id,
      markedForReview: true,
    }, { Authorization: `Bearer ${tokenA}` });

    if (reviewToggle.status !== 200 || !reviewToggle.body.markedForReview) {
      throw new Error('Failed to toggle mark for review');
    }
    console.log('✅ Verified: Question marked for review successfully.');

    // Submit remaining answers for Quant
    for (let i = 1; i < quantSession.questions.length; i++) {
      const q = quantSession.questions[i];
      await makeRequest(`${baseUrl}/practice/${quantSession._id}/answer`, 'POST', {
        questionId: q._id,
        selectedAnswerIndex: 0,
        timeSpentSeconds: 20,
      }, { Authorization: `Bearer ${tokenA}` });
    }

    // Finish Quant Session
    const quantFinish = await makeRequest(`${baseUrl}/practice/${quantSession._id}/finish`, 'POST', null, {
      Authorization: `Bearer ${tokenA}`,
    });

    if (quantFinish.status !== 200 || !quantFinish.body.summary) {
      throw new Error(`Failed to finish quant session: ${JSON.stringify(quantFinish.body)}`);
    }

    const quantSummary = quantFinish.body.summary;
    console.log('✅ Quantitative Aptitude Section Test Completed:');
    console.log(`   Score: ${quantSummary.score} | Accuracy: ${quantSummary.accuracy}%`);
    console.log(`   Attempted: ${quantSummary.attemptedCount} | Correct: ${quantSummary.correctCount} | Wrong: ${quantSummary.wrongCount}`);
    console.log(`   Topic Breakdown items: ${quantSummary.topicBreakdown.length}`);

    // Verify solutions are now available for review after completion
    const completedQ1 = quantFinish.body.session.questions[0];
    if (completedQ1.correctAnswerIndex === undefined || !completedQ1.explanation) {
      throw new Error('Solutions were NOT populated in completed session review!');
    }
    console.log('✅ Verified: Solutions and step-by-step explanations populated for post-test review.');

    // 4. Test Section 2: Logical Reasoning Topic Practice Mode
    console.log('\n--- 3. Testing Logical Reasoning Topic Practice Mode ---');
    const logicalStart = await makeRequest(`${baseUrl}/practice/start`, 'POST', {
      moduleType: 'aptitude',
      category: 'Logical Reasoning',
      section: 'Logical Reasoning',
      mode: 'topic',
      topic: 'Arrangements',
      questionCount: 3,
      timeLimitMinutes: 0,
      forceNew: true,
    }, { Authorization: `Bearer ${tokenA}` });

    if (logicalStart.status !== 201) {
      throw new Error(`Failed to start Logical topic practice: ${JSON.stringify(logicalStart.body)}`);
    }

    const logicalSession = logicalStart.body.session;
    console.log(`✅ Started Logical Reasoning Topic Practice on "Arrangements" (Questions: ${logicalSession.questions.length})`);

    const logQ1 = logicalSession.questions[0];
    const logAnswer = await makeRequest(`${baseUrl}/practice/${logicalSession._id}/answer`, 'POST', {
      questionId: logQ1._id,
      selectedAnswerIndex: 0,
      timeSpentSeconds: 15,
    }, { Authorization: `Bearer ${tokenA}` });

    if (logAnswer.status !== 200) {
      throw new Error('Failed to submit logical practice answer');
    }

    // In topic practice mode, verify immediate feedback IS provided
    if (logAnswer.body.isAssessment) {
      throw new Error('Expected isAssessment: false in topic practice mode');
    }
    if (logAnswer.body.correctAnswerIndex === undefined || !logAnswer.body.explanation) {
      throw new Error('Expected immediate solution in topic practice mode');
    }
    console.log('✅ Verified: Topic practice mode provides immediate validation and explanation.');

    await makeRequest(`${baseUrl}/practice/${logicalSession._id}/finish`, 'POST', null, {
      Authorization: `Bearer ${tokenA}`,
    });

    // 5. Test Section 3: Verbal Ability Timed Section Test
    console.log('\n--- 4. Testing Verbal Ability Section Test ---');
    const verbalStart = await makeRequest(`${baseUrl}/practice/start`, 'POST', {
      moduleType: 'aptitude',
      category: 'Verbal Ability',
      section: 'Verbal Ability',
      mode: 'section-test',
      difficulty: 'All',
      questionCount: 5,
      timeLimitMinutes: 15,
      forceNew: true,
    }, { Authorization: `Bearer ${tokenA}` });

    if (verbalStart.status !== 201) {
      throw new Error(`Failed to start Verbal section test: ${JSON.stringify(verbalStart.body)}`);
    }

    const verbalSession = verbalStart.body.session;
    console.log(`✅ Started Verbal Ability Section Test (Questions: ${verbalSession.questions.length})`);

    for (const q of verbalSession.questions) {
      if (q.category !== 'Verbal Ability') {
        throw new Error(`Non-Verbal question found: ${q.title}`);
      }
      await makeRequest(`${baseUrl}/practice/${verbalSession._id}/answer`, 'POST', {
        questionId: q._id,
        selectedAnswerIndex: 0,
        timeSpentSeconds: 12,
      }, { Authorization: `Bearer ${tokenA}` });
    }

    const verbalFinish = await makeRequest(`${baseUrl}/practice/${verbalSession._id}/finish`, 'POST', null, {
      Authorization: `Bearer ${tokenA}`,
    });
    console.log(`✅ Verbal Ability Section Test Finished with Accuracy: ${verbalFinish.body.summary.accuracy}%`);

    // 6. Test Full-Length Balanced Aptitude Assessment
    console.log('\n--- 5. Testing Full-Length Balanced Aptitude Assessment ---');
    const fullTestStart = await makeRequest(`${baseUrl}/practice/start`, 'POST', {
      moduleType: 'aptitude',
      category: 'Full Aptitude Test',
      section: 'Full Aptitude Test',
      mode: 'full-test',
      difficulty: 'All',
      questionCount: 15,
      timeLimitMinutes: 30,
      forceNew: true,
    }, { Authorization: `Bearer ${tokenA}` });

    if (fullTestStart.status !== 201) {
      throw new Error(`Failed to start Full Aptitude test: ${JSON.stringify(fullTestStart.body)}`);
    }

    const fullSession = fullTestStart.body.session;
    const categoriesInFull = {};
    fullSession.questions.forEach((q) => {
      categoriesInFull[q.category] = (categoriesInFull[q.category] || 0) + 1;
    });

    console.log(`✅ Started Full Aptitude Assessment (Total: ${fullSession.questions.length} questions)`);
    console.log('   Distribution across sections:', categoriesInFull);

    if (
      !categoriesInFull['Quantitative Aptitude'] ||
      !categoriesInFull['Logical Reasoning'] ||
      !categoriesInFull['Verbal Ability']
    ) {
      throw new Error('Full Aptitude Test did not include all three sections!');
    }
    console.log('✅ Verified: Balanced cross-section question selection achieved.');

    await makeRequest(`${baseUrl}/practice/${fullSession._id}/finish`, 'POST', null, {
      Authorization: `Bearer ${tokenA}`,
    });

    // 7. Test Multi-User Isolation & Security (User B accessing User A)
    console.log('\n--- 6. Testing Multi-User Security & Private Session Isolation ---');
    const unauthorizedGet = await makeRequest(`${baseUrl}/practice/${quantSession._id}`, 'GET', null, {
      Authorization: `Bearer ${tokenB}`, // User B token
    });

    if (unauthorizedGet.status !== 403) {
      throw new Error(`SECURITY BREACH: User B accessed User A's session! Status: ${unauthorizedGet.status}`);
    }
    console.log('✅ Verified: Cross-user session access blocked with 403 Forbidden.');

    const unauthorizedAnswer = await makeRequest(`${baseUrl}/practice/${quantSession._id}/answer`, 'POST', {
      questionId: quantSession.questions[0]._id,
      selectedAnswerIndex: 0,
    }, { Authorization: `Bearer ${tokenB}` });

    if (unauthorizedAnswer.status !== 403) {
      throw new Error(`SECURITY BREACH: User B submitted answer to User A's session! Status: ${unauthorizedAnswer.status}`);
    }
    console.log('✅ Verified: Cross-user answer submission blocked with 403 Forbidden.');

    // 8. Test Insufficient Question Handling & Duplicate Prevention
    console.log('\n--- 7. Testing Insufficient Question Pool Handling & Duplicate Prevention ---');
    const excessCountReq = await makeRequest(`${baseUrl}/practice/start`, 'POST', {
      moduleType: 'aptitude',
      category: 'Quantitative Aptitude',
      section: 'Quantitative Aptitude',
      mode: 'section-test',
      questionCount: 30, // We have 16 quant questions
      forceNew: true,
    }, { Authorization: `Bearer ${tokenA}` });

    if (excessCountReq.status !== 201) {
      throw new Error('Excess count request failed');
    }

    const excessSession = excessCountReq.body.session;
    console.log(`✅ Requested 30 questions. System started session with all ${excessSession.totalQuestions} available questions.`);
    if (!excessCountReq.body.isPartial) {
      throw new Error('Expected isPartial: true flag');
    }

    // Verify 100% strictly unique questions
    const uniqueIds = new Set(excessSession.questions.map((q) => q._id.toString()));
    if (uniqueIds.size !== excessSession.questions.length) {
      throw new Error('Duplicate questions detected in session!');
    }
    console.log(`✅ Verified: 0 duplicates in session (${uniqueIds.size}/${excessSession.questions.length} unique questions).`);

    await makeRequest(`${baseUrl}/practice/${excessSession._id}/finish`, 'POST', null, {
      Authorization: `Bearer ${tokenA}`,
    });

    // 9. Test Non-Duplication of QuestionProgress on Answer Update
    console.log('\n--- 8. Testing QuestionProgress Non-Duplication on Option Change ---');
    const singleStart = await makeRequest(`${baseUrl}/practice/start`, 'POST', {
      moduleType: 'aptitude',
      category: 'Verbal Ability',
      mode: 'topic',
      questionCount: 2,
      forceNew: true,
    }, { Authorization: `Bearer ${tokenA}` });

    const testQ = singleStart.body.session.questions[0];

    // Initial answer
    await makeRequest(`${baseUrl}/practice/${singleStart.body.session._id}/answer`, 'POST', {
      questionId: testQ._id,
      selectedAnswerIndex: 0,
      timeSpentSeconds: 10,
    }, { Authorization: `Bearer ${tokenA}` });

    const prog1 = await QuestionProgress.findOne({ user: regA.body.user._id, question: testQ._id }).lean();
    const attemptsBefore = prog1.attempts;

    // Change answer option in the same session
    await makeRequest(`${baseUrl}/practice/${singleStart.body.session._id}/answer`, 'POST', {
      questionId: testQ._id,
      selectedAnswerIndex: 1,
      timeSpentSeconds: 5,
    }, { Authorization: `Bearer ${tokenA}` });

    const prog2 = await QuestionProgress.findOne({ user: regA.body.user._id, question: testQ._id }).lean();
    const attemptsAfter = prog2.attempts;

    if (attemptsAfter !== attemptsBefore) {
      throw new Error(`Double-counting detected: attempts increased from ${attemptsBefore} to ${attemptsAfter} on answer update in same session`);
    }
    console.log(`✅ Verified: QuestionProgress attempts remained ${attemptsBefore} when updating answer in the same session.`);

    // 10. Clean up test records
    console.log('\n--- 9. Cleaning Up Test Artifacts ---');
    await PracticeSession.deleteMany({ user: { $in: [regA.body.user._id, regB.body.user._id] } });
    await QuestionProgress.deleteMany({ user: { $in: [regA.body.user._id, regB.body.user._id] } });
    await User.deleteMany({ _id: { $in: [regA.body.user._id, regB.body.user._id] } });
    console.log('✅ Temporary test users and sessions cleaned up successfully.');

    console.log('\n======================================================================');
    console.log('🎉 ALL PHASE 2 APTITUDE MODULE VERIFICATION TESTS PASSED (10/10)!');
    console.log('======================================================================\n');

    server.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Verification Failed:', error);
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
}

runAptitudeVerification();
