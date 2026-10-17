const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getPlatformStats,
  getUsers,
  updateUserRole,
  getAdminQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/adminController');

// All admin routes strictly require authentication and admin role verification
router.use(protect);
router.use(adminOnly);

router.get('/stats', getPlatformStats);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/questions', getAdminQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

module.exports = router;
