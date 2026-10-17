const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestionFilters,
  getQuestionById,
  submitAnswer,
  toggleBookmark,
  updateNotes,
  getQuestionProgress,
} = require('../controllers/questionController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// Public / Optionally Authenticated routes
router.get('/', optionalProtect, getQuestions);
router.get('/filters', getQuestionFilters);
router.get('/:id', optionalProtect, getQuestionById);

// Protected routes (require valid JWT)
router.post('/:id/submit', protect, submitAnswer);
router.post('/:id/reveal', protect, (req, res, next) => {
  req.body.action = 'reveal';
  return submitAnswer(req, res, next);
});
router.post('/:id/bookmark', protect, toggleBookmark);
router.put('/:id/notes', protect, updateNotes);
router.get('/:id/progress', protect, getQuestionProgress);

module.exports = router;
