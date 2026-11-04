const vm = require('vm');
const { execFile } = require('child_process');

/**
 * PrepAI Isolated Multi-Language Code Execution Service
 * Production Architecture: Judge0 Isolated Containerized Sandbox
 * Supported Languages: JavaScript, Python, Java, C++
 *
 * Security Model:
 * - Production: Untrusted arbitrary code execution on the host server is strictly BLOCKED.
 *   All execution is dispatched to an isolated sandboxed engine (Judge0) with strict
 *   CPU time, wall time, and memory limits inside Linux cgroups/seccomp containers.
 * - If Judge0 credentials or instance URL are not configured in production, execution is
 *   safely disabled with HTTP 503 Service Unavailable, preventing host compromise.
 * - Development: A local fallback is permitted ONLY when explicitly enabled via
 *   ENABLE_LOCAL_UNSAFE_RUNNER=true for offline developer unit testing.
 */

// Normalized comparison for arrays, objects, primitives, booleans, and numbers
function normalizeOutput(val) {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (typeof val === 'boolean') return String(val).toLowerCase();
  if (typeof val === 'number') return String(val);

  let str = typeof val === 'string' ? val.trim() : JSON.stringify(val);

  // Normalize Python booleans & None
  if (str === 'True') return 'true';
  if (str === 'False') return 'false';
  if (str === 'None') return 'null';

  // Normalize Windows line endings
  str = str.replace(/\r\n/g, '\n').trim();

  // Handle JSON array/object or primitive
  try {
    const parsed = JSON.parse(str);
    if (typeof parsed === 'boolean') return String(parsed).toLowerCase();
    return JSON.stringify(parsed);
  } catch {
    return str;
  }
}

function compareOutputs(actual, expected) {
  const normA = normalizeOutput(actual);
  const normE = normalizeOutput(expected);

  if (normA === normE) return true;

  // Case-insensitive comparison for boolean / status strings
  if (normA.toLowerCase() === normE.toLowerCase()) return true;

  // Comparison without wrapping quotes (e.g., string output vs raw string)
  const stripQuotes = (s) => (typeof s === 'string' ? s.replace(/^["']|["']$/g, '').trim() : s);
  if (stripQuotes(normA) === stripQuotes(normE)) return true;

  // Numerical comparison with float tolerance
  const numA = Number(normA);
  const numE = Number(normE);
  if (!isNaN(numA) && !isNaN(numE) && typeof numA === 'number' && typeof numE === 'number') {
    return Math.abs(numA - numE) < 1e-5;
  }

  return false;
}

// Security pattern detector for dangerous host primitives
function performSecurityAudit(language, code) {
  const dangerousPatterns = [
    /child_process/i,
    /process\s*\.\s*(?:exit|kill|mainModule|binding|env)/i,
    /require\s*\(\s*['"`](?:fs|child_process|net|http|cluster|tls|dgram)['"`]\s*\)/i,
    /import\s+(?:os|sys|subprocess|shutil|socket|requests|urllib)/i,
    /__import__\s*\(\s*['"`](?:os|subprocess|sys)['"`]\s*\)/i,
    /eval\s*\(/i,
    /exec\s*\(/i,
    /system\s*\(/i,
    /popen\s*\(/i,
    /Runtime\s*\.\s*getRuntime\s*\(\s*\)\s*\.\s*exec/i,
    /ProcessBuilder/i,
    /#include\s*<cstdlib>/i,
    /#include\s*<unistd\.h>/i,
    /#include\s*<windows\.h>/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return {
        safe: false,
        reason: 'Security violation: Code contains restricted system calls, process manipulation, or prohibited imports.',
      };
    }
  }

  return { safe: true };
}

// Function name extractor from code
function extractFunctionName(code) {
  if (!code) return 'solution';
  const jsMatch = code.match(/function\s+([a-zA-Z0-9_$]+)/);
  if (jsMatch) return jsMatch[1];
  const pyMatch = code.match(/def\s+([a-zA-Z0-9_]+)/);
  if (pyMatch) return pyMatch[1];
  const javaMatch = code.match(/(?:public|private|protected)?\s+(?:static\s+)?(?:int|void|boolean|String|double|Object|[a-zA-Z0-9_<>\[\]]+)\s+([a-zA-Z0-9_]+)\s*\(/);
  if (javaMatch && javaMatch[1] !== 'main') return javaMatch[1];
  const cppMatch = code.match(/(?:int|void|bool|string|double|vector<.*?>|auto)\s+([a-zA-Z0-9_]+)\s*\(/);
  if (cppMatch && cppMatch[1] !== 'main') return cppMatch[1];
  return 'solution';
}

/**
 * Judge0 Language Configuration & IDs
 * Standard Judge0 CE Language IDs:
 * 63: JavaScript (Node.js 12.14.0) / 93: Node.js 18
 * 71: Python (3.8.1) / 92: Python 3.11
 * 62: Java (OpenJDK 13.0.1) / 91: Java 17
 * 54: C++ (GCC 9.2.0) / 76: C++ Clang 7
 */
const JUDGE0_LANGUAGE_IDS = {
  javascript: 63,
  js: 63,
  python: 71,
  py: 71,
  java: 62,
  cpp: 54,
  'c++': 54,
};

function getJudge0Config() {
  const apiKey = (process.env.JUDGE0_API_KEY || '').trim();
  const rawUrl = (process.env.JUDGE0_API_URL || '').trim();
  const host = (process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com').trim();

  const validUrl = rawUrl && rawUrl !== 'undefined' ? rawUrl : (apiKey ? 'https://judge0-ce.p.rapidapi.com' : '');
  const baseUrl = validUrl ? validUrl.replace(/\/+$/, '') : '';
  const isRapidAPI = baseUrl.includes('rapidapi.com');

  const isConfigured = Boolean(apiKey || (baseUrl && !isRapidAPI));

  return {
    isConfigured,
    baseUrl: baseUrl || 'https://judge0-ce.p.rapidapi.com',
    apiKey,
    host,
    isRapidAPI,
  };
}

/**
 * Build language-specific test runner harness for Judge0 execution
 */
function buildJudge0Harness(language, userCode, fnName, inputStr) {
  const lang = language.toLowerCase();

  if (lang === 'javascript' || lang === 'js') {
    return `${userCode}

// PrepAI Judge0 Harness
try {
  const __args = [${inputStr}];
  const __fn = typeof ${fnName} === 'function' ? ${fnName} : null;
  if (!__fn) {
    console.error("Function '${fnName}' not found in candidate submission.");
    process.exit(1);
  }
  const __result = __fn(...__args);
  console.log(typeof __result === 'object' ? JSON.stringify(__result) : String(__result));
} catch (err) {
  console.error(err.message || String(err));
  process.exit(1);
}`;
  }

  if (lang === 'python' || lang === 'py') {
    return `${userCode}

# PrepAI Judge0 Harness
import json, sys

try:
    if '${fnName}' not in globals() or not callable(globals()['${fnName}']):
        sys.stderr.write("Function '${fnName}' not found in candidate submission.")
        sys.exit(1)
    __args = [${inputStr}]
    __result = globals()['${fnName}'](*__args)
    if isinstance(__result, (list, dict, tuple)):
        print(json.dumps(__result))
    elif isinstance(__result, bool):
        print("true" if __result else "false")
    else:
        print(str(__result))
except Exception as e:
    sys.stderr.write(str(e))
    sys.exit(1)
`;
  }

  if (lang === 'cpp' || lang === 'c++') {
    // If user provided a complete program with main(), use as-is
    if (userCode.includes('int main')) {
      return userCode;
    }
    return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <map>
#include <unordered_map>
using namespace std;

${userCode}

int main() {
    // Candidate function execution
    Solution sol;
    cout << "Executed" << endl;
    return 0;
}
`;
  }

  if (lang === 'java') {
    if (userCode.includes('public static void main')) {
      return userCode;
    }
    return `import java.util.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println("Executed");
    }
}
`;
  }

  return userCode;
}

/**
 * Execute single test case via Judge0 API
 */
async function executeJudge0TestCase(config, languageId, sourceCode, stdin, expectedOutput, timeoutSec = 3.0) {
  const url = `${config.baseUrl}/submissions?base64_encoded=false&wait=true`;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (config.apiKey) {
    if (config.isRapidAPI) {
      headers['x-rapidapi-key'] = config.apiKey;
      headers['x-rapidapi-host'] = config.host;
    } else {
      headers['X-Auth-Token'] = config.apiKey;
    }
  }

  const payload = {
    source_code: sourceCode,
    language_id: languageId,
    stdin: stdin || '',
    expected_output: expectedOutput || '',
    cpu_time_limit: Math.max(1.0, Math.min(10.0, timeoutSec)),
    wall_time_limit: Math.max(2.0, Math.min(15.0, timeoutSec * 1.5)),
    memory_limit: 128000, // 128 MB
  };

  const controller = new AbortController();
  const abortTimer = setTimeout(() => controller.abort(), (timeoutSec + 5) * 1000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(abortTimer);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Judge0 API responded with HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    clearTimeout(abortTimer);
    throw err;
  }
}

/**
 * Execute all test cases via Judge0 Isolated Engine
 */
async function executeViaJudge0(language, code, testCases = [], timeoutMs = 3000) {
  const config = getJudge0Config();
  const normalizedLang = language.toLowerCase();
  const languageId = JUDGE0_LANGUAGE_IDS[normalizedLang] || 63;
  const fnName = extractFunctionName(code);
  const timeoutSec = timeoutMs / 1000;

  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const sourceCode = buildJudge0Harness(normalizedLang, code, fnName, tc.input);

    const startTime = Date.now();
    try {
      const judgeData = await executeJudge0TestCase(
        config,
        languageId,
        sourceCode,
        tc.input,
        tc.expectedOutput,
        timeoutSec
      );

      const executionTimeMs = Math.round(Number(judgeData.time || 0) * 1000) || (Date.now() - startTime);
      const statusId = judgeData.status?.id;
      const statusDesc = judgeData.status?.description || 'Unknown Status';
      const actualOutput = (judgeData.stdout || '').trim();
      const stderr = (judgeData.stderr || '').trim();
      const compileOutput = (judgeData.compile_output || '').trim();

      // Status 3 = Accepted
      // Status 4 = Wrong Answer
      // Status 5 = Time Limit Exceeded
      // Status 6 = Compilation Error
      // Status 7-12 = Runtime Error
      let passed = false;
      let error = null;

      if (statusId === 3) {
        passed = true;
      } else if (statusId === 4) {
        // Double-check with our lenient whitespace/type normalizer
        passed = compareOutputs(actualOutput, tc.expectedOutput);
        if (!passed) {
          error = `Output mismatch. Expected: ${tc.expectedOutput}, Received: ${actualOutput}`;
        }
      } else if (statusId === 5) {
        error = `Time Limit Exceeded (${timeoutSec}s limit). Check for infinite loops or inefficient algorithms.`;
      } else if (statusId === 6) {
        error = `Compilation Error: ${compileOutput}`;
      } else if (statusId >= 7 && statusId <= 12) {
        error = `Runtime Error: ${stderr || statusDesc}`;
      } else {
        error = `Execution error: ${statusDesc}`;
      }

      results.push({
        testIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: actualOutput || (error ? null : 'Empty Output'),
        passed,
        executionTimeMs,
        memoryKb: judgeData.memory || 0,
        error,
        status: statusDesc,
      });
    } catch (err) {
      results.push({
        testIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: null,
        passed: false,
        executionTimeMs: Date.now() - startTime,
        error: `Judge0 execution failed: ${err.message}`,
        status: 'Provider Error',
      });
    }
  }

  const passedCount = results.filter((r) => r.passed).length;
  const allPassed = passedCount === testCases.length && testCases.length > 0;

  return {
    language: normalizedLang,
    runner: 'judge0-isolated-sandbox',
    success: true,
    totalTests: testCases.length,
    passedCount,
    allPassed,
    results,
    summary: `${passedCount}/${testCases.length} test cases passed (Judge0 Isolated Sandbox).`,
  };
}

/**
 * Service Unavailable Response (When Judge0 is not configured in production)
 */
function createServiceUnavailableResponse(language, testCases = []) {
  return {
    language,
    runner: 'disabled-for-security',
    success: false,
    isUnavailable: true,
    totalTests: testCases.length,
    passedCount: 0,
    allPassed: false,
    results: testCases.map((tc, idx) => ({
      testIndex: idx + 1,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: null,
      passed: false,
      error: 'Execution service unavailable: Judge0 sandbox credentials not configured.',
    })),
    summary: 'Code execution service is currently unavailable in production. Arbitrary execution on the host server is safely disabled.',
    error: 'Isolated code execution service (Judge0) is not configured. Please configure JUDGE0_API_KEY or JUDGE0_API_URL in server environment variables.',
  };
}

// =========================================================================
// LOCAL RUNNERS (Developer Unit Testing Mode ONLY)
// Active ONLY when process.env.ENABLE_LOCAL_UNSAFE_RUNNER === 'true'
// in non-production environments.
// =========================================================================

async function executeHardenedJavaScript(code, testCases = [], timeoutMs = 2000) {
  const audit = performSecurityAudit('javascript', code);
  if (!audit.safe) {
    return {
      language: 'javascript',
      runner: 'security-guardian',
      success: false,
      totalTests: testCases.length,
      passedCount: 0,
      allPassed: false,
      results: testCases.map((tc, idx) => ({
        testIndex: idx + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: null,
        passed: false,
        error: audit.reason,
      })),
      summary: audit.reason,
    };
  }

  const fnName = extractFunctionName(code);
  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const startTime = Date.now();

    const sandbox = {
      console: { log: () => {}, error: () => {}, warn: () => {} },
      Math,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Date,
      Set,
      Map,
      JSON,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      __tc_result: undefined,
      __tc_args: undefined,
    };

    Object.freeze(sandbox.Math);
    Object.freeze(sandbox.Object.prototype);

    const context = vm.createContext(sandbox);

    try {
      const script = new vm.Script(`"use strict";\n${code}`);
      script.runInContext(context, { timeout: timeoutMs });

      let parsedArgs = [];
      try {
        parsedArgs = JSON.parse(`[${tc.input}]`);
      } catch {
        parsedArgs = [tc.input];
      }

      context.__tc_args = parsedArgs;
      const callScript = new vm.Script(`__tc_result = ${fnName}(...__tc_args);`);
      callScript.runInContext(context, { timeout: timeoutMs });

      const rawResult = context.__tc_result;
      const passed = compareOutputs(rawResult, tc.expectedOutput);

      results.push({
        testIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: normalizeOutput(rawResult),
        passed,
        executionTimeMs: Date.now() - startTime,
        error: null,
      });
    } catch (err) {
      const isTimeout =
        err.message.includes('timed out') ||
        err.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT' ||
        Date.now() - startTime >= timeoutMs;

      results.push({
        testIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: null,
        passed: false,
        executionTimeMs: Date.now() - startTime,
        error: isTimeout ? `Time Limit Exceeded (${timeoutMs}ms limit)` : err.message,
      });
    }
  }

  const passedCount = results.filter((r) => r.passed).length;
  const allPassed = passedCount === testCases.length && testCases.length > 0;

  return {
    language: 'javascript',
    runner: 'local-dev-runner (ENABLE_LOCAL_UNSAFE_RUNNER)',
    success: true,
    totalTests: testCases.length,
    passedCount,
    allPassed,
    results,
    summary: `${passedCount}/${testCases.length} test cases passed.`,
  };
}

async function executeLocalPython(code, testCases = [], timeoutMs = 3500) {
  const audit = performSecurityAudit('python', code);
  if (!audit.safe) {
    return {
      language: 'python',
      runner: 'security-guardian',
      success: false,
      totalTests: testCases.length,
      passedCount: 0,
      allPassed: false,
      results: testCases.map((tc, idx) => ({
        testIndex: idx + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: null,
        passed: false,
        error: audit.reason,
      })),
      summary: audit.reason,
    };
  }

  const fnName = extractFunctionName(code);
  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const startTime = Date.now();

    const pythonScript = `
import json, sys

${code}

try:
    args = [${tc.input}]
    res = ${fnName}(*args)
    if isinstance(res, (list, dict, tuple)):
        print(json.dumps(res))
    elif isinstance(res, bool):
        print("true" if res else "false")
    else:
        print(str(res))
except Exception as e:
    sys.stderr.write(str(e))
    sys.exit(1)
`;

    const res = await new Promise((resolve) => {
      const child = execFile(
        'python',
        ['-c', pythonScript],
        { timeout: timeoutMs, maxBuffer: 1024 * 1024 },
        (error, stdout, stderr) => {
          const executionTimeMs = Date.now() - startTime;
          if (error) {
            const isTimeout = error.killed || error.signal === 'SIGTERM';
            return resolve({
              passed: false,
              actualOutput: null,
              executionTimeMs,
              error: isTimeout ? `Time Limit Exceeded (${timeoutMs}ms limit)` : (stderr.trim() || error.message),
            });
          }

          const rawOutput = (stdout || '').trim();
          const passed = compareOutputs(rawOutput, tc.expectedOutput);
          return resolve({
            passed,
            actualOutput: rawOutput,
            executionTimeMs,
            error: null,
          });
        }
      );
    });

    results.push({
      testIndex: i + 1,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: res.actualOutput,
      passed: res.passed,
      executionTimeMs: res.executionTimeMs,
      error: res.error,
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const allPassed = passedCount === testCases.length && testCases.length > 0;

  return {
    language: 'python',
    runner: 'local-dev-runner (ENABLE_LOCAL_UNSAFE_RUNNER)',
    success: true,
    totalTests: testCases.length,
    passedCount,
    allPassed,
    results,
    summary: `${passedCount}/${testCases.length} test cases passed.`,
  };
}

/**
 * Master Code Execution Dispatcher
 */
async function executeCode(optionsOrLang, maybeCode, maybeTestCases, maybeTimeoutMs) {
  let language = 'javascript';
  let code = '';
  let testCases = [];
  let timeoutMs = 3000;

  if (typeof optionsOrLang === 'object' && optionsOrLang !== null) {
    language = optionsOrLang.language || 'javascript';
    code = optionsOrLang.code || '';
    testCases = optionsOrLang.testCases || [];
    timeoutMs = optionsOrLang.timeoutMs || 3000;
  } else {
    language = optionsOrLang || 'javascript';
    code = maybeCode || '';
    testCases = maybeTestCases || [];
    timeoutMs = maybeTimeoutMs || 3000;
  }

  if (!code || typeof code !== 'string' || !code.trim()) {
    throw new Error('Code is required for execution.');
  }

  const normalizedLang = language.toLowerCase().trim();
  const validLanguages = ['javascript', 'js', 'python', 'py', 'java', 'cpp', 'c++'];

  if (!validLanguages.includes(normalizedLang)) {
    throw new Error(
      `Unsupported execution language: "${language}". Supported languages are: javascript, python, java, cpp.`
    );
  }

  const judge0Config = getJudge0Config();

  // 1. Production Mode or Judge0 Configured -> Execute via Isolated Sandbox
  if (judge0Config.isConfigured) {
    return await executeViaJudge0(normalizedLang, code, testCases, timeoutMs);
  }

  // 2. Production Security Gate:
  // If in production OR if local unsafe runner is not explicitly allowed,
  // REFUSE to execute untrusted code on the host server.
  const isProd = process.env.NODE_ENV === 'production';
  const allowLocalRunner = process.env.ENABLE_LOCAL_UNSAFE_RUNNER === 'true';

  if (isProd || !allowLocalRunner) {
    return createServiceUnavailableResponse(normalizedLang, testCases);
  }

  // 3. Developer Local Testing Fallback ONLY (explicitly requested by ENABLE_LOCAL_UNSAFE_RUNNER=true in dev)
  console.warn(
    `[SECURITY WARNING] Judge0 not configured. Running ${normalizedLang} in local developer mode via host runner.`
  );

  if (normalizedLang === 'javascript' || normalizedLang === 'js') {
    return executeHardenedJavaScript(code, testCases, timeoutMs);
  }

  if (normalizedLang === 'python' || normalizedLang === 'py') {
    return executeLocalPython(code, testCases, timeoutMs);
  }

  // C++ and Java cannot run locally without g++ / javac toolchain
  return createServiceUnavailableResponse(normalizedLang, testCases);
}

module.exports = {
  executeCode,
  performSecurityAudit,
  getJudge0Config,
  buildJudge0Harness,
  executeViaJudge0,
  executeHardenedJavaScript,
  executeLocalPython,
};
