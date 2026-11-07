const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/daily-insights', aiController.getDailyInsights);
router.post('/weekly-analysis', aiController.getWeeklyAnalysis);
router.post('/ask', aiController.askAiAssistant);

module.exports = router;
