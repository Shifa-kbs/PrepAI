const express = require('express');
const router = express.Router();
const {
  startSession,
  getActiveSession,
  getSessionById,
  submitSessionAnswer,
  toggleMarkForReview,
  finishSession,
  getSessionHistory,
  abandonActiveSession,
  getAptitudeStats,
} = require('../controllers/practiceController');
const { protect } = require('../middleware/authMiddleware');

// All practice routes are strictly authenticated
router.use(protect);

router.post('/start', startSession);
router.get('/active', getActiveSession);
router.get('/history', getSessionHistory);
router.get('/aptitude/stats', getAptitudeStats);
router.post('/abandon', abandonActiveSession);

router.get('/:id', getSessionById);
router.post('/:id/answer', submitSessionAnswer);
router.put('/:id/review', toggleMarkForReview);
router.post('/:id/finish', finishSession);

module.exports = router;
