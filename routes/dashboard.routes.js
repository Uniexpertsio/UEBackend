const express = require('express');
const DashboardController = require('../controllers/Dashboard');
const Middleware = require("../controllers/Middleware")

const router = express.Router();
const dashboardController = new DashboardController();

router.get('/banners', Middleware.checkAuth, dashboardController.getBanners.bind(dashboardController));
router.get('/intake', Middleware.checkAuth, dashboardController.getIntakes.bind(dashboardController));
router.get('/count', Middleware.checkAuth, dashboardController.getCount.bind(dashboardController));
router.get('/top-schools', Middleware.checkAuth, dashboardController.getTopSchools.bind(dashboardController));
router.get('/recent-programs', Middleware.checkAuth, dashboardController.getRecentPrograms.bind(dashboardController));
router.get('/interviews', Middleware.checkAuth, dashboardController.getInterviews.bind(dashboardController));
router.get('/report', Middleware.checkAuth, dashboardController.getReport.bind(dashboardController));

module.exports = router;
