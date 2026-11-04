const express = require('express');
const router = express.Router();
const {
  submitCognitiveSession,
  getCognitiveHistory,
  getCognitiveStats,
} = require('../controllers/cognitiveController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/session', submitCognitiveSession);
router.get('/history', getCognitiveHistory);
router.get('/stats', getCognitiveStats);

module.exports = router;
