const assert = require('assert');
const aiInterviewService = require('./services/aiInterviewService');

async function runTests() {
  console.log('--- Testing AI Mock Interview Evaluation Fixes ---');

  // Scenario A: 0 answers submitted (5 questions skipped/unanswered)
  console.log('\n[Test 1] Testing 0 Answers Submitted (All Skipped)...');
  const questionsA = [
    { questionText: 'Q1', userAnswer: '', score: 0, status: 'skipped' },
    { questionText: 'Q2', userAnswer: '[Skipped by candidate]', score: 0, status: 'skipped' },
    { questionText: 'Q3', userAnswer: '', score: 0, status: 'unanswered' },
    { questionText: 'Q4', userAnswer: '', score: 0, status: 'unanswered' },
    { questionText: 'Q5', userAnswer: '', score: 0, status: 'unanswered' },
  ];

  const reportA = await aiInterviewService.generateFinalReport({
    jobRole: 'Full Stack Developer',
    interviewType: 'Technical',
    difficulty: 'Medium',
    experienceLevel: 'Fresher (0-1 yrs)',
    questions: questionsA,
  });

  assert.strictEqual(reportA.overallScore, null, 'Overall score must be null for 0 answers');
  assert.strictEqual(reportA.evaluationStatus, 'Not Evaluated', 'Evaluation status must be Not Evaluated');
  assert.strictEqual(reportA.technicalKnowledge, null, 'Technical knowledge score must be null');
  assert.strictEqual(reportA.problemSolving, null, 'Problem solving score must be null');
  assert.strictEqual(reportA.topStrengths.length, 0, 'Top strengths must be empty array for 0 answers');
  assert(reportA.summary.toLowerCase().includes('no answers were submitted'), 'Summary must mention no answers were submitted');
  console.log('✓ Test 1 Passed: Zero answers correctly produces Not Evaluated and null scores.');

  // Scenario B: Partial Answers Submitted (2 answered, 3 skipped)
  console.log('\n[Test 2] Testing Partial Evaluation (2 of 5 answered)...');
  const questionsB = [
    { questionText: 'Q1', userAnswer: 'React uses a virtual DOM to diff updates efficiently.', score: 80, status: 'answered' },
    { questionText: 'Q2', userAnswer: 'B-trees reduce disk I/O by keeping balanced multi-way trees.', score: 90, status: 'answered' },
    { questionText: 'Q3', userAnswer: '[Skipped by candidate]', score: 0, status: 'skipped' },
    { questionText: 'Q4', userAnswer: '[Skipped by candidate]', score: 0, status: 'skipped' },
    { questionText: 'Q5', userAnswer: '[Skipped by candidate]', score: 0, status: 'skipped' },
  ];

  const reportB = await aiInterviewService.generateFinalReport({
    jobRole: 'Full Stack Developer',
    interviewType: 'Technical',
    difficulty: 'Medium',
    experienceLevel: 'Fresher (0-1 yrs)',
    questions: questionsB,
  });

  assert.strictEqual(reportB.overallScore, 85, `Overall score must be average of answered questions (85), got ${reportB.overallScore}`);
  assert.strictEqual(reportB.evaluationStatus, 'Partial Evaluation', 'Evaluation status must be Partial Evaluation');
  assert.strictEqual(reportB.answeredCount, 2, 'answeredCount must be 2');
  assert.strictEqual(reportB.skippedCount, 3, 'skippedCount must be 3');
  console.log('✓ Test 2 Passed: Partial answers evaluated strictly on answered questions with Partial Evaluation status.');

  // Scenario C: Full Answers Submitted (5 of 5 answered)
  console.log('\n[Test 3] Testing Full Evaluation (5 of 5 answered)...');
  const questionsC = [
    { questionText: 'Q1', userAnswer: 'Answer 1 with solid technical keywords.', score: 80, status: 'answered' },
    { questionText: 'Q2', userAnswer: 'Answer 2 with solid technical keywords.', score: 85, status: 'answered' },
    { questionText: 'Q3', userAnswer: 'Answer 3 with solid technical keywords.', score: 90, status: 'answered' },
    { questionText: 'Q4', userAnswer: 'Answer 4 with solid technical keywords.', score: 75, status: 'answered' },
    { questionText: 'Q5', userAnswer: 'Answer 5 with solid technical keywords.', score: 80, status: 'answered' },
  ];

  const reportC = await aiInterviewService.generateFinalReport({
    jobRole: 'Full Stack Developer',
    interviewType: 'Technical',
    difficulty: 'Medium',
    experienceLevel: 'Fresher (0-1 yrs)',
    questions: questionsC,
  });

  assert.strictEqual(reportC.overallScore, 82, `Overall score must be average of answered questions (82), got ${reportC.overallScore}`);
  assert.strictEqual(reportC.evaluationStatus, 'Completed', 'Evaluation status must be Completed');
  assert.strictEqual(reportC.answeredCount, 5, 'answeredCount must be 5');
  assert.strictEqual(reportC.skippedCount, 0, 'skippedCount must be 0');
  console.log('✓ Test 3 Passed: Full interview properly synthesized with Completed status.');

  console.log('\n--- ALL AI MOCK INTERVIEW TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});

