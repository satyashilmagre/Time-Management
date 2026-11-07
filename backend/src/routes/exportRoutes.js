const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/csv', exportController.exportCSV);
router.get('/report-data', exportController.getReportData);

module.exports = router;
