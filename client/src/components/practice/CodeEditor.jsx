import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  Terminal,
  ChevronDown,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import { runCodeExecution } from '../../services/practiceService';
import toast from 'react-hot-toast';

const DEFAULT_TEMPLATES = {
  javascript: (name = 'solution') =>
    `/**\n * @param {any} input\n * @return {any}\n */\nfunction ${name}(...args) {\n  // Write your JavaScript solution here\n  \n}\n`,
  python: (name = 'solution') =>
    `def ${name}(*args):\n    # Write your Python solution here\n    pass\n`,
  java: (name = 'solution') =>
    `public class Solution {\n    public Object ${name}(String input) {\n        // Write your Java solution here\n        return null;\n    }\n}\n`,
  cpp: (name = 'solution') =>
    `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Write your C++ solution here\n};\n`,
};

const extractFunctionName = (codeTemplate) => {
  if (!codeTemplate) return 'solution';
  const match = codeTemplate.match(/function\s+([a-zA-Z0-9_$]+)/) ||
                codeTemplate.match(/def\s+([a-zA-Z0-9_]+)/);
  return match ? match[1] : 'solution';
};

const CodeEditor = ({
  question,
  onCodeSubmit,
  onChange,
  initialCode = '',
}) => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [activeTab, setActiveTab] = useState('testcases'); // 'testcases' or 'output'

  const fnName = extractFunctionName(question?.codeTemplate);

  // Initialize or reset template for current language & question
  const getBoilerplate = (lang) => {
    if (lang === 'javascript' && question?.codeTemplate) {
      return question.codeTemplate;
    }
    return DEFAULT_TEMPLATES[lang] ? DEFAULT_TEMPLATES[lang](fnName) : '';
  };

  useEffect(() => {
    const nextCode = initialCode || getBoilerplate(language);
    setCode(nextCode);
    if (onChange) {
      onChange(nextCode, language);
    }
  }, [question?._id, language]);

  const handleLanguageChange = (newLang) => {
    if (newLang === language) return;
    setLanguage(newLang);
    const nextCode = getBoilerplate(newLang);
    setCode(nextCode);
    if (onChange) {
      onChange(nextCode, newLang);
    }
    setExecutionResult(null);
  };

  const handleResetCode = () => {
    const nextCode = getBoilerplate(language);
    setCode(nextCode);
    if (onChange) {
      onChange(nextCode, language);
    }
    setExecutionResult(null);
    toast.success('Code reset to default template');
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before executing.');
      return;
    }

    setIsRunning(true);
    setActiveTab('output');
    try {
      const testCases = (question?.testCases && question.testCases.length > 0)
        ? question.testCases
        : [
            { input: '5', expectedOutput: '5' },
          ];

      const res = await runCodeExecution({
        language,
        code,
        testCases,
        questionId: question?._id,
      });

      if (res.isUnavailable || !res.success) {
        setExecutionResult({
          success: false,
          isUnavailable: true,
          summary: res.message || res.summary || 'Code execution service is currently unavailable.',
          results: [],
        });
        toast.error(res.message || res.summary || 'Code execution service is currently unavailable.', { duration: 5000 });
        return;
      }

      if (res.success) {
        setExecutionResult(res);
        if (res.allPassed) {
          toast.success(`🎉 ${res.summary}`);
          if (onCodeSubmit) {
            onCodeSubmit(code, true, language, res);
          }
        } else {
          toast.error(`❌ ${res.summary}`);
          if (onCodeSubmit) {
            onCodeSubmit(code, false, language, res);
          }
        }
      }
    } catch (err) {
      const is503 = err.response?.status === 503 || err.response?.data?.isUnavailable;
      const msg = err.response?.data?.message || err.message || 'Execution error';
      setExecutionResult({
        success: false,
        isUnavailable: is503,
        summary: is503 ? 'Code execution engine unavailable in production.' : 'Execution failed',
        results: is503
          ? []
          : [
              {
                testIndex: 1,
                error: msg,
                passed: false,
                executionTimeMs: 0,
              },
            ],
      });
      toast.error(msg, { duration: 5000 });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Editor Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
            <Code2 className="w-4 h-4 text-brand-400" />
            <span>Coding Sandbox:</span>
          </div>

          {/* Language Selector */}
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            {['javascript', 'python', 'java', 'cpp'].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLanguageChange(lang)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  language === lang
                    ? 'bg-sky-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'javascript' ? 'JavaScript' : lang === 'python' ? 'Python' : lang === 'java' ? 'Java' : 'C++'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetCode}
            icon={RotateCcw}
            className="text-xs text-slate-400 hover:text-white"
          >
            Reset
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleRunCode}
            loading={isRunning}
            icon={Play}
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950 text-xs font-semibold"
          >
            Run Code
          </Button>
        </div>
      </div>

      {/* Monaco Code Editor Window */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
        <Editor
          height="340px"
          language={language === 'javascript' ? 'javascript' : language === 'python' ? 'python' : language === 'java' ? 'java' : 'cpp'}
          value={code}
          onChange={(val) => {
            const nextCode = val || '';
            setCode(nextCode);
            if (onChange) onChange(nextCode, language);
          }}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            fontFamily: 'Fira Code, Menlo, Monaco, Consolas, monospace',
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>

      {/* Tabs & Results Panel */}
      <Card className="bg-slate-900/90 border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex space-x-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('testcases')}
              className={`pb-1 transition-colors ${
                activeTab === 'testcases'
                  ? 'text-brand-400 border-b-2 border-brand-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Test Cases ({question?.testCases?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('output')}
              className={`pb-1 transition-colors ${
                activeTab === 'output'
                  ? 'text-brand-400 border-b-2 border-brand-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Execution Output {executionResult ? `(${executionResult.summary})` : ''}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>Sandboxed Evaluation</span>
          </div>
        </div>

        {/* Tab 1: Visible Test Cases */}
        {activeTab === 'testcases' && (
          <div className="space-y-2">
            {question?.testCases && question.testCases.length > 0 ? (
              question.testCases.map((tc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1"
                >
                  <div className="text-slate-400 font-semibold flex items-center justify-between">
                    <span>Test Case #{idx + 1}</span>
                    {tc.isHidden && (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                        Hidden in Exam
                      </span>
                    )}
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-500">Input: </span>
                    <span className="text-indigo-300">{tc.input}</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-500">Expected: </span>
                    <span className="text-emerald-400">{tc.expectedOutput}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">
                Sample inputs will be passed automatically from the problem specification.
              </p>
            )}
          </div>
        )}

        {/* Tab 2: Execution Results */}
        {activeTab === 'output' && (
          <div className="space-y-3">
            {isRunning ? (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                <span>Executing code in secure sandbox...</span>
              </div>
            ) : executionResult ? (
              <div className="space-y-3">
                {executionResult.isUnavailable ? (
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 space-y-2">
                    <div className="flex items-center space-x-2 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      <span>Isolated Code Execution Unavailable</span>
                    </div>
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      {executionResult.summary ||
                        'Arbitrary code execution on the host server is safely disabled in production. Please configure an isolated Judge0 instance (JUDGE0_API_KEY) in the server environment.'}
                    </p>
                  </div>
                ) : (
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      executionResult.allPassed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {executionResult.allPassed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                      <span className="font-bold text-sm">{executionResult.summary}</span>
                    </div>
                    <span className="text-xs opacity-75">
                      Language: {executionResult.language?.toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  {executionResult.results?.map((res, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border text-xs font-mono space-y-1.5 ${
                        res.passed
                          ? 'bg-slate-950/80 border-emerald-900/40 text-slate-200'
                          : 'bg-slate-950/80 border-rose-900/40 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300">Test Case #{res.testIndex}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {res.executionTimeMs}ms
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              res.passed
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {res.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                      </div>

                      <div className="text-slate-400">
                        <span className="text-slate-500">Input: </span>
                        <span>{res.input}</span>
                      </div>
                      <div className="text-slate-400">
                        <span className="text-slate-500">Expected: </span>
                        <span className="text-emerald-400">{res.expectedOutput}</span>
                      </div>
                      <div className="text-slate-400">
                        <span className="text-slate-500">Actual: </span>
                        <span className={res.passed ? 'text-emerald-300 font-semibold' : 'text-rose-400 font-semibold'}>
                          {res.actualOutput || 'None'}
                        </span>
                      </div>

                      {res.stdout && (
                        <div className="pt-1 text-[11px] text-slate-400 bg-slate-900 p-2 rounded">
                          <span className="text-slate-500 block font-bold">Standard Output:</span>
                          <pre>{res.stdout}</pre>
                        </div>
                      )}

                      {res.error && (
                        <div className="pt-1 text-[11px] text-rose-300 bg-rose-950/30 p-2 rounded border border-rose-900/30">
                          <span className="text-rose-400 block font-bold">Error:</span>
                          <pre className="whitespace-pre-wrap">{res.error}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                Click "Run Code" to compile and execute your solution against test cases.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CodeEditor;
