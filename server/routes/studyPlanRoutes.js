const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getStudyPlan,
  createOrUpdatePlan,
  toggleTaskCompletion,
  addCustomTask,
  deleteTask,
} = require('../controllers/studyPlanController');

// All study plan routes require authentication
router.use(protect);

router.get('/', getStudyPlan);
router.post('/', createOrUpdatePlan);
router.patch('/tasks/:taskId/toggle', toggleTaskCompletion);
router.post('/tasks', addCustomTask);
router.delete('/tasks/:taskId', deleteTask);

module.exports = router;
