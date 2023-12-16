const express = require('express');
const {  addApplication,
    getApplications,
    getOneNotification,
    dismissOneNotification } = require('../controllers/Notification');
const Middleware = require("../controllers/Middleware")

const router = express.Router();

router.post('/', Middleware.checkAuth, addApplication);
router.get('/', Middleware.checkAuth, getApplications);
router.get('/:id', Middleware.checkAuth, getOneNotification);
router.get('/:id/dismiss', Middleware.checkAuth, dismissOneNotification);

module.exports = router;
