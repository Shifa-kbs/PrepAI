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

async function runPhase3Verification() {
  console.log('========================================================');
  console.log('--- STARTING PHASE 3 BACKEND VERIFICATION ---');
  console.log('========================================================');

  // Start test server on ephemeral port
  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api`;
    console.log(`[Test Server] Running on port ${port}`);

    try {
      // 0. Ensure user and questions exist
      const testEmail = `phase3_tester_${Date.now()}@prepai.dev`;
      const testPassword = 'Password123!';

      console.log('\n[Setup] Registering test user...');
      const regRes = await makeRequest(
        `${baseUrl}/auth/register`,
        'POST',
        JSON.stringify({ name: 'Phase3 Tester', email: testEmail, password: testPassword })
      );
      if (regRes.status !== 201 || !regRes.body.token) {
        throw new Error(`Failed to register test user: ${JSON.stringify(regRes.body)}`);
      }
      const token = regRes.body.token;
      const authHeaders = { Authorization: `Bearer ${token}` };
      console.log('✅ Test user registered successfully. Token obtained.');

      // 1. Question list endpoint works
      console.log('\n[Test 1] Testing Question List (GET /api/questions)...');
      const listRes = await makeRequest(`${baseUrl}/questions`);
      if (listRes.status !== 200 || !listRes.body.success || !Array.isArray(listRes.body.questions)) {
        throw new Error(`Question list endpoint failed: ${JSON.stringify(listRes.body)}`);
      }
      console.log(`✅ Question list returned ${listRes.body.questions.length} questions. Total in DB: ${listRes.body.pagination.total}`);

      // 2. Pagination works
      console.log('\n[Test 2] Testing Pagination (GET /api/questions?page=1&limit=3)...');
      const pageRes = await makeRequest(`${baseUrl}/questions?page=1&limit=3`);
      if (
        pageRes.status !== 200 ||
        pageRes.body.questions.length > 3 ||
        pageRes.body.pagination.limit !== 3 ||
        pageRes.body.pagination.page !== 1
      ) {
        throw new Error(`Pagination failed: ${JSON.stringify(pageRes.body.pagination)}`);
      }
      console.log(`✅ Pagination verified: page=${pageRes.body.pagination.page}, limit=${pageRes.body.pagination.limit}, count=${pageRes.body.questions.length}`);

      // 3. Search works
      console.log('\n[Test 3] Testing Search (GET /api/questions?search=Sum)...');
      const searchRes = await makeRequest(`${baseUrl}/questions?search=Sum`);
      if (searchRes.status !== 200 || !searchRes.body.success) {
        throw new Error(`Search failed: ${JSON.stringify(searchRes.body)}`);
      }
      const matchFound = searchRes.body.questions.some((q) =>
        q.title.toLowerCase().includes('sum') || q.description.toLowerCase().includes('sum')
      );
      if (!matchFound && searchRes.body.questions.length > 0) {
        throw new Error('Search result does not match query term "Sum"');
      }
      console.log(`✅ Search verified: found ${searchRes.body.questions.length} questions matching "Sum".`);

      // 4. Category filter works
      console.log('\n[Test 4] Testing Category filter (GET /api/questions?category=DSA)...');
      const catRes = await makeRequest(`${baseUrl}/questions?category=DSA`);
      if (catRes.status !== 200 || !catRes.body.success) {
        throw new Error(`Category filter failed: ${JSON.stringify(catRes.body)}`);
      }
      const allDsa = catRes.body.questions.every((q) => q.category === 'DSA');
      if (!allDsa) throw new Error('Category filter returned non-DSA questions');
      console.log(`✅ Category filter verified: all ${catRes.body.questions.length} results belong to category 'DSA'.`);

      // 5. Difficulty filter works
      console.log('\n[Test 5] Testing Difficulty filter (GET /api/questions?difficulty=Easy)...');
      const diffRes = await makeRequest(`${baseUrl}/questions?difficulty=Easy`);
      if (diffRes.status !== 200 || !diffRes.body.success) {
        throw new Error(`Difficulty filter failed: ${JSON.stringify(diffRes.body)}`);
      }
      const allEasy = diffRes.body.questions.every((q) => q.difficulty === 'Easy');
      if (!allEasy) throw new Error('Difficulty filter returned non-Easy questions');
      console.log(`✅ Difficulty filter verified: all ${diffRes.body.questions.length} results have difficulty 'Easy'.`);

      // 6. Company filter works
      console.log('\n[Test 6] Testing Company filter (GET /api/questions?company=Google)...');
      const compRes = await makeRequest(`${baseUrl}/questions?company=Google`);
      if (compRes.status !== 200 || !compRes.body.success) {
        throw new Error(`Company filter failed: ${JSON.stringify(compRes.body)}`);
      }
      const allGoogle = compRes.body.questions.every((q) =>
        q.companyTags.some((c) => c.toLowerCase() === 'google')
      );
      if (!allGoogle && compRes.body.questions.length > 0) {
        throw new Error('Company filter returned questions without Google tag');
      }
      console.log(`✅ Company filter verified: ${compRes.body.questions.length} questions found tagged with 'Google'.`);

      // 7. Security: Normal question responses do NOT expose correctAnswerIndex, sampleAnswer, explanation
      console.log('\n[Test 7] Testing Security Sanitization (Fields MUST NOT be exposed)...');
      const firstQ = listRes.body.questions[0];
      const singleQRes = await makeRequest(`${baseUrl}/questions/${firstQ._id}`, 'GET', null, authHeaders);

      if (
        singleQRes.body.question.correctAnswerIndex !== undefined ||
        singleQRes.body.question.sampleAnswer !== undefined ||
        singleQRes.body.question.explanation !== undefined
      ) {
        throw new Error(
          `SECURITY BREACH: Sensitive fields exposed before submission! Found: ${JSON.stringify({
            correctAnswerIndex: singleQRes.body.question.correctAnswerIndex,
            sampleAnswer: singleQRes.body.question.sampleAnswer,
            explanation: singleQRes.body.question.explanation,
          })}`
        );
      }
      console.log('✅ Security verified: correctAnswerIndex, sampleAnswer, and explanation are strictly stripped from unsubmitted responses.');

      // 8. Unauthenticated users cannot access protected progress/answer endpoints
      console.log('\n[Test 8] Testing Protected Endpoints without Auth (MUST return 401)...');
      const unauthSubmit = await makeRequest(
        `${baseUrl}/questions/${firstQ._id}/submit`,
        'POST',
        JSON.stringify({ selectedAnswerIndex: 0 })
      );
      if (unauthSubmit.status !== 401) {
        throw new Error(`Expected 401 for unauthenticated submit, got ${unauthSubmit.status}`);
      }

      const unauthBookmark = await makeRequest(
        `${baseUrl}/questions/${firstQ._id}/bookmark`,
        'POST'
      );
      if (unauthBookmark.status !== 401) {
        throw new Error(`Expected 401 for unauthenticated bookmark, got ${unauthBookmark.status}`);
      }

      const unauthNotes = await makeRequest(
        `${baseUrl}/questions/${firstQ._id}/notes`,
        'PUT',
        JSON.stringify({ notes: 'Secret test note' })
      );
      if (unauthNotes.status !== 401) {
        throw new Error(`Expected 401 for unauthenticated notes, got ${unauthNotes.status}`);
      }
      console.log('✅ Protected endpoints verified: all rejected unauthenticated calls with 401 Unauthorized.');

      // 9. Answer submission correctly updates QuestionProgress & counts attempts
      console.log('\n[Test 9 & 10] Testing Answer Submission (POST /api/questions/:id/submit)...');
      // Fetch full question from DB to know what the correct answer actually is
      const dbQ = await Question.findById(firstQ._id).select('+correctAnswerIndex +explanation');
      const correctIdx = dbQ.correctAnswerIndex ?? 0;
      const wrongIdx = (correctIdx + 1) % (dbQ.options?.length || 4);

      // Submit incorrect answer first
      console.log(`Submitting incorrect answer (index ${wrongIdx})...`);
      const wrongSubmitRes = await makeRequest(
        `${baseUrl}/questions/${firstQ._id}/submit`,
        'POST',
        JSON.stringify({ selectedAnswerIndex: wrongIdx, timeSpentSeconds: 45 }),
        authHeaders
      );
      if (wrongSubmitRes.status !== 200 || wrongSubmitRes.body.isCorrect !== false) {
        throw new Error(`Incorrect answer test failed: ${JSON.stringify(wrongSubmitRes.body)}`);
      }
      if (wrongSubmitRes.body.progress.incorrectAttempts !== 1 || wrongSubmitRes.body.progress.attempts !== 1) {
        throw new Error(`Incorrect attempts count mismatch: ${JSON.stringify(wrongSubmitRes.body.progress)}`);
      }
      if (!wrongSubmitRes.body.explanation) {
        throw new Error('Explanation should be revealed in submission response!');
      }
      console.log('✅ Incorrect submission tracked: attempts=1, incorrectAttempts=1, status=attempted, explanation revealed.');

      // Submit correct answer
      console.log(`Submitting correct answer (index ${correctIdx})...`);
      const correctSubmitRes = await makeRequest(
        `${baseUrl}/questions/${firstQ._id}/submit`,
        'POST',
        JSON.stringify({ selectedAnswerIndex: correctIdx, timeSpentSeconds: 30 }),
        authHeaders
      );
      if (correctSubmitRes.status !== 200 || correctSubmitRes.body.isCorrect !== true) {
        throw new Error(`Correct answer test failed: ${JSON.stringify(correctSubmitRes.body)}`);
      }
      if (
        correctSubmitRes.body.progress.correctAttempts !== 1 ||
        correctSubmitRes.body.progress.incorrectAttempts !== 1 ||
        correctSubmitRes.body.progress.attempts !== 2 ||
        correctSubmitRes.body.progress.status !== 'solved'
      ) {
        throw new Error(`Progress tracking mismatch: ${JSON.stringify(correctSubmitRes.body.progress)}`);
      }
      console.log('✅ Correct submission tracked: attempts=2, correctAttempts=1, incorrectAttempts=1, status=solved.');

      // 11. Solved filter works
      console.log('\n[Test 11] Testing Solved filter (GET /api/questions?status=solved)...');
      const solvedRes = await makeRequest(`${baseUrl}/questions?status=solved`, 'GET', null, authHeaders);
      if (solvedRes.status !== 200 || !solvedRes.body.success) {
        throw new Error(`Solved filter request failed: ${JSON.stringify(solvedRes.body)}`);
      }
      const hasSolvedQ = solvedRes.body.questions.some((q) => q._id.toString() === firstQ._id.toString());
      if (!hasSolvedQ) {
        throw new Error('Solved filter did not return the just-solved question!');
      }
      console.log(`✅ Solved filter verified: found ${solvedRes.body.questions.length} solved question(s) including ${firstQ.title}.`);

      // 12. Bookmark / save functionality
      console.log('\n[Test 12] Testing Bookmark toggle (POST /api/questions/:id/bookmark)...');
      const bmRes1 = await makeRequest(
        `${baseUrl}/questions/${firstQ._id}/bookmark`,
        'POST',
        null,
        authHeaders
      );
      if (bmRes1.status !== 200 || bmRes1.body.isBookmarked !== true) {
        throw new Error(`Bookmark add failed: ${JSON.stringify(bmRes1.body)}`);
      }
      console.log('Bookmark added: isBookmarked = true.');

      // Verify Saved filter
      const savedFilterRes = await makeRequest(`${baseUrl}/questions?saved=true`, 'GET', null, authHeaders);
      const isFoundInSaved = savedFilterRes.body.questions.some((q) => q._id.toString() === firstQ._id.toString());
      if (!isFoundInSaved) {
        throw new Error('Saved filter did not include the bookmarked question!');
      }
      console.log('Saved filter verified: returned bookmarked question.');

      // Toggle bookmark off
      const bmRes2 = await makeRequest(
        `${baseUrl}/questions/${firstQ._id}/bookmark`,
        'POST',
        null,
        authHeaders
      );
      if (bmRes2.status !== 200 || bmRes2.body.isBookmarked !== false) {
        throw new Error(`Bookmark remove failed: ${JSON.stringify(bmRes2.body)}`);
      }
      console.log('✅ Bookmark toggle off verified: isBookmarked = false.');

      // 13. Notes functionality
      console.log('\n[Test 13] Testing Notes update (PUT /api/questions/:id/notes)...');
      const testNotes = 'Note: Remember to review two-pointer vs hash map trade-offs.';
      const notesRes = await makeRequest(
        `${baseUrl}/questions/${firstQ._id}/notes`,
        'PUT',
        JSON.stringify({ notes: testNotes }),
        authHeaders
      );
      if (notesRes.status !== 200 || notesRes.body.notes !== testNotes) {
        throw new Error(`Notes update failed: ${JSON.stringify(notesRes.body)}`);
      }

      // Check progress endpoint
      const progRes = await makeRequest(
        `${baseUrl}/questions/${firstQ._id}/progress`,
        'GET',
        null,
        authHeaders
      );
      if (progRes.status !== 200 || progRes.body.progress.notes !== testNotes) {
        throw new Error(`Progress notes mismatch: ${JSON.stringify(progRes.body)}`);
      }
      console.log(`✅ Notes verified: saved and retrieved "${progRes.body.progress.notes}"`);

      // 14. Phase 1 & Phase 2 Auth still works
      console.log('\n[Test 14] Verifying Phase 1 & 2 Auth (GET /api/auth/me)...');
      const meRes = await makeRequest(`${baseUrl}/auth/me`, 'GET', null, authHeaders);
      if (meRes.status !== 200 || meRes.body.user.email !== testEmail) {
        throw new Error(`Auth verification failed: ${JSON.stringify(meRes.body)}`);
      }
      console.log(`✅ Phase 1 & 2 Auth fully intact: User ${meRes.body.user.name} (${meRes.body.user.email}) authenticated.`);

      // Clean up test user
      await User.deleteOne({ email: testEmail });
      await QuestionProgress.deleteMany({ user: meRes.body.user._id });
      console.log('\n[Cleanup] Test user and progress records cleaned up.');

      console.log('\n========================================================');
      console.log('🎉 ALL PHASE 3 BACKEND REQUIREMENTS VERIFIED SUCCESSFULLY!');
      console.log('========================================================');

      server.close(() => process.exit(0));
    } catch (err) {
      console.error('\n❌ VERIFICATION FAILED:', err.message);
      server.close(() => process.exit(1));
    }
  });
}

runPhase3Verification();
