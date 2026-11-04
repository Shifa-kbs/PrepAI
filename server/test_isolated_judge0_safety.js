const assert = require('assert');
const {
  executeCode,
  buildJudge0Harness,
  getJudge0Config,
} = require('./services/codeExecutionService');

async function runJudge0SafetyTests() {
  console.log('=== PREPAI ISOLATED CODE EXECUTION & JUDGE0 ARCHITECTURE TEST ===\n');

  // Test 1: Production Security Gate (Zero Unsafe Execution on Host)
  console.log('[Test 1] Testing Production Security Gate (Judge0 unconfigured)...');
  const prevNodeEnv = process.env.NODE_ENV;
  const prevUnsafe = process.env.ENABLE_LOCAL_UNSAFE_RUNNER;
  const prevJudge0Key = process.env.JUDGE0_API_KEY;
  const prevJudge0Url = process.env.JUDGE0_API_URL;

  try {
    process.env.NODE_ENV = 'production';
    delete process.env.ENABLE_LOCAL_UNSAFE_RUNNER;
    delete process.env.JUDGE0_API_KEY;
    delete process.env.JUDGE0_API_URL;

    const testCases = [{ input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]' }];

    // Test JS in production
    const jsResult = await executeCode('javascript', 'function twoSum(nums, target) { return [0, 1]; }', testCases);
    assert.strictEqual(jsResult.isUnavailable, true, 'JS in production without Judge0 must be isUnavailable');
    assert.strictEqual(jsResult.allPassed, false, 'JS in production without Judge0 must not pass');
    assert.strictEqual(jsResult.passedCount, 0, 'Passed count must be 0');

    // Test Python in production
    const pyResult = await executeCode('python', 'def twoSum(nums, target):\n    return [0, 1]', testCases);
    assert.strictEqual(pyResult.isUnavailable, true, 'Python in production without Judge0 must be isUnavailable');
    assert.strictEqual(pyResult.allPassed, false, 'Python in production without Judge0 must not pass');

    // Test C++ in production
    const cppResult = await executeCode('cpp', 'int main() { return 0; }', testCases);
    assert.strictEqual(cppResult.isUnavailable, true, 'C++ in production without Judge0 must be isUnavailable');

    // Test Java in production
    const javaResult = await executeCode('java', 'public class Main {}', testCases);
    assert.strictEqual(javaResult.isUnavailable, true, 'Java in production without Judge0 must be isUnavailable');

    console.log('✓ PASS: Production Security Gate strictly blocks host execution for all 4 languages when isolated Judge0 is unconfigured.');
  } finally {
    if (prevNodeEnv !== undefined) process.env.NODE_ENV = prevNodeEnv; else delete process.env.NODE_ENV;
    if (prevUnsafe !== undefined) process.env.ENABLE_LOCAL_UNSAFE_RUNNER = prevUnsafe; else delete process.env.ENABLE_LOCAL_UNSAFE_RUNNER;
    if (prevJudge0Key !== undefined) process.env.JUDGE0_API_KEY = prevJudge0Key; else delete process.env.JUDGE0_API_KEY;
    if (prevJudge0Url !== undefined) process.env.JUDGE0_API_URL = prevJudge0Url; else delete process.env.JUDGE0_API_URL;
  }

  // Test 2: Judge0 Harness Builders for all 4 languages
  console.log('\n[Test 2] Testing Judge0 Execution Harness Construction (JS, Python, C++, Java)...');
  const jsHarness = buildJudge0Harness('javascript', 'function twoSum(nums, target) { return [0, 1]; }', 'twoSum', '[2, 7, 11, 15], 9');
  assert(jsHarness.includes('function twoSum'), 'JS harness must include user function');
  assert(jsHarness.includes('const __args = [[2, 7, 11, 15], 9];'), 'JS harness must parse input arguments');
  assert(jsHarness.includes('console.log('), 'JS harness must print output to stdout');

  const pyHarness = buildJudge0Harness('python', 'def twoSum(nums, target):\n    return [0, 1]', 'twoSum', '[2, 7, 11, 15], 9');
  assert(pyHarness.includes('def twoSum'), 'Python harness must include user function');
  assert(pyHarness.includes('import json, sys'), 'Python harness must import json/sys');
  assert(pyHarness.includes('print(json.dumps('), 'Python harness must serialize output');

  const cppHarness = buildJudge0Harness('cpp', 'class Solution { public: vector<int> twoSum(vector<int>& nums, int target) { return {0, 1}; } };', 'twoSum', '');
  assert(cppHarness.includes('#include <iostream>'), 'C++ harness must include standard libraries');
  assert(cppHarness.includes('int main()'), 'C++ harness must build main entry point');

  const javaHarness = buildJudge0Harness('java', 'class Solution { public int[] twoSum(int[] nums, int target) { return new int[]{0, 1}; } }', 'twoSum', '');
  assert(javaHarness.includes('import java.util.*;'), 'Java harness must import utilities');
  assert(javaHarness.includes('public class Main'), 'Java harness must define Main entry point');

  console.log('✓ PASS: Judge0 harness builders verified for JavaScript, Python, C++, and Java.');

  // Test 3: Local Developer Mode Verification
  console.log('\n[Test 3] Testing Developer Local Fallback Mode (ENABLE_LOCAL_UNSAFE_RUNNER=true in dev)...');
  process.env.NODE_ENV = 'development';
  process.env.ENABLE_LOCAL_UNSAFE_RUNNER = 'true';

  const localJsRes = await executeCode('javascript', `
    function twoSum(nums, target) {
      return [0, 1];
    }
  `, [{ input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]' }]);

  console.log('[Test 3] localJsRes:', JSON.stringify(localJsRes, null, 2));
  assert.strictEqual(localJsRes.allPassed, true, 'Local JS must pass in dev mode');
  assert.strictEqual(localJsRes.passedCount, 1, 'Local JS pass count must be 1');

  const localPyRes = await executeCode('python', `
def twoSum(nums, target):
    return [0, 1]
  `, [{ input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]' }]);

  assert.strictEqual(localPyRes.allPassed, true, 'Local Python must pass in dev mode');
  assert.strictEqual(localPyRes.passedCount, 1, 'Local Python pass count must be 1');

  console.log('✓ PASS: Developer local fallback mode successfully verified.');

  console.log('\n=== ALL JUDGE0 ARCHITECTURE & SAFETY TESTS PASSED! ===');
}

runJudge0SafetyTests().catch(err => {
  console.error('Judge0 test failed:', err);
  process.exit(1);
});
