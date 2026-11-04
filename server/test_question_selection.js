/**
 * Automated Verification: Question Selection, Duplicate Prevention, and Session Counts
 * Tests 5, 10, and 20 question requests, partial-count fallback behavior, and progress-aware selection.
 */

const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/.env' });

const app = require('./index');
const User = require('./models/User');
const PracticeSession = require('./models/PracticeSession');
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

async function runSelectionTests() {
  console.log('================================================================');
  console.log('--- STARTING QUESTION SELECTION & DUPLICATE PREVENTION TESTS ---');
  console.log('================================================================');

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api`;
    console.log(`[Test Server] Running on ephemeral port ${port}`);

    const testEmail = `selection_test_${Date.now()}@prepai.dev`;
    const password = 'Password123!';
    let testUserDoc = null;

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

      // 1. Register test user
      console.log('\n[Test 1] Registering test user for session tests...');
      const regRes = await makeRequest(
        `${baseUrl}/auth/register`,
        'POST',
        JSON.stringify({ name: 'Selection Tester', email: testEmail, password })
      );
      if (regRes.status !== 201 || !regRes.body.token) {
        throw new Error(`User registration failed with status ${regRes.status}`);
      }
      const token = regRes.body.token;
      const headers = { Authorization: `Bearer ${token}` };
      testUserDoc = await User.findOne({ email: testEmail });
      console.log('✅ Test user registered successfully.');

      // 2. Request exactly 5 questions for Java
      console.log('\n[Test 2] Requesting 5 questions for Category: Java...');
      const session5 = await makeRequest(
        `${baseUrl}/practice/start`,
        'POST',
        JSON.stringify({
          mode: 'topic',
          category: 'Java',
          difficulty: 'All',
          questionCount: 5,
          forceNew: true,
        }),
        headers
      );

      if (session5.status !== 201) {
        throw new Error(`Failed to start 5-question session, got ${session5.status}`);
      }
      const qList5 = session5.body.session.questions;
      console.log(`Received ${qList5.length} questions. Is Partial: ${session5.body.isPartial}`);
      if (qList5.length !== 5) {
        throw new Error(`Expected exactly 5 questions, received ${qList5.length}`);
      }
      // Check duplicate prevention
      const ids5 = qList5.map((q) => q._id);
      const uniqueIds5 = new Set(ids5);
      if (uniqueIds5.size !== 5) {
        throw new Error(`Duplicate questions detected in 5-question session!`);
      }
      console.log('✅ Exactly 5 distinct questions received with ZERO duplicates.');

      // 3. Request exactly 10 questions for Java
      console.log('\n[Test 3] Requesting 10 questions for Category: Java...');
      const session10 = await makeRequest(
        `${baseUrl}/practice/start`,
        'POST',
        JSON.stringify({
          mode: 'topic',
          category: 'Java',
          difficulty: 'All',
          questionCount: 10,
          forceNew: true,
        }),
        headers
      );

      if (session10.status !== 201) {
        throw new Error(`Failed to start 10-question session, got ${session10.status}`);
      }
      const qList10 = session10.body.session.questions;
      console.log(`Received ${qList10.length} questions. Is Partial: ${session10.body.isPartial}`);
      if (qList10.length !== 10) {
        throw new Error(`Expected exactly 10 questions, received ${qList10.length}`);
      }
      const ids10 = qList10.map((q) => q._id);
      const uniqueIds10 = new Set(ids10);
      if (uniqueIds10.size !== 10) {
        throw new Error(`Duplicate questions detected in 10-question session!`);
      }
      console.log('✅ Exactly 10 distinct questions received with ZERO duplicates.');

      // 4. Request 20 questions for Java (when DB has ~16 Java questions)
      console.log('\n[Test 4] Requesting 20 questions for Category: Java (fallback behavior)...');
      const session20 = await makeRequest(
        `${baseUrl}/practice/start`,
        'POST',
        JSON.stringify({
          mode: 'topic',
          category: 'Java',
          difficulty: 'All',
          questionCount: 20,
          forceNew: true,
        }),
        headers
      );

      if (session20.status !== 201) {
        throw new Error(`Failed to start 20-question session, got ${session20.status}`);
      }
      const qList20 = session20.body.session.questions;
      console.log(`Requested 20 questions. Received: ${qList20.length}`);
      console.log(`isPartial: ${session20.body.isPartial}, availableCount: ${session20.body.availableCount}`);
      console.log(`Message: "${session20.body.message}"`);

      if (!session20.body.isPartial) {
        throw new Error('Expected isPartial to be true when available < requested');
      }
      if (qList20.length !== session20.body.availableCount) {
        throw new Error(`Session questions count (${qList20.length}) does not match availableCount (${session20.body.availableCount})`);
      }
      const ids20 = qList20.map((q) => q._id);
      const uniqueIds20 = new Set(ids20);
      if (uniqueIds20.size !== qList20.length) {
        throw new Error('Duplicate questions detected in partial session!');
      }
      console.log('✅ Partial question fallback works honestly with clear explanation and ZERO duplicates.');

      // 5. Request 20 questions in Mixed Topics (where DB has 131 questions)
      console.log('\n[Test 5] Requesting 20 questions in Mixed Mode (sufficient pool)...');
      const sessionMixed20 = await makeRequest(
        `${baseUrl}/practice/start`,
        'POST',
        JSON.stringify({
          mode: 'mixed',
          difficulty: 'All',
          questionCount: 20,
          forceNew: true,
        }),
        headers
      );

      if (sessionMixed20.status !== 201) {
        throw new Error(`Failed to start 20-question mixed session, got ${sessionMixed20.status}`);
      }
      const qListMixed20 = sessionMixed20.body.session.questions;
      console.log(`Received ${qListMixed20.length} questions. isPartial: ${sessionMixed20.body.isPartial}`);
      if (qListMixed20.length !== 20) {
        throw new Error(`Expected exactly 20 questions in mixed mode, received ${qListMixed20.length}`);
      }
      const idsMixed20 = qListMixed20.map((q) => q._id);
      const uniqueIdsMixed20 = new Set(idsMixed20);
      if (uniqueIdsMixed20.size !== 20) {
        throw new Error('Duplicate questions detected in 20-question mixed session!');
      }
      console.log('✅ Exactly 20 distinct mixed questions returned with ZERO duplicates.');

      // 6. Test Review Mistakes prioritization
      console.log('\n[Test 6] Testing mistake-prioritization policy...');
      // Submit an incorrect answer to the first question in active session
      const activeSessionId = sessionMixed20.body.session._id;
      const Question = require('./models/Question');
      const mcqQ = qListMixed20.find((q) => Array.isArray(q.options) && q.options.length > 1);
      if (!mcqQ) throw new Error('No MCQ question found in mixed set');

      const qDoc = await Question.findById(mcqQ._id).select('+correctAnswerIndex');
      const wrongIndex = (qDoc.correctAnswerIndex + 1) % mcqQ.options.length;

      const answerRes = await makeRequest(
        `${baseUrl}/practice/${activeSessionId}/answer`,
        'POST',
        JSON.stringify({
          questionId: mcqQ._id,
          selectedAnswerIndex: wrongIndex,
        }),
        headers
      );
      console.log(`Submitted answer for ${mcqQ.title}. isCorrect: ${answerRes.body.isCorrect}`);
      if (answerRes.body.isCorrect !== false) {
        throw new Error('Expected answer to be marked incorrect');
      }

      // Start new session with reviewMistakes: true
      const reviewSession = await makeRequest(
        `${baseUrl}/practice/start`,
        'POST',
        JSON.stringify({
          mode: 'mixed',
          questionCount: 5,
          reviewMistakes: true,
          forceNew: true,
        }),
        headers
      );
      if (reviewSession.status !== 201) {
        throw new Error(`Failed to start review session: ${reviewSession.status}`);
      }
      const reviewQIds = reviewSession.body.session.questions.map((q) => q._id.toString());
      const mistakeWasIncluded = reviewQIds.includes(mcqQ._id.toString());
      console.log(`Was previously wrong question included in review pool? ${mistakeWasIncluded}`);
      if (!mistakeWasIncluded) {
        throw new Error('Expected previously failed question to be prioritized in review session');
      }
      console.log('✅ Mistake-prioritization policy verified successfully.');

      console.log('\n================================================================');
      console.log('🎉 ALL QUESTION SELECTION & DUPLICATION TESTS PASSED SUCCESSFULLY!');
      console.log('================================================================');
    } finally {
      // Cleanup test data
      if (testUserDoc) {
        console.log('\n[Cleanup] Cleaning up test user and test sessions...');
        await PracticeSession.deleteMany({ user: testUserDoc._id });
        await QuestionProgress.deleteMany({ user: testUserDoc._id });
        await User.deleteOne({ _id: testUserDoc._id });
        console.log('✅ Cleanup completed.');
      }
      server.close();
      await mongoose.disconnect();
    }
  });
}

runSelectionTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
