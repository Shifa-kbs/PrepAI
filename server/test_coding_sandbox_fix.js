const { executeCode } = require('./services/codeExecutionService');
const { allQuestions } = require('./data/questions');

async function testCodingSandboxFix() {
  console.log('========================================================================');
  console.log('🧪 Testing Coding Sandbox Evaluation Logic');
  console.log('========================================================================\n');

  // Test 1: JavaScript Correct Two Sum
  const twoSumQ = allQuestions.find((q) => q.slug === 'dsa-two-sum-coding-problem');
  console.log('[1/4] Testing JavaScript Two Sum Solution...');
  const jsRes = await executeCode('javascript', twoSumQ.sampleAnswer, twoSumQ.testCases);
  console.log('  JS result allPassed:', jsRes.allPassed, 'summary:', jsRes.summary);
  if (!jsRes.allPassed) throw new Error('JS Two Sum failed!');

  // Test 2: Python Correct Two Sum
  console.log('\n[2/4] Testing Python Two Sum Solution...');
  const pyCode = `
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []
`;
  const pyRes = await executeCode('python', pyCode, twoSumQ.testCases);
  console.log('  Python result allPassed:', pyRes.allPassed, 'summary:', pyRes.summary);
  if (!pyRes.allPassed) throw new Error('Python Two Sum failed!');

  // Test 3: Incorrect Solution (should fail)
  console.log('\n[3/4] Testing Incorrect JavaScript Solution...');
  const wrongCode = `function twoSum(nums, target) { return [999, 999]; }`;
  const wrongRes = await executeCode('javascript', wrongCode, twoSumQ.testCases);
  console.log('  Wrong code allPassed:', wrongRes.allPassed, 'passedCount:', wrongRes.passedCount);
  if (wrongRes.allPassed) throw new Error('Wrong code should have failed!');

  // Test 4: Runtime Syntax / Infinite Loop protection
  console.log('\n[4/4] Testing Infinite Loop Timeout Protection...');
  const infiniteLoop = `function twoSum(nums, target) { while(true) {} }`;
  const loopRes = await executeCode('javascript', infiniteLoop, twoSumQ.testCases);
  console.log('  Loop code allPassed:', loopRes.allPassed, 'error caught:', loopRes.results[0]?.error);
  if (loopRes.allPassed) throw new Error('Infinite loop should have failed!');

  console.log('\n========================================================================');
  console.log('🎉 ALL CODING EVALUATION TESTS PASSED (100%)');
  console.log('========================================================================');
}

testCodingSandboxFix().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
