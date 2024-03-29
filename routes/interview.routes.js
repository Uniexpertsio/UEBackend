const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/Interview');
const Middleware = require("../controllers/Middleware")

router.post('/support', Middleware.checkAuth, interviewController.createInterview);

router.get('/partner', Middleware.checkAuth, interviewController.getPartnerInterviews);

module.exports = router;