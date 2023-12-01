const { MongoClient } = require("mongodb");
const Student = require("../models/Student");
const Agent = require("../models/Agent");
const School = require("../models/School");
const Intake = require("../models/Intake");
const Program = require("../models/Program");
const Application = require("../models/Application");
const TestScore = require("../models/TestScore");
const Config = require("../models/Config");
const Education = require("../models/Education");
const Comment = require("../models/Comment");
const Document = require("../models/Document");
const DocumentType = require("../models/DocumentType");

class SalesforceSyncService {
  constructor() {
    //  this.mongoUri = "mongodb+srv://dbuser:Password123@atlascluster.ziipicy.mongodb.net/uniexpertsdb?retryWrites=true&w=majority";
    // this.mongoClient = new MongoClient(this.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    // this.connectToDatabase();
  }

//   async connectToDatabase() {
//     try {
//       await this.mongoClient.connect();
//       console.log("Connected to the database");
//       this.db = this.mongoClient.db(this.mongoUri);
//       this.studentCollection = this.db.collection("students");
//       // Add more collections as needed
//     } catch (error) {
//       console.error("Error connecting to the database:", error);
//     }
//   }

  async updateAccount(id, agentId, body) {
    // Implement the logic for updating the account
    return Agent.updateOne({ externalId: await this.getAgentId(body.ExternalId__c), verificationStatus: body.Onboarding_Status__c });
  }

  async createStudent(id, agentId, body) {
    // Implement the logic for creating a student
    if (typeof body.Doc_Verification_Officer_Id__c != 'undefined') {
        body.Doc_Verification_Officer_Id__c = await this.getStaffId(body.Doc_Verification_Officer_Id__c);
      }
      if (typeof body.Partner_Account_Id__c != 'undefined') {
        body.Partner_Account_Id__c = await this.getStaffId(body.Partner_Account_Id__c);
      }
      if (typeof body.BDM_User_Id__c != 'undefined') {
        body.BDM_User_Id__c = await this.getStaffId(body.BDM_User_Id__c);
      }
      return Student.create(mapStudent(id, agentId, body));
  }

  // Implement the rest of the methods similarly

  updateStudent(id, agentId, body) {
    return Student.updateOne({ externalId: body.ExternalId__c }, { $set: mapStudent(id, agentId, body) });
  }

  deleteStudent(body) {
    return Student.deleteOne({ externalId: body.ExternalId__c });
  }

  async getStudentId(externalId) {
    const student = await Student.findOne({ externalId });
    if (!student) throw Error("Student not found");
    return student.id;
  }

async getSchoolId(externalId){
    const school = await School.findOne({ externalId });
    if (!school) throw new Error("School not found");
    return school.id;
  }

async getIntakeId(externalId){
    const intake = await Intake.findOne({ externalId });
    if (!intake) throw new Error("Intake not found");
    return intake.id;
  }

   async getProgramId(externalId) {
    const program = await Program.findOne({ externalId });
    if (!program) throw new Error("Program not found");
    return program?.id;
  }

   async getApplicationId(externalId){
    const application = await Application.findOne({ externalId });
    if (!application) throw new Error("Application not found");
    return application?.id;
  }

  async createStudentEducation(id, body) {
    const studentId = await this.getStudentId(body.Student_Id__c);
    const education = await Education.create({ ...mapEducation(body, studentId, id), createdBy: id });

    return Student.updateOne(
      { _id: studentId },
      { $push: { educations: education.id }, $set: { modifiedBy: id } }
    );
  }

  async updateStudentEducation(id, body) {
    const studentId = await this.getStudentId(body.Student_Id__c);

    return Education.updateOne(
      { externalId: body.ExternalId__c },
      { $set: mapEducation(body, studentId, id) }
    );
  }

  async deleteStudentEducation(id, body) {
    const education = await Education.findOne({ externalId: body.ExternalId__c });
    if (!education) throw new Error("Not found");

    await Education.deleteOne({ externalId: body.ExternalId__c });
    return Student.updateOne(
      { _id: education.studentId },
      { $pull: { educations: education.id }, $set: { modifiedBy: id } }
    );
  }

  async createStudentWorkHistory(id, body) {
    const studentId = await this.getStudentId(body.Student_Id__c);

    const workHistory = await WorkHistory.create({
      ...mapWorkHistory(body, studentId, id),
      createdBy: id,
    });

    return Student.updateOne(
      { _id: studentId },
      { $push: { workHistory: workHistory.id }, $set: { modifiedBy: id } }
    );
  }

  async updateStudentWorkHistory(id, body) {
    const studentId = await this.getStudentId(body.Student_Id__c);

    return WorkHistory.updateOne(
      { externalId: body.ExternalId__c },
      { $set: mapWorkHistory(body, studentId, id) }
    );
  }

  async deleteStudentWorkHistory(id, body) {
    const workHistory = await WorkHistory.findOne({ externalId: body.ExternalId__c });
    if (!workHistory) throw new Error("not found");

    await WorkHistory.deleteOne({ externalId: body.ExternalId__c });
    return Student.updateOne(
      { _id: workHistory.studentId },
      { $pull: { workHistory: workHistory.id }, $set: { modifiedBy: id } }
    );
  }

   async getExamType(examTypeString) {
    const examTypes = (await Config.findOne({ type: ConfigType.TEST_SCORE_EXAM_TYPE })).value;
    let examType = null;
    examTypes.forEach((e) => {
      if (e.value === examTypeString) {
        examType = e;
      }
    });
    return examType;
  }

  async createStudentTestScore(id, body) {
    const studentId = await this.getStudentId(body.Student_Id__c);
    const examType = await this.getExamType(body.English_Exam_Type__c);

    const testScore = await TestScore.create({
      ...mapTestScore(body, examType, studentId, id),
      createdBy: id,
    });

    return Student.updateOne(
      { _id: studentId },
      { $push: { testScore: testScore.id }, $set: { modifiedBy: id } }
    );
  }

  async updateStudentTestScore(id, body) {
    const studentId = await this.getStudentId(body.Student_Id__c);
    const examType = await this.getExamType(body.English_Exam_Type__c);

    return TestScore.updateOne(
      { externalId: body.ExternalId__c },
      { $set: mapTestScore(body, examType, studentId, id) }
    );
  }

  async deleteStudentTestScore(id, body) {
    const testScore = await TestScore.findOne({ externalId: body.ExternalId__c });
    if (!testScore) throw new Error("not found");

    await TestScore.deleteOne({ externalId: body.ExternalId__c });
    return Student.updateOne(
      { _id: testScore.studentId },
      { $pull: { testScore: testScore.id }, $set: { modifiedBy: id } }
    );
  }

async getDocumentTypeId(externalId) {
    if (!externalId) return null;
    const documentType = await DocumentType.findOne({ externalId });
    if (!documentType) throw new Error("not found");
    return documentType.id;
  }

  async createStudentDocument(id, agentId, body) {
    const studentId = await this.getStudentId(body.Student_Id__c);
    let documentTypeId = '';
    if (typeof body.LatestDocumentId__c != "undefined") {
      documentTypeId = await this.getDocumentTypeId(body.LatestDocumentId__c);
    }

    const document = await Document.create({
      ...mapDocument(body, documentTypeId, studentId, id),
      agentId,
      createdBy: id,
    });

    return Student.updateOne(
      { _id: studentId },
      { $push: { documents: document.id }, $set: { modifiedBy: id } }
    );
  }

  async updateStudentDocument(id, body) {
    const studentId = await this.getStudentId(body.Student_Id__c);
    const documentTypeId = await this.getDocumentTypeId(body.LatestDocumentId__c);

    return Document.updateOne(
      { externalId: body.ExternalId__c },
      { $set: mapDocument(body, documentTypeId, studentId, id) }
    );
  }

  async deleteStudentDocument(id, body) {
    const document = await Document.findOne({ externalId: body.ExternalId__c });
    if (!document) throw new Error("not found");

    await Document.deleteOne({ externalId: body.ExternalId__c });
    return Student.updateOne(
      { _id: document.userId },
      { $pull: { documents: document.id }, $set: { modifiedBy: id } }
    );
  }

  async createStudentPayment(id, body) {
    const studentId = await this.getStudentId(body.Student_Id__c);
    body.School_Id__c = await this.getSchoolId(body.School_Id__c);
    body.Application_Id__c = await this.getApplicationId(body.Application_Id__c);
    body.Programme_Id__c = await this.getProgramId(body.Programme_Id__c);

    // const payment = await this.paymentModel.create({
    //   ...mapPayment(body, studentId, id),
    //   createdBy: id,
    // });

    return Student.updateOne(
      { _id: studentId },
      { $push: { payment: payment?.id }, $set: { modifiedBy: id } }
    );
  }

  async updateStudentPayment(id, body) {
    const studentId = await this.getStudentId(body.Student_Id__c);
    body.School_Id__c = await this.getSchoolId(body.School_Id__c);
    body.Application_Id__c = await this.getApplicationId(body.Application_Id__c);
    body.Programme_Id__c = await this.getProgramId(body.Programme_Id__c);

    //return this.paymentModel.updateOne({ externalId: body.ExternalId__c }, { $set: mapPayment(body, studentId, id) });
  }

  async deleteStudentPayment(id, body) {
    const payment = await this.paymentModel.findOne({ externalId: body.ExternalId__c });
    if (!payment) throw new Error("not found");

    //await this.paymentModel.deleteOne({ externalId: body.ExternalId__c });
    return Student.updateOne(
      { _id: payment?.studentId },
      { $pull: { payment: payment.id }, $set: { modifiedBy: id } }
    );
  }

   async getDocumentId(externalId) {
    if (!externalId) return null;
    const documentType = await Document.findOne({ externalId });
    if (!documentType) throw new Error("not found");
    return documentType.id;
  }

  async createStudentTask(id, body) {
    const studentId = await this.getStudentId(body.Student_Id__c);
    const documentTypeId = await this.getDocumentTypeId(body.DocumentMaster_Id__c);
    const documentId = await this.getDocumentId(body.Document_Id__c);
    if (typeof body.Application_Id__c != 'undefined') {
      body.Application_Id__c = await this.getApplicationId(body.Application_Id__c);
    }

    const task = await Task.create({
      ...mapTask(body, studentId, id, documentId, documentTypeId),
      createdBy: id,
    });

    return Student.updateOne({ _id: studentId }, { $push: { tasks: task.id }, $set: { modifiedBy: id } });
  }

  async updateStudentTask(id, body) {
    const studentId = await this.getStudentId(body.Student_Id__c);
    const documentTypeId = await this.getDocumentTypeId(body.DocumentMaster_Id__c);
    const documentId = await this.getDocumentId(body.Document_Id__c);
    if (typeof body.Application_Id__c != 'undefined') {
      body.Application_Id__c = await this.getApplicationId(body.Application_Id__c);
    }

    return Task.updateOne(
      { externalId: body.ExternalId__c },
      { $set: mapTask(body, studentId, id, documentId, documentTypeId) }
    );
  }

  async deleteStudentTask(id, body) {
    const task = await Task.findOne({ externalId: body.ExternalId__c });
    if (!task) throw new Error("not found");

    await Task.deleteOne({ externalId: body.ExternalId__c });
    return Student.updateOne(
      { _id: task.studentId },
      { $pull: { tasks: task.id }, $set: { modifiedBy: id } }
    );
  }

   async getStaffId(externalId) {
    const staff = await this.staffModel.findOne({ externalId });
    if (!staff) throw Error("Agent not found");
    return staff.id;
  }

async getAgentId(externalId) {
    const staff = await Agent.findOne({ externalId });
    if (!staff) throw Error("Staff not found");
    return staff.id;
  }

  async createStudentComment(id, body) {
    const studentId = await this.getStudentId(body.Student_Id__c);
    const staffId = await this.getStaffId(body.Account_Id__c);

    const comment = await Comment.create({ ...mapComment(body, staffId, studentId) });

    return Student.updateOne(
      { _id: studentId },
      { $push: { comments: comment.id }, $set: { modifiedBy: id } }
    );
  }

  getApplication(count) {
    return Application.find({}).sort({ _id: -1 }).limit(count);
  }

  getStudent(count) {
    return Student.find({}).sort({ _id: -1 }).limit(count);
  }

  getStudentEducation(count) {
    return Education.find({}).sort({ _id: -1 }).limit(count);
  }

  getStudentWorkHistory(count) {
    return WorkHistory.find({}).sort({ _id: -1 }).limit(count);
  }

  getStudentTestScore(count) {
    return TestScore.find({}).sort({ _id: -1 }).limit(count);
  }

  getStudentDocument(count) {
    return Document.find({}).sort({ _id: -1 }).limit(count);
  }

  getStudentPayment(count) {
    return this.paymentModel.find({}).sort({ _id: -1 }).limit(count);
  }

  getStudentTask(count) {
    return Task.find({}).sort({ _id: -1 }).limit(count);
  }

  getStudentComment(count) {
    return Comment.find({}).sort({ _id: -1 }).limit(count);
  }

  async createApplication(id, agentId, body) {
    let data = {
      agentId: agentId,
      createdBy: id,
      modifiedBy: id
      // stages: ,
      // tasks: ,
      // comments: ,
      // documents: ,
      // payments: ,
    };
    if (typeof body.Name != "undefined") {
      data.applicationId = body.Name;
    }
    if (typeof body.Student_Id__c != "undefined") {
      data.studentId = await this.getStudentId(body.Student_Id__c);
    }
    if (typeof body.School_Id__c != "undefined") {
      data.schoolId = await this.getSchoolId(body.School_Id__c);
    }
    if (typeof body.Programme_Id__c != "undefined") {
      data.programId = await this.getProgramId(body.Programme_Id__c);
    }
    if (typeof body.Processing_Officer_Id__c != "undefined") {
      data.processingOfficerId = await this.getStaffId(body.Processing_Officer_Id__c);
    }
    if (typeof body.Intake_Id__c != "undefined") {
      data.intakeId = await this.getIntakeId(body.Intake_Id__c);
    }
    if (typeof body.Status__c != "undefined") {
      data.status = body.Status__c;
    }
    if (typeof body.Current_Stage__c != "undefined") {
      data.stage = body.Current_Stage__c;
    }
    // if (typeof body.Application_Submitted_By__c != "undefined") {
    //   // Verify This
    //   data.counsellorId = await this.getStaffId(body.Application_Submitted_By__c);
    // }
    if (typeof body.ExternalId__c != "undefined") {
      data.externalId = body.ExternalId__c;
    }
    return Application.create(data);
  }

  async updateApplication(id, body) {
    let data = {
      modifiedBy: id
      // stages: ,
      // tasks: ,
      // comments: ,
      // documents: ,
      // payments: , 
    };
    if (typeof body.Name != "undefined") {
      data.applicationId = body.Name;
    }
    if (typeof body.Student_Id__c != "undefined") {
      data.studentId = await this.getStudentId(body.Student_Id__c);
    }
    if (typeof body.School_Id__c != "undefined") {
      data.schoolId = await this.getSchoolId(body.School_Id__c);
    }
    if (typeof body.Programme_Id__c != "undefined") {
      data.programId = await this.getProgramId(body.Programme_Id__c);
    }
    if (typeof body.Processing_Officer_Id__c != "undefined") {
      data.processingOfficerId = await this.getStaffId(body.Processing_Officer_Id__c);
    }
    if (typeof body.Intake_Id__c != "undefined") {
      data.intakeId = await this.getIntakeId(body.Intake_Id__c);
    }
    if (typeof body.Status__c != "undefined") {
      data.status = body.Status__c;
    }
    if (typeof body.Current_Stage__c != "undefined") {
      data.stage = body.Current_Stage__c;
    }
    // if (typeof body.Application_Submitted_By__c != "undefined") {
    //   // Verify This
    //   data.counsellorId = await this.getStaffId(body.Application_Submitted_By__c);
    // }
    return Application.updateOne({ externalId: body.ExternalId__c }, { $set: data });
  }

  async createApplicationComment(id, body) {
    const applicationId = await this.getApplicationId(body.Application_Id__c);

    const comment = await Comment.create({
      message: body.Message_Body__c,
      relationId: applicationId,
      externalId: body.ExternalId__c
    });

    if (typeof body.Student_Id__c != "undefined") {
      const studentId = await this.getStudentId(body.Student_Id__c);
      comment.userId = studentId;
    }

    return Application.updateOne(
      { _id: applicationId },
      { $push: { comments: comment.id }, $set: { modifiedBy: id } }
    );
  }

  async createApplicationDocument(id, body) {
    const studentId = await this.getStudentId(body.Student_Id__c);
    const documentTypeId = await this.getDocumentTypeId(body.LatestDocumentId__c);
    const applicationId = await this.getApplicationId(body.Application_Id__c);

    const doc = await Document.create({
      documentTypeId: documentTypeId,
      url: body.SharepointPath__c,
      status: body.Status__c,
      userId: studentId,
      modifiedBy: id,
      externalId: body.ExternalId__c,
      createdBy: id
    });

    return Application.updateOne(
      { _id: applicationId },
      { $push: { documents: doc.id }, $set: { modifiedBy: id } }
    );
  }

  async updateApplicationDocument(id, body) {
    // const applicationId = await this.getApplicationId(body.Application_Id__c);

    let data = {
      modifiedBy: id
    }
    if (typeof body.LatestDocumentId__c != "undefined") {
      const documentTypeId = await this.getDocumentTypeId(body.LatestDocumentId__c);
      data.documentTypeId = documentTypeId;
    }
    if (typeof body.SharepointPath__c != "undefined") {
      data.url = body.SharepointPath__c;
    }
    if (typeof body.Status__c != "undefined") {
      data.status = body.Status__c;
    }
    if (typeof body.Student_Id__c != "undefined") {
      const studentId = await this.getStudentId(body.Student_Id__c);
      data.userId = studentId;
    }
    if (typeof body.ExternalId__c != "undefined") {
      return Document.updateOne(
        { externalId: body.ExternalId__c },
        { $set: data }
      );
    }

  }

  async createApplicationPayment(id, body) {
    const studentId = await this.getStudentId(body.Student_Id__c);
    const applicationId = await this.getApplicationId(body.Application_Id__c);

    // const payment = await this.paymentModel.create({
    //   paymentName: body.Name,
    //   studentId: studentId,
    //   schoolId: await this.getSchoolId(body.School_Id__c),
    //   applicationId: applicationId,
    //   programmeId: await this.getProgramId(body.Programme_Id__c),
    //   amount: body.Amount__c,
    //   currency: body.CurrencyIsoCode,
    //   date: body.Payment_Date__c,
    //   status: body.Status__c,
    //   modifiedBy: id,
    //   externalId: body.ExternalId__c,
    //   createdBy: id,
    // });

    return Application.updateOne(
      { _id: applicationId },
      { $push: { payments: payment?.id }, $set: { modifiedBy: id } }
    );
  }

  async updateApplicationPayment(id, body) {

    let data = {
      modifiedBy: id
    };

    if (typeof body.Student_Id__c != "undefined") {
      const studentId = await this.getStudentId(body.Student_Id__c);
      data.studentId = studentId;
    }
    if (typeof body.School_Id__c != "undefined") {
      data.schoolId = await this.getSchoolId(body.School_Id__c);
    }
    if (typeof body.Programme_Id__c != "undefined") {
      data.programmeId = await this.getProgramId(body.Programme_Id__c);
    }

    if (typeof body.Name != "undefined") {
      data.paymentName = body.Name;
    }
    if (typeof body.Amount__c != "undefined") {
      data.amount = body.Amount__c;
    }
    if (typeof body.CurrencyIsoCode != "undefined") {
      data.currency = body.CurrencyIsoCode;
    }
    if (typeof body.Payment_Date__c != "undefined") {
      data.date = body.Payment_Date__c;
    }
    if (typeof body.Status__c != "undefined") {
      data.status = body.Status__c;
    }
    if (typeof body.ExternalId__c != "undefined") {
      return this.paymentModel.updateOne({ externalId: body.ExternalId__c }, { $set: data });
    }

  }

  async createSchool(id, body) {
    return School.create({ ...mapSchool(id, body), createdBy: id });
  }

  async updateSchool(id, body) {
    return School.updateOne({ externalId: body.ExternalId__c }, { $set: mapSchool(id, body) });
  }

  async createSchoolProgramme(id, body) {
    let schoolId = await this.getSchoolId(body.University_Id__c);
    const doc = await Program.create({ ...mapProgram(id, schoolId, body), createdBy: id });

    return School.updateOne(
      { _id: schoolId },
      { $push: { programmes: doc.id }, $set: { modifiedBy: id } }
    );
  }

  async updateSchoolProgramme(id, body) {
    let schoolId = await this.getSchoolId(body.University_Id__c);

    if (typeof body.ExternalId__c != "undefined") {
      return Program.updateOne(
        { externalId: body.ExternalId__c },
        { $set: mapProgram(id, schoolId, body) }
      );
    }

  }

  async createSchoolIntake(id, body) {
    let progId = await this.getProgramId(body.Programme_Id__c);
    let schoolId = await this.getSchoolId(body.School_Id__c);
    return Intake.create({ ...mapIntake(id, progId, schoolId, body), createdBy: id });

    // return Program.updateOne(
    //   { _id: schoolId },
    //   { $push: { inta: doc.id }, $set: { modifiedBy: id } }
    // );
  }

  async updateSchoolIntake(id, body) {
    let progId = await this.getProgramId(body.Programme_Id__c);
    let schoolId = await this.getSchoolId(body.School_Id__c);

    if (typeof body.ExternalId__c != "undefined") {
      return Intake.updateOne(
        { externalId: body.ExternalId__c },
        { $set: mapIntake(id, progId, schoolId, body) }
      );
    }

  }

  async updateMasterDocument(id, body) {
    let data = {};
    if (body.ExternalId__c) {
      if (body.Country__c) {
        let country = body.Country__c.split(';');
        data.country = country;
      }
      if (body.Name) {
        data.name = body.Name;
      }
      if (body.Contact_Record_Type__c) {
        data.contactRecordType = body.Contact_Record_Type__c;
      }
      if (body.Document_Category__c) {
        data.category = body.Document_Category__c;
      }
      if (body.Active__c) {
        data.isActive = body.Active__c;
      }
      if (body.Description__c) {
        data.description = body.Description__c;
      }
      if (body.Mandatory__c) {
        data.isMandatory = body.Mandatory__c;
      }
      if (body.Sequence__c) {
        data.sequence = body.Sequence__c;
      }
      if (body.ObjectType__c) {
        data.objectType = body.ObjectType__c;
      }
    }

    return DocumentType.updateOne(
      { externalId: body.ExternalId__c },
      { $set: data }
    );
  }

  async createMasterDocument(id, body) {
    let country = body.Country__c.split(';');

    return DocumentType.create({
      name: body.Name,
      contactRecordType: body.Contact_Record_Type__c,
      category: body.Document_Category__c,
      isActive: body.Active__c,
      description: body.Description__c,
      isMandatory: body.Mandatory__c,
      country: country,
      sequence: body.Sequence__c,
      objectType: body.ObjectType__c,
      externalId: body.ExternalId__c
    });
  }
}

const salesforceSyncService = new SalesforceSyncService();

module.exports = SalesforceSyncService;