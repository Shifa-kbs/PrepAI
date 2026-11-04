const dotenv = require('dotenv');

dotenv.config();

/**
 * AI Interview Service utilizing Google Gemini REST API
 * Supports Live Gemini Mode and Offline Simulated Mock AI Mode
 * Guarantees zero crashing when API keys are absent or network is restricted.
 */

const getApiKey = () => {
  return (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
};

const getModelName = () => {
  return process.env.GEMINI_MODEL || 'gemini-1.5-flash';
};

const getAIStatus = () => {
  const key = getApiKey();
  const isMockEnv = process.env.MOCK_AI === 'true';
  const isLive = Boolean(key) && !isMockEnv;

  return {
    isConfigured: isLive,
    mode: isLive ? 'live-gemini' : 'simulated-ai',
    providerName: isLive ? `Google Gemini (${getModelName()})` : 'PrepAI Simulated AI Interviewer',
    model: getModelName(),
    description: isLive
      ? 'Live Google Gemini AI API is actively connected and generating dynamic questions.'
      : 'Simulated AI Interviewer is active. Realistic questions, real-time evaluations, and mentorship roadmaps are generated offline without consuming API credits.',
  };
};

/**
 * Clean and parse raw JSON text returned from LLM
 */
const cleanAndParseJson = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('AI provider returned empty response');
  }

  // Remove markdown code fences if present (e.g. ```json ... ```)
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const startObj = cleaned.indexOf('{');
    const endObj = cleaned.lastIndexOf('}');
    if (startObj !== -1 && endObj !== -1 && endObj > startObj) {
      try {
        return JSON.parse(cleaned.substring(startObj, endObj + 1));
      } catch (e) {
        // Fall through
      }
    }
    throw new Error(`Failed to parse AI provider JSON output: ${err.message}`);
  }
};

/**
 * Call Gemini REST API directly
 */
const callGeminiApi = async (systemInstruction, userPrompt) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const model = getModelName();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${systemInstruction}\n\nTask:\n${userPrompt}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.6,
      topP: 0.95,
      responseMimeType: 'application/json',
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      let parsedErr = errorBody;
      try {
        parsedErr = JSON.parse(errorBody).error?.message || errorBody;
      } catch (e) {}

      if (response.status === 401 || response.status === 403) {
        throw new Error(`Invalid Gemini API credentials: ${parsedErr}`);
      } else if (response.status === 429) {
        throw new Error('Gemini API rate limit exceeded.');
      } else {
        throw new Error(`Gemini API Error (HTTP ${response.status}): ${parsedErr}`);
      }
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content?.parts?.[0]?.text) {
      throw new Error('Gemini API returned an incomplete response structure');
    }

    return candidate.content.parts[0].text;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Generate role-appropriate interview questions
 * Gracefully falls back to simulated generator if Gemini is unavailable
 */
const generateInterviewQuestions = async ({
  jobRole = 'Full Stack Developer',
  interviewType = 'Mixed',
  difficulty = 'Medium',
  experienceLevel = 'Fresher (0-1 yrs)',
  topics = [],
  questionCount = 5,
}) => {
  const apiKey = getApiKey();
  const forceMock = process.env.MOCK_AI === 'true';

  if (!apiKey || forceMock) {
    return generateMockQuestions({ jobRole, interviewType, difficulty, topics, questionCount });
  }

  const topicStr = topics.length > 0 ? topics.join(', ') : 'core concepts and system workflows';

  const systemInstruction = `You are an elite technical interviewer conducting a realistic hiring interview for a ${experienceLevel} ${jobRole}.
You will generate exactly ${questionCount} structured interview questions.
Interview Type: ${interviewType} (if Technical: focus on programming, architecture, databases, problem-solving; if Behavioral: focus on STAR methodology, conflict resolution, ownership, communication; if Mixed: include both technical challenges and behavioral scenarios).
Difficulty Level: ${difficulty}.
Topics / Focus Areas: ${topicStr}.

Respond strictly in valid JSON format matching this schema:
{
  "questions": [
    {
      "questionText": "Clear, direct interview question string",
      "category": "Topic category such as System Design, React, Node.js, Leadership, or Algorithms",
      "difficulty": "${difficulty}",
      "contextHint": "A short, helpful 1-sentence prompt on what key aspects the candidate should focus on in their answer"
    }
  ]
}`;

  const userPrompt = `Generate exactly ${questionCount} ${difficulty} level questions for a ${jobRole} interview in ${interviewType} format focusing on ${topicStr}.`;

  try {
    const rawJson = await callGeminiApi(systemInstruction, userPrompt);
    const parsed = cleanAndParseJson(rawJson);

    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('Empty questions array from Gemini');
    }

    return parsed.questions.slice(0, questionCount).map((q, idx) => ({
      questionText: q.questionText || `Interview Question ${idx + 1}`,
      category: q.category || (interviewType === 'Behavioral' ? 'Behavioral' : 'Technical'),
      difficulty: q.difficulty || difficulty,
      contextHint: q.contextHint || 'Explain your thought process and support with real-world examples.',
      aiProvider: 'gemini-1.5-flash',
    }));
  } catch (err) {
    console.warn(`[AI Interview Notice] Live Gemini generation failed (${err.message}). Using simulated interviewer fallback.`);
    return generateMockQuestions({ jobRole, interviewType, difficulty, topics, questionCount });
  }
};

/**
 * Evaluate submitted answer with structured feedback
 * Gracefully falls back to simulated evaluator if Gemini is unavailable
 */
const evaluateAnswer = async ({
  jobRole,
  interviewType,
  difficulty,
  questionText,
  category,
  userAnswer,
}) => {
  if (!userAnswer || userAnswer.trim().length === 0) {
    return {
      relevanceScore: 0,
      clarityScore: 0,
      depthScore: 0,
      overallScore: 0,
      feedback: 'No answer was provided for this question. Make sure to attempt every question during your interview.',
      strengths: [],
      weaknesses: ['The question was left blank.'],
      suggestedImprovements: ['Provide a structured answer explaining the core concept, implementation details, and trade-offs.'],
      followUpQuestion: null,
      provider: 'automated-evaluator',
    };
  }

  const apiKey = getApiKey();
  const forceMock = process.env.MOCK_AI === 'true';

  if (!apiKey || forceMock) {
    return generateMockEvaluation({ questionText, userAnswer, jobRole });
  }

  const systemInstruction = `You are a senior hiring manager and tech lead assessing an interview response for a ${jobRole} position.
Question: "${questionText}"
Category: "${category || 'General'}"
Target Difficulty: "${difficulty || 'Medium'}"

Evaluate the candidate's answer constructively, fairly, and critically.
Score metrics strictly from 0 to 100:
- relevanceScore: Did the candidate answer the specific question asked?
- clarityScore: Is the communication clear, concise, and well-structured?
- depthScore: Does the response demonstrate technical correctness, depth, and practical experience?
- overallScore: Weighted composite score (0-100).

Respond strictly in valid JSON matching this schema:
{
  "relevanceScore": 85,
  "clarityScore": 80,
  "depthScore": 75,
  "overallScore": 80,
  "feedback": "Coherent, encouraging 2-3 sentence assessment of the candidate's answer.",
  "strengths": [
    "Specific positive observation #1",
    "Specific positive observation #2"
  ],
  "weaknesses": [
    "Specific area where answer fell short #1"
  ],
  "suggestedImprovements": [
    "Actionable tip on how to elevate this response to staff-engineer or senior quality"
  ],
  "followUpQuestion": "Optional follow-up question if depth was missing, or null if complete"
}`;

  const userPrompt = `Candidate's Submitted Answer:\n"""\n${userAnswer}\n"""\n\nEvaluate this answer now.`;

  try {
    const rawJson = await callGeminiApi(systemInstruction, userPrompt);
    const parsed = cleanAndParseJson(rawJson);

    const clamp = (val, def = 70) => {
      const num = Number(val);
      if (isNaN(num)) return def;
      return Math.max(0, Math.min(100, Math.round(num)));
    };

    return {
      relevanceScore: clamp(parsed.relevanceScore, 75),
      clarityScore: clamp(parsed.clarityScore, 75),
      depthScore: clamp(parsed.depthScore, 70),
      overallScore: clamp(parsed.overallScore, 73),
      feedback: typeof parsed.feedback === 'string' && parsed.feedback.trim()
        ? parsed.feedback.trim()
        : 'Good effort addressing the main components of the question. Continue practicing real-world implementation depth.',
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0
        ? parsed.strengths.filter(Boolean)
        : ['Clear technical communication', 'Addressed the core question premise directly'],
      weaknesses: Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0
        ? parsed.weaknesses.filter(Boolean)
        : ['Could expand on failure modes and edge cases'],
      suggestedImprovements: Array.isArray(parsed.suggestedImprovements) && parsed.suggestedImprovements.length > 0
        ? parsed.suggestedImprovements.filter(Boolean)
        : ['Support technical statements with specific benchmark numbers or architecture trade-offs.'],
      followUpQuestion: typeof parsed.followUpQuestion === 'string' && parsed.followUpQuestion.trim().length > 10
        ? parsed.followUpQuestion.trim()
        : null,
      provider: 'gemini-live',
    };
  } catch (err) {
    console.warn(`[AI Interview Notice] Live Gemini evaluation failed (${err.message}). Using simulated evaluation fallback.`);
    return generateMockEvaluation({ questionText, userAnswer, jobRole });
  }
};

/**
 * Generate comprehensive final report summarizing the entire interview and acting as AI mentor
 */
const generateFinalReport = async ({
  jobRole,
  interviewType,
  difficulty,
  experienceLevel,
  questions = [],
}) => {
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(
    (q) =>
      q.userAnswer &&
      q.userAnswer.trim().length > 0 &&
      !q.userAnswer.startsWith('[Skipped') &&
      q.status === 'answered'
  );
  const answeredCount = answeredQuestions.length;
  const skippedCount = totalQuestions - answeredCount;

  // RULE A: ZERO ANSWERS SUBMITTED
  if (answeredCount === 0) {
    return {
      overallScore: null,
      technicalKnowledge: null,
      answerRelevance: null,
      problemSolving: null,
      communicationClarity: null,
      evaluationStatus: 'Not Evaluated',
      answeredCount: 0,
      skippedCount: totalQuestions,
      totalQuestions,
      summary:
        'No answers were submitted during this interview. We cannot evaluate your performance without candidate responses.',
      topStrengths: [],
      keyAreasForImprovement: [
        'No candidate responses provided. Attempt answering questions during your next interview session to receive targeted competency evaluation.',
      ],
      missingConcepts: [],
      recommendedTopicsToPractice: [
        'Review foundational concepts in the Learning Studio before retaking',
      ],
      suggestedNextSteps: [
        'Start a new mock interview session and attempt every question',
        'Review technical concepts in the PrepAI Learning Studio',
      ],
      studyRoadmap: [
        { timeframe: 'Immediate', focus: 'Start a new interview session and provide answers for each prompt' },
        { timeframe: 'Week 1', focus: 'Revise core topics in the Learning Studio' },
      ],
      disclaimer: 'Evaluation requires candidate responses.',
      provider: 'unanswered-session',
      isSimulated: false,
    };
  }

  // Calculate scores exclusively over answered questions (Rule B & C)
  const averageScore = Math.round(
    answeredQuestions.reduce((acc, q) => acc + (q.score || 0), 0) / answeredCount
  );

  const isPartial = answeredCount < totalQuestions;
  const evaluationStatus = isPartial ? 'Partial Evaluation' : 'Completed';

  const apiKey = getApiKey();
  const forceMock = process.env.MOCK_AI === 'true';

  if (!apiKey || forceMock) {
    return generateMockFinalReport({
      jobRole,
      questions,
      averageScore,
      answeredCount,
      skippedCount,
      totalQuestions,
      isPartial,
    });
  }

  const summaryContext = questions.map((q, idx) => ({
    qIndex: idx + 1,
    question: q.questionText,
    category: q.category,
    userAnswer: q.userAnswer || '[Skipped / Unanswered]',
    score: q.score || 0,
    strengths: q.strengths || [],
    weaknesses: q.weaknesses || [],
  }));

  const systemInstruction = `You are an elite career mentor and tech lead synthesizing a final evaluation report for a candidate interview.
Candidate Target: ${experienceLevel} ${jobRole}
Interview Type: ${interviewType}
Difficulty: ${difficulty}
Status: ${evaluationStatus} (${answeredCount} of ${totalQuestions} questions answered).

Synthesize an executive candidate feedback report and actionable improvement mentor roadmap.
Scores must be numbers from 0 to 100 based strictly on the ${answeredCount} answered responses:
- overallScore
- technicalKnowledge
- answerRelevance
- problemSolving
- communicationClarity

Respond strictly in valid JSON matching this schema:
{
  "overallScore": ${averageScore},
  "technicalKnowledge": 80,
  "answerRelevance": 85,
  "problemSolving": 78,
  "communicationClarity": 82,
  "summary": "2-4 sentence executive overview of the candidate's interview performance and readiness.",
  "topStrengths": [
    "Key overall strength #1",
    "Key overall strength #2"
  ],
  "keyAreasForImprovement": [
    "Major area for improvement #1",
    "Major area for improvement #2"
  ],
  "missingConcepts": [
    "Specific concept #1 that was misunderstood or omitted"
  ],
  "recommendedTopicsToPractice": [
    "Specific topic #1",
    "Specific topic #2"
  ],
  "suggestedNextSteps": [
    "Concrete actionable preparation step #1",
    "Concrete actionable preparation step #2"
  ],
  "studyRoadmap": [
    { "phase": "Days 1-2", "focus": "Core concept reinforcement" },
    { "phase": "Days 3-4", "focus": "Problem-solving drill" },
    { "phase": "Days 5-7", "focus": "Mock simulation round" }
  ]
}`;

  const userPrompt = `Interview Performance Transcript (${answeredCount}/${totalQuestions} answered):\n${JSON.stringify(summaryContext, null, 2)}`;

  try {
    const rawJson = await callGeminiApi(systemInstruction, userPrompt);
    const parsed = cleanAndParseJson(rawJson);

    const clamp = (val, def = 70) => {
      const num = Number(val);
      if (isNaN(num)) return def;
      return Math.max(0, Math.min(100, Math.round(num)));
    };

    return {
      overallScore: clamp(parsed.overallScore, averageScore),
      technicalKnowledge: clamp(parsed.technicalKnowledge, Math.max(0, averageScore + 2)),
      answerRelevance: clamp(parsed.answerRelevance, Math.max(0, averageScore + 1)),
      problemSolving: clamp(parsed.problemSolving, Math.max(0, averageScore - 2)),
      communicationClarity: clamp(parsed.communicationClarity, Math.max(0, averageScore + 3)),
      evaluationStatus,
      answeredCount,
      skippedCount,
      totalQuestions,
      summary: typeof parsed.summary === 'string' && parsed.summary.trim()
        ? parsed.summary.trim()
        : `${isPartial ? `[Partial Evaluation: ${answeredCount}/${totalQuestions} Answered] ` : ''}Candidate completed ${answeredCount} responses for ${jobRole}.`,
      topStrengths: Array.isArray(parsed.topStrengths) && parsed.topStrengths.length > 0
        ? parsed.topStrengths.filter(Boolean)
        : ['Clear baseline technical vocabulary', 'Coherent communication flow'],
      keyAreasForImprovement: Array.isArray(parsed.keyAreasForImprovement) && parsed.keyAreasForImprovement.length > 0
        ? parsed.keyAreasForImprovement.filter(Boolean)
        : (isPartial ? [`Attempt all questions in future rounds (${skippedCount} skipped)`] : ['Deepen quantitative metrics in responses']),
      missingConcepts: Array.isArray(parsed.missingConcepts) && parsed.missingConcepts.length > 0
        ? parsed.missingConcepts.filter(Boolean)
        : ['Concurrency lock ordering', 'Cache invalidation strategies'],
      recommendedTopicsToPractice: Array.isArray(parsed.recommendedTopicsToPractice) && parsed.recommendedTopicsToPractice.length > 0
        ? parsed.recommendedTopicsToPractice.filter(Boolean)
        : ['System Design & Scalability', 'Advanced Data Structures & Algorithms'],
      suggestedNextSteps: Array.isArray(parsed.suggestedNextSteps) && parsed.suggestedNextSteps.length > 0
        ? parsed.suggestedNextSteps.filter(Boolean)
        : ['Practice verbalizing code logic out loud', 'Time your responses to remain under 3 minutes per question'],
      studyRoadmap: Array.isArray(parsed.studyRoadmap) && parsed.studyRoadmap.length > 0
        ? parsed.studyRoadmap
        : [
            { timeframe: 'Days 1-2', focus: 'Revise weak concepts in PrepAI Learning Studio' },
            { timeframe: 'Days 3-4', focus: 'Solve 5 targeted Medium problems in Practice Sandbox' },
            { timeframe: 'Days 5-7', focus: 'Retake full mock interview round' },
          ],
      disclaimer: 'PrepAI AI Mentor feedback is an educational preparation assessment. Hiring decisions are made independently by employers.',
      provider: 'gemini-live',
      isSimulated: false,
    };
  } catch (err) {
    console.warn(`[AI Interview Notice] Live Gemini final report failed (${err.message}). Using simulated mentor synthesis.`);
    return generateMockFinalReport({
      jobRole,
      questions,
      averageScore,
      answeredCount,
      skippedCount,
      totalQuestions,
      isPartial,
    });
  }
};

// ==========================================
// TEST MOCK PROVIDERS (Offline Simulation)
// ==========================================

const generateMockQuestions = ({ jobRole, interviewType, difficulty, topics, questionCount }) => {
  const sampleBank = [
    {
      questionText: `Explain the architectural difference between monolithic and microservice architectures, and when you would choose one over the other for a ${jobRole}.`,
      category: 'System Architecture',
      difficulty,
      contextHint: 'Focus on deployment scalability, data consistency, and operational complexity.',
    },
    {
      questionText: `How does database indexing work under the hood, and how do B-Trees optimize lookup performance in high-throughput applications?`,
      category: 'Databases',
      difficulty,
      contextHint: 'Mention node structures, disk I/O reduction, and balanced tree traversal.',
    },
    {
      questionText: `Describe a situation where you had a critical disagreement with a teammate over technical implementation. How did you resolve it?`,
      category: 'Behavioral',
      difficulty,
      contextHint: 'Use the STAR technique (Situation, Task, Action, Result) with an objective mindset.',
    },
    {
      questionText: `How does the JavaScript event loop coordinate between the call stack, microtask queue (Promises), and macrotask queue (setTimeout)?`,
      category: 'JavaScript Internals',
      difficulty,
      contextHint: 'Walk through execution order and explain asynchronous non-blocking I/O.',
    },
    {
      questionText: `What caching strategies (like Write-Through, Write-Back, Cache-Aside) would you employ to reduce database load in a distributed system?`,
      category: 'Distributed Systems',
      difficulty,
      contextHint: 'Discuss cache invalidation, latency trade-offs, and stale reads.',
    },
    {
      questionText: `Tell me about a challenging bug you encountered in production that was difficult to reproduce. How did you diagnose and remediate it?`,
      category: 'Behavioral',
      difficulty,
      contextHint: 'Highlight observability, logs/metrics, root-cause analysis, and post-mortem prevention.',
    },
    {
      questionText: `How do you handle API authentication and authorization securely across client applications and backend microservices?`,
      category: 'Security',
      difficulty,
      contextHint: 'Compare JWT tokens, refresh token rotation, and RBAC authorization strategies.',
    },
    {
      questionText: `Explain how React reconciliation and the Virtual DOM fiber tree work when updating component state.`,
      category: 'Frontend Architecture',
      difficulty,
      contextHint: 'Discuss diffing algorithms, batching, and component re-render triggers.',
    },
    {
      questionText: `When designing a RESTful API, how do you ensure idempotency, graceful error handling, and backwards compatibility?`,
      category: 'API Design',
      difficulty,
      contextHint: 'Cover HTTP verbs, status codes, API versioning, and idempotency keys.',
    },
    {
      questionText: `Where do you see yourself technically in three years, and what skills are you actively developing to achieve that milestone?`,
      category: 'Career Growth',
      difficulty,
      contextHint: 'Connect your personal growth goals to real-world engineering impact.',
    },
  ];

  return sampleBank.slice(0, questionCount).map((q) => ({
    ...q,
    difficulty,
    aiProvider: 'simulated-ai-interviewer',
  }));
};

const generateMockEvaluation = ({ questionText, userAnswer }) => {
  const words = (userAnswer || '').trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let score = 75;
  if (wordCount < 10) score = 40;
  else if (wordCount > 30) score = 85;

  const hasKeywords = /(scalability|performance|tradeoff|latency|complexity|architecture|security|testing)/i.test(userAnswer);
  if (hasKeywords) score = Math.min(100, score + 10);

  return {
    relevanceScore: score,
    clarityScore: Math.min(100, score + 5),
    depthScore: Math.max(30, score - 5),
    overallScore: score,
    feedback: `[Simulated AI Interviewer] Your answer of ${wordCount} words addressed key aspects of the question. ${
      hasKeywords ? 'Solid use of engineering vocabulary and trade-offs.' : 'Consider incorporating more specific scalability and performance metrics.'
    }`,
    strengths: [
      'Addressed the main question components directly',
      wordCount >= 20 ? 'Provided adequate structural elaboration' : 'Communicated concisely',
    ],
    weaknesses: [
      wordCount < 20 ? 'Response was relatively brief; expand with concrete examples' : 'Could highlight quantitative benchmarks or production failure modes',
    ],
    suggestedImprovements: [
      'Structure future answers with: 1) Core Definition, 2) Technical Mechanics, 3) Real-world Trade-offs.',
    ],
    followUpQuestion: score < 70
      ? 'How would you test and monitor this implementation in a high-throughput production environment?'
      : null,
    provider: 'simulated-ai',
  };
};

const generateMockFinalReport = ({
  jobRole,
  questions = [],
  averageScore,
  answeredCount: explicitAnsweredCount,
  skippedCount: explicitSkippedCount,
  totalQuestions: explicitTotalQuestions,
  isPartial: explicitIsPartial,
}) => {
  const answered = questions.filter(
    (q) =>
      q.userAnswer &&
      q.userAnswer.trim().length > 0 &&
      !q.userAnswer.startsWith('[Skipped') &&
      q.status === 'answered'
  );
  const total = explicitTotalQuestions || questions.length;
  const answeredCount = explicitAnsweredCount !== undefined ? explicitAnsweredCount : answered.length;
  const skippedCount = explicitSkippedCount !== undefined ? explicitSkippedCount : (total - answeredCount);

  // RULE A: ZERO ANSWERS SUBMITTED
  if (answeredCount === 0) {
    return {
      overallScore: null,
      technicalKnowledge: null,
      answerRelevance: null,
      problemSolving: null,
      communicationClarity: null,
      evaluationStatus: 'Not Evaluated',
      answeredCount: 0,
      skippedCount: total,
      totalQuestions: total,
      summary:
        'No answers were submitted during this interview. We cannot evaluate your performance without candidate responses.',
      topStrengths: [],
      keyAreasForImprovement: [
        'No candidate responses provided. Attempt answering questions during your next interview session to receive targeted competency evaluation.',
      ],
      missingConcepts: [],
      recommendedTopicsToPractice: [
        'Review foundational concepts in the Learning Studio before retaking',
      ],
      suggestedNextSteps: [
        'Start a new mock interview session and attempt every question',
        'Review technical concepts in the PrepAI Learning Studio',
      ],
      studyRoadmap: [
        { timeframe: 'Immediate', focus: 'Start a new interview session and provide answers for each prompt' },
        { timeframe: 'Week 1', focus: 'Revise core topics in the Learning Studio' },
      ],
      disclaimer: 'Evaluation requires candidate responses.',
      provider: 'simulated-ai-mentor',
      isSimulated: true,
    };
  }

  // Calculate scores exclusively over answered questions
  const avg = averageScore !== undefined && averageScore !== null
    ? averageScore
    : Math.round(answered.reduce((a, b) => a + (b.score || 0), 0) / answeredCount);

  const isPartial = explicitIsPartial !== undefined ? explicitIsPartial : (answeredCount < total);
  const evaluationStatus = isPartial ? 'Partial Evaluation' : 'Completed';

  return {
    overallScore: avg,
    technicalKnowledge: Math.min(100, avg + 3),
    answerRelevance: Math.min(100, avg + 1),
    problemSolving: Math.max(0, avg - 2),
    communicationClarity: Math.min(100, avg + 2),
    evaluationStatus,
    answeredCount,
    skippedCount,
    totalQuestions: total,
    summary: isPartial
      ? `[Partial Evaluation: ${answeredCount}/${total} Answered] Candidate demonstrated foundational understanding across answered questions for ${jobRole}, but skipped ${skippedCount} question(s). Performance rating is based exclusively on completed answers.`
      : `Candidate demonstrated solid foundational readiness for the ${jobRole} role across all interview questions.`,
    topStrengths: [
      'Strong grasp of fundamentals across answered questions',
      'Articulate communication of technical concepts',
    ],
    keyAreasForImprovement: isPartial
      ? [
          `Attempt all questions in future rounds (${skippedCount} question(s) were skipped)`,
          'Deepen quantitative metrics in architectural decisions',
        ]
      : [
          'Deepen quantitative metrics in architectural decisions',
          'Elaborate on edge cases and failure modes in distributed environments',
        ],
    missingConcepts: [
      'Concurrency lock contention strategies',
      'Distributed transaction isolation models',
    ],
    recommendedTopicsToPractice: [
      'Advanced System Design Patterns',
      'Concurrency, Locking & Thread Safety',
      'STAR Method Behavioral Framing',
    ],
    suggestedNextSteps: [
      'Practice mock interview rounds with timed responses',
      'Deep-dive into database internal storage engines and caching topologies',
    ],
    studyRoadmap: [
      { phase: 'Days 1-2', focus: 'Revise missing concepts in PrepAI Learning Studio' },
      { phase: 'Days 3-4', focus: 'Solve 5 targeted Medium problems in Practice Sandbox' },
      { phase: 'Days 5-7', focus: 'Retake full mock interview round' },
    ],
    disclaimer: 'PrepAI AI Mentor feedback is an educational preparation assessment. Hiring decisions are made independently by employers.',
    provider: 'simulated-ai-mentor',
    isSimulated: true,
  };
};

module.exports = {
  generateInterviewQuestions,
  evaluateAnswer,
  generateFinalReport,
  getAIStatus,
  getApiKey,
  getModelName,
};
