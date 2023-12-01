const SalesforceSyncService = require('../service/salesforcesync.service');

class SalesforceSyncController {
    constructor() {
      this.salesforceService = new SalesforceSyncService();
    }
  
    updateAccount(req, res) {
      const { id, agentId } = req.user;
      const body = req.body;
      this.salesforceService.updateAccount(id, agentId, body)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({ error: error.message }));
    }
  
    createStudent(req, res) {
      const { id, agentId } = req.user;
      const body = req.body;
      this.salesforceService.createStudent(id, agentId, body)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({ error: error.message }));
    }
  
    updateStudent(req, res) {
      const { id, agentId } = req.user;
      const body = req.body;
      this.salesforceService.updateStudent(id, agentId, body)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({ error: error.message }));
    }
  
    deleteStudent(req, res) {
      const body = req.body;
      this.salesforceService.deleteStudent(body)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({ error: error.message }));
    }
  
    getStudent(req, res) {
      const count = req.params.count;
      this.salesforceService.getStudent(count)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({ error: error.message }));
    }
  
    createStudentEducation(req, res) {
      const { id } = req.user;
      const body = req.body;
      this.salesforceService.createStudentEducation(id, body)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({ error: error.message }));
    }
  
    updateStudentEducation(req, res) {
      const { id } = req.user;
      const body = req.body;
      this.salesforceService.updateStudentEducation(id, body)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({ error: error.message }));
    }
  
    deleteStudentEducation(req, res) {
      const { id } = req.user;
      const body = req.body;
      this.salesforceService.deleteStudentEducation(id, body)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({ error: error.message }));
    }
  
    getStudentEducation(req, res) {
      const count = req.params.count;
      this.salesforceService.getStudentEducation(count)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({ error: error.message }));
    }
  
    createStudentWorkHistory(req, res) {
      const { id } = req.user;
      const body = req.body;
      this.salesforceService.createStudentWorkHistory(id, body)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({ error: error.message }));
    }
  
    updateStudentWorkHistory(req, res) {
      const { id } = req.user;
      const body = req.body;
      this.salesforceService.updateStudentWorkHistory(id, body)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({ error: error.message }));
    }
  
    deleteStudentWorkHistory(req, res) {
      const { id } = req.user;
      const body = req.body;
      this.salesforceService.deleteStudentWorkHistory(id, body)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({ error: error.message }));
    }
  
    getStudentWorkHistory(req, res) {
      const count = req.params.count;
      this.salesforceService.getStudentWorkHistory(count)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({ error: error.message }));
    }
  
     // Create student test score
  createStudentTestScore(req, res) {
    try {
      const { id } = req.user;
      const body = req.body;
      // Call the service method to create a student test score
      const result = this.salesforceService.createStudentTestScore(id, body);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Update student test score
  updateStudentTestScore(req, res) {
    try {
      const { id } = req.user;
      const body = req.body;
      // Call the service method to update a student test score
      const result = this.salesforceService.updateStudentTestScore(id, body);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Delete student test score
  deleteStudentTestScore(req, res) {
    try {
      const { id } = req.user;
      const body = req.body;
      // Call the service method to delete a student test score
      const result = this.salesforceService.deleteStudentTestScore(id, body);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Get student test score by count
  getStudentTestScore(req, res) {
    try {
      const count = req.params.count;
      // Call the service method to get student test scores by count
      const result = this.salesforceService.getStudentTestScore(count);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Create student document
  createStudentDocument(req, res) {
    try {
      const { id, agentId } = req.user;
      const body = req.body;
      // Call the service method to create a student document
      const result = this.salesforceService.createStudentDocument(id, agentId, body);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Update student document
  updateStudentDocument(req, res) {
    try {
      const { id } = req.user;
      const body = req.body;
      // Call the service method to update a student document
      const result = this.salesforceService.updateStudentDocument(id, body);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Delete student document
  deleteStudentDocument(req, res) {
    try {
      const { id } = req.user;
      const body = req.body;
      // Call the service method to delete a student document
      const result = this.salesforceService.deleteStudentDocument(id, body);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Get student documents by count
  getStudentDocument(req, res) {
    try {
      const count = req.params.count;
      // Call the service method to get student documents by count
      const result = this.salesforceService.getStudentDocument(count);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  createStudentPayment(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.createStudentPayment(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  updateStudentPayment(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.updateStudentPayment(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  deleteStudentPayment(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.deleteStudentPayment(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  getStudentPayment(req, res) {
    const count = req.params.count;
    try {
      const result = this.salesforceService.getStudentPayment(count);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  createStudentTask(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.createStudentTask(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  updateStudentTask(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.updateStudentTask(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  deleteStudentTask(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.deleteStudentTask(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  getStudentTask(req, res) {
    const count = req.params.count;
    try {
      const result = this.salesforceService.getStudentTask(count);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  createStudentComment(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.createStudentComment(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  getStudentComment(req, res) {
    const count = req.params.count;
    try {
      const result = this.salesforceService.getStudentComment(count);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  createApplication(req, res) {
    const { id, agentId } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.createApplication(id, agentId, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  updateApplication(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.updateApplication(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  getApplication(req, res) {
    const count = req.params.count;
    try {
      const result = this.salesforceService.getApplication(count);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  createApplicationNote(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.createApplicationComment(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  getApplicationComment(req, res) {
    const count = req.params.count;
    try {
      const result = this.salesforceService.getStudentComment(count);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  createApplicationDocument(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.createApplicationDocument(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  updateApplicationDocument(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.updateApplicationDocument(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  getApplicationDocument(req, res) {
    const count = req.params.count;
    try {
      const result = this.salesforceService.getStudentDocument(count);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  createApplicationPayment(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.createApplicationPayment(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  updateApplicationPayment(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.updateApplicationPayment(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  getApplicationPayment(req, res) {
    const count = req.params.count;
    try {
      const result = this.salesforceService.getStudentPayment(count);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  createSchool(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.createSchool(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  updateSchool(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.updateSchool(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  createSchoolProgramme(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.createSchoolProgramme(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  updateSchoolProgramme(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.updateSchoolProgramme(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  createSchoolIntake(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.createSchoolIntake(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  updateSchoolIntake(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.updateSchoolIntake(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  createMasterDocument(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.createMasterDocument(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  updateMasterDocument(req, res) {
    const { id } = req.user;
    const body = req.body;
    try {
      const result = this.salesforceService.updateMasterDocument(id, body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
  }
  
  module.exports = SalesforceSyncController;
  