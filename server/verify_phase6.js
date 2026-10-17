const mongoose = require('mongoose');
const http = require('http');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/.env' });

const app = require('./index');
const User = require('./models/User');
const Question = require('./models/Question');
const QuestionProgress = require('./models/QuestionProgress');
const PracticeSession = require('./models/PracticeSession');
const MockInterview = require('./models/MockInterview');
const StudyPlan = require('./models/StudyPlan');

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

async function runPhase6Verification() {
  console.log('================================================================');
  console.log('--- STARTING PHASE 6 ANALYTICS, STUDY PLAN & ADMIN TESTS ---');
  console.log('================================================================');

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api`;
    console.log(`[Test Server] Running on ephemeral port ${port}`);

    const userA_Email = `phase6_alice_${Date.now()}@prepai.dev`;
    const userB_Email = `phase6_bob_${Date.now()}@prepai.dev`;
    const adminEmail = `phase6_admin_${Date.now()}@prepai.dev`;
    const password = 'Password123!';

    const createdQuestionIds = [];
    let userADoc, userBDoc, adminDoc;

    try {
      // 1. Setup: Register Alice (User A), Bob (User B), and Admin
      console.log('\n[Step 1] Registering test users (Alice, Bob, Admin)...');
      const regA = await makeRequest(
        `${baseUrl}/auth/register`,
        'POST',
        JSON.stringify({ name: 'Alice Student', email: userA_Email, password })
      );
      if (regA.status !== 201 || !regA.body.token) throw new Error('Registration for Alice failed');
      const tokenA = regA.body.token;
      const headersA = { Authorization: `Bearer ${tokenA}` };

      const regB = await makeRequest(
        `${baseUrl}/auth/register`,
        'POST',
        JSON.stringify({ name: 'Bob Student', email: userB_Email, password })
      );
      if (regB.status !== 201 || !regB.body.token) throw new Error('Registration for Bob failed');
      const tokenB = regB.body.token;
      const headersB = { Authorization: `Bearer ${tokenB}` };

      const regAdmin = await makeRequest(
        `${baseUrl}/auth/register`,
        'POST',
        JSON.stringify({ name: 'Charlie Admin', email: adminEmail, password })
      );
      if (regAdmin.status !== 201 || !regAdmin.body.token) throw new Error('Registration for Admin failed');
      const tokenAdmin = regAdmin.body.token;
      const headersAdmin = { Authorization: `Bearer ${tokenAdmin}` };

      // Promote Charlie to admin directly in MongoDB
      adminDoc = await User.findOne({ email: adminEmail });
      adminDoc.role = 'admin';
      await adminDoc.save();

      userADoc = await User.findOne({ email: userA_Email });
      userBDoc = await User.findOne({ email: userB_Email });

      console.log('✅ Users registered and Admin promoted to role: admin');

      // 2. Empty-State Analytics
      console.log('\n[Step 2] Testing Analytics Empty-State Handling...');
      const emptyAnalytics = await makeRequest(`${baseUrl}/analytics`, 'GET', null, headersA);
      if (emptyAnalytics.status !== 200) throw new Error(`Expected 200 for empty analytics, got ${emptyAnalytics.status}`);
      const emptyData = emptyAnalytics.body.data;
      if (emptyData.practiceOverview.totalSessions !== 0 || emptyData.practiceOverview.completedSessions !== 0) {
        throw new Error('Expected 0 practice sessions for brand new user');
      }
      if (emptyData.questionMetrics.questionsAttempted !== 0 || emptyData.questionMetrics.accuracy !== 0) {
        throw new Error('Expected 0 questions and 0% accuracy for brand new user');
      }
      if (emptyData.mockInterviewMetrics.totalInterviews !== 0) {
        throw new Error('Expected 0 mock interviews for brand new user');
      }
      if (!Array.isArray(emptyData.scoreTrends) || emptyData.scoreTrends.length !== 0) {
        throw new Error('Expected empty scoreTrends array for brand new user');
      }
      console.log('✅ Empty-state analytics returned gracefully with 0 counts and 0% accuracy.');

      // 3. Create Persisted Test Data for Alice
      console.log('\n[Step 3] Seeding Real Persisted Practice Sessions, Progress, & Interviews...');
      // Create test questions conforming to QuestionSchema
      const testQ1 = await Question.create({
        title: 'Phase6 Two Sum Target Test',
        description: 'Find two numbers that add up to target.',
        category: 'DSA',
        difficulty: 'Easy',
        sampleAnswer: 'def twoSum(nums, target): return [0, 1]',
        explanation: 'Hash map approach with O(n) complexity.',
      });
      createdQuestionIds.push(testQ1._id);

      const testQ2 = await Question.create({
        title: 'Phase6 Virtual DOM Diff Test',
        description: 'Explain and implement virtual DOM diffing.',
        category: 'React',
        difficulty: 'Medium',
        sampleAnswer: 'const diff = () => {};',
        explanation: 'Reconciliation algorithm.',
      });
      createdQuestionIds.push(testQ2._id);

      // Question Progress for Alice: 2 DSA attempts (2 correct), 2 React attempts (1 correct)
      await QuestionProgress.create({
        user: userADoc._id,
        question: testQ1._id,
        status: 'solved',
        attempts: 2,
        correctAttempts: 2,
        isBookmarked: true,
      });

      await QuestionProgress.create({
        user: userADoc._id,
        question: testQ2._id,
        status: 'attempted',
        attempts: 2,
        correctAttempts: 1,
        isBookmarked: false,
      });

      // Practice Sessions for Alice
      // Session 1: DSA, score 100%
      await PracticeSession.create({
        user: userADoc._id,
        category: 'DSA',
        difficulty: 'Easy',
        status: 'completed',
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
        totalQuestions: 2,
        score: 100,
        accuracy: 100,
        questions: [testQ1._id, testQ1._id],
        answers: [
          { question: testQ1._id, isCorrect: true, status: 'correct' },
          { question: testQ1._id, isCorrect: true, status: 'correct' },
        ],
      });

      // Session 2: React, score 50%
      await PracticeSession.create({
        user: userADoc._id,
        category: 'React',
        difficulty: 'Medium',
        status: 'completed',
        startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
        totalQuestions: 2,
        score: 50,
        accuracy: 50,
        questions: [testQ2._id, testQ2._id],
        answers: [
          { question: testQ2._id, isCorrect: true, status: 'correct' },
          { question: testQ2._id, isCorrect: false, status: 'wrong' },
        ],
      });

      // Mock Interview for Alice: overall score 85
      await MockInterview.create({
        user: userADoc._id,
        jobRole: 'Full Stack Engineer',
        interviewType: 'Technical',
        difficulty: 'Medium',
        totalQuestions: 1,
        status: 'completed',
        overallScore: 85,
        questions: [{ questionText: 'Explain virtual DOM.' }],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
      });

      console.log('✅ Real persisted sessions and progress created for Alice.');

      // 4. Analytics Calculations Verification
      console.log('\n[Step 4] Verifying Real-Data Analytics Calculations...');
      const aliceAnalytics = await makeRequest(`${baseUrl}/analytics`, 'GET', null, headersA);
      if (aliceAnalytics.status !== 200) throw new Error(`Analytics retrieval failed: ${aliceAnalytics.status}`);
      const aData = aliceAnalytics.body.data;

      // Practice Overview checks: 2 sessions, both completed, avg score = (100 + 50)/2 = 75%
      if (aData.practiceOverview.totalSessions !== 2 || aData.practiceOverview.completedSessions !== 2) {
        throw new Error(`Expected 2 sessions, got total: ${aData.practiceOverview.totalSessions}`);
      }
      if (aData.practiceOverview.averageScore !== 75) {
        throw new Error(`Expected avg score 75%, got ${aData.practiceOverview.averageScore}%`);
      }
      if (aData.practiceOverview.bestScore !== 100) {
        throw new Error(`Expected best score 100%, got ${aData.practiceOverview.bestScore}%`);
      }

      // Mock Interview checks: 1 completed, avg = 85
      if (aData.mockInterviewMetrics.completedInterviews !== 1 || aData.mockInterviewMetrics.averageScore !== 85) {
        throw new Error(`Expected 1 interview with score 85, got ${JSON.stringify(aData.mockInterviewMetrics)}`);
      }

      // Questions Metrics checks: attempted = 2 unique questions, 4 total attempts, 3 correct => accuracy = 75%
      if (aData.questionMetrics.questionsAttempted !== 2 || aData.questionMetrics.correctAnswers !== 3) {
        throw new Error(`Expected 2 unique questions attempted, 3 correct answers. Got: ${JSON.stringify(aData.questionMetrics)}`);
      }
      if (aData.questionMetrics.accuracy !== 75) {
        throw new Error(`Expected 75% accuracy, got ${aData.questionMetrics.accuracy}%`);
      }

      // Score trends check: 2 trend data points sorted chronologically
      if (aData.scoreTrends.length !== 2) {
        throw new Error(`Expected 2 trend points, got ${aData.scoreTrends.length}`);
      }
      if (aData.scoreTrends[0].score !== 100 || aData.scoreTrends[1].score !== 50) {
        throw new Error(`Expected trend scores [100, 50], got [${aData.scoreTrends.map((t) => t.score)}]`);
      }

      // Topic strengths & needs improvement check
      const strengthCats = aData.topicPerformance.strengths.map((s) => s.category);
      const improveCats = aData.topicPerformance.needsImprovement.map((s) => s.category);
      if (!strengthCats.includes('DSA')) {
        throw new Error('Expected DSA in topic strengths (100% accuracy)');
      }
      if (!improveCats.includes('React')) {
        throw new Error('Expected React in areas requiring improvement (50% accuracy)');
      }

      // Recent activity merged check
      if (aData.recentActivity.length !== 3) {
        throw new Error(`Expected 3 recent activities (2 practice + 1 mock), got ${aData.recentActivity.length}`);
      }
      console.log('✅ Real-time Analytics metrics, trends, topic mastery, and activity feed accurately computed.');

      // 5. Cross-User Data Isolation
      console.log('\n[Step 5] Testing Cross-User Analytics & Study Plan Isolation...');
      const bobAnalytics = await makeRequest(`${baseUrl}/analytics`, 'GET', null, headersB);
      if (bobAnalytics.body.data.practiceOverview.totalSessions !== 0) {
        throw new Error("Bob can see Alice's practice sessions! Isolation breached.");
      }
      if (bobAnalytics.body.data.questionMetrics.questionsAttempted !== 0) {
        throw new Error("Bob can see Alice's question progress! Isolation breached.");
      }
      console.log("✅ User B cannot access User A's analytics metrics.");

      // 6. Study Plan Creation & Task Toggling
      console.log('\n[Step 6] Testing Study Plan Creation & Task Toggling...');
      const planPayload = {
        goal: 'Senior Full Stack Engineer',
        targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        studyHoursPerWeek: 12,
        preferredDays: ['Mon', 'Wed', 'Fri', 'Sat'],
        targetCategories: ['DSA', 'React', 'SQL'],
      };

      const planRes = await makeRequest(
        `${baseUrl}/study-plan`,
        'POST',
        JSON.stringify(planPayload),
        headersA
      );

      if (planRes.status !== 200 || !planRes.body.success) {
        throw new Error(`Study plan creation failed: ${JSON.stringify(planRes.body)}`);
      }

      const createdPlan = planRes.body.data;
      if (!createdPlan.tasks || createdPlan.tasks.length === 0) {
        throw new Error('Generated study plan has no tasks');
      }
      if (createdPlan.goal !== 'Senior Full Stack Engineer') {
        throw new Error(`Plan goal mismatch: ${createdPlan.goal}`);
      }
      if (createdPlan.progress !== 0 || createdPlan.completedTasks !== 0) {
        throw new Error('Initial plan progress must be 0');
      }

      // Task Toggle
      const firstTaskId = createdPlan.tasks[0]._id;
      const toggleRes = await makeRequest(
        `${baseUrl}/study-plan/tasks/${firstTaskId}/toggle`,
        'PATCH',
        null,
        headersA
      );

      if (toggleRes.status !== 200 || !toggleRes.body.success) {
        throw new Error(`Toggle task completion failed: ${JSON.stringify(toggleRes.body)}`);
      }

      const updatedPlan = toggleRes.body.data;
      const toggledTask = updatedPlan.tasks.find((t) => t._id === firstTaskId);
      if (!toggledTask || toggledTask.isCompleted !== true) {
        throw new Error('Task was not marked completed');
      }
      if (updatedPlan.completedTasks !== 1 || updatedPlan.progress <= 0) {
        throw new Error('Plan progress and completedTasks did not increment');
      }

      // Toggle back
      const toggleBackRes = await makeRequest(
        `${baseUrl}/study-plan/tasks/${firstTaskId}/toggle`,
        'PATCH',
        null,
        headersA
      );
      if (toggleBackRes.body.data.tasks.find((t) => t._id === firstTaskId).isCompleted !== false) {
        throw new Error('Task was not unchecked');
      }

      // Add Custom Task
      const customTaskRes = await makeRequest(
        `${baseUrl}/study-plan/tasks`,
        'POST',
        JSON.stringify({
          title: 'Review System Design Primer Chapter 3',
          description: 'Read caching patterns',
          category: 'System Design',
          day: 'Sat',
          estimatedMinutes: 45,
          week: 1,
        }),
        headersA
      );
      if (customTaskRes.status !== 201) throw new Error('Add custom task failed');
      const customTask = customTaskRes.body.data.tasks.find(
        (t) => t.title === 'Review System Design Primer Chapter 3'
      );
      if (!customTask) throw new Error('Custom task was not found in plan tasks');

      // Delete Custom Task
      const delTaskRes = await makeRequest(
        `${baseUrl}/study-plan/tasks/${customTask._id}`,
        'DELETE',
        null,
        headersA
      );
      if (delTaskRes.status !== 200) throw new Error('Delete task failed');
      if (delTaskRes.body.data.tasks.find((t) => t._id === customTask._id)) {
        throw new Error('Deleted task still present in plan');
      }

      console.log('✅ Study plan creation, toggle completion, custom task addition, and deletion verified.');

      // 7. Duplicate-Task Prevention on Plan Updates
      console.log('\n[Step 7] Testing Duplicate-Task Prevention during Plan Updates...');
      const planCountBefore = await StudyPlan.countDocuments({ user: userADoc._id });
      if (planCountBefore !== 1) throw new Error(`Expected exactly 1 study plan document, found ${planCountBefore}`);

      const regenPayload = {
        goal: 'Staff Engineer Prep',
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        studyHoursPerWeek: 8,
        preferredDays: ['Mon', 'Tue', 'Thu'],
        targetCategories: ['DSA', 'SQL'],
      };

      const regenRes = await makeRequest(
        `${baseUrl}/study-plan`,
        'POST',
        JSON.stringify(regenPayload),
        headersA
      );
      if (regenRes.status !== 200) throw new Error('Plan regeneration failed');

      const planCountAfter = await StudyPlan.countDocuments({ user: userADoc._id });
      if (planCountAfter !== 1) {
        throw new Error(`Plan document duplicated! Count is now ${planCountAfter}`);
      }
      if (regenRes.body.data.goal !== 'Staff Engineer Prep') {
        throw new Error('Regenerated plan goal was not updated');
      }

      // Check Bob cannot see Alice's plan
      const bobPlan = await makeRequest(`${baseUrl}/study-plan`, 'GET', null, headersB);
      if (bobPlan.body.data !== null) {
        throw new Error("Bob received Alice's study plan! Isolation breached.");
      }
      console.log('✅ Plan regeneration prevents duplicates and respects user isolation.');

      // 8. Admin Authorization & Rejection of Non-Admin Requests
      console.log('\n[Step 8] Testing Admin Authorization (403 for non-admins)...');
      const nonAdminStats = await makeRequest(`${baseUrl}/admin/stats`, 'GET', null, headersA);
      if (nonAdminStats.status !== 403) {
        throw new Error(`Expected 403 Forbidden for non-admin on /admin/stats, got ${nonAdminStats.status}`);
      }

      const nonAdminUsers = await makeRequest(`${baseUrl}/admin/users`, 'GET', null, headersA);
      if (nonAdminUsers.status !== 403) {
        throw new Error(`Expected 403 Forbidden for non-admin on /admin/users, got ${nonAdminUsers.status}`);
      }

      const nonAdminQCreate = await makeRequest(
        `${baseUrl}/admin/questions`,
        'POST',
        JSON.stringify({ title: 'Hacker Q' }),
        headersA
      );
      if (nonAdminQCreate.status !== 403) {
        throw new Error(`Expected 403 Forbidden for non-admin on /admin/questions, got ${nonAdminQCreate.status}`);
      }
      console.log('✅ Non-admin requests are strictly rejected with 403 Forbidden.');

      // 9. Admin Platform Statistics & User Management
      console.log('\n[Step 9] Testing Admin Platform Statistics & User Management...');
      const adminStats = await makeRequest(`${baseUrl}/admin/stats`, 'GET', null, headersAdmin);
      if (adminStats.status !== 200 || !adminStats.body.success) {
        throw new Error(`Admin stats retrieval failed: ${JSON.stringify(adminStats.body)}`);
      }
      const sData = adminStats.body.data;
      if (sData.users.total < 3 || sData.questions.total < 2) {
        throw new Error(`Stats counts incorrect: ${JSON.stringify(sData)}`);
      }

      // Admin Users safe search & pagination
      const adminUsersRes = await makeRequest(
        `${baseUrl}/admin/users?search=Alice`,
        'GET',
        null,
        headersAdmin
      );
      if (adminUsersRes.status !== 200) throw new Error('Admin users list failed');
      const userList = adminUsersRes.body.data.users;
      if (!userList.some((u) => u.email === userA_Email)) {
        throw new Error('Alice was not returned in admin user search');
      }

      // 10. Sensitive Data Exclusion
      console.log('\n[Step 10] Verifying Sensitive Data Exclusion from Responses...');
      for (const u of userList) {
        if (u.password !== undefined) throw new Error(`Sensitive field 'password' exposed for user ${u.email}`);
        if (u.passwordResetToken !== undefined) throw new Error(`Sensitive 'passwordResetToken' exposed`);
        if (u.passwordResetExpires !== undefined) throw new Error(`Sensitive 'passwordResetExpires' exposed`);
      }
      console.log('✅ Passwords, hashes, and reset tokens are strictly excluded from admin responses.');

      // 11. Admin Self-Demotion Prevention
      console.log('\n[Step 11] Testing Admin Self-Demotion Prevention...');
      const selfDemoteRes = await makeRequest(
        `${baseUrl}/admin/users/${adminDoc._id}/role`,
        'PATCH',
        JSON.stringify({ role: 'student' }),
        headersAdmin
      );
      if (selfDemoteRes.status !== 400) {
        throw new Error(`Expected 400 when admin attempts self-demotion, got ${selfDemoteRes.status}`);
      }
      console.log('✅ Self-demotion is strictly prevented to safeguard platform access.');

      // 12. Question CRUD Validation & Persistence
      console.log('\n[Step 12] Testing Admin Question CRUD...');
      // Validation failure check
      const invalidQ = await makeRequest(
        `${baseUrl}/admin/questions`,
        'POST',
        JSON.stringify({ title: '' }),
        headersAdmin
      );
      if (invalidQ.status !== 400) {
        throw new Error(`Expected 400 on invalid question create, got ${invalidQ.status}`);
      }

      // Valid Question Create
      const newQRes = await makeRequest(
        `${baseUrl}/admin/questions`,
        'POST',
        JSON.stringify({
          title: 'Phase6 Admin Created Question',
          description: 'A test problem created via admin portal.',
          category: 'SQL',
          difficulty: 'Hard',
          companyTags: ['Amazon', 'Google'],
          sampleAnswer: 'SELECT * FROM users WHERE active = 1;',
          explanation: 'B-tree index scan on active flag.',
        }),
        headersAdmin
      );
      if (newQRes.status !== 201) throw new Error(`Admin question creation failed: ${newQRes.status}`);
      const createdQId = newQRes.body.data._id;
      createdQuestionIds.push(createdQId);

      // Question Update
      const updateQRes = await makeRequest(
        `${baseUrl}/admin/questions/${createdQId}`,
        'PUT',
        JSON.stringify({
          title: 'Phase6 Admin Updated Question',
          category: 'SQL',
          difficulty: 'Medium',
        }),
        headersAdmin
      );
      if (updateQRes.status !== 200 || updateQRes.body.data.title !== 'Phase6 Admin Updated Question') {
        throw new Error('Admin question update failed');
      }

      // Question Delete
      const deleteQRes = await makeRequest(
        `${baseUrl}/admin/questions/${createdQId}`,
        'DELETE',
        null,
        headersAdmin
      );
      if (deleteQRes.status !== 200) throw new Error('Admin question delete failed');

      const checkDeleted = await Question.findById(createdQId);
      if (checkDeleted) throw new Error('Question was not deleted from database');
      console.log('✅ Question CRUD, validation, update, and deletion verified.');

      console.log('\n================================================================');
      console.log('🎉 ALL PHASE 6 AUTOMATED VERIFICATION CHECKS PASSED SUCCESSFULLY!');
      console.log('================================================================');
    } catch (err) {
      console.error('\n❌ Phase 6 Verification Failed:', err.message);
      process.exitCode = 1;
    } finally {
      // Cleanup Test Records
      console.log('\n[Cleanup] Cleaning up isolated test records from MongoDB Atlas...');
      try {
        await User.deleteMany({ email: { $in: [userA_Email, userB_Email, adminEmail] } });
        if (createdQuestionIds.length > 0) {
          await Question.deleteMany({ _id: { $in: createdQuestionIds } });
        }
        await QuestionProgress.deleteMany({ user: { $in: [userADoc?._id, userBDoc?._id] } });
        await PracticeSession.deleteMany({ user: { $in: [userADoc?._id, userBDoc?._id] } });
        await MockInterview.deleteMany({ user: { $in: [userADoc?._id, userBDoc?._id] } });
        await StudyPlan.deleteMany({ user: { $in: [userADoc?._id, userBDoc?._id] } });
        console.log('✅ Cleanup completed successfully.');
      } catch (cleanErr) {
        console.error('Cleanup warning:', cleanErr.message);
      }

      server.close(() => {
        console.log('[Test Server] Ephemeral server closed.');
        mongoose.connection.close(false).then(() => {
          console.log('[MongoDB] Connection closed.');
          process.exit(process.exitCode || 0);
        });
      });
    }
  });
}

runPhase6Verification();
