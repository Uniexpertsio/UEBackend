const EducationService = require('../service/education.service');

class EducationController {
  constructor() {
    this.educationService = new EducationService();
  }

  addEducation(req, res) {
    try {
      const { studentId, modifiedBy, body } = req;
      const education = this.educationService.add(studentId, modifiedBy, body);
      res.status(201).json(education);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  updateEducation(req, res) {
    try {
      const { modifiedBy, params, body } = req;
      const educationId = params.educationId;
      this.educationService.update(modifiedBy, educationId, body);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  deleteEducation(req, res) {
    try {
      const { params } = req;
      const educationId = params.educationId;
      this.educationService.delete(educationId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getByStudentId(req, res) {
    try {
      const { params } = req;
      const studentId = params.studentId;
      const education = this.educationService.getByStudentId(studentId);
      res.json(education);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = EducationController;
