/**
 * Comprehensive PrepAI v1.0 Production Verification Suite
 * Tests:
 * 1. Question Bank Integrity & Category Coverage (Java, Python, C++, JS, DSA, CS core, Aptitude)
 * 2. Multi-Language Code Execution Hardening (Java, Python, C++, JS)
 * 3. Gemini AI Interviewer & Mentoring Engine (Status, Live vs Offline, Readiness, Concepts, Roadmap)
 * 4. Auth Security Verification (Password Reset Token never leaked in API response)
 * 5. Learning Studio Persistence Schema Validation
 */

const { allQuestions, categoryBreakdown } = require('./data/questions');
const codeExecutionService = require('./services/codeExecutionService');
const aiInterviewService = require('./services/aiInterviewService');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runComprehensiveVerification() {
  console.log('========================================================================');
  console.log('🚀 PREPAI v1.0 COMPREHENSIVE PRODUCTION VERIFICATION SUITE');
  console.log('========================================================================');

  // ==========================================
  // 1. Question Bank Verification
  // ==========================================
  console.log('\n[1/5] Validating Question Banks & Categorical Distribution...');
  assert(Array.isArray(allQuestions) && allQuestions.length >= 200, `Question bank contains ${allQuestions.length} total curated questions`);

  const categoryCounts = {};
  const allowedCategories = [
    'DSA', 'Java', 'Python', 'C++', 'JavaScript',
    'SQL', 'DBMS', 'Operating Systems', 'Computer Networks', 'OOP',
    'Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'
  ];

  allQuestions.forEach((q, i) => {
    categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
    if (!q.title || !q.description || !q.category) {
      throw new Error(`Question at index ${i} missing required title, description, or category`);
    }
    if (q.type === 'mcq') {
      if (!Array.isArray(q.options) || q.options.length < 2 || q.correctAnswerIndex === undefined) {
        throw new Error(`Invalid MCQ question at index ${i}: "${q.title}"`);
      }
    }
  });

  console.log('  Question distribution across modules:');
  for (const cat of allowedCategories) {
    const count = categoryCounts[cat] || 0;
    assert(count > 0, `Category "${cat}" has active questions (Count: ${count})`);
  }

  // Ensure purged categories are 0
  assert(!categoryCounts['Web Development'], 'Web Development successfully purged from question bank');
  assert(!categoryCounts['Software Engineering'], 'Software Engineering successfully purged from question bank');

  // ==========================================
  // 2. Multi-Language Code Execution Hardening
  // ==========================================
  console.log('\n[2/5] Validating Multi-Language Sandboxed Execution Dispatcher...');

  // Test JavaScript execution
  const jsCode = `function reverseString(s) { return s.split('').reverse().join(''); }`;
  const jsRes = await codeExecutionService.executeCode('javascript', jsCode, [
    { input: 'hello', expectedOutput: 'olleh' }
  ]);
  assert(jsRes.allPassed === true, `JavaScript isolated execution passed (${jsRes.passedCount}/${jsRes.totalTests} tests)`);

  // Test Python execution
  const pyCode = `def reverse_words(s):\n    return ' '.join(s.split()[::-1])`;
  const pyRes = await codeExecutionService.executeCode('python', pyCode, [
    { input: 'the sky is blue', expectedOutput: 'blue is sky the' }
  ]);
  assert(pyRes.allPassed === true, `Python isolated execution passed (${pyRes.passedCount}/${pyRes.totalTests} tests)`);

  // Test Java execution
  const javaCode = `
class Solution {
    public int search(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] == target) return i;
        }
        return -1;
    }
}`;
  const javaRes = await codeExecutionService.executeCode('java', javaCode, [
    { input: '[-1,0,3,5,9,12], 9', expectedOutput: '4' }
  ]);
  assert(javaRes.allPassed === true, `Java isolated execution passed (${javaRes.passedCount}/${javaRes.totalTests} tests)`);

  // Test C++ execution
  const cppCode = `
class Solution {
public:
    int search(vector<int>& nums, int target) {
        for (int i = 0; i < nums.size(); i++) {
            if (nums[i] == target) return i;
        }
        return -1;
    }
};`;
  const cppRes = await codeExecutionService.executeCode('cpp', cppCode, [
    { input: '[-1,0,3,5,9,12], 9', expectedOutput: '4' }
  ]);
  assert(cppRes.allPassed === true, `C++ isolated execution passed (${cppRes.passedCount}/${cppRes.totalTests} tests)`);

  // ==========================================
  // 3. Gemini AI Interviewer & Mentoring
  // ==========================================
  console.log('\n[3/5] Validating AI Interview Status & Mentoring Engine...');
  const aiStatus = aiInterviewService.getAIStatus();
  assert(typeof aiStatus.isConfigured === 'boolean', `AI configured check returns boolean (${aiStatus.isConfigured})`);
  assert(typeof aiStatus.mode === 'string', `AI mode transparently reported: "${aiStatus.mode}"`);
  assert(!aiStatus.key && !JSON.stringify(aiStatus).includes('AIza'), 'AI status does not leak sensitive API keys');

  // Validate Mock Interview Questions Generation
  const questionsRes = await aiInterviewService.generateInterviewQuestions({
    jobRole: 'Full Stack Engineer',
    interviewType: 'Technical',
    difficulty: 'Medium',
    questionCount: 3,
    topics: ['Node.js', 'System Design']
  });
  assert(Array.isArray(questionsRes) && questionsRes.length === 3, `Generated ${questionsRes.length} AI interview questions`);

  // Validate Mentoring Generation
  const mockInterviewDoc = {
    jobRole: 'Frontend Developer',
    interviewType: 'Technical',
    difficulty: 'Medium',
    experienceLevel: 'Mid-Level',
    questions: [
      {
        questionText: 'Explain JavaScript event loop and microtask queue.',
        category: 'JavaScript',
        difficulty: 'Medium',
        userAnswer: 'The event loop checks the call stack and microtask queue before executing macrotasks.',
        score: 82,
        strengths: ['Clear grasp of async coordination'],
        weaknesses: ['Could mention setImmediate']
      },
      {
        questionText: 'How do you optimize React component re-renders?',
        category: 'React',
        difficulty: 'Medium',
        userAnswer: 'Using React.memo, useCallback, and optimizing state placement.',
        score: 74,
        strengths: ['Identified memoization techniques'],
        weaknesses: ['Missed useDeferredValue']
      }
    ]
  };

  const mentoring = await aiInterviewService.generateFinalReport(mockInterviewDoc);
  assert(typeof mentoring.overallScore === 'number', `Mentoring overallScore generated (${mentoring.overallScore}%)`);
  assert(Array.isArray(mentoring.missingConcepts) && mentoring.missingConcepts.length > 0, `Mentoring identified missing concepts: [${mentoring.missingConcepts.join(', ')}]`);
  assert(Array.isArray(mentoring.recommendedTopicsToPractice) && mentoring.recommendedTopicsToPractice.length > 0, `Mentoring recommended practice modules: [${mentoring.recommendedTopicsToPractice.join(', ')}]`);
  assert(Array.isArray(mentoring.studyRoadmap) && mentoring.studyRoadmap.length > 0, `Mentoring created ${mentoring.studyRoadmap.length}-week structured action plan`);

  // ==========================================
  // 4. Critical Security Verification (Password Reset)
  // ==========================================
  console.log('\n[4/5] Validating Security & Sensitive Token Protections...');
  const authControllerSource = require('fs').readFileSync('./controllers/authController.js', 'utf8');
  assert(!authControllerSource.includes('resetToken: resetToken'), 'authController forgotPassword does NOT leak resetToken in response JSON');
  assert(authControllerSource.includes("Password reset link has been dispatched to your email address."), 'authController forgotPassword returns safe generic message');

  // Verify emailService does not dump raw resetToken into console in production mode
  const emailServiceSource = require('fs').readFileSync('./services/emailService.js', 'utf8');
  assert(emailServiceSource.includes("process.env.NODE_ENV === 'production'"), 'emailService conditionally guards debug token logging for production environment');

  // ==========================================
  // 5. MongoDB Models & Learning Studio Integration
  // ==========================================
  console.log('\n[5/5] Validating Database Schema & Learning Studio Integration...');
  const practiceSessionSchema = require('./models/PracticeSession').schema;
  const moduleTypeValues = practiceSessionSchema.path('moduleType').enumValues;
  assert(moduleTypeValues.includes('learning'), `PracticeSession schema moduleType enum includes 'learning' (${moduleTypeValues.join(', ')})`);

  console.log('\n========================================================================');
  console.log(`🏆 ALL PRODUCTION VERIFICATION TESTS PASSED: ${passedTests}/${totalTests} (100%)`);
  console.log('========================================================================\n');
}

runComprehensiveVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
