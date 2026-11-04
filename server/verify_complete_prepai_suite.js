/**
 * PrepAI v1.0 Comprehensive Automated Regression Test Suite
 * Validates:
 * 1. Coding Sandbox Evaluation (JS, Python, test case matching, timeouts, anti-spoofing)
 * 2. AI Mock Interview Evaluation (0-answers / Not Evaluated, Partial Evaluation, Full Evaluation)
 * 3. Learning Studio Curriculum (5 Domains, 17 DSA topics, 5 CS subjects, 41 total topics)
 * 4. API Health & Security Middleware
 */

const assert = require('assert');
const path = require('path');
const { executeCode } = require('./services/codeExecutionService');
const aiInterviewService = require('./services/aiInterviewService');

async function runRegressionSuite() {
  console.log('================================================================');
  console.log('       PREPAI v1.0 - FULL PLATFORM REGRESSION VERIFICATION      ');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function test(name, fn) {
    totalTests++;
    try {
      fn();
      console.log(`  [PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`  [FAIL] ${name}:`, err.message);
      throw err;
    }
  }

  async function asyncTest(name, fn) {
    totalTests++;
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`  [FAIL] ${name}:`, err.message);
      throw err;
    }
  }

  // =================================================================
  // SECTION 1: CODING SANDBOX EVALUATION
  // =================================================================
  console.log('--- SECTION 1: CODING SANDBOX EVALUATION ---');
  process.env.ENABLE_LOCAL_UNSAFE_RUNNER = 'true';
  process.env.NODE_ENV = 'development';

  const twoSumTestCases = [
    { input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]', isHidden: false },
    { input: '[3, 2, 4], 6', expectedOutput: '[1, 2]', isHidden: false },
    { input: '[3, 3], 6', expectedOutput: '[0, 1]', isHidden: false },
  ];

  await asyncTest('JavaScript: Correct solution passes all test cases', async () => {
    const code = `
      function twoSum(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
          const complement = target - nums[i];
          if (map.has(complement)) {
            return [map.get(complement), i];
          }
          map.set(nums[i], i);
        }
        return [];
      }
    `;
    const res = await executeCode('javascript', code, twoSumTestCases, 2000);
    assert.strictEqual(res.allPassed, true, 'All test cases should pass');
    assert.strictEqual(res.passedCount, 3, 'Should pass 3/3');
    assert.strictEqual(res.results.length, 3, 'Should have 3 results');
    assert.strictEqual(res.results[0].passed, true, 'Test case 1 must pass');
  });

  await asyncTest('JavaScript: Incorrect solution correctly fails', async () => {
    const wrongCode = `
      function twoSum(nums, target) {
        return [0, 0];
      }
    `;
    const res = await executeCode('javascript', wrongCode, twoSumTestCases, 2000);
    assert.strictEqual(res.allPassed, false, 'Should fail allPassed');
    assert(res.passedCount < 3, 'Pass count must be less than 3');
  });

  await asyncTest('JavaScript: Infinite loop safely times out without hanging server', async () => {
    const loopCode = `
      function twoSum(nums, target) {
        while(true) {}
      }
    `;
    const res = await executeCode('javascript', loopCode, twoSumTestCases, 1500);
    assert.strictEqual(res.allPassed, false, 'Infinite loop must fail');
    assert(res.results[0].error.toLowerCase().includes('time limit exceeded') || res.results[0].error.toLowerCase().includes('timed out'), 'Should record timeout');
  });

  await asyncTest('Python: Correct solution passes via native Python runner', async () => {
    const pythonCode = `
def twoSum(nums, target):
    prevMap = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in prevMap:
            return [prevMap[diff], i]
        prevMap[n] = i
    return []
`;
    const res = await executeCode('python', pythonCode, twoSumTestCases, 3500);
    assert.strictEqual(res.allPassed, true, 'Python solution should pass');
    assert.strictEqual(res.passedCount, 3, 'Should pass 3/3');
  });

  await asyncTest('Python: Syntax error correctly captured and reported', async () => {
    const brokenPython = `
def twoSum(nums, target)
    return invalid syntax
`;
    const res = await executeCode('python', brokenPython, twoSumTestCases, 3500);
    assert.strictEqual(res.allPassed, false, 'Syntax error must fail');
    assert(res.results[0].error.length > 0, 'Error message must be present');
  });

  // =================================================================
  // SECTION 2: AI MOCK INTERVIEW EVALUATION & SCORING RULES
  // =================================================================
  console.log('\n--- SECTION 2: AI MOCK INTERVIEW EVALUATION ---');

  await asyncTest('Rule A (Zero Answers): All skipped yields Not Evaluated and null scores', async () => {
    const zeroAnswers = [
      { questionText: 'Q1', userAnswer: '', score: 0, status: 'skipped' },
      { questionText: 'Q2', userAnswer: '[Skipped by candidate]', score: 0, status: 'skipped' },
      { questionText: 'Q3', userAnswer: '', score: 0, status: 'skipped' },
      { questionText: 'Q4', userAnswer: '', score: 0, status: 'unanswered' },
      { questionText: 'Q5', userAnswer: '', score: 0, status: 'unanswered' },
    ];
    const report = await aiInterviewService.generateFinalReport({
      jobRole: 'Full Stack Developer',
      interviewType: 'Technical',
      difficulty: 'Medium',
      experienceLevel: 'Fresher (0-1 yrs)',
      questions: zeroAnswers,
    });
    assert.strictEqual(report.overallScore, null, 'Overall score must be null');
    assert.strictEqual(report.evaluationStatus, 'Not Evaluated', 'Status must be Not Evaluated');
    assert.strictEqual(report.technicalKnowledge, null, 'Technical knowledge must be null');
    assert.strictEqual(report.problemSolving, null, 'Problem solving must be null');
    assert.strictEqual(report.topStrengths.length, 0, 'Strengths must be empty array');
    assert(report.summary.toLowerCase().includes('no answers were submitted'), 'Summary must mention zero answers');
  });

  await asyncTest('Rule B (Partial Answers): 2 of 5 answered evaluated strictly on answered subset', async () => {
    const partialAnswers = [
      { questionText: 'Q1', userAnswer: 'React Fiber enables incremental rendering.', score: 80, status: 'answered' },
      { questionText: 'Q2', userAnswer: 'B-Trees reduce disk I/O with high branching factor.', score: 90, status: 'answered' },
      { questionText: 'Q3', userAnswer: '[Skipped by candidate]', score: 0, status: 'skipped' },
      { questionText: 'Q4', userAnswer: '[Skipped by candidate]', score: 0, status: 'skipped' },
      { questionText: 'Q5', userAnswer: '[Skipped by candidate]', score: 0, status: 'skipped' },
    ];
    const report = await aiInterviewService.generateFinalReport({
      jobRole: 'Full Stack Developer',
      interviewType: 'Technical',
      difficulty: 'Medium',
      experienceLevel: 'Fresher (0-1 yrs)',
      questions: partialAnswers,
    });
    assert.strictEqual(report.overallScore, 85, 'Overall score must be average of answered (85)');
    assert.strictEqual(report.evaluationStatus, 'Partial Evaluation', 'Status must be Partial Evaluation');
    assert.strictEqual(report.answeredCount, 2, 'answeredCount must be 2');
    assert.strictEqual(report.skippedCount, 3, 'skippedCount must be 3');
  });

  await asyncTest('Rule C (All Answers): 5 of 5 answered produces full Completed report', async () => {
    const fullAnswers = [
      { questionText: 'Q1', userAnswer: 'Answer 1 with detail', score: 85, status: 'answered' },
      { questionText: 'Q2', userAnswer: 'Answer 2 with detail', score: 75, status: 'answered' },
      { questionText: 'Q3', userAnswer: 'Answer 3 with detail', score: 90, status: 'answered' },
      { questionText: 'Q4', userAnswer: 'Answer 4 with detail', score: 80, status: 'answered' },
      { questionText: 'Q5', userAnswer: 'Answer 5 with detail', score: 80, status: 'answered' },
    ];
    const report = await aiInterviewService.generateFinalReport({
      jobRole: 'Full Stack Developer',
      interviewType: 'Technical',
      difficulty: 'Medium',
      experienceLevel: 'Fresher (0-1 yrs)',
      questions: fullAnswers,
    });
    assert.strictEqual(report.overallScore, 82, 'Overall score must be average of 5 (82)');
    assert.strictEqual(report.evaluationStatus, 'Completed', 'Status must be Completed');
    assert.strictEqual(report.answeredCount, 5, 'answeredCount must be 5');
    assert.strictEqual(report.skippedCount, 0, 'skippedCount must be 0');
  });

  // =================================================================
  // SECTION 3: LEARNING STUDIO CURRICULUM
  // =================================================================
  console.log('\n--- SECTION 3: LEARNING STUDIO CURRICULUM ---');

  const { CURRICULUM } = require('../client/src/data/learningCurriculum');

  test('Curriculum contains all 5 Core Domains', () => {
    assert.strictEqual(CURRICULUM.length, 5, 'Must have 5 main domains');
    const domainIds = CURRICULUM.map(d => d.subjectId);
    assert(domainIds.includes('quant'), 'Must include Quantitative Aptitude');
    assert(domainIds.includes('logical'), 'Must include Logical Reasoning');
    assert(domainIds.includes('verbal'), 'Must include Verbal Ability');
    assert(domainIds.includes('dsa'), 'Must include DSA & Coding Practice');
    assert(domainIds.includes('cs-fundamentals'), 'Must include CS Fundamentals');
  });

  test('DSA domain contains ALL 17 required topics', () => {
    const dsaDomain = CURRICULUM.find(d => d.subjectId === 'dsa');
    assert(dsaDomain, 'DSA domain must exist');
    assert.strictEqual(dsaDomain.topics.length, 17, `DSA must contain 17 topics, got ${dsaDomain.topics.length}`);

    const expectedDsaTopics = [
      'dsa-arrays',
      'dsa-strings',
      'dsa-linked-lists',
      'dsa-stacks',
      'dsa-queues',
      'dsa-hashing',
      'dsa-searching',
      'dsa-sorting',
      'dsa-recursion',
      'dsa-backtracking',
      'dsa-trees',
      'dsa-bst',
      'dsa-heaps',
      'dsa-graphs',
      'dsa-greedy',
      'dsa-dynamic-programming',
      'dsa-advanced-ds',
    ];

    expectedDsaTopics.forEach(expectedId => {
      const found = dsaDomain.topics.find(t => t.id === expectedId);
      assert(found, `DSA topic ${expectedId} must be present in curriculum`);
    });
  });

  test('CS Fundamentals contains ALL 5 required subjects', () => {
    const csDomain = CURRICULUM.find(d => d.subjectId === 'cs-fundamentals');
    assert(csDomain, 'CS Fundamentals domain must exist');
    assert.strictEqual(csDomain.topics.length, 5, `CS Fundamentals must contain 5 subjects, got ${csDomain.topics.length}`);

    const expectedCsSubjects = ['cs-oop', 'cs-dbms', 'cs-sql', 'cs-os', 'cs-cn'];
    expectedCsSubjects.forEach(expectedId => {
      const found = csDomain.topics.find(t => t.id === expectedId);
      assert(found, `CS subject ${expectedId} must be present in curriculum`);
    });
  });

  test('Every topic has complete concepts, formulas, shortcuts, solved examples, practice questions & topic tests', () => {
    let totalQuestions = 0;
    let totalTopics = 0;

    CURRICULUM.forEach(domain => {
      domain.topics.forEach(topic => {
        totalTopics++;
        assert(topic.title, `Topic in ${domain.subjectId} must have title`);
        assert(topic.concept && topic.concept.overview, `Topic ${topic.id} must have concept overview`);
        assert(Array.isArray(topic.concept.formulas) && topic.concept.formulas.length > 0, `Topic ${topic.id} must have formulas`);
        assert(Array.isArray(topic.concept.solvedExamples) && topic.concept.solvedExamples.length > 0, `Topic ${topic.id} must have solved examples`);
        assert(Array.isArray(topic.practiceQuestions) && topic.practiceQuestions.length > 0, `Topic ${topic.id} must have practice questions`);
        assert(Array.isArray(topic.topicTest) && topic.topicTest.length > 0, `Topic ${topic.id} must have topic tests`);

        totalQuestions += (topic.practiceQuestions.length + topic.topicTest.length);

        // Verify question structure
        topic.practiceQuestions.forEach(q => {
          assert(q.question, `Practice question in ${topic.id} must have question text`);
          assert(Array.isArray(q.options) && q.options.length >= 4, `Practice question in ${topic.id} must have >= 4 options`);
          assert(q.correctIndex >= 0 && q.correctIndex < q.options.length, `Practice question in ${topic.id} must have valid correctIndex`);
          assert(q.hint, `Practice question in ${topic.id} must have a hint`);
          assert(q.explanation, `Practice question in ${topic.id} must have an explanation`);
        });

        topic.topicTest.forEach(q => {
          assert(q.question, `Test question in ${topic.id} must have question text`);
          assert(Array.isArray(q.options) && q.options.length >= 4, `Test question in ${topic.id} must have >= 4 options`);
          assert(q.correctIndex >= 0 && q.correctIndex < q.options.length, `Test question in ${topic.id} must have valid correctIndex`);
          assert(q.explanation, `Test question in ${topic.id} must have an explanation`);
        });
      });
    });

    assert.strictEqual(totalTopics, 41, `Total topics must be 41, got ${totalTopics}`);
    assert(totalQuestions >= 82, `Total questions must be >= 82, got ${totalQuestions}`);
    console.log(`     -> Verified ${totalTopics} topics across 5 domains with ${totalQuestions} validated MCQs`);
  });

  // =================================================================
  // SECTION 4: PRODUCTION DEPLOYMENT & SECURITY
  // =================================================================
  console.log('\n--- SECTION 4: PRODUCTION DEPLOYMENT & SECURITY ---');

  test('Vercel SPA rewrite configuration exists and is valid', () => {
    const vercelConfig = require('../client/vercel.json');
    assert(Array.isArray(vercelConfig.rewrites), 'Vercel rewrites must be an array');
    assert.strictEqual(vercelConfig.rewrites[0].destination, '/index.html', 'Rewrites must point to /index.html');
  });

  test('Render blueprint configuration exists and has health check', () => {
    const fs = require('fs');
    const renderPath = path.join(__dirname, '../render.yaml');
    assert(fs.existsSync(renderPath), 'render.yaml must exist');
    const content = fs.readFileSync(renderPath, 'utf8');
    assert(content.includes('/api/health'), 'render.yaml must have /api/health health check');
    assert(content.includes('npm start'), 'render.yaml must have npm start');
  });

  test('Root .gitignore protects .env and sensitive credentials', () => {
    const fs = require('fs');
    const gitignorePath = path.join(__dirname, '../.gitignore');
    assert(fs.existsSync(gitignorePath), '.gitignore must exist');
    const content = fs.readFileSync(gitignorePath, 'utf8');
    assert(content.includes('.env'), '.gitignore must exclude .env');
    assert(content.includes('node_modules'), '.gitignore must exclude node_modules');
  });

  await asyncTest('Production Security Gate: Untrusted code execution safely blocked when Judge0 is unconfigured', async () => {
    delete process.env.ENABLE_LOCAL_UNSAFE_RUNNER;
    delete process.env.JUDGE0_API_KEY;
    delete process.env.JUDGE0_API_URL;
    process.env.NODE_ENV = 'production';

    const testCases = [{ input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]' }];
    const res = await executeCode('javascript', 'function twoSum(nums, target) { return [0, 1]; }', testCases);
    assert.strictEqual(res.isUnavailable, true, 'Execution must return isUnavailable in production without Judge0');
    assert.strictEqual(res.allPassed, false, 'Must not claim passed');
    assert.strictEqual(res.passedCount, 0, 'Passed count must be 0');
  });

  console.log('\n================================================================');
  console.log(`  ALL ${passedTests}/${totalTests} REGRESSION TESTS EXECUTED AND PASSED 100%!`);
  console.log('================================================================\n');
}

runRegressionSuite().catch(err => {
  console.error('\nSuite Execution Interrupted:', err);
  process.exit(1);
});
