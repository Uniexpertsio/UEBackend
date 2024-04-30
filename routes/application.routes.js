// applicationRoutes.js

const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/Application');

const Middleware = require("../controllers/Middleware");

router.post('/', Middleware.checkAuth, applicationController.addApplication.bind(applicationController));
router.get('/', Middleware.checkAuth, applicationController.getApplications.bind(applicationController));
router.get('/:applicationId/task', Middleware.checkAuth, applicationController.getTasks.bind(applicationController));
router.patch('/:applicationId/task/:taskId', Middleware.checkAuth, applicationController.updateTask.bind(applicationController));
router.get('/:applicationId/task/:taskId/comment', Middleware.checkAuth, applicationController.getTaskComments.bind(applicationController));
router.post('/:applicationId/task/:taskId/comment', Middleware.checkAuth, applicationController.addTaskComment.bind(applicationController));
router.get('/:applicationId/comment', Middleware.checkAuth, applicationController.getComments.bind(applicationController));
router.post('/:applicationId/comment', Middleware.checkAuth, applicationController.addComment.bind(applicationController));
router.get('/:applicationId/document', Middleware.checkAuth, applicationController.getStudentDocuments.bind(applicationController));
router.post('/:applicationId/payment', Middleware.checkAuth, applicationController.addOrUpdatePayment.bind(applicationController));
router.get('/:applicationId/payment', Middleware.checkAuth, applicationController.getPayments.bind(applicationController));
router.get('/:applicationId', Middleware.checkAuth, applicationController.getApplication.bind(applicationController));
router.patch('/:applicationSfId',Middleware.checkAuth, applicationController.updateApplication.bind(applicationController));
router.get('/stages',Middleware.checkAuth, applicationController.updateApplication.bind(applicationController));

module.exports = router;
