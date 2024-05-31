const StudentService = require("../service/student.service");
const StudentModel = require("../models/Student");
const DocumentModel = require("../models/Document");
const { getContactId } = require("../service/salesforce.service");

class StudentController {
  constructor() {
    this.studentService = new StudentService();
  }

  async createStudent(req, res) {
    try {
      const { id, agentId } = req.user;
      const body = req.body;
      const result = await this.studentService.createStudent(id, agentId, body);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStudents(req, res) {
    try {
      const { agentId, role, _id } = req.user;
      const query = req.query;
      const searchData = {
        searchType: req.query.searchType,
        searchTerm: req.query.searchTerm,
      };
      const result = await this.studentService.getStudent(
        agentId,
        query,
        role,
        _id,
        searchData
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStudentPc(req, res) {
    try {
      const result = await this.studentService.preferredCountries();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteStudent(req, res) {
    try {
      const studentId = req.params.studentId;
      await this.studentService.deleteStudent(studentId);
      res.status(200).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStudentGeneralInformation(req, res) {
    try {
      const studentId = req.params.studentId;
      const result = await this.studentService.getStudentGeneralInformation(
        studentId
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async generalInformationWithSfId(req, res) {
    try {
      const studentId = req.params.studentId;
      const result =
        await this.studentService.getStudentGeneralInformationWithSfId(
          studentId
        );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateStudentGeneralInformation(req, res) {
    try {
      const studentId = req.params.studentId;
      const { id } = req.user;
      const body = req.body;
      const data = await this.studentService.updateStudentGeneralInformation(
        studentId,
        id,
        body,
        req.query?.frontend
      );
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStudentEducation(req, res) {
    try {
      const studentId = req.params.studentId;
      const result = await this.studentService.getStudentEducation(studentId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addStudentEducation(req, res) {
    try {
      const studentId = req.params.studentId;
      const { _id, agentId } = req.user;
      const body = req.body;
      const student = await this.studentService.addStudentEducation(
        studentId,
        _id,
        body
      );
      res.status(200).json(student);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateStudentEducation(req, res) {
    try {
      const studentId = req.params.studentId;
      const educationId = req.params.educationId;
      const { id } = req.user;
      const body = req.body;
      const education = await this.studentService.updateStudentEducation(
        studentId,
        id,
        educationId,
        body
      );
      res.status(200).json(education);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteStudentEducation(req, res) {
    try {
      const studentId = req.params.studentId;
      const educationId = req.params.educationId;
      const { id } = req.user;
      const education = await this.studentService.deleteEducation(
        studentId,
        id,
        educationId
      );
      res.status(200).json(education);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStudentWorkHistory(req, res) {
    try {
      const studentId = req.params.studentId;
      const result = await this.studentService.getStudentWorkHistory(studentId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addStudentWorkHistory(req, res) {
    try {
      const studentId = req.params.studentId;
      const { id, agentId } = req.user;
      const body = req.body;
      const { addStudentPage } = req.query;
      const workHistory = await this.studentService.addStudentWorkHistory(
        studentId,
        id,
        body,
        agentId,
        addStudentPage
      );
      res.status(200).json(workHistory);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateStudentWorkHistory(req, res) {
    try {
      const studentId = req.params.studentId;
      const workHistoryId = req.params.workHistoryId;
      const body = req.body;
      const { id } = req.user;
      const workHistory = await this.studentService.updateStudentWorkHistory(
        studentId,
        id,
        workHistoryId,
        body
      );
      res.status(200).json(workHistory);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  deleteStudentWorkHistory = async (req, res) => {
    try {
      const { studentId, workHistoryId } = req.params;
      const { id } = req.user;
      const result = await this.studentService.deleteStudentWorkHistory(
        studentId,
        id,
        workHistoryId
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getStudentTestScore = async (req, res) => {
    try {
      const { studentId } = req.params;
      const result = await this.studentService.getStudentTestScore(studentId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  addStudentTestScore = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { body } = req;
      const { id, agentId } = req.user;
      const result = await this.studentService.addStudentTestScore(
        studentId,
        id,
        body,
        agentId
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  updateStudentTestScore = async (req, res) => {
    try {
      const { studentId, testScoreId } = req.params;
      const { body } = req;
      const { id } = req.user;
      const { isFrontend } = req.query;
      const result = await this.studentService.updateStudentTestScore(
        studentId,
        id,
        testScoreId,
        isFrontend,
        body
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  deleteStudentTestScore = async (req, res) => {
    try {
      const { studentId, testScoreId } = req.params;
      const { id } = req.user;
      const result = await this.studentService.deleteStudentTestScore(
        studentId,
        id,
        testScoreId
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getStudentDocuments = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { searchType, searchTerm, applicationId } = req.query;
      const studentData = await StudentModel.findOne({ _id: studentId });
      if (!studentData) {
        throw new Error(`Student not with id: ${studentId}`);
      }
      let query;
      switch (searchType) {
        case "name":
          query = { name: new RegExp(searchTerm, "i") };
          break;
        case "category":
          query = { category: new RegExp(searchTerm, "i") };
          break;
        case "used for":
          query = { "used for": new RegExp(searchTerm, "i") };
          break;
        case "status":
          query = { status: new RegExp(searchTerm, "i") };
          break;
        default:
          query = {};
          break;
      }
      if (studentId) {
        query = { $and: [{ studentId, applicationId: { $exists: false } }] };
      }
      if (studentId && applicationId) {
        query = {
          $or: [{ studentId }, { $and: [{ studentId, applicationId }] }],
        };
      }
      const documentData = await DocumentModel.find(query);
      res.status(200).json(documentData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  addStudentDocuments = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { body } = req;
      const { id } = req.user;
      const result = await this.studentService.addStudentDocuments(
        studentId,
        id,
        body
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  updateStudentDocument = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { body } = req;
      const { id } = req.user;
      const { applicationId } = req.query;
      const result = await this.studentService.updateStudentDocument(
        studentId,
        id,
        body,
        req.query?.frontend,
        applicationId
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  updateStudentCurrentStage = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { noWorkHistory, addStudentPage } = req.query;
      const result = await this.studentService.updateStudentCurrentStage(
        studentId,
        noWorkHistory,
        addStudentPage
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  deleteStudentDocument = async (req, res) => {
    try {
      const { studentId, documentId } = req.params;
      const { id } = req.user;
      const result = await this.studentService.deleteStudentDocument(
        studentId,
        id,
        documentId
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getStudentPayments = async (req, res) => {
    try {
      const { studentId } = req.params;
      const result = await this.studentService.getStudentPayments(studentId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  addStudentPayment = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { body } = req;
      const { id } = req.user;
      const result = await this.studentService.addStudentPayment(
        studentId,
        id,
        body
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  updateStudentPayment = async (req, res) => {
    try {
      const { studentId, paymentId } = req.params;
      const { body } = req;
      const { id } = req.user;
      const result = await this.studentService.updateStudentPayment(
        studentId,
        id,
        paymentId,
        body
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  deleteStudentPayment = async (req, res) => {
    try {
      const { studentId, paymentId } = req.params;
      const { id } = req.user;
      const result = await this.studentService.deleteStudentPayment(
        studentId,
        id,
        paymentId
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getStudentTasks = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { status } = req.query;
      const result = await this.studentService.getStudentTasks(
        studentId,
        status
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  addStudentTask = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { body } = req;
      const { id, agentId } = req.user;
      const result = await this.studentService.addStudentTask(
        studentId,
        agentId,
        id,
        body
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  updateStudentTask = async (req, res) => {
    try {
      const { studentId, taskId } = req.params;
      const { data } = req.query;
      const { id } = req.user;
      const result = await this.studentService.updateStudentTask(
        studentId,
        id,
        taskId,
        data
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getStudentTaskComments = async (req, res) => {
    try {
      const { studentId, taskId } = req.params;
      const result = await this.studentService.getStudentTaskComments(
        studentId,
        taskId
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  addStudentTaskComment = async (req, res) => {
    try {
      const { studentId, taskId } = req.params;
      const { body } = req;
      const { id } = req.user;
      const result = await this.studentService.addStudentTaskComment(
        studentId,
        id,
        taskId,
        body
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getStudentComments = async (req, res) => {
    try {
      const { studentId } = req.params;
      const comments = await this.studentService.getStudentComments(studentId);
      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  addStudentComment = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { id } = req.user;
      const body = req.body;
      const response = await this.studentService.addStudentComment(
        studentId,
        id,
        body
      );
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getStudentProgress = async (req, res) => {
    try {
      const { studentId } = req.params;
      const progress = await this.studentService.getStudentProgress(studentId);
      res.status(200).json(progress);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  async StudentSearch(req, res) {
    try {
      const student = await this.studentService.getStudentSearchData(req);
      res.status(200).json(student);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async getPartnerId(req, res) {
    try {
      const { studentId } = req?.params;
      const student = await StudentModel.findById(studentId);
      let contact;
      if (student?.salesforceId) {
        contact = await getContactId(student?.salesforceId);
      }
      res.status(200).json({ partnerId: contact?.Student_ID__c });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStudentsByStudentId(req, res) {
    try {
      const studentId = req.params.studentId;
      const testScores = await this.studentService.getStudentsByStudentId(
        studentId
      );
      res.status(200).json(testScores);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = StudentController;
