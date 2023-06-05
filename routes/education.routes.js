const express = require('express');
const router = express.Router();
const EducationController = require('../controllers/Education');

const educationController = new EducationController();

router.post('/', educationController.addEducation.bind(educationController));
router.put('/:educationId', educationController.updateEducation.bind(educationController));
router.delete('/:educationId', educationController.deleteEducation.bind(educationController));
router.get('/student/:studentId', educationController.getByStudentId.bind(educationController));

module.exports = router;
