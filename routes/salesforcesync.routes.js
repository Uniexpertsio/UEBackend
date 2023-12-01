const express = require('express');
const SalesforceSyncController = require('../controllers/SalesforceSync');

const router = express.Router();
const salesforceController = new SalesforceSyncController();

router.post('/account/update', salesforceController.updateAccount.bind(salesforceController));
router.post('/student/add', salesforceController.createStudent.bind(salesforceController));
router.post('/student/update', salesforceController.updateStudent.bind(salesforceController));
router.post('/student/delete', salesforceController.deleteStudent.bind(salesforceController));
router.get('/student/:count', salesforceController.getStudent.bind(salesforceController));
router.post('/student/education/add', salesforceController.createStudentEducation.bind(salesforceController));
router.post('/student/education/update', salesforceController.updateStudentEducation.bind(salesforceController));
router.post('/student/education/delete', salesforceController.deleteStudentEducation.bind(salesforceController));
router.get('/student/education/:count', salesforceController.getStudentEducation.bind(salesforceController));
router.post('/student/work-history/add', salesforceController.createStudentWorkHistory.bind(salesforceController));
router.post('/student/work-history/update', salesforceController.updateStudentWorkHistory.bind(salesforceController));
router.post('/student/work-history/delete', salesforceController.deleteStudentWorkHistory.bind(salesforceController));
router.post('/student/test-score/add', salesforceController.createStudentTestScore.bind(salesforceController));
router.post('/student/test-score/update', salesforceController.updateStudentTestScore.bind(salesforceController));

router.post('/student/test-score/delete', salesforceController.deleteStudentTestScore.bind(salesforceController));

router.get('/student/test-score/:count', salesforceController.getStudentTestScore.bind(salesforceController));

router.post('/student/document/add', salesforceController.createStudentDocument.bind(salesforceController));

router.post('/student/document/update', salesforceController.updateStudentDocument.bind(salesforceController));

router.post('/student/document/delete', salesforceController.deleteStudentDocument.bind(salesforceController));

router.get('/student/document/:count', salesforceController.getStudentDocument.bind(salesforceController));

router.post('/student/payment/add', salesforceController.createStudentPayment.bind(salesforceController));

router.post('/student/payment/update', salesforceController.updateStudentPayment.bind(salesforceController));

router.post('/student/payment/delete', salesforceController.deleteStudentPayment.bind(salesforceController));

router.get('/student/payment/:count', salesforceController.getStudentPayment.bind(salesforceController));

router.post('/student/task/add', salesforceController.createStudentTask.bind(salesforceController));

router.post('/student/task/update', salesforceController.updateStudentTask.bind(salesforceController));

router.post('/student/task/delete', salesforceController.deleteStudentTask.bind(salesforceController));

router.get('/student/task/:count', salesforceController.getStudentTask.bind(salesforceController));

router.post('/student/comment/add', salesforceController.createStudentComment.bind(salesforceController));

router.get('/student/comment/:count', salesforceController.getStudentComment.bind(salesforceController));

router.post('/application/add', salesforceController.createApplication.bind(salesforceController));

router.post('/application/update', salesforceController.updateApplication.bind(salesforceController));

router.get('/application/:count', salesforceController.getApplication.bind(salesforceController));

router.post('/application/comment/add', salesforceController.createApplicationNote.bind(salesforceController));

router.get('/application/comment/:count', salesforceController.getApplicationComment.bind(salesforceController));

router.post('/application/document/add', salesforceController.createApplicationDocument.bind(salesforceController));

router.post('/application/document/update', salesforceController.updateApplicationDocument.bind(salesforceController));

router.get('/application/document/:count', salesforceController.getApplicationDocument.bind(salesforceController));

router.post('/application/payment/add', salesforceController.createApplicationPayment.bind(salesforceController));

router.post('/application/payment/update', salesforceController.updateApplicationPayment.bind(salesforceController));

router.get('/application/payment/:count', salesforceController.getApplicationPayment.bind(salesforceController));

router.post('/school/create', salesforceController.createSchool.bind(salesforceController));

router.post('/school/update', salesforceController.updateSchool.bind(salesforceController));

router.post('/school/programme/create', salesforceController.createSchoolProgramme.bind(salesforceController));

router.post('/school/programme/update', salesforceController.updateSchoolProgramme.bind(salesforceController));

router.post('/school/intake/create', salesforceController.createSchoolIntake.bind(salesforceController));

router.post('/school/intake/update', salesforceController.updateSchoolIntake.bind(salesforceController));

router.post('/master/document/add', salesforceController.createMasterDocument.bind(salesforceController));

router.post('/master/document/update', salesforceController.updateMasterDocument.bind(salesforceController));

module.exports = router;
