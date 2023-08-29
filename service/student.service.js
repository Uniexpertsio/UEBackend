const uuid = require("uuid");
const StudentModel = require("../models/Student");
const StaffService = require("./staff.service");
const EducationService = require("../service/education.service");
const DocumentService = require("../service/document.service");
const WorkHistoryService = require("../service/workHistory.service");
const TestScoreService = require("../service/testScore.service");
const StudentPaymentService = require("../service/studentPayment.service");
const {sendToSF} = require("./salesforce.service");
const TaskService = require("../service/task.service");
const CommentService = require("../service/comment.service");
const ApplicationService = require("../service/application.service");
const ProgramService = require("../service/program.service");
const SchoolService = require("../service/school.service");
const { MappingFiles } = require('./../constants/Agent.constants');


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
    const externalId = uuid();

    const student = await StudentModel.create({
      ...studentInformation,
      modifiedBy,
      agentId,
      externalId,
      createdBy: modifiedBy,
    });

    // {
    //   "attributes": {
    //     "type": "Contact",
    //     "url": "/services/data/v55.0/sobjects/Contact/003N000001vT1EDIA0"
    //   },
    //   "RecordTypeId":"0125g00000020HRAAY",
    //   "FirstName": "efvknfvjknr",
    //   "LastName": "rtjgtr",
    //   "Lock_Record__c":"true,"
    //   "Source__c": "Partner",
    //   "Passport_Number__c": "8787678765",
    //   "MobilePhone": "+917876567876",
    //   "Whatsapp_No__c": "+917876567876",
    //   "Preferred_Country__c": "Austria;Cyprus",
    //   "Email": "ank@gmail.com",
    //   "Medical_History_Detail__c": "sjkchsduiwv",
    //   "Medical_History__c": "No",
    //   "Account_Name_Id__c":"401959e7-f3ef-ebfd-4eec-f3590128fd30",
    //   "Application_Submitted_By_Id__c":"401959e7-f3ef-ebfd-4eec-f3590128fd30",
    //   "BDM_User_Id__c":"401959e7-f3ef-ebfd-4eec-f3590128fd30",
    //   "MC_Subscriber_Id__c":"401959e7-f3ef-ebfd-4eec-f3590128fd30",
    //   "Partner_Account_Id__c":"401959e7-f3ef-ebfd-4eec-f3590128fd30",
    //   "Processing_Officer_Id__c:"401959e7-f3ef-ebfd-4eec-f3590128fd30",
    //   "Partner_User_Id__c":"401959e7-f3ef-ebfd-4eec-f3590128fd30",
    //   "Reports_To_Id__c":"401959e7-f3ef-ebfd-4eec-f3590128fd30",
    //   "School_Id__c":"401959e7-f3ef-ebfd-4eec-f3590128fd30",
    //   "Martial_Status__c": "Married",
    //   "Gender__c": "Male",
    //   "Birthdate": "2022-07-11",
    //   "First_Language__c": "iohdwef",
    //   "Country_of_Citizenship__c": "Albania",
    //   "EmergencyContactName__c": "dcvderfverw",
    //   "Relationship__c": "Mother",
    //   "EmergencyContactEmail__c": "ank@gmail.com",
    //   "Phone": "8987678987",
    //   "Country__c": "Aland Islands",
    //   "Have_you_been_refused_a_visa__c": "No",
    //   "Do_you_have_a_valid_Study_Permit_Visa__c": "No",
    //   "Study_Permit_Visa_Details__c": "wefwer",
    //   "Id": "003N000001vT1EDIA0",
    //   "ExternalId__c" :"401959e7-f3ef-ebfd-4eec-f3590128fd30"
    // }		
   
    const url = "Contact/003N000001vT1EDIA0"
    const sf = await sendToSF(MappingFiles.STUDENT_student, {
      ...studentInformation,
      externalId: externalId,
      _user: { agentId, id: modifiedBy },
      url
    });
    console.log("sf: ", sf);
    return { id: student.id };
  }

  async getStudent(studentId) {
    return await this.findById(studentId);
  }

  async getStudentGeneralInformation(studentId) {
    const student = await StudentModel.findOne({ _id: studentId });
    if (!student) throw new Error("Student not found");
    return student.getGeneralInformation();
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

  getStudentEducation(studentId) {
    return this.educationService.getByStudentId(studentId);
  }

  
  async addStudentEducation(studentId, modifiedBy, body) {
    const education = await this.educationService.add(studentId, modifiedBy, body);

    const result = await StudentModel.updateOne(
      { _id: studentId },
      { $push: { educations: education.id }, $set: { modifiedBy } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Stufdent not found");
    }

    // {
    //   "attributes": {
    //     "type": "Education__c",
    //     "url": "/services/data/v55.0/sobjects/Education__c/a02N000000N8POMIA3"
    //   },
    //   "Name_of_Institution__c": "Miet",
    //   "Lock_Record__c":"true",
    //   "ShowInProfile__c":"true",
    //   "Level_of_Education__c": "Grade 1",
    //   "Degree_Awarded_On__c": "2022-10-30",
    //   "Degree_Awarded__c": "Yes",
    //   "Name": "Salesforce Platform123",
    //   "Country_of_Institution__c": "Aland Islands",
    //   "Class__c": "First Class",
    //   "Score__c": 10,
    //   "Attended_Institution_To__c": "2022-10-27",
    //   "Attended_Institution_From__c": "2022-10-12",
    //   "Affiliated_University__c": "AKTU",
    //   "Id": "a02N000000N8POMIA3",
    //   "ExternalId__c" :"401959e7-f3ef-ebfd-4eec-f3590128fd30",
    //   "Student_Id__c": "7fe359b1-81a5-4a0e-7 (16 more) ..."
    // }
  		
  //   "{
  //     "Name_of_Institution__c": "Miet",
  //     "Lock_Record__c":"true",
  //     "ShowInProfile__c":"true",
  //     "Level_of_Education__c": "Grade 1",
  //     "Degree_Awarded_On__c": "2022-10-30",
  //     "Degree_Awarded__c": "Yes",
  //     "Name": "salesforce Sample",
  //     "Country_of_Institution__c": "Aland Islands",
  //     "Class__c": "First Class",
  //     "Score__c": 10,
  //     "Attended_Institution_To__c": "2022-10-27",
  //     "Attended_Institution_From__c": "2022-10-12",
  //     "Affiliated_University__c": "AKTU",
  //      "Student__r" : 
  //     {
  //          "ExternalId__c" : "0c5f938b-7a34-0ed2-914b-9c60970bb40e"
  //     }
  //   }
      
  // EndPointUrl For Patch:-- https://uniexperts--dev.my.salesforce.com/services/data/v55.0/sobjects/Education__c/ExternalId__c/11996  
  //   Headers:
  //         Content-Type:-application/json
  //         Authorization:- Bearer 00DN0000000cDM4!ASAAQCPueQ1kguX04emRQIWIniLncCALulkTnxpFZRfmwXZYpD2UGMiCr.NyZzgt0_eK_lJd0SHibPrHZksH7eOPpncSXTX2			  
  
    const url = "Education__c/a02N000000N8POMIA3"
    const sf = await sendToSF(MappingFiles.STUDENT_education_history, { ...body, studentId: (await this.findById(studentId)).externalId, _user: { id: modifiedBy }, url });
    console.log("sf: ", sf)
    return { id: education.id };
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
      throw new Error("Education does not belong to the student");
    }

    education.set(educationData);
    let savedEducation = await education.save();

    return savedEducation;
  }

  async updateStudentEducation(studentId, modifiedBy, educationId, body) {
    await this.checkIfEducationBelongsToStudent(studentId, educationId);
    let updatedEducation = await this.educationService.update(modifiedBy, educationId, body);
    const url = "Education__c/a02N000000N8POMIA3"
    await sendToSF(MappingFiles.STUDENT_education_history, { ...a, studentId: (await this.findById(studentId)).externalId, _user: { id: modifiedBy } , url});
    return updatedEducation;
  }

  async deleteEducation(studentId, modifiedBy, educationId) {
    await this.checkIfEducationBelongsToStudent(studentId, educationId);
    await this.educationService.delete(educationId);
    return StudentModel.updateOne(
      { _id: studentId },
      { $pull: { educations: educationId }, $set: { modifiedBy } }
    );
  }

  async checkIfEducationBelongsToStudent(studentId, educationId) {
    const student = await StudentModel.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    if (student.educations.indexOf(educationId) == -1) {
      throw new Error("Student does not belong to education");
    }
  }

  async addStudentWorkHistory(studentId, modifiedBy, body) {
    await this.findById(studentId);

    const workHistory = await this.workHistoryService.add(studentId, modifiedBy, body);

    const result = await StudentModel.updateOne(
      { _id: studentId },
      { $push: { workHistory: workHistory.id }, $set: { modifiedBy } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("student not found");
    }

    // {
    //   "attributes": {
    //     "type": "Work_history__c",
    //     "url": "/services/data/v55.0/sobjects/Work_history__c/a0EN000000K7HBUMA3"
    //   },
    //   "Name": "Ankit",
    //   "Designation__c": "Developer",
    //   "Lock_Record__c":"true",
    //   "Date_of_Joining__c": "2022-10-12",
    //   "Date_of_relieving__c": "2022-10-13",
    //   "Contact_info__c": "wehf",
    //   "Email_Id__c": "ank@gmail.com",
    //   "Id": "a0EN000000K7HBUMA3",
    //   "ExternalId__c" :"401959e7-f3ef-ebfd-4eec-f3590128fd30",
    //   "Student_Id__c": "7fe359b1-81a5-4a0e-7 (16 more) ..."
    // }

  const url = "Work_history__c/a0EN000000K7HBUMA3"
  const sf = await sendToSF(MappingFiles.STUDENT_work_history, { ...workHistory, studentId: (await this.findById(studentId)).externalId, _user: { id: modifiedBy }, url });
  console.log("sf: ", sf);

    return workHistory;
  }

  async updateStudentWorkHistory(studentId, modifiedBy, workHistoryId, body) {
    await this.checkIfWorkHistoryBelongsToStudent(studentId, workHistoryId);
    const wh = await this.workHistoryService.update(modifiedBy, workHistoryId, body);
    const url = "Work_history__c/a0EN000000K7HBUMA3"
    await sendToSF(MappingFiles.STUDENT_work_history, { ...wh, studentId: (await this.findById(studentId)).externalId, _user: { id: modifiedBy }, url });
    return wh;
  }

  async deleteStudentWorkHistory(studentId, modifiedBy, workHistoryId) {
    await this.checkIfWorkHistoryBelongsToStudent(studentId, workHistoryId);
    await this.workHistoryService.delete(workHistoryId);
    return StudentModel.updateOne(
      { _id: studentId },
      { $pull: { workHistory: workHistoryId }, $set: { modifiedBy } }
    );
  }

  async checkIfWorkHistoryBelongsToStudent(studentId, workHistoryId) {
    const student = await StudentModel.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    if (student.workHistory.indexOf(workHistoryId) == -1) {
      throw new Error("Work history does not belong to student");
    }
  }

  async addStudentTestScore(studentId, modifiedBy, body) {
    const externalId = uuid();
    if (body.scoreInformation.length) {
      for (let i = 0; i < body.scoreInformation.length; i++) {
        let key = body.scoreInformation[i].key;
        if (['Total Percentile', 'Percentile', 'Total Score', ''].includes(key)) {
          body.scoreInformation.push({
            key: 'ts',
            value: body.scoreInformation[i].value
          });
        }
      }
    }
    const testScore = await this.testScoreService.add(studentId, modifiedBy, body);

    const result = await StudentModel.updateOne(
      { _id: studentId },
      { $push: { testScore: testScore.id }, $set: { modifiedBy } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Student not found");
    }

    // await sendToSF(MappingFiles.STUDENT_test_score, { ...testScore, studentId: (await this.findById(studentId)).externalId, _user: { id: modifiedBy } });

    return { id: testScore.id };
  }

  async updateStudentTestScore(studentId, modifiedBy, testScoreId, body) {
    await this.checkIfTestScoreBelongsToStudent(studentId, testScoreId);
    let a = await this.testScoreService.update(modifiedBy, testScoreId, body);

    //// await sendToSF(MappingFiles.STUDENT_test_score, { ...a, studentId: (await this.findById(studentId)).externalId, _user: { id: modifiedBy } });
    return a;
  }

  async deleteStudentTestScore(studentId, modifiedBy, testScoreId) {
    await this.checkIfTestScoreBelongsToStudent(studentId, testScoreId);
    await this.testScoreService.delete(testScoreId);
    return StudentModel.updateOne({ _id: studentId }, { $pull: { testScore: testScoreId }, $set: { modifiedBy } });
  }

  async checkIfTestScoreBelongsToStudent(studentId, testScoreId) {
    const student = await StudentModel.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    if (student.testScore.indexOf(testScoreId) == -1) {
      throw new Error("Test score does not belong to student");
    }
  }

  // async addDocumentToStudent(studentId, documentData) {
  //   const student = await this.findById(studentId);
  //   const document = await this.documentService.createDocument(
  //     student,
  //     documentData
  //   );

  //   return { id: document.id };
  // }

  // async updateDocumentOfStudent(studentId, documentId, documentData) {
  //   const student = await this.findById(studentId);
  //   const document = await this.documentService.findById(documentId);

  //   if (document.studentId.toString() !== student._id.toString()) {
  //     throw new Error("Document does not belong to the student");
  //   }

  //   document.set(documentData);
  //   await document.save();

  //   return { id: document.id };
  // }

  // async deleteDocumentOfStudent(studentId, documentId) {
  //   const student = await this.findById(studentId);
  //   const document = await this.documentService.findById(documentId);

  //   if (document.studentId.toString() !== student._id.toString()) {
  //     throw new Error("Document does not belong to the student");
  //   }

  //   await document.remove();
  // }

  // async getStudentPayments(studentId) {
  //   const student = await this.findById(studentId);
  //   return this.studentPaymentService.getStudentPayments(student);
  // }

  // async addPaymentToStudent(studentId, paymentData) {
  //   const student = await this.findById(studentId);
  //   const payment = await this.studentPaymentService.createPayment(
  //     student,
  //     paymentData
  //   );

  //   return { id: payment.id };
  // }

  // async updatePaymentOfStudent(studentId, paymentId, paymentData) {
  //   const student = await this.findById(studentId);
  //   const payment = await this.studentPaymentService.findById(paymentId);

  //   if (payment.studentId.toString() !== student._id.toString()) {
  //     throw new Error("Payment does not belong to student");
  //   }

  //   payment.set(paymentData);
  //   await payment.save();

  //   return { id: payment.id };
  // }

  // async deletePaymentOfStudent(studentId, paymentId) {
  //   const student = await this.findById(studentId);
  //   const payment = await this.studentPaymentService.findById(paymentId);

  //   if (payment.studentId.toString() !== student._id.toString()) {
  //     throw new Error("Payment does not belong to student");
  //   }

  //   await payment.remove();
  // }

  // async getStudentTasks(studentId) {
  //   const student = await this.findById(studentId);
  //   return this.taskService.getTasksByStudent(student);
  // }

  // async addTaskToStudent(studentId, taskData) {
  //   const student = await this.findById(studentId);
  //   const task = await this.taskService.createTask(student, taskData);

  //   return { id: task.id };
  // }

  // async updateTaskOfStudent(studentId, taskId, taskData) {
  //   const student = await this.findById(studentId);
  //   const task = await this.taskService.findById(taskId);

  //   if (task.studentId.toString() !== student._id.toString()) {
  //     throw new Error("Task does not belong to student");
  //   }

  //   task.set(taskData);
  //   await task.save();

  //   return { id: task.id };
  // }

  // async deleteTaskOfStudent(studentId, taskId) {
  //   const student = await this.findById(studentId);
  //   const task = await this.taskService.findById(taskId);

  //   if (task.studentId.toString() !== student._id.toString()) {
  //     throw new Error("Task does not belong to student");
  //   }

  //   await task.remove();
  // }

  // async addCommentToStudent(studentId, commentData) {
  //   const student = await this.findById(studentId);
  //   const comment = await this.commentService.createComment(
  //     student,
  //     commentData
  //   );

  //   return { id: comment.id };
  // }

  // async updateCommentOfStudent(studentId, commentId, commentData) {
  //   const student = await this.findById(studentId);
  //   const comment = await this.commentService.findById(commentId);

  //   if (comment.studentId.toString() !== student._id.toString()) {
  //     throw new CommentDoesNotBelongsToStudentException();
  //   }

  //   comment.set(commentData);
  //   await comment.save();

  //   return { id: comment.id };
  // }

  // async deleteCommentOfStudent(studentId, commentId) {
  //   const student = await this.findById(studentId);
  //   const comment = await this.commentService.findById(commentId);

  //   if (comment.studentId.toString() !== student._id.toString()) {
  //     throw new CommentDoesNotBelongsToStudentException();
  //   }

  //   await comment.remove();
  // }

  // async getStudentApplications(studentId) {
  //   const student = await this.findById(studentId);
  //   return this.applicationService.getApplicationsByStudent(student);
  // }

  // async addApplicationToStudent(studentId, applicationData) {
  //   const student = await this.findById(studentId);
  //   const application = await this.applicationService.createApplication(
  //     student,
  //     applicationData
  //   );

  //   return { id: application.id };
  // }

  // async updateApplicationOfStudent(studentId, applicationId, applicationData) {
  //   const student = await this.findById(studentId);
  //   const application = await this.applicationService.findById(applicationId);

  //   if (application.studentId.toString() !== student._id.toString()) {
  //     throw new ApplicationDoesNotBelongsToStudentException();
  //   }

  //   application.set(applicationData);
  //   await application.save();

  //   return { id: application.id };
  // }

  // async deleteApplicationOfStudent(studentId, applicationId) {
  //   const student = await this.findById(studentId);
  //   const application = await this.applicationService.findById(applicationId);

  //   if (application.studentId.toString() !== student._id.toString()) {
  //     throw new ApplicationDoesNotBelongsToStudentException();
  //   }

  //   await application.remove();
  // }

  // async getStudentPrograms(studentId) {
  //   const student = await this.findById(studentId);
  //   return this.programService.getProgramsByStudent(student);
  // }

  // async addProgramToStudent(studentId, programData) {
  //   const student = await this.findById(studentId);
  //   const program = await this.programService.createProgram(student, programData);

  //   return { id: program.id };
  // }

  // async updateProgramOfStudent(studentId, programId, programData) {
  //   const student = await this.findById(studentId);
  //   const program = await this.programService.findById(programId);

  //   if (program.studentId.toString() !== student._id.toString()) {
  //     throw new ProgramDoesNotBelongsToStudentException();
  //   }

  //   program.set(programData);
  //   await program.save();

  //   return { id: program.id };
  // }

  // async deleteProgramOfStudent(studentId, programId) {
  //   const student = await this.findById(studentId);
  //   const program = await this.programService.findById(programId);

  //   if (program.studentId.toString() !== student._id.toString()) {
  //     throw new ProgramDoesNotBelongsToStudentException();
  //   }

  //   await program.remove();
  // }

  // async getStudentSchools(studentId) {
  //   const student = await this.findById(studentId);
  //   return this.schoolService.getSchoolsByStudent(student);
  // }

  // async addSchoolToStudent(studentId, schoolData) {
  //   const student = await this.findById(studentId);
  //   const school = await this.schoolService.createSchool(student, schoolData);

  //   return { id: school.id };
  // }

  // async updateSchoolOfStudent(studentId, schoolId, schoolData) {
  //   const student = await this.findById(studentId);
  //   const school = await this.schoolService.findById(schoolId);

  //   if (school.studentId.toString() !== student._id.toString()) {
  //     throw new SchoolDoesNotBelongsToStudentException();
  //   }

  //   school.set(schoolData);
  //   await school.save();

  //   return { id: school.id };
  // }

  // async deleteSchoolOfStudent(studentId, schoolId) {
  //   const student = await this.findById(studentId);
  //   const school = await this.schoolService.findById(schoolId);

  //   if (school.studentId.toString() !== student._id.toString()) {
  //     throw new SchoolDoesNotBelongsToStudentException();
  //   }

  //   await school.remove();
  // }

  async addStudentTestScore(studentId, modifiedBy, body) {
    const externalId = uuid();
    if (body.scoreInformation.length) {
      for (let i = 0; i < body.scoreInformation.length; i++) {
        let key = body.scoreInformation[i].key;
        if (['Total Percentile', 'Percentile', 'Total Score', ''].includes(key)) {
          body.scoreInformation.push({
            key: 'ts',
            value: body.scoreInformation[i].value
          });
        }
      }
    }
    const testScore = await this.testScoreService.add(studentId, modifiedBy, body);

    const result = await StudentModel.updateOne(
      { _id: studentId },
      { $push: { testScore: testScore.id }, $set: { modifiedBy } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Student not found");
    }

    // await sendToSF(MappingFiles.STUDENT_test_score, { ...testScore, studentId: (await this.findById(studentId)).externalId, _user: { id: modifiedBy } });

    return { id: testScore.id };
  }

  async updateStudentTestScore(studentId, modifiedBy, testScoreId, body) {
    await this.checkIfTestScoreBelongsToStudent(studentId, testScoreId);
    let a = await this.testScoreService.update(modifiedBy, testScoreId, body);

    // await sendToSF(MappingFiles.STUDENT_test_score, { ...a, studentId: (await this.findById(studentId)).externalId, _user: { id: modifiedBy } });

    return a;
  }

  async deleteStudentTestScore(studentId, modifiedBy, testScoreId) {
    await this.checkIfTestScoreBelongsToStudent(studentId, testScoreId);
    await this.testScoreService.delete(testScoreId);
    return StudentModel.updateOne({ _id: studentId }, { $pull: { testScore: testScoreId }, $set: { modifiedBy } });
  }

  async checkIfTestScoreBelongsToStudent(studentId, testScoreId) {
    const student = await StudentModel.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    if (student.testScore.indexOf(testScoreId) == -1) {
      throw TestScoreDoesNotBelongsToStudentException();
    }
  }

  async addStudentDocuments(studentId, modifiedBy, body) {
    const documents = await this.documentService.addDocuments(modifiedBy, studentId, body);
    const documentIds = documents.map((document) => document.id);

    const result = await StudentModel.updateOne(
      { _id: studentId },
      { $set: { documents: documentIds, modifiedBy } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Student not found");
    }

    let sid = (await this.findById(studentId)).externalId;
    documents.forEach(doc => {
      // await sendToSF(MappingFiles.STUDENT_document, { ...doc, studentId: sid, _user: { id: modifiedBy } });
    });

    return documentIds;
  }

  async updateStudentDocument(studentId, modifiedBy, body) {
    const document = await this.documentService.addDocument(modifiedBy, studentId, body);

    const result = await StudentModel.updateOne(
      { _id: studentId },
      { $push: { documents: document.id }, $set: { modifiedBy } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Student not found");
    }
    // await sendToSF(MappingFiles.STUDENT_document, { ...document, studentId: (await this.findById(studentId)).externalId, _user: { id: modifiedBy } });

    return document.id;
  }

  async deleteStudentDocument(studentId, modifiedBy, documentId) {
    await this.checkIfDocumentBelongsToStudent(studentId, documentId);
    await this.documentService.delete(documentId);
    return StudentModel.updateOne({ _id: studentId }, { $pull: { documents: documentId }, $set: { modifiedBy } });
  }

  async checkIfDocumentBelongsToStudent(studentId, documentId) {
    const student = await StudentModel.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    if (student.documents.indexOf(documentId) == -1) {
      throw new Error("Document does not belong to student");
    }
  }

  async addStudentPayment(studentId, modifiedBy, body) {
    const application = await this.applicationService.findById(body.applicationId);
    const payment = await this.studentPaymentService.add(
      studentId,
      application.programId,
      application.schoolId,
      modifiedBy,
      body
    );

    const result = await StudentModel.updateOne(
      { _id: studentId },
      { $push: { payment: payment.id }, $set: { modifiedBy } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Student not found");
    }

    let dt = {
      ...payment,
      studentId: (await this.findById(studentId)).externalId,
      _user: { id: modifiedBy }
    };
    if(payment.applicationId){
      dt.applicationId = (await this.applicationService.findById(payment.applicationId)).externalId;
    }
    if(payment.programmeId){
      dt.programmeId = (await this.programService.findById(payment.programmeId)).externalId;
    }
    if(payment.schoolId){
      dt.schoolId = (await this.schoolService.findById(payment.schoolId)).externalId;
    }
    // await sendToSF(MappingFiles.STUDENT_payment, dt);

    return { id: payment.id };
  }

  async updateStudentPayment(studentId, modifiedBy, paymentId, body) {
    await this.checkIfPaymentBelongsToStudent(studentId, paymentId);
    let a = await this.studentPaymentService.update(modifiedBy, paymentId, body);
    // await sendToSF(MappingFiles.STUDENT_payment, {
    //   ...a,
    //   _user: { id: modifiedBy }
    // });
    return a;
  }

  async deleteStudentPayment(studentId, modifiedBy, paymentId) {
    await this.checkIfPaymentBelongsToStudent(studentId, paymentId);
    await this.studentPaymentService.delete(paymentId);
    return StudentModel.updateOne({ _id: studentId }, { $pull: { payment: paymentId }, $set: { modifiedBy } });
  }

  async checkIfPaymentBelongsToStudent(studentId, paymentId) {
    const student = await StudentModel.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    if (student.payment.indexOf(paymentId) == -1) {
      throw new Error("Payment does not belong to student");
    }
  }

  async addStudentTask(studentId, agentId, modifiedBy, body) {
    const task = await this.taskService.add(studentId, agentId, modifiedBy, body);

    const result = await StudentModel.updateOne(
      { _id: studentId },
      { $push: { tasks: task.id }, $set: { modifiedBy } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Student not found");
    }

    return { id: task.id };
  }

  async updateStudentTask(studentId, modifiedBy, taskId, data) {
    await this.checkIfTaskBelongsToStudent(studentId, taskId);
    return this.taskService.addResponse(modifiedBy, taskId, data);
  }

  async checkIfTaskBelongsToStudent(studentId, taskId) {
    const student = await StudentModel.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    if (student.tasks.indexOf(taskId) == -1) {
      throw new Error("Task does not belong to student");
    }
  }

  async addStudentComment(studentId, modifiedBy, body) {
    const comment = await this.commentService.add(body.message, modifiedBy, studentId, body.attachment);

    const result = await StudentModel.updateOne(
      { _id: studentId },
      { $push: { comments: comment.comment.id }, $set: { modifiedBy } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Student not found");
    }

    // await sendToSF(MappingFiles.STUDENT_comment, {
    //   ...comment,
    //   // userId: (await this.findById(studentId)).externalId,
    //   _user: { id: modifiedBy }
    // });

    return comment;
  }

  getStudentEducation(studentId) {
    return this.educationService.getByStudentId(studentId);
  }

  getStudentWorkHistory(studentId) {
    return this.workHistoryService.getByStudentId(studentId);
  }

  getStudentTestScore(studentId) {
    return this.testScoreService.getByStudentId(studentId);
  }

  getStudentDocuments(studentId) {
    return this.documentService.getByUserId(studentId);
  }

  async getStudentPayments(studentId) {
    const payments = await this.studentPaymentService.getByStudentId(studentId);
    return this.applicationService.parsePaymentsResponse(payments);
  }

  getStudentTasks(studentId, status) {
    return this.taskService.getByStudentId(studentId, status);
  }

  async getStudentComments(studentId) {
    const student = await StudentModel.findById(studentId);
    if (!student) throw new Error("Student not found");

    return Promise.all(
      student.comments.map(async (comment) => {
        return await this.commentService.getComment(comment);
      })
    );
  }

  async getStudentProgress(studentId) {
    const student = await StudentModel.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }
    const total = 5;
    let progress = 0;
    if (student.studentInformation) {
      progress++;
    }
    if ((student.educations.length ?? 0) > 0) {
      progress++;
    }
    if ((student.workHistory.length ?? 0) > 0) {
      progress++;
    }
    if ((student.testScore.length ?? 0) > 0) {
      progress++;
    }
    if ((student.documents.length ?? 0) > 0) {
      progress++;
    }
    return (progress / total) * 100;
  }

  async findById(id) {
    const student = await StudentModel.findById(id);

    if (!student) {
      throw new Error("Student not found");
    }

    return student;
  }

  async getStudentTaskComments(studentId, taskId) {
    await this.checkIfTaskBelongsToStudent(studentId, taskId);
    return this.taskService.getComments(taskId);
  }

  async addStudentTaskComments(studentId, taskId, id, body) {
    await this.checkIfTaskBelongsToStudent(studentId, taskId);
    return this.taskService.addComment(taskId, body, id);
  }

  async getStudentCount(agentId) {
    return (await StudentModel.find({ agentId })).length;
  }

  getPaidStudents(agentId, year) {
    return StudentModel.aggregate([
      { $match: { agentId: agentId, createdAt: { $exists: true } } },
      {
        $redact: {
          $cond: [{ $eq: [{ $year: "$createdAt" }, Number.parseInt(year.toString())] }, "$$KEEP", "$$PRUNE"],
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          value: { $sum: 1 },
        },
      },
      MonthFilter,
      { $project: { _id: 0, key: 1, value: 1 } },
    ]);
  }

  async checkForValidUsers(staffId, counsellorId) {
    const [staff, counsellor] = await Promise.all([
      this.staffService.findById(staffId),
      this.staffService.findById(counsellorId),
    ]);

    if (!staff || !counsellor) {
      throw new Error("Student not found");
    }
  }

  async findById(studentId) {
    const student = await StudentModel.findById(studentId);

    if (!student) {
      throw new Error("Student not found");
    }

    return student;
  }
}

module.exports = StudentService;
