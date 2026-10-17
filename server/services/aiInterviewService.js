const dotenv = require('dotenv');

dotenv.config();

/**
 * AI Interview Service utilizing Google Gemini REST API
 * Supports Mock Mode for testing without consuming API credits
 */

const getApiKey = () => {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
};

const getModelName = () => {
  return process.env.GEMINI_MODEL || 'gemini-1.5-flash';
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
    // Attempt extracting substring between first { and last } or [ and ]
    const startObj = cleaned.indexOf('{');
    const endObj = cleaned.lastIndexOf('}');
    if (startObj !== -1 && endObj !== -1 && endObj > startObj) {
      try {
        return JSON.parse(cleaned.substring(startObj, endObj + 1));
      } catch (e) {
        // Fall through to throw below
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
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY to your server/.env file with a valid Google Gemini API key to enable AI Mock Interviews.'
    );
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
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout

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
        throw new Error('Gemini API rate limit exceeded. Please wait a moment and try again.');
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
    if (error.name === 'AbortError') {
      throw new Error('Gemini API request timed out after 35 seconds. Please try again.');
    }
    throw error;
  }
};

/**
 * Generate role-appropriate interview questions
 */
const generateInterviewQuestions = async ({
  jobRole = 'Full Stack Developer',
  interviewType = 'Mixed',
  difficulty = 'Medium',
  experienceLevel = 'Fresher (0-1 yrs)',
  topics = [],
  questionCount = 5,
}) => {
  // Check for test mock provider mode
  if (process.env.MOCK_AI === 'true') {
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

  const rawJson = await callGeminiApi(systemInstruction, userPrompt);
  const parsed = cleanAndParseJson(rawJson);

  if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error('Invalid format received from Gemini: questions array is missing or empty.');
  }

  // Validate and normalize questions
  return parsed.questions.slice(0, questionCount).map((q, idx) => ({
    questionText: q.questionText || `Interview Question ${idx + 1}`,
    category: q.category || (interviewType === 'Behavioral' ? 'Behavioral' : 'Technical'),
    difficulty: q.difficulty || difficulty,
    contextHint: q.contextHint || 'Explain your thought process and support with real-world examples.',
  }));
};

/**
 * Evaluate submitted answer with structured feedback
 */
const evaluateAnswer = async ({
  jobRole,
  interviewType,
  difficulty,
  questionText,
  category,
  userAnswer,
}) => {
  // Check for test mock provider mode
  if (process.env.MOCK_AI === 'true') {
    return generateMockEvaluation({ questionText, userAnswer });
  }

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
    };
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

  const rawJson = await callGeminiApi(systemInstruction, userPrompt);
  const parsed = cleanAndParseJson(rawJson);

  const clamp = (val, def = 70) => {
    const num = Number(val);
    if (isNaN(num)) return def;
    return Math.max(0, Math.min(100, Math.round(num)));
  };

  return {
    relevanceScore: clamp(parsed.relevanceScore, 70),
    clarityScore: clamp(parsed.clarityScore, 70),
    depthScore: clamp(parsed.depthScore, 70),
    overallScore: clamp(parsed.overallScore, 70),
    feedback: typeof parsed.feedback === 'string' && parsed.feedback.trim()
      ? parsed.feedback.trim()
      : 'Good effort. Your answer touched on key concepts, but could benefit from deeper technical rationale and concrete examples.',
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.filter(Boolean) : ['Addressed the main question'],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.filter(Boolean) : ['Could provide more edge cases and depth'],
    suggestedImprovements: Array.isArray(parsed.suggestedImprovements)
      ? parsed.suggestedImprovements.filter(Boolean)
      : ['Structure your answer by first defining the high-level pattern, followed by implementation details and runtime trade-offs.'],
    followUpQuestion: typeof parsed.followUpQuestion === 'string' && parsed.followUpQuestion.trim().length > 5
      ? parsed.followUpQuestion.trim()
      : null,
  };
};

/**
 * Generate comprehensive final report summarizing the entire interview
 */
const generateFinalReport = async ({
  jobRole,
  interviewType,
  difficulty,
  experienceLevel,
  questions = [],
}) => {
  // Check for test mock provider mode
  if (process.env.MOCK_AI === 'true') {
    return generateMockFinalReport({ jobRole, questions });
  }

  const answeredQuestions = questions.filter((q) => q.userAnswer && q.userAnswer.trim().length > 0);
  const averageScore = answeredQuestions.length > 0
    ? Math.round(answeredQuestions.reduce((acc, q) => acc + (q.score || 0), 0) / answeredQuestions.length)
    : 0;

  const summaryContext = questions.map((q, idx) => ({
    qIndex: idx + 1,
    question: q.questionText,
    category: q.category,
    userAnswer: q.userAnswer || '[Skipped / Unanswered]',
    score: q.score || 0,
    strengths: q.strengths || [],
    weaknesses: q.weaknesses || [],
  }));

  const systemInstruction = `You are an executive hiring board member synthesizing a final evaluation report for a candidate interview.
Candidate Target: ${experienceLevel} ${jobRole}
Interview Type: ${interviewType}
Difficulty: ${difficulty}

Below are the transcript summaries of each question and answer from the session.
Synthesize an executive candidate feedback report.
Scores must be numbers from 0 to 100:
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
  "summary": "2-4 sentence executive overview of the candidate's interview performance, readiness for the role, and general impression.",
  "topStrengths": [
    "Key overall strength #1",
    "Key overall strength #2",
    "Key overall strength #3"
  ],
  "keyAreasForImprovement": [
    "Major area for improvement #1",
    "Major area for improvement #2"
  ],
  "recommendedTopicsToPractice": [
    "Specific topic or technology #1",
    "Specific topic or technology #2"
  ],
  "suggestedNextSteps": [
    "Concrete actionable preparation step #1",
    "Concrete actionable preparation step #2"
  ]
}`;

  const userPrompt = `Interview Performance Transcript:\n${JSON.stringify(summaryContext, null, 2)}`;

  const rawJson = await callGeminiApi(systemInstruction, userPrompt);
  const parsed = cleanAndParseJson(rawJson);

  const clamp = (val, def = 70) => {
    const num = Number(val);
    if (isNaN(num)) return def;
    return Math.max(0, Math.min(100, Math.round(num)));
  };

  return {
    overallScore: clamp(parsed.overallScore, averageScore),
    technicalKnowledge: clamp(parsed.technicalKnowledge, 75),
    answerRelevance: clamp(parsed.answerRelevance, 80),
    problemSolving: clamp(parsed.problemSolving, 75),
    communicationClarity: clamp(parsed.communicationClarity, 80),
    summary: typeof parsed.summary === 'string' && parsed.summary.trim()
      ? parsed.summary.trim()
      : `The candidate demonstrated foundational knowledge for the ${jobRole} position with solid communication. Continued practice in edge-case handling and system architecture will elevate interview readiness.`,
    topStrengths: Array.isArray(parsed.topStrengths) && parsed.topStrengths.length > 0
      ? parsed.topStrengths.filter(Boolean)
      : ['Clear baseline technical vocabulary', 'Coherent communication flow', 'Willingness to explain trade-offs'],
    keyAreasForImprovement: Array.isArray(parsed.keyAreasForImprovement) && parsed.keyAreasForImprovement.length > 0
      ? parsed.keyAreasForImprovement.filter(Boolean)
      : ['Deepen architectural explanations', 'Include more specific performance metrics in responses'],
    recommendedTopicsToPractice: Array.isArray(parsed.recommendedTopicsToPractice) && parsed.recommendedTopicsToPractice.length > 0
      ? parsed.recommendedTopicsToPractice.filter(Boolean)
      : ['System Design & Scalability', 'Advanced Data Structures & Algorithms', 'Behavioral STAR Scenarios'],
    suggestedNextSteps: Array.isArray(parsed.suggestedNextSteps) && parsed.suggestedNextSteps.length > 0
      ? parsed.suggestedNextSteps.filter(Boolean)
      : ['Practice verbalizing code logic out loud', 'Time your responses to remain under 3 minutes per question'],
  };
};

// ==========================================
// TEST MOCK PROVIDERS (Explicitly Isolated)
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
  }));
};

const generateMockEvaluation = ({ questionText, userAnswer }) => {
  const wordCount = (userAnswer || '').trim().split(/\s+/).length;
  let score = 75;
  if (wordCount < 10) score = 40;
  else if (wordCount > 30) score = 85;

  return {
    relevanceScore: score,
    clarityScore: Math.min(100, score + 5),
    depthScore: Math.max(30, score - 5),
    overallScore: score,
    feedback: `[MOCK AI PROVIDER: Test Mode] Your answer of ${wordCount} words addressed the fundamental aspect of "${questionText.substring(0, 35)}...". Clear technical vocabulary was used.`,
    strengths: ['Identified core engineering principles', 'Communicated with structured technical terminology'],
    weaknesses: wordCount < 20 ? ['Answer was relatively brief; could expand on real-world edge cases'] : ['Could include specific latency/throughput trade-offs'],
    suggestedImprovements: ['Mention concrete benchmarks and production scenarios to reinforce credibility.'],
    followUpQuestion: score < 70 ? 'Can you elaborate on how you would test this implementation under high load?' : null,
  };
};

const generateMockFinalReport = ({ jobRole, questions }) => {
  const answered = questions.filter((q) => q.userAnswer && q.userAnswer.trim().length > 0);
  const avg = answered.length > 0
    ? Math.round(answered.reduce((a, b) => a + (b.score || 70), 0) / answered.length)
    : 70;

  return {
    overallScore: avg,
    technicalKnowledge: Math.min(100, avg + 4),
    answerRelevance: Math.min(100, avg + 2),
    problemSolving: Math.max(40, avg - 3),
    communicationClarity: Math.min(100, avg + 5),
    summary: `[MOCK AI PROVIDER: Test Mode] Candidate demonstrated solid readiness for the ${jobRole} role. Good clarity on core engineering paradigms with room to demonstrate deeper system scalability metrics.`,
    topStrengths: [
      'Strong grasp of fundamentals and clear problem framing',
      'Articulate communication of technical concepts',
      'Demonstrated awareness of real-world trade-offs',
    ],
    keyAreasForImprovement: [
      'Deepen quantitative metrics in architectural decisions',
      'Elaborate on edge cases and failure modes in distributed environments',
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
  };
};

module.exports = {
  generateInterviewQuestions,
  evaluateAnswer,
  generateFinalReport,
  getApiKey,
  getModelName,
};
