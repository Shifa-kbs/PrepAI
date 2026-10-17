const crypto = require('crypto');
const aiInterviewService = require('./aiInterviewService');

/**
 * Deterministic rule-based task generator tailored to target categories and preferred study days
 */
const generateRuleBasedTasks = ({
  goal = 'Full Stack Developer',
  targetCategories = ['DSA', 'React', 'SQL'],
  studyHoursPerWeek = 10,
  preferredDays = ['Monday', 'Wednesday', 'Friday', 'Saturday'],
  weeks = 2,
}) => {
  const days = preferredDays.length > 0 ? preferredDays : ['Monday', 'Wednesday', 'Friday', 'Saturday'];
  const categories = targetCategories.length > 0 ? targetCategories : ['DSA', 'React', 'SQL', 'System Design'];

  const taskTemplates = [
    { title: 'Solve 3 Easy & Medium Problems in {category}', minutes: 45, diff: 'Medium', desc: 'Focus on time & space complexity analysis.' },
    { title: 'Deep Dive: Core Concepts & Internals of {category}', minutes: 60, diff: 'Medium', desc: 'Review runtime behavior, architecture, and common pitfall questions.' },
    { title: 'Timed Practice Session: 5 Questions in {category}', minutes: 30, diff: 'Hard', desc: 'Simulate high-pressure test conditions.' },
    { title: 'AI Mock Interview Practice Round for {category}', minutes: 45, diff: 'Medium', desc: 'Practice verbal responses and STAR methodology.' },
    { title: 'Code Review & Refactoring Patterns in {category}', minutes: 40, diff: 'Easy', desc: 'Refactor past attempted solutions for optimal readability and performance.' },
  ];

  const tasks = [];
  let taskCounter = 1;

  for (let w = 1; w <= weeks; w++) {
    for (let d = 0; d < days.length; d++) {
      const dayName = days[d];
      const category = categories[(w * days.length + d) % categories.length];
      const template = taskTemplates[(w + d) % taskTemplates.length];

      const taskId = `task_${Date.now()}_${w}_${d}_${crypto.randomBytes(3).toString('hex')}`;
      const title = template.title.replace('{category}', category);

      tasks.push({
        id: taskId,
        title,
        description: template.desc,
        category,
        difficulty: template.diff,
        day: dayName,
        week: w,
        estimatedMinutes: Math.min(120, Math.max(20, template.minutes)),
        isCompleted: false,
        completedAt: null,
      });

      taskCounter++;
    }
  }

  return tasks;
};

/**
 * Generate Personalized Study Plan with AI or Rule-Based Fallback
 */
const generatePlan = async ({
  goal = 'Full Stack Developer',
  targetCategories = [],
  studyHoursPerWeek = 10,
  preferredDays = ['Monday', 'Wednesday', 'Friday', 'Saturday'],
  targetDate,
}) => {
  const days = preferredDays.length > 0 ? preferredDays : ['Monday', 'Wednesday', 'Friday', 'Saturday'];
  const categories = targetCategories.length > 0 ? targetCategories : ['DSA', 'React', 'Node.js', 'SQL'];

  // Check if AI is available and not in explicit test mock mode
  const apiKey = aiInterviewService.getApiKey();
  const canUseAi = apiKey && process.env.MOCK_AI !== 'true';

  if (canUseAi) {
    try {
      const systemInstruction = `You are a principal engineering mentor and career strategist creating a personalized study plan for an engineer targeting: "${goal}".
Study commitment: ${studyHoursPerWeek} hours/week.
Preferred active study days: ${days.join(', ')}.
Priority focus categories: ${categories.join(', ')}.

Create a structured 2-week schedule with 1 concrete, actionable preparation task for each preferred study day.
Each task must have:
- title: concise action string
- description: 1 sentence advice
- category: one of the priority focus categories
- difficulty: Easy, Medium, or Hard
- day: must be one of the specified preferred study days
- week: 1 or 2
- estimatedMinutes: number between 30 and 90

Respond strictly in valid JSON matching this schema:
{
  "tasks": [
    {
      "title": "Solve 3 Two-Pointer Problems in DSA",
      "description": "Master array windowing techniques.",
      "category": "DSA",
      "difficulty": "Medium",
      "day": "Monday",
      "week": 1,
      "estimatedMinutes": 45
    }
  ]
}`;

      const userPrompt = `Generate the customized 2-week task plan now.`;
      const rawJson = await aiInterviewService.callGeminiApi(systemInstruction, userPrompt);
      const parsed = JSON.parse(rawJson.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim());

      if (parsed && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
        const validatedTasks = parsed.tasks.map((t, idx) => ({
          id: `task_ai_${Date.now()}_${idx}_${crypto.randomBytes(3).toString('hex')}`,
          title: t.title || `Study Task ${idx + 1}`,
          description: t.description || 'Focus on understanding core principles.',
          category: t.category || categories[idx % categories.length],
          difficulty: t.difficulty || 'Medium',
          day: t.day || days[idx % days.length],
          week: Number(t.week) || (idx < days.length ? 1 : 2),
          estimatedMinutes: Number(t.estimatedMinutes) || 45,
          isCompleted: false,
          completedAt: null,
        }));

        return {
          tasks: validatedTasks,
          generatedBy: 'ai',
        };
      }
    } catch (err) {
      console.warn('[StudyPlan AI Fallback] AI generation failed, falling back to rule-based engine:', err.message);
    }
  }

  // Deterministic rule-based generation (always reliable and transparent)
  const ruleTasks = generateRuleBasedTasks({
    goal,
    targetCategories: categories,
    studyHoursPerWeek,
    preferredDays: days,
    weeks: 2,
  });

  return {
    tasks: ruleTasks,
    generatedBy: 'rule-based',
  };
};

module.exports = {
  generatePlan,
  generateRuleBasedTasks,
};
