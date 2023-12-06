const express = require('express');
const DashboardController = require('../controllers/Dashboard');

const router = express.Router();
const dashboardController = new DashboardController();

router.get('/banners', dashboardController.getBanners.bind(dashboardController));
router.get('/intake', dashboardController.getIntakes.bind(dashboardController));
router.get('/count', dashboardController.getCount.bind(dashboardController));
router.get('/top-schools', dashboardController.getTopSchools.bind(dashboardController));
router.get('/recent-programs', dashboardController.getRecentPrograms.bind(dashboardController));
router.get('/interviews', dashboardController.getInterviews.bind(dashboardController));
router.get('/report', dashboardController.getReport.bind(dashboardController));

module.exports = router;
