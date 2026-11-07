const express = require('express');
const router = express.Router();
const focusController = require('../controllers/focusController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/start', focusController.startFocusSession);
router.post('/complete', focusController.completeFocusSession);
router.get('/history', focusController.getFocusHistory);
router.get('/stats', focusController.getFocusStats);

module.exports = router;
