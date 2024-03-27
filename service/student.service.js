const uuid = require("uuid");
const StudentModel = require("../models/Student");
const Document = require("../models/Document");
const StaffService = require("./staff.service");
const EducationService = require("../service/education.service");
const DocumentService = require("../service/document.service");
const WorkHistoryService = require("../service/workHistory.service");
const TestScoreService = require("../service/testScore.service");
const StudentPaymentService = require("../service/studentPayment.service");
const TaskService = require("../service/task.service");
const CommentService = require("../service/comment.service");
const ApplicationService = require("../service/application.service");
const ProgramService = require("../service/program.service");
const SchoolService = require("../service/school.service");
const { MappingFiles } = require("./../constants/Agent.constants");
const { sendToSF, sendDataToSF, updateDataToSF } = require("./salesforce.service");
const Staff = require("../models/Staff");

const PreferredCountries = {
  Australia: "Australia",
  Canada: "Canada",
  France: "France",
  Germany: "Germany",
  Ireland: "Ireland",
  New_Zealand: "New Zealand",
  Poland: "Poland",
  Portugal: "Portugal",
  Singapore: "Singapore",
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

    /// to confirm with nilesh on flow with creation of student ////
    this.programService = new ProgramService();
    this.schoolService = new SchoolService();
  }

  converttoSfBody(data) {
    const convertedData = {
      Salutation: data.studentInformation.salutation,
      FirstName: data.studentInformation.firstName,
      LastName: data.studentInformation.lastName,
      DocumentCreated__c: true,
      Task_Created__c: true,
      Partner_Account__c: "0016D00000eKbyjQAC",
      // Partner_User__c: "",
      Counsellor__c: "",
      Student_Status__c: "",
      // Processing_Officer__c: "",
      // BDM_User__c: "",
      Source__c: data.studentInformation.source,
      Passport_Number__c: data.studentInformation.passportNumber,
      MobilePhone: "+" + data.studentInformation.mobile,
      Whatsapp_No__c: "+" + data.studentInformation.whatsappNumber,
      Email: data.studentInformation.email,
      Preferred_Country__c: data.studentInformation.countryOfInterest,
      Intake_Preferred__c: data.studentInformation.intakePreferred,
      Medical_History_Detail__c:
        data.demographicInformation.medicalHistoryDetails,
      Medical_History__c: data.demographicInformation.haveMedicalHistory
        ? "Yes"
        : "No",
      Martial_Status__c: data.demographicInformation.maritalStatus,
      Gender__c: data.demographicInformation.gender,
      Birthdate: data.demographicInformation.dateOfBirth.split("T")[0],
      First_Language__c: data.demographicInformation.firstLanguage,
      Country_of_Citizenship__c: data.demographicInformation.country,
      MailingStreet: data.address.address,
      MailingCity: data.address.city,
      MailingState: data.address.state,
      MailingCountry: data.address.country,
      MailingPostalCode: data.address.zipCode,
      EmergencyContactName__c: data.emergencyContact.name,
      Relationship__c: data.emergencyContact.relationship,
      EmergencyContactEmail__c: data.emergencyContact.email,
      Phone: data.emergencyContact.phoneNumber,
      Country__c: data.emergencyContact.country,
      Have_you_been_refused_a_visa__c: data.backgroundInformation.isRefusedVisa
        ? "Yes"
        : "No",
      Do_you_have_a_valid_Study_Permit_Visa__c:
        data.backgroundInformation.haveStudyPermit,
      Study_Permit_Visa_Details__c:
        data.backgroundInformation.studyPermitDetails,
      Lock_Record__c: true,
      RecordTypeId: "0125g00000020HRAAY",
    };

    return convertedData;
  }

  setScore(data) {
    switch (data?.gradingScheme) {
      case "Percentage":
        return data?.percentage;
      case "CGPA":
        return parseFloat(data?.cgpa);
      case "GPA":
        return parseFloat(data?.gpa);
      case "Grade":
        return "";
      case "Class":
        return "";
      case "Score":
        return data?.score;
      case "Division":
        return "";
    }
  }

  convertEducationData(data) {
    const convertedData = {
      Name_of_Institution__c: data.institutionName,
      Lock_Record__c: "true",
      ShowInProfile__c: "true",
      Level_of_Education__c: data.level,
      Degree_Awarded_On__c: data.degreeAwardedOn.split("T")[0],
      Degree_Awarded__c: data.isDegreeAwarded ? "Yes" : "No",
      Name: data.degree,
      Country_of_Institution__c: data.country,
      Class__c: data?.division,
      Score__c: this.setScore(data),
      Attended_Institution_To__c: data.attendedTo.split("T")[0],
      Attended_Institution_From__c: data.attendedFrom.split("T")[0],
      Affiliated_University__c: data.affiliatedUniversity,
      Verification_Status__c: "",
      Student__c: data?.sfId,
      Primary_Language_of_Instruction__c: data.instituteLanguage,
      Grade__c:data?.grade
    };

    return convertedData;
  }

  convertEducationData(data) {
    const convertedData = {
      Name_of_Institution__c: data.institutionName,
      Lock_Record__c: "true",
      ShowInProfile__c: "true",
      Level_of_Education__c: data.level,
      Degree_Awarded_On__c: data.degreeAwardedOn.split("T")[0],
      Degree_Awarded__c: data.isDegreeAwarded ? "Yes" : "No",
      Name: data.degree,
      Country_of_Institution__c: data.country,
      Class__c: data?.class||data?.division,
      Score__c: this.setScore(data),
      Attended_Institution_To__c: data.attendedTo.split("T")[0],
      Attended_Institution_From__c: data.attendedFrom.split("T")[0],
      Affiliated_University__c: data.affiliatedUniversity,
      Verification_Status__c: "", // You may update this based on your specific logic
      Student__c: data?.sfId, // Replace with the actual student ID
      Primary_Language_of_Instruction__c: data.instituteLanguage,
      Grade__c:data?.grade
    };

    return convertedData;
  }

  convertWorkHistoryData(data) {
    const convertedData = {
      Name: data?.employerName,
      Designation__c: data?.designation,
      Date_of_Joining__c: data?.doj.split("T")[0],
      Date_of_relieving__c: data?.dor.split("T")[0],
      Email_Id__c: data?.email,
      Contact_info__c: data?.contactInfo,
      Phone_Number_of_the_Signed_Person__c:data?.signedPersonPhone,
      Email_ID_of_the_Signed_Person__c:data?.signedPersonEmail,
      Name_of_the_Signed_Person__c:data?.signedPersonName,
      Student__c: "003Hy00000tPfkUIAS",
      Lock_Record__c: "",
    };

    return convertedData;
  }

  convertTestScoreData(data) {
    let convertedData = {
      RecordTypeId: "", // Fill this value based on the examType
      Student__c: data?.studentId,
      Date_of_Exam__c: data.doe.split("T")[0],
      ID_Certificate_No__c: data.certificateNo,
      Verification_Status__c: data?.status,
    };

    // Mapping record type IDs based on the examType
    switch (data.examType) {
      case "12th Standard English Mark":
        convertedData.RecordTypeId = "0125g0000000zo2AAA";
        convertedData.Quantitative_reasoning_Percentile__c = data?.percentile; // Placeholder
        convertedData.Total_Score__c = data?.englishMarks; // Placeholder
        convertedData.English_Exam_Type__c = "12th STD. English mark";
        break;
      case "GRE":
        convertedData.RecordTypeId = "0125g0000000zo0AAA";
        convertedData.Quantitative_reasoning_Score__c =
          data?.quantitativeReasoningScore; // Placeholder
        convertedData.Verbal_Reasoning_Score__c = data?.verbalReasoningScore; // Placeholder
        convertedData.Analytical_reasoning_Score__c =
          data?.analyticalReasoningScore; // Placeholder
        convertedData.Verbal_Reasoning_Percentile__c =
          data?.verbalReasoningPercentile; // Placeholder
        convertedData.Analytical_reasoning_Percentile__c =
          data?.analyticalReasoningPercentile; // Placeholder
        convertedData.Quantitative_reasoning_Percentile__c = data?.percentile;
        convertedData.English_Exam_Type__c = "GRE";
        break;
      case "GMAT":
        convertedData.RecordTypeId = "0125g0000000znzAAA";
        convertedData.Quantitative_Percentile__c = data?.quantitativePercentile; // Placeholder
        convertedData.Verbal_Score1__c = data?.verbalScore; // Placeholder
        convertedData.Integrated_Listening_Score__c =
          data?.integratedListeningScore; // Placeholder
        convertedData.Verbal_Percentile__c = data?.verbalpercentile; // Placeholder
        convertedData.Integrated_Listening_Percentile__c =
          data?.integratedListeningPercentile; // Placeholder
        convertedData.Gmat_Quantitative_Score__c = data?.quantitativeScore; // Placeholder
        convertedData.Total_Percentile__c = data?.totalPercentile;
        convertedData.English_Exam_Type__c = "GMAT";
        break;
      case "Duolingo":
        convertedData.RecordTypeId = "0125g0000000znyAAA";
        convertedData.Comprehension__c = data?.comprehension; // Placeholder
        convertedData.Conversation__c = data?.conversation; // Placeholder
        convertedData.Literacy__c = data?.literacy; // Placeholder
        convertedData.Overall__c = data?.overall; // Placeholder
        convertedData.Production__c = data?.production; // Placeholder
        convertedData.Quantitative_reasoning_Percentile__c = data?.percentile;
        convertedData.English_Exam_Type__c = "Duolingo English Test";
        break;
      case "TOEFL / IELTS / PTE":
        convertedData.RecordTypeId = "0125g0000000zo1AAA";
        convertedData.Listening__c = data?.listening; // Placeholder
        convertedData.Reading__c = data?.reading; // Placeholder
        convertedData.GRE_Writing_Score__c = data?.writing; // Placeholder
        convertedData.Verbal_Score__c = data?.speaking; // Placeholder
        convertedData.Overall__c = data?.overall; // Placeholder
        convertedData.English_Exam_Type__c = data?.selectedType;
      default:
        break;
    }
    return convertedData;
  }

  convertTaskData(data) {
    const convertedData = {
      RecordTypeId: "0125g0000003r8xAAA",
      Name: data.name,
      Sequence__c: "2",
      TaskMaster__c: "",
      DocumentId__c: "",
      ContactId__c: "0036D00000p36F3QAI", // Dynamic for student
      Status__c: "New", // Enum: New, In Progress, Due, Completed
      Lock_Record__c: false,
      Type__c: "Question", // Enum: Question, Clarification, Request Document, Interview, Appointment, Pre-Screening Documents, Verify Document, Re-upload Document, Re-verify Document, Agent Training
      CompletedDate__c: "2023-02-09",
      Mandatory__c: true,
      Publish_To_Portal__c: true,
      IsArchived__c: true,
      Priority__c: "High", // Enum: High, Normal, Low
      Description__c: data.description,
      CommentUniexperts__c: "asrftrf",
      IsReminderSet__c: true,
      ApplicationStages__c: "Pre-Submission", // Enum: Pre-Submission, Application Submitted, Accepted(Conditional), Accepted(Unconditional), Payment, Visa Letter Requested
      RecurrenceInterval__c: 2,
      Start_Date__c: "",
      Task_End_Date__c: "2023-08-17T09:43:56.000+0000",
      Student_stages__c: "", // Enum: New Student, General, Educational, Work History, Documents Received, Pre Screening Interview, Pre Documents Verification, Document Verified, Application, Visa Approved, Enrolled, Commission, Rejected
    };

    return convertedData;
  }

  convertToGeneralInfoData(inputData) {
    const outputData = {
      RecordTypeId: "0125g0000003I7FAAU",
      Company_Logo__c: "",
      Country_Code__c: "+91",
      Timezone_UTC__c: inputData.personalDetails.timezone.utc_offset,
      Same_As_Billing_Address__c: false,
      Timezone_Region__c: inputData.personalDetails.timezone.name,
      Name: inputData.company.companyName,
      Lock_Record__c: true,
      BDM_User__c: "",
      //"Parent": "",
      //"PrimaryContact__r": "",
      Students_Per_Year__c: inputData.company.studentPerYear.replace("+", ""),
      CurrencyIsoCode: "GBP",
      Year_Founded__c: inputData.company.yearFounded,
      Website: inputData.company.website,
      MaxActiveUsersAllowed__c: 5,
      Country__c: inputData.company.country,
      Phone: inputData.personalDetails.phone,
      EntityType__c: inputData.company.entityType,
      Tax_Number__c: inputData.company.taxNumber,
      Onboarding_Status__c: "New",
      PartnerNotified__c: false,
      Bypass_Documentation__c: false,
      FinalDocumentStatus__c: "Pending",
      Agreement_signed_time_stamp__c: new Date(),
      Terms_Conditions_Agreed__c: "",
      Latitude__c: "",
      Longitude__c: "",
      IP_Address__c: "",
      Acknowledgement_Acceptance__c: false,
      BillingCity: inputData.address.city,
      BillingCountry: inputData.address.country,
      BillingState: inputData.address.state,
      BillingStreet: inputData.address.address,
      BillingPostalCode: inputData.address.zipCode,
      ShippingCity: inputData.address.city,
      ShippingCountry: inputData.address.country,
      ShippingState: inputData.address.state,
      ShippingStreet: inputData.address.address,
      ShippingPostalCode: inputData.address.zipCode,
      Type: "Partner",
      NumberOfEmployees: parseInt(inputData.company.employeeCount),
      Description: "",
    };
  
    return outputData;
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

    const studentData = this.converttoSfBody(studentInformation)
    console.log("\n\nStudent Data: " + JSON.stringify(studentData)+"\n\n\n\n")
    const studentUrl = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Contact`;
    const sfStudentResponse = await sendDataToSF(studentData, studentUrl);
    const sfId = sfStudentResponse?.id;
    if (sfId) {
      await StudentModel.updateOne(
        { _id: student._id },
        { $set: { salesforceId: sfId } }
      );
    }
    return { id: student._id, sf: sfStudentResponse };
  }

  async preferredCountries() {
    return PreferredCountries;
  }

  async getStudent(agentId, query) {
    const filter = { agentId };
    const sortByType = query.sortByType === "Ascending" ? 1 : -1;
    const sortBy = {};
    if (query.sortBy) {
      sortBy[`${query.sortBy}`] = sortByType;
    }
    if (query.queryCreatedBy) {
      filter.createdBy = query.queryCreatedBy;
    }
    if (query.queryName) {
      filter.studentInformation = { firstName: query.queryName };
    }
    if (query.queryEmail) {
      filter.emergencyContact = { email: query.queryEmail };
    }
    if (query.queryMobile) {
      filter.emergencyContact = { phoneNumber: query.queryMobile };
    }
    if (query.queryCountry) {
      filter.demographicInformation = { country: query.queryCountry };
    }
    if (query.queryCounsellor) {
      filter.studentInformation = { counsellorId: query.queryCounsellor };
    }
    const student = await StudentModel.find(filter)
      .skip(parseInt(query.perPage) * (parseInt(query.pageNo) - 1))
      .sort(sortBy)
      .limit(parseInt(query.perPage));
    const studentList = [];
    for (let i = 0; i < student.length; i++) {
      const staff = await Staff.findOne({ _id: student[i].createdBy });
      const counsellor = await Staff.findOne({
        _id: student[i].studentInformation.counsellorId,
      });

      if (staff) {
        student[i].createdBy = staff.fullName;
      }

      if (counsellor) {
        student[i].studentInformation.counsellorId = staff.fullName;
      }

      studentList.push(student[i]);
    }

    return studentList;
  }

  async getStudentGeneralInformation(studentId) {
    const student = await StudentModel.findOne({ _id: studentId });
    if (!student) throw new Error("Student not found");
    return student;
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
    
    const studentData = this.converttoSfBody(studentDetails);
    const studentUrl = `${process.env.SF_OBJECT_URL}Contact/${student?.salesforceId}`;
    const sfCompanyData = await updateDataToSF(studentData, studentUrl);
    console.log('sf Company Data',sfCompanyData)

    return { id: student.id };
  }

  async deleteStudent(studentId) {
    return await StudentModel.findByIdAndDelete(studentId);
  }

  getStudentEducation(studentId) {
    return this.educationService.getByStudentId(studentId);
  }

  async addStudentEducation(studentId, modifiedBy, body) {
    const education = await this.educationService.add(
      studentId,
      modifiedBy,
      body
    );
    const result = await StudentModel.updateOne(
      { _id: studentId },
      { $push: { educations: education.id }, $set: { modifiedBy } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Student not found");
    }

    const educationData = this.convertEducationData(body)
    const educationUrl = `${process.env.SF_API_URL}services/data/v55.0/sobjects/Education__c`;
    const sfEducationResponse = await sendDataToSF(educationData, educationUrl);
    console.log(sfEducationResponse);
    return { id: education.id, sf: sfEducationResponse };
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
    const student = await this.checkIfEducationBelongsToStudent(studentId, educationId);
    let updatedEducation = await this.educationService.update(
      modifiedBy,
      educationId,
      body
    );
    // const url = "Education__c/a02N000000N8POMIA3";
    // await sendToSF(MappingFiles.STUDENT_education_history, {
    //   ...a,
    //   studentId: (await this.findById(studentId)).externalId,
    //   _user: { id: modifiedBy },
    //   url,
    // });

    const studentData = this.convertEducationData(body);
    const studentUrl = `${process.env.SF_OBJECT_URL}Education__c/${student?.salesforceId}`;
    console.log('student url--',studentUrl)
    const sfCompanyData = await updateDataToSF(studentData, studentUrl);
    console.log('sfCompanyData--442',sfCompanyData)

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
    console.log('student request---539',studentId,educationId)
    const student = await StudentModel.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    if (student.educations.indexOf(educationId) == -1) {
      throw new Error("Student does not belong to education");
    }
    return student;
  }

  async addStudentWorkHistory(studentId, modifiedBy, body, agentId) {
    await this.findById(studentId);
    const workHistory = await this.workHistoryService.add(
      studentId,
      modifiedBy,
      body
    );

    const result = await StudentModel.updateOne(
      { _id: studentId },
      { $push: { workHistory: workHistory.id }, $set: { modifiedBy } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("student not found");
    }
    const workHistoryData = this.convertWorkHistoryData(body)
    const workHistoryUrl = `${process.env.SF_API_URL}services/data/v55.0/sobjects/Work_history__c`;
    const sfWorkHistoryResponse = await sendDataToSF(workHistoryData, workHistoryUrl);

    console.log("sfWorkHistoryResponse: ", sfWorkHistoryResponse);

    return workHistory;
  }

  async updateStudentWorkHistory(studentId, modifiedBy, workHistoryId, body) {
    const student = await this.checkIfWorkHistoryBelongsToStudent(studentId, workHistoryId);
    const wh = await this.workHistoryService.update(
      modifiedBy,
      workHistoryId,
      body
    );
    // const url = "Work_history__c/a0EN000000K7HBUMA3";
    // await sendToSF(MappingFiles.STUDENT_work_history, {
    //   ...wh,
    //   studentId: (await this.findById(studentId)).externalId,
    //   _user: { id: modifiedBy },
    //   url,
    // });

    const studentData = this.convertWorkHistoryData(body);
    const studentUrl = `${process.env.SF_OBJECT_URL}Work_history__c/${student?.salesforceId}`;
    const sfCompanyData = await updateDataToSF(studentData, studentUrl);
    console.log('sfCompanyData--442',sfCompanyData);

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

  async addStudentTestScore(studentId, modifiedBy, body, agentId) {
    if (body.scoreInformation.length) {
      for (let i = 0; i < body.scoreInformation.length; i++) {
        let key = body.scoreInformation[i].key;
        if (
          ["Total Percentile", "Percentile", "Total Score", ""].includes(key)
        ) {
          body.scoreInformation.push({
            key: "ts",
            value: body.scoreInformation[i].value,
          });
        }
      }
    }
  
    const testScore = await this.testScoreService.add(
      studentId,
      modifiedBy,
      body,
      agentId
    );
    const result = await StudentModel.updateOne(
      { _id: studentId },
      { $push: { testScore: testScore.id }, $set: { modifiedBy } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Student not found");
    }

    const testScoreSfData = this.convertTestScoreData(body)
    const testScoreUrl = `${process.env.SF_API_URL}services/data/v55.0/sobjects/Test_Score__c`;
    const testScoreSfResponse = await sendDataToSF(testScoreSfData, testScoreUrl);

    console.log("testScoreSfResponse: ", testScoreSfResponse);
    return { id: testScore.id };
  }

  async updateStudentTestScore(studentId, modifiedBy, testScoreId, body) {
    const student = await this.checkIfTestScoreBelongsToStudent(studentId, testScoreId);
    let a = await this.testScoreService.update(modifiedBy, testScoreId, body);
    const studentData = this.convertTestScoreData(body);
    const studentUrl = `${process.env.SF_OBJECT_URL}Test_Score__c/${student?.salesforceId}`;
    const sfCompanyData = await updateDataToSF(studentData, studentUrl);
    console.log('sfCompanyData--442',sfCompanyData)
    //// await sendToSF(MappingFiles.STUDENT_test_score, { ...a, studentId: (await this.findById(studentId)).externalId, _user: { id: modifiedBy } });
    return a;
  }

  async deleteStudentTestScore(studentId, modifiedBy, testScoreId) {
    await this.checkIfTestScoreBelongsToStudent(studentId, testScoreId);
    await this.testScoreService.delete(testScoreId);
    return StudentModel.updateOne(
      { _id: studentId },
      { $pull: { testScore: testScoreId }, $set: { modifiedBy } }
    );
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

  async addStudentTestScore(studentId, modifiedBy, body, agentId) {
    const externalId = uuid();
    if (body.scoreInformation.length) {
      for (let i = 0; i < body.scoreInformation.length; i++) {
        let key = body.scoreInformation[i].key;
        if (
          ["Total Percentile", "Percentile", "Total Score", ""].includes(key)
        ) {
          body.scoreInformation.push({
            key: "ts",
            value: body.scoreInformation[i].value,
          });
        }
      }
    }
    const testScore = await this.testScoreService.add(
      studentId,
      modifiedBy,
      body,
      agentId
    );
    const result = await StudentModel.updateOne(
      { _id: studentId },
      { $push: { testScore: testScore.id }, $set: { modifiedBy } }
    );
    if (result.modifiedCount === 0) {
      throw new Error("Student not found");
    }

    const testScoreSfData = this.convertTestScoreData(body);
    const testScoreUrl =
      "https://uniexperts--uxuat.sandbox.my.salesforce.com/services/data/v55.0/sobjects/Test_Score__c";
    const testScoreSfResponse = await sendDataToSF(
      testScoreSfData,
      testScoreUrl
    );
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
    return StudentModel.updateOne(
      { _id: studentId },
      { $pull: { testScore: testScoreId }, $set: { modifiedBy } }
    );
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
    const documents = await this.documentService.addDocuments(
      modifiedBy,
      studentId,
      body
    );
    const documentIds = documents.map((document) => document.id);

    const result = await StudentModel.updateOne(
      { _id: studentId },
      { $set: { documents: documentIds, modifiedBy } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Student not found");
    }

    let sid = (await this.findById(studentId)).externalId;
    documents.forEach(async (doc) => {
      await sendToSF(MappingFiles.STUDENT_document, {
        ...doc,
        studentId: sid,
        _user: { id: modifiedBy },
      });
    });

    return documentIds;
  }

  // async updateStudentDocument(studentId, modifiedBy, body) {
  //   const document = await this.documentService.addDocument(
  //     modifiedBy,
  //     studentId,
  //     body
  //   );

  //   const result = await StudentModel.updateOne(
  //     { _id: studentId },
  //     { $push: { documents: document.id }, $set: { modifiedBy } }
  //   );

  //   if (result.modifiedCount === 0) {
  //     throw new Error("Student not found");
  //   }
  //   // await sendToSF(MappingFiles.STUDENT_document, { ...document, studentId: (await this.findById(studentId)).externalId, _user: { id: modifiedBy } });

  //   return document.id;
  // }

  async updateStudentDocument(studentId, modifiedBy, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const student = await StudentModel.findOne({_id: studentId});
        if (!student) throw "student not found";
        const document = await this.documentService.addOrUpdateStudentDocument(
          modifiedBy,
          studentId,
          body
        );
        const documentIds = document.map((document) => document.id);
        await StudentModel.updateOne(
          { _id: studentId },
          { $set: { documents: documentIds } }
        );
        await Promise.all(
          document.map(async (doc) => {
            // let dtype = await this.documentTypeService.findById(doc.documentTypeId);
            const data = {
              Name: doc.name,
              Lock_Record__c: false,
              Active__c: "",
              LatestDocumentId__c: "",
              ReviewRemarks__c: "",
              BypassDocumentation__c: false,
              Status__c: doc.status,
              IsPublic__c: "",
              IsNewDoc__c: true,
              FileType__c: "",
              ExpiryDate__c: "2023-01-25",
              Is_Downloaded__c: false,
              Sequence__c: 30,
              Mandatory__c: true,
              Entity_Type__c: "", //Individual,Private,Proprietor,Partnership,Trust
              ObjectType__c: "", //Student,Application,Agent
              Account__c: student.commonId,
              School__c: "",
              Student__c: "",
              Document_Master__c: "",
              Application__c: "",
              Programme__c: "",
              S3_DMS_URL__c: doc.url,
              ContentUrl__c: doc.url
            };
            let sfIdFound = false;

            for (const document of body.documents) {
              if (document.sfId) {
                const url = `${process.env.SF_OBJECT_URL}DMS_Documents__c/${document.sfId}`;
                const sfRes = await sendDataToSF(data, url);
                sfIdFound = true; // Set the flag to true if sfId is found
              }
            }

            if (!sfIdFound) {
              const url = `${process.env.SF_OBJECT_URL}DMS_Documents__c`;
              const sfRes = await sendDataToSF(data, url);
              doc["sfId"] = sfRes.id;
              await Document.findOneAndUpdate(
                { _id: doc._id },
                { $set: { sfId: sfRes.id } },
                { new: true }
              );
            }
          })
        );
        resolve(document);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  async deleteStudentDocument(studentId, modifiedBy, documentId) {
    await this.checkIfDocumentBelongsToStudent(studentId, documentId);
    await this.documentService.delete(documentId);
    return StudentModel.updateOne(
      { _id: studentId },
      { $pull: { documents: documentId }, $set: { modifiedBy } }
    );
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
    const application = await this.applicationService.findById(
      body.applicationId
    );
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
      _user: { id: modifiedBy },
    };
    if (payment.applicationId) {
      dt.applicationId = (
        await this.applicationService.findById(payment.applicationId)
      ).externalId;
    }
    if (payment.programmeId) {
      dt.programmeId = (
        await this.programService.findById(payment.programmeId)
      ).externalId;
    }
    if (payment.schoolId) {
      dt.schoolId = (
        await this.schoolService.findById(payment.schoolId)
      ).externalId;
    }
    // await sendToSF(MappingFiles.STUDENT_payment, dt);

    return { id: payment.id };
  }

  async updateStudentPayment(studentId, modifiedBy, paymentId, body) {
    const student = await this.checkIfPaymentBelongsToStudent(studentId, paymentId);
    let a = await this.studentPaymentService.update(
      modifiedBy,
      paymentId,
      body
    );
    // await sendToSF(MappingFiles.STUDENT_payment, {
    //   ...a,
    //   _user: { id: modifiedBy }
    // });
    const studentData = this.converttoSfBody(body);
    const studentUrl = `${process.env.SF_OBJECT_URL}STUDENT_payment/${student?.salesforceId}`;
    const sfCompanyData = await updateDataToSF(body, studentUrl);
    console.log('sfCompanyData--442',sfCompanyData)
    return a;
  }

  async deleteStudentPayment(studentId, modifiedBy, paymentId) {
    await this.checkIfPaymentBelongsToStudent(studentId, paymentId);
    await this.studentPaymentService.delete(paymentId);
    return StudentModel.updateOne(
      { _id: studentId },
      { $pull: { payment: paymentId }, $set: { modifiedBy } }
    );
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
    const task = await this.taskService.add(
      studentId,
      agentId,
      modifiedBy,
      body
    );

    const result = await StudentModel.updateOne(
      { _id: studentId },
      { $push: { tasks: task.id }, $set: { modifiedBy } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Student not found");
    }

    const taskSfData = this.convertTaskData(body)
    const taskSfUrl = `${process.env.SF_API_URL}services/data/v50.0/sobjects/RelatedTask__c`;
    const taskSFResponse = await sendDataToSF(taskSfData, taskSfUrl);
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
    const comment = await this.commentService.add(
      body.message,
      modifiedBy,
      studentId,
      body.attachment
    );

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
    if ((student.educations.length ? student.educations.length : 0) > 0) {
      progress++;
    }
    if ((student.workHistory.length ? student.workHistory.length : 0) > 0) {
      progress++;
    }
    if ((student.testScore.length ? student.testScore.length : 0) > 0) {
      progress++;
    }
    if ((student.documents.length ? student.documents.length : 0) > 0) {
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
          $cond: [
            {
              $eq: [{ $year: "$createdAt" }, Number.parseInt(year.toString())],
            },
            "$$KEEP",
            "$$PRUNE",
          ],
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
      this.staffService.findByAgentId(staffId),
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
