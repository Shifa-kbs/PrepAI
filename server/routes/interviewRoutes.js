const express = require('express');
const router = express.Router();
const {
  startInterview,
  getActiveInterview,
  getInterviewById,
  submitAnswer,
  skipQuestion,
  finishInterview,
  getInterviewReport,
  getInterviewHistory,
  abandonActiveInterview,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

// All interview endpoints strictly require authentication
router.use(protect);

router.post('/start', startInterview);
router.get('/active', getActiveInterview);
router.get('/history', getInterviewHistory);
router.post('/abandon', abandonActiveInterview);

router.get('/:id', getInterviewById);
router.post('/:id/answer', submitAnswer);
router.post('/:id/skip', skipQuestion);
router.post('/:id/finish', finishInterview);
router.get('/:id/report', getInterviewReport);

module.exports = router;
