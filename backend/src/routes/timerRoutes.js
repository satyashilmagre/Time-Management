const express = require('express');
const router = express.Router();
const timerController = require('../controllers/timerController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/active', timerController.getActiveTimer);
router.post('/start', timerController.startTimer);
router.post('/pause', timerController.pauseTimer);
router.post('/resume', timerController.resumeTimer);
router.post('/stop', timerController.stopTimer);
router.post('/discard', timerController.discardTimer);

module.exports = router;
