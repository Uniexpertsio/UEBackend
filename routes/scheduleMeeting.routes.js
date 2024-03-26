const express = require('express');
const router = express.Router();
const ScheduleMeetingController = require('../controllers/scheduleMeeting');
const Middleware = require("../controllers/Middleware");

const scheduleMeetingController = new ScheduleMeetingController();

router.post('/',Middleware.checkAuth, scheduleMeetingController.scheduleMeeting.bind(scheduleMeetingController));

module.exports = router;
