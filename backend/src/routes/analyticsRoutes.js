const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/daily', analyticsController.getDailyAnalytics);
router.get('/weekly', analyticsController.getWeeklyAnalytics);
router.get('/monthly', analyticsController.getMonthlyAnalytics);
router.get('/yearly', analyticsController.getYearlyAnalytics);
router.get('/wasted-time', analyticsController.getWastedTimeDetection);
router.get('/productivity-score', analyticsController.getProductivityScore);

module.exports = router;
