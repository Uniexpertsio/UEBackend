const express = require('express');
const reportController = require('../controllers/Report');
const Middleware = require("../controllers/Middleware");

const router = express.Router();

router.use(express.json());

router.get('/total-earning', Middleware.checkAuth, reportController.getTotalEarning);
router.get('/agent-earning', Middleware.checkAuth, reportController.getAgentEarning);
router.get('/data', Middleware.checkAuth, reportController.getReportData);
router.get('/type', Middleware.checkAuth, reportController.getReportType);
router.get('/list', Middleware.checkAuth, reportController.getReportList);
router.get('/', Middleware.checkAuth, reportController.getReport);

module.exports = router;
