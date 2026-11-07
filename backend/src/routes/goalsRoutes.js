const express = require('express');
const router = express.Router();
const goalsController = require('../controllers/goalsController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', goalsController.getGoals);
router.post('/daily', goalsController.createDailyGoal);
router.post('/weekly', goalsController.createWeeklyGoal);
router.put('/daily/:id', goalsController.updateDailyGoal);
router.delete('/daily/:id', goalsController.deleteDailyGoal);
router.delete('/weekly/:id', goalsController.deleteWeeklyGoal);

module.exports = router;
