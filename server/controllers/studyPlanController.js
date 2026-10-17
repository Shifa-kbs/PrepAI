const mongoose = require('mongoose');
const StudyPlan = require('../models/StudyPlan');
const QuestionProgress = require('../models/QuestionProgress');
const studyPlanGenerator = require('../services/studyPlanGenerator');

/**
 * @desc    Get current user's study plan and recommended focus categories
 * @route   GET /api/study-plan
 * @access  Private
 */
const getStudyPlan = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOne({ user: req.user._id }).lean();

    // Query user's progress to recommend priority topics
    const progressList = await QuestionProgress.find({ user: req.user._id })
      .populate('question', 'category')
      .lean();

    const catStats = {};
    progressList.forEach((p) => {
      const cat = p.question?.category || 'General';
      if (!catStats[cat]) catStats[cat] = { attempted: 0, solved: 0 };
      catStats[cat].attempted += 1;
      if (p.status === 'solved') catStats[cat].solved += 1;
    });

    const recommendedCategories = Object.keys(catStats)
      .filter((c) => catStats[c].attempted > 0 && catStats[c].solved / catStats[c].attempted < 0.7)
      .slice(0, 4);

    return res.status(200).json({
      success: true,
      plan: plan || null,
      data: plan || null,
      recommendedCategories: recommendedCategories.length > 0 ? recommendedCategories : ['DSA', 'React', 'SQL', 'System Design'],
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Create or regenerate personalized study plan
 * @route   POST /api/study-plan
 * @access  Private
 */
const createOrUpdatePlan = async (req, res, next) => {
  try {
    const {
      goal = 'Full Stack Software Engineer',
      targetDate,
      studyHoursPerWeek = 10,
      preferredDays = ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      targetCategories = [],
    } = req.body;

    if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Goal is required',
      });
    }

    const hours = Math.max(1, Math.min(60, parseInt(studyHoursPerWeek, 10) || 10));

    // Generate balanced tasks
    const { tasks, generatedBy } = await studyPlanGenerator.generatePlan({
      goal: goal.trim(),
      targetCategories: Array.isArray(targetCategories) && targetCategories.length > 0 ? targetCategories : ['DSA', 'React', 'SQL'],
      studyHoursPerWeek: hours,
      preferredDays: Array.isArray(preferredDays) && preferredDays.length > 0 ? preferredDays : ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      targetDate,
    });

    // Check if user already has an existing plan
    let plan = await StudyPlan.findOne({ user: req.user._id });

    if (plan) {
      // Overwrite plan fields cleanly without duplicating tasks
      plan.goal = goal.trim();
      if (targetDate) plan.targetDate = new Date(targetDate);
      plan.studyHoursPerWeek = hours;
      plan.preferredDays = preferredDays;
      plan.targetCategories = targetCategories;
      plan.tasks = tasks; // Replaces task array with clean new schedule
      plan.generatedBy = generatedBy;
      plan.lastGeneratedAt = new Date();
    } else {
      plan = new StudyPlan({
        user: req.user._id,
        goal: goal.trim(),
        targetDate: targetDate ? new Date(targetDate) : undefined,
        studyHoursPerWeek: hours,
        preferredDays,
        targetCategories,
        tasks,
        generatedBy,
        lastGeneratedAt: new Date(),
      });
    }

    await plan.save();

    return res.status(200).json({
      success: true,
      message: `Study plan generated successfully via ${generatedBy} engine`,
      plan,
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Toggle a task's completion status
 * @route   PATCH /api/study-plan/tasks/:taskId/toggle
 * @access  Private
 */
const toggleTaskCompletion = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const plan = await StudyPlan.findOne({ user: req.user._id });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'No study plan found for user',
      });
    }

    const task = plan.tasks.find(
      (t) =>
        (t.id && t.id.toString() === taskId.toString()) ||
        (t._id && t._id.toString() === taskId.toString())
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found in study plan',
      });
    }

    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date() : null;

    await plan.save();

    return res.status(200).json({
      success: true,
      message: task.isCompleted ? 'Task marked as complete' : 'Task unmarked',
      task,
      progress: plan.progress,
      plan,
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Add a custom task to current study plan
 * @route   POST /api/study-plan/tasks
 * @access  Private
 */
const addCustomTask = async (req, res, next) => {
  try {
    const {
      title,
      description = '',
      category = 'General',
      difficulty = 'Medium',
      day = 'Monday',
      week = 1,
      estimatedMinutes = 45,
    } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    const plan = await StudyPlan.findOne({ user: req.user._id });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'No active study plan found. Please create a study plan first.',
      });
    }

    const newTask = {
      id: `task_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      difficulty,
      day,
      week: Math.max(1, parseInt(week, 10) || 1),
      estimatedMinutes: Math.max(10, parseInt(estimatedMinutes, 10) || 45),
      isCompleted: false,
      completedAt: null,
    };

    plan.tasks.push(newTask);
    await plan.save();

    return res.status(201).json({
      success: true,
      message: 'Custom task added successfully',
      task: newTask,
      plan,
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Delete a task from current study plan
 * @route   DELETE /api/study-plan/tasks/:taskId
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const plan = await StudyPlan.findOne({ user: req.user._id });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found',
      });
    }

    const initialCount = plan.tasks.length;
    plan.tasks = plan.tasks.filter(
      (t) =>
        (t.id ? t.id.toString() !== taskId.toString() : true) &&
        (t._id ? t._id.toString() !== taskId.toString() : true)
    );

    if (plan.tasks.length === initialCount) {
      return res.status(404).json({
        success: false,
        message: 'Task not found in plan',
      });
    }

    await plan.save();

    return res.status(200).json({
      success: true,
      message: 'Task removed from plan',
      plan,
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getStudyPlan,
  createOrUpdatePlan,
  toggleTaskCompletion,
  addCustomTask,
  deleteTask,
};
