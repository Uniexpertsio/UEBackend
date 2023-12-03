const express = require('express');
const SalesforceSyncController = require('../controllers/SalesforceSync');
const Middleware = require("../controllers/Middleware");

const router = express.Router();
const salesforceController = new SalesforceSyncController();

router.post('/account/update', Middleware.checkAuth, salesforceController.updateAccount.bind(salesforceController));
router.post('/student/add', Middleware.checkAuth, salesforceController.createStudent.bind(salesforceController));
router.post('/student/update', Middleware.checkAuth, salesforceController.updateStudent.bind(salesforceController));
router.post('/student/delete', Middleware.checkAuth, salesforceController.deleteStudent.bind(salesforceController));
router.get('/student/:count', Middleware.checkAuth, salesforceController.getStudent.bind(salesforceController));
router.post('/student/education/add', Middleware.checkAuth, salesforceController.createStudentEducation.bind(salesforceController));
router.post('/student/education/update', Middleware.checkAuth, salesforceController.updateStudentEducation.bind(salesforceController));
router.post('/student/education/delete', Middleware.checkAuth, salesforceController.deleteStudentEducation.bind(salesforceController));
router.get('/student/education/:count', Middleware.checkAuth, salesforceController.getStudentEducation.bind(salesforceController));
router.post('/student/work-history/add', Middleware.checkAuth, salesforceController.createStudentWorkHistory.bind(salesforceController));
router.post('/student/work-history/update', Middleware.checkAuth, salesforceController.updateStudentWorkHistory.bind(salesforceController));
router.post('/student/work-history/delete', Middleware.checkAuth, salesforceController.deleteStudentWorkHistory.bind(salesforceController));
router.post('/student/test-score/add', Middleware.checkAuth, salesforceController.createStudentTestScore.bind(salesforceController));
router.post('/student/test-score/update', Middleware.checkAuth, salesforceController.updateStudentTestScore.bind(salesforceController));

router.post('/student/test-score/delete', Middleware.checkAuth, salesforceController.deleteStudentTestScore.bind(salesforceController));

router.get('/student/test-score/:count', Middleware.checkAuth, salesforceController.getStudentTestScore.bind(salesforceController));

router.post('/student/document/add', Middleware.checkAuth, salesforceController.createStudentDocument.bind(salesforceController));

router.post('/student/document/update', Middleware.checkAuth, salesforceController.updateStudentDocument.bind(salesforceController));

router.post('/student/document/delete', Middleware.checkAuth, salesforceController.deleteStudentDocument.bind(salesforceController));

router.get('/student/document/:count', Middleware.checkAuth, salesforceController.getStudentDocument.bind(salesforceController));

router.post('/student/payment/add', Middleware.checkAuth, salesforceController.createStudentPayment.bind(salesforceController));

router.post('/student/payment/update', Middleware.checkAuth, salesforceController.updateStudentPayment.bind(salesforceController));

router.post('/student/payment/delete', Middleware.checkAuth, salesforceController.deleteStudentPayment.bind(salesforceController));

router.get('/student/payment/:count', Middleware.checkAuth, salesforceController.getStudentPayment.bind(salesforceController));

router.post('/student/task/add', Middleware.checkAuth, salesforceController.createStudentTask.bind(salesforceController));

router.post('/student/task/update', Middleware.checkAuth, salesforceController.updateStudentTask.bind(salesforceController));

router.post('/student/task/delete', Middleware.checkAuth, salesforceController.deleteStudentTask.bind(salesforceController));

router.get('/student/task/:count', Middleware.checkAuth, salesforceController.getStudentTask.bind(salesforceController));

router.post('/student/comment/add', Middleware.checkAuth, salesforceController.createStudentComment.bind(salesforceController));

router.get('/student/comment/:count', Middleware.checkAuth, salesforceController.getStudentComment.bind(salesforceController));

router.post('/application/add', Middleware.checkAuth, salesforceController.createApplication.bind(salesforceController));

router.post('/application/update', Middleware.checkAuth, salesforceController.updateApplication.bind(salesforceController));

router.get('/application/:count', Middleware.checkAuth, salesforceController.getApplication.bind(salesforceController));

router.post('/application/comment/add', Middleware.checkAuth, salesforceController.createApplicationNote.bind(salesforceController));

router.get('/application/comment/:count', Middleware.checkAuth, salesforceController.getApplicationComment.bind(salesforceController));

router.post('/application/document/add', Middleware.checkAuth, salesforceController.createApplicationDocument.bind(salesforceController));

router.post('/application/document/update', Middleware.checkAuth, salesforceController.updateApplicationDocument.bind(salesforceController));

router.get('/application/document/:count', Middleware.checkAuth, salesforceController.getApplicationDocument.bind(salesforceController));

router.post('/application/payment/add', Middleware.checkAuth, salesforceController.createApplicationPayment.bind(salesforceController));

router.post('/application/payment/update', Middleware.checkAuth, salesforceController.updateApplicationPayment.bind(salesforceController));

router.get('/application/payment/:count', Middleware.checkAuth, salesforceController.getApplicationPayment.bind(salesforceController));

router.post('/school/create', Middleware.checkAuth, salesforceController.createSchool.bind(salesforceController));

router.post('/school/update', Middleware.checkAuth, salesforceController.updateSchool.bind(salesforceController));

router.post('/school/programme/create', Middleware.checkAuth, salesforceController.createSchoolProgramme.bind(salesforceController));

router.post('/school/programme/update', Middleware.checkAuth, salesforceController.updateSchoolProgramme.bind(salesforceController));

router.post('/school/intake/create', Middleware.checkAuth, salesforceController.createSchoolIntake.bind(salesforceController));

router.post('/school/intake/update', Middleware.checkAuth, salesforceController.updateSchoolIntake.bind(salesforceController));

router.post('/master/document/add', Middleware.checkAuth, salesforceController.createMasterDocument.bind(salesforceController));

router.post('/master/document/update', Middleware.checkAuth, salesforceController.updateMasterDocument.bind(salesforceController));

module.exports = router;
