const uuid = require("uuid");
const StudentModel = require("../models/Student");
const StaffService = require("../service/staff.service");
const EducationService = require("../service/education.service");
const DocumentService = require("../service/document.service");
const WorkHistoryService = require("../service/workHistory.service");
const TestScoreService = require("../service/testScore.service");
const StudentPaymentService = require("../service/studentPayment.service");
const SalesforceService = require("../salesforce/salesforce.service");
const TaskService = require("../service/task.service");
const CommentService = require("../service/comment.service");
const ApplicationService = require("../service/application.service");
const ProgramService = require("../service/program.service");
const SchoolService = require("../service/school.service");
const {
  StudentNotFoundException,
  DocumentDoesNotBelongsToStudentException,
  EducationDoesNotBelongsToStudentException,
  PaymentDoesNotBelongsToStudentException,
  TaskDoesNotBelongsToStudentException,
  TestScoreDoesNotBelongsToStudentException,
  WorkHistoryDoesNotBelongsToStudentException,
} = require("../common/exceptions");


const PreferredCountries = {
  Australia: "Australia",
  Austria: "Austria",
  Belgium: "Belgium",
  Canada: "Canada",
  Cyprus: "Cyprus",
  Czech_Republic: "Czech Republic",
  Estonia: "Estonia",
  France: "France",
  Germany: "Germany",
  Hungary: "Hungary",
  Ireland: "Ireland",
  Latvia: "Latvia",
  Lithuania: "Lithuania",
  Malaysia: "Malaysia",
  Netherlands: "Netherlands",
  New_Zealand: "New Zealand",
  Poland: "Poland",
  Portugal: "Portugal",
  Singapore: "Singapore",
  Spain: "Spain",
  Sweden: "Sweden",
  Switzerland: "Switzerland",
  United_Arab_Emirates: "United Arab Emirates",
  United_Kingdom: "United Kingdom",
  United_States: "United States",
};

class StudentService {
  constructor() {
    this.staffService = new StaffService();
    this.educationService = new EducationService();
    this.documentService = new DocumentService();
    this.workHistoryService = new WorkHistoryService();
    this.testScoreService = new TestScoreService();
    this.studentPaymentService = new StudentPaymentService();
    this.salesforceService = new SalesforceService();
    this.taskService = new TaskService();
    this.commentService = new CommentService();
    this.applicationService = new ApplicationService();
    this.programService = new ProgramService();
    this.schoolService = new SchoolService();
  }

  async createStudent(modifiedBy, agentId, studentInformation) {
    await this.checkForValidUsers(
      studentInformation.studentInformation.staffId,
      studentInformation.studentInformation.counsellorId
    );
    const externalId = uuid.v4();

    const student = await StudentModel.create({
      ...studentInformation,
      modifiedBy,
      agentId,
      externalId,
      createdBy: modifiedBy,
    });

    // this.salesforceService.sendToSF(MappingFiles.STUDENT_student, {
    //   ...studentInformation,
    //   externalId: externalId,
    //   _user: { agentId, id: modifiedBy },
    // });

    return { id: student.id };
  }

  async getStudent(studentId) {
    return await this.findById(studentId);
  }

  async updateStudentGeneralInformation(studentId, modifiedBy, studentDetails) {
    if (studentDetails.studentInformation) {
      await this.checkForValidUsers(
        studentDetails.studentInformation.staffId,
        studentDetails.studentInformation.counsellorId
      );
    }

    const student = await this.findById(studentId);

    student.set({
      ...studentDetails,
      modifiedBy,
    });

    await student.save();

    return { id: student.id };
  }

  async deleteStudent(studentId) {
    const student = await this.findById(studentId);
    await student.remove();
  }

  async addEducationToStudent(studentId, educationData) {
    const student = await this.findById(studentId);
    const education = await this.educationService.createEducation(
      student,
      educationData
    );

    return { id: education.id };
  }

  async updateEducationOfStudent(studentId, educationId, educationData) {
    const student = await this.findById(studentId);
    const education = await this.educationService.findById(educationId);

    if (education.studentId.toString() !== student._id.toString()) {
      throw new EducationDoesNotBelongsToStudentException();
    }

    education.set(educationData);
    await education.save();

    return { id: education.id };
  }

  async deleteEducationOfStudent(studentId, educationId) {
    const student = await this.findById(studentId);
    const education = await this.educationService.findById(educationId);

    if (education.studentId.toString() !== student._id.toString()) {
      throw new EducationDoesNotBelongsToStudentException();
    }

    await education.remove();
  }

  async addWorkHistoryToStudent(studentId, workHistoryData) {
    const student = await this.findById(studentId);
    const workHistory = await this.workHistoryService.createWorkHistory(
      student,
      workHistoryData
    );

    return { id: workHistory.id };
  }

  async updateWorkHistoryOfStudent(studentId, workHistoryId, workHistoryData) {
    const student = await this.findById(studentId);
    const workHistory = await this.workHistoryService.findById(workHistoryId);

    if (workHistory.studentId.toString() !== student._id.toString()) {
      throw new WorkHistoryDoesNotBelongsToStudentException();
    }

    workHistory.set(workHistoryData);
    await workHistory.save();

    return { id: workHistory.id };
  }

  async deleteWorkHistoryOfStudent(studentId, workHistoryId) {
    const student = await this.findById(studentId);
    const workHistory = await this.workHistoryService.findById(workHistoryId);

    if (workHistory.studentId.toString() !== student._id.toString()) {
      throw new WorkHistoryDoesNotBelongsToStudentException();
    }

    await workHistory.remove();
  }

  async addTestScoreToStudent(studentId, testScoreData) {
    const student = await this.findById(studentId);
    const testScore = await this.testScoreService.createTestScore(
      student,
      testScoreData
    );

    return { id: testScore.id };
  }

  async updateTestScoreOfStudent(studentId, testScoreId, testScoreData) {
    const student = await this.findById(studentId);
    const testScore = await this.testScoreService.findById(testScoreId);

    if (testScore.studentId.toString() !== student._id.toString()) {
      throw new TestScoreDoesNotBelongsToStudentException();
    }

    testScore.set(testScoreData);
    await testScore.save();

    return { id: testScore.id };
  }

  async deleteTestScoreOfStudent(studentId, testScoreId) {
    const student = await this.findById(studentId);
    const testScore = await this.testScoreService.findById(testScoreId);

    if (testScore.studentId.toString() !== student._id.toString()) {
      throw new TestScoreDoesNotBelongsToStudentException();
    }

    await testScore.remove();
  }

  async addDocumentToStudent(studentId, documentData) {
    const student = await this.findById(studentId);
    const document = await this.documentService.createDocument(
      student,
      documentData
    );

    return { id: document.id };
  }

  async updateDocumentOfStudent(studentId, documentId, documentData) {
    const student = await this.findById(studentId);
    const document = await this.documentService.findById(documentId);

    if (document.studentId.toString() !== student._id.toString()) {
      throw new DocumentDoesNotBelongsToStudentException();
    }

    document.set(documentData);
    await document.save();

    return { id: document.id };
  }

  async deleteDocumentOfStudent(studentId, documentId) {
    const student = await this.findById(studentId);
    const document = await this.documentService.findById(documentId);

    if (document.studentId.toString() !== student._id.toString()) {
      throw new DocumentDoesNotBelongsToStudentException();
    }

    await document.remove();
  }

  async getStudentPayments(studentId) {
    const student = await this.findById(studentId);
    return this.studentPaymentService.getStudentPayments(student);
  }

  async addPaymentToStudent(studentId, paymentData) {
    const student = await this.findById(studentId);
    const payment = await this.studentPaymentService.createPayment(
      student,
      paymentData
    );

    return { id: payment.id };
  }

  async updatePaymentOfStudent(studentId, paymentId, paymentData) {
    const student = await this.findById(studentId);
    const payment = await this.studentPaymentService.findById(paymentId);

    if (payment.studentId.toString() !== student._id.toString()) {
      throw new PaymentDoesNotBelongsToStudentException();
    }

    payment.set(paymentData);
    await payment.save();

    return { id: payment.id };
  }

  async deletePaymentOfStudent(studentId, paymentId) {
    const student = await this.findById(studentId);
    const payment = await this.studentPaymentService.findById(paymentId);

    if (payment.studentId.toString() !== student._id.toString()) {
      throw new PaymentDoesNotBelongsToStudentException();
    }

    await payment.remove();
  }

  async getStudentTasks(studentId) {
    const student = await this.findById(studentId);
    return this.taskService.getTasksByStudent(student);
  }

  async addTaskToStudent(studentId, taskData) {
    const student = await this.findById(studentId);
    const task = await this.taskService.createTask(student, taskData);

    return { id: task.id };
  }

  async updateTaskOfStudent(studentId, taskId, taskData) {
    const student = await this.findById(studentId);
    const task = await this.taskService.findById(taskId);

    if (task.studentId.toString() !== student._id.toString()) {
      throw new TaskDoesNotBelongsToStudentException();
    }

    task.set(taskData);
    await task.save();

    return { id: task.id };
  }

  async deleteTaskOfStudent(studentId, taskId) {
    const student = await this.findById(studentId);
    const task = await this.taskService.findById(taskId);

    if (task.studentId.toString() !== student._id.toString()) {
      throw new TaskDoesNotBelongsToStudentException();
    }

    await task.remove();
  }

  async addCommentToStudent(studentId, commentData) {
    const student = await this.findById(studentId);
    const comment = await this.commentService.createComment(
      student,
      commentData
    );

    return { id: comment.id };
  }

  async updateCommentOfStudent(studentId, commentId, commentData) {
    const student = await this.findById(studentId);
    const comment = await this.commentService.findById(commentId);

    if (comment.studentId.toString() !== student._id.toString()) {
      throw new CommentDoesNotBelongsToStudentException();
    }

    comment.set(commentData);
    await comment.save();

    return { id: comment.id };
  }

  async deleteCommentOfStudent(studentId, commentId) {
    const student = await this.findById(studentId);
    const comment = await this.commentService.findById(commentId);

    if (comment.studentId.toString() !== student._id.toString()) {
      throw new CommentDoesNotBelongsToStudentException();
    }

    await comment.remove();
  }

  async getStudentApplications(studentId) {
    const student = await this.findById(studentId);
    return this.applicationService.getApplicationsByStudent(student);
  }

  async addApplicationToStudent(studentId, applicationData) {
    const student = await this.findById(studentId);
    const application = await this.applicationService.createApplication(
      student,
      applicationData
    );

    return { id: application.id };
  }

  async updateApplicationOfStudent(studentId, applicationId, applicationData) {
    const student = await this.findById(studentId);
    const application = await this.applicationService.findById(applicationId);

    if (application.studentId.toString() !== student._id.toString()) {
      throw new ApplicationDoesNotBelongsToStudentException();
    }

    application.set(applicationData);
    await application.save();

    return { id: application.id };
  }

  async deleteApplicationOfStudent(studentId, applicationId) {
    const student = await this.findById(studentId);
    const application = await this.applicationService.findById(applicationId);

    if (application.studentId.toString() !== student._id.toString()) {
      throw new ApplicationDoesNotBelongsToStudentException();
    }

    await application.remove();
  }

  async getStudentPrograms(studentId) {
    const student = await this.findById(studentId);
    return this.programService.getProgramsByStudent(student);
  }

  async addProgramToStudent(studentId, programData) {
    const student = await this.findById(studentId);
    const program = await this.programService.createProgram(student, programData);

    return { id: program.id };
  }

  async updateProgramOfStudent(studentId, programId, programData) {
    const student = await this.findById(studentId);
    const program = await this.programService.findById(programId);

    if (program.studentId.toString() !== student._id.toString()) {
      throw new ProgramDoesNotBelongsToStudentException();
    }

    program.set(programData);
    await program.save();

    return { id: program.id };
  }

  async deleteProgramOfStudent(studentId, programId) {
    const student = await this.findById(studentId);
    const program = await this.programService.findById(programId);

    if (program.studentId.toString() !== student._id.toString()) {
      throw new ProgramDoesNotBelongsToStudentException();
    }

    await program.remove();
  }

  async getStudentSchools(studentId) {
    const student = await this.findById(studentId);
    return this.schoolService.getSchoolsByStudent(student);
  }

  async addSchoolToStudent(studentId, schoolData) {
    const student = await this.findById(studentId);
    const school = await this.schoolService.createSchool(student, schoolData);

    return { id: school.id };
  }

  async updateSchoolOfStudent(studentId, schoolId, schoolData) {
    const student = await this.findById(studentId);
    const school = await this.schoolService.findById(schoolId);

    if (school.studentId.toString() !== student._id.toString()) {
      throw new SchoolDoesNotBelongsToStudentException();
    }

    school.set(schoolData);
    await school.save();

    return { id: school.id };
  }

  async deleteSchoolOfStudent(studentId, schoolId) {
    const student = await this.findById(studentId);
    const school = await this.schoolService.findById(schoolId);

    if (school.studentId.toString() !== student._id.toString()) {
      throw new SchoolDoesNotBelongsToStudentException();
    }

    await school.remove();
  }

  async checkForValidUsers(staffId, counsellorId) {
    const [staff, counsellor] = await Promise.all([
      this.staffService.findById(staffId),
      this.staffService.findById(counsellorId),
    ]);

    if (!staff || !counsellor) {
      throw new StudentNotFoundException();
    }
  }

  async findById(studentId) {
    const student = await StudentModel.findById(studentId);

    if (!student) {
      throw new StudentNotFoundException();
    }

    return student;
  }
}

module.exports = StudentService;
