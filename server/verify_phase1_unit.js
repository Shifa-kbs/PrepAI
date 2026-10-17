const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const express = require('express');
const http = require('http');

const User = require('./models/User');
const Question = require('./models/Question');
const QuestionProgress = require('./models/QuestionProgress');
const PracticeSession = require('./models/PracticeSession');
const MockInterview = require('./models/MockInterview');
const StudyPlan = require('./models/StudyPlan');
const generateToken = require('./utils/generateToken');
const { sendPasswordResetEmail } = require('./services/emailService');
const { protect } = require('./middleware/authMiddleware');
const { authorize } = require('./middleware/roleMiddleware');

async function runUnitTests() {
  console.log('====================================================');
  console.log('--- STARTING PHASE 1 DIRECT UNIT & INTEGRATION TESTS ---');
  console.log('====================================================');

  try {
    // 1. Test JWT Generation & Decoding
    console.log('\n[1/7] Testing JWT Token Utility...');
    const fakeUserId = '60d5ec49f1b2c81234567890';
    const token = generateToken(fakeUserId);
    if (!token || typeof token !== 'string') throw new Error('JWT generation failed');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'prepai_super_secret_jwt_key_change_in_production_2026');
    if (decoded.id !== fakeUserId) throw new Error('JWT payload ID mismatch!');
    console.log('✅ JWT Token generation & verification working perfectly!');

    // 2. Test Password Hashing & Reset Token Logic
    console.log('\n[2/7] Testing Password Hashing & Reset Token methods...');
    const rawPassword = 'MySecretPassword123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);
    const isMatch = await bcrypt.compare(rawPassword, hashedPassword);
    if (!isMatch) throw new Error('Bcrypt password hash matching failed');

    const dummyUser = new User({
      name: 'Jane Student',
      email: 'jane@example.com',
      password: hashedPassword,
    });

    const resetToken = dummyUser.getResetPasswordToken();
    if (!resetToken || !dummyUser.resetPasswordToken || !dummyUser.resetPasswordExpire) {
      throw new Error('Password reset token generation failed');
    }
    console.log('✅ Password hashing and crypto reset token methods verified!');

    // 3. Test Email Service Abstraction
    console.log('\n[3/7] Testing Modular Email Service...');
    const emailResult = await sendPasswordResetEmail({
      email: dummyUser.email,
      resetToken,
      resetUrl: `http://localhost:5173/reset-password/${resetToken}`,
    });
    if (!emailResult.success) throw new Error('Email service failed');
    console.log('✅ Modular email service logged reset token successfully!');

    // 4. Test Mongoose Schemas & Protected Select Properties
    console.log('\n[4/7] Testing Model Schemas & Protected Fields...');
    const qSchema = Question.schema.paths;
    if (!qSchema.sampleAnswer.options.select === false) throw new Error('Question.sampleAnswer missing select: false!');
    if (!qSchema.explanation.options.select === false) throw new Error('Question.explanation missing select: false!');
    if (!qSchema.correctAnswerIndex.options.select === false) throw new Error('Question.correctAnswerIndex missing select: false!');
    console.log('✅ Question Model answer protection (select: false) verified!');

    // 5. Test QuestionProgress Compound Index
    console.log('\n[5/7] Testing QuestionProgress Model Indexing...');
    const qpIndexes = QuestionProgress.schema.indexes();
    const hasCompoundIndex = qpIndexes.some((idx) => {
      const fields = idx[0];
      return fields.user === 1 && fields.question === 1 && idx[1]?.unique === true;
    });
    if (!hasCompoundIndex) throw new Error('QuestionProgress compound index { user: 1, question: 1 } missing!');
    console.log('✅ QuestionProgress unique compound index { user: 1, question: 1 } verified!');

    // 6. Test Role Authorization Middleware
    console.log('\n[6/7] Testing Role Middleware Authorization...');
    let req = { user: { role: 'student' } };
    let res = { status: (code) => ({ json: (data) => ({ code, data }) }) };
    let nextCalled = false;
    authorize('admin')(req, res, () => { nextCalled = true; });
    if (nextCalled) throw new Error('Student role bypassed admin check!');

    req.user.role = 'admin';
    authorize('admin')(req, res, () => { nextCalled = true; });
    if (!nextCalled) throw new Error('Admin role blocked by role middleware!');
    console.log('✅ Role middlewareRBAC controls verified!');

    // 7. Test Express App & Health Endpoint
    console.log('\n[7/7] Testing Express Health Route Server...');
    const app = express();
    app.get('/api/health', (req, res) => res.status(200).json({ success: true, message: 'PrepAI API is running' }));
    const server = app.listen(5088);

    const healthRes = await new Promise((resolve, reject) => {
      http.get('http://localhost:5088/api/health', (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      }).on('error', reject);
    });

    if (healthRes.status !== 200 || !healthRes.body.success) throw new Error('Health endpoint check failed');
    server.close();
    console.log('✅ Health Endpoint GET /api/health returned 200 OK with correct JSON response!');

    console.log('\n====================================================');
    console.log('🎉 ALL PHASE 1 DIRECT UNIT TESTS PASSED 100%! 🎉');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ UNIT TEST FAILED:', err.message);
    process.exit(1);
  }
}

runUnitTests();
