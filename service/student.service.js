const uuid = require("uuid");
const mongoose = require("mongoose");
const StudentModel = require("../models/Student");
const ApplicationModel = require("../models/Application");
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
const {
  sendToSF,
  sendDataToSF,
  updateDataToSF,
  getPartnerId,
  getContactId,
  getDataFromSF,
} = require("./salesforce.service");
const Staff = require("../models/Staff");
const { parseInMongoObjectId } = require("../utils/sfErrorHandeling");
const Application = require("../models/Application");
const TestScore = require("../models/TestScore");
const Education = require("../models/Education");
const Student = require("../models/Student");
const staffModel = require("../models/Staff");

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
      Salutation: data?.studentInformation?.salutation,
      FirstName: data?.studentInformation?.firstName,
      LastName: data?.studentInformation?.lastName,
      DocumentCreated__c: true,
      Task_Created__c: true,
      Partner_Account__c: data?.studentInformation?.partnerAccount,
      // Partner_User__c: "",
      Counsellor__c: data?.studentInformation?.partneruser,
      Student_Status__c: "",
      Processing_Officer__c: "",
      // Preferred_Country__c: "Canada;France",
      BDM_User__c: "",
      Source__c: data?.studentInformation?.source,
      Passport_Number__c: data?.studentInformation?.passportNumber,
      MobilePhone: "+" + data?.studentInformation?.mobile,
      Whatsapp_No__c: "+" + data?.studentInformation?.whatsappNumber,
      WhatsApp_Country_Code__c: data?.studentInformation?.whatsappCountryCode,
      Country_Code__c: data?.studentInformation?.mobileCountryCode,
      Email: data?.studentInformation?.email,
      Preferred_Country__c:
        data?.studentInformation?.preferredCountry.join(";"),
      Intake_Preferred__c: data?.studentInformation?.intakePreferred,
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
      EmergencyContactName__c: data?.emergencyContact?.name,
      Relationship__c: data.emergencyContact.relationship,
      EmergencyContactEmail__c: data?.emergencyContact?.email,
      Emergency_Contact_Country_Code__c: data?.emergencyContact?.countryCode,
      Phone: data.emergencyContact.phoneNumber,
      Country__c: data.emergencyContact.country,
      Have_you_been_refused_a_visa__c: data.backgroundInformation.isRefusedVisa
        ? "Yes"
        : "No",
      Do_you_have_a_valid_Study_Permit_Visa__c:
        data.backgroundInformation.haveStudyPermit,
      Study_Permit_Visa_Details__c:
        data.backgroundInformation.studyPermitDetails,
      // Lock_Record__c: true,
      RecordTypeId: "0125g00000020HRAAY",
      OtherStreet: data?.emergencyContact?.address,
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
      Lock_Record__c: true,
      ShowInProfile__c: true,
      Level_of_Education__c: data.level,
      Degree_Awarded_On__c: data.degreeAwardedOn.split("T")[0],
      Degree_Awarded__c: data.isDegreeAwarded ? "Yes" : "No",
      Name: data.degree,
      Country_of_Institution__c: data.country,
      Class__c: data?.division,
      CGPA__c: this.setScore(data),
      Attended_Institution_To__c: data.attendedTo.split("T")[0],
      Attended_Institution_From__c: data.attendedFrom.split("T")[0],
      Affiliated_University__c: data.affiliatedUniversity,
      Verification_Status__c: "",
      Student__c: data?.sfId,
      Primary_Language_of_Instruction__c: data.instituteLanguage,
      Grade__c: data?.grade,
    };

    return convertedData;
  }

  // convertEducationData(data) {
  //   const convertedData = {
  //     Name_of_Institution__c: data.institutionName,
  //     Lock_Record__c: true,
  //     ShowInProfile__c: true,
  //     Level_of_Education__c: data.level,
  //     Degree_Awarded_On__c: data.degreeAwardedOn.split("T")[0],
  //     Degree_Awarded__c: data.isDegreeAwarded ? "Yes" : "No",
  //     Name: data.degree,
  //     Country_of_Institution__c: data.country,
  //     Class__c: data?.class || data?.division || null,
  //     CGPA__c: this.setScore(data),
  //     Attended_Institution_To__c: data.attendedTo.split("T")[0],
  //     Attended_Institution_From__c: data.attendedFrom.split("T")[0],
  //     Affiliated_University__c: data.affiliatedUniversity,
  //     Verification_Status__c: "", // You may update this based on your specific logic
  //     Student__c: data?.sfId, // Replace with the actual student ID
  //     Primary_Language_of_Instruction__c: data?.instituteLanguage || null,
  //     Grade__c: data?.grade,
  //   };

  //   return convertedData;
  // }

  convertWorkHistoryData(data, studentId) {
    const convertedData = {
      Name: data?.employerName,
      Designation__c: data?.designation,
      Date_of_Joining__c: data?.doj.split("T")[0],
      Date_of_relieving__c: data?.dor.split("T")[0],
      Email_Id__c: data?.email,
      Country_Code__c: data?.countryCode,
      Contact_info__c: data?.contactInfo,
      Signed_Country_Code__c: data?.signedPersonCountryCode,
      Phone_Number_of_the_Signed_Person__c: data?.signedPersonPhone,
      Email_ID_of_the_Signed_Person__c: data?.signedPersonEmail,
      Name_of_the_Signed_Person__c: data?.signedPersonName,
      Student__c: studentId,
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
    try {
      // Check if the staffId and counsellorId are valid users
      const isValid = await this.checkForValidUsers(
        studentInformation.studentInformation.staffId,
        studentInformation.studentInformation.counsellorId
      );

      // Proceed only if both staff and counsellor are found
      if (isValid) {
        // Generate a unique external ID for the student
        const externalId = uuid();
        // Create a new student in the database

        const student = await StudentModel.create({
          ...studentInformation,
          modifiedBy,
          agentId,
          externalId,
          createdBy: modifiedBy,
          currentStage: 1,
        });

        // Convert student information to Salesforce format
        const studentData = this.converttoSfBody(studentInformation);

        // Construct the URL for Salesforce API to create a Contact
        const studentUrl = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Contact`;
        // Send student data to Salesforce
        const sfStudentResponse = await sendDataToSF(studentData, studentUrl);
        // Get the Salesforce ID if the student was successfully created in Salesforce
        const sfId = sfStudentResponse?.id;
        let contactDetails;

        // Update the student in the database with the Salesforce ID
        if (sfId) {
          await StudentModel.updateOne(
            { _id: student._id },
            { $set: { salesforceId: sfId } }
          );

          // Retrieve additional contact details from Salesforce
          contactDetails = await getContactId(sfId);
          await StudentModel.updateOne(
            { _id: student._id },
            { $set: { partnerId: contactDetails?.Student_ID__c } }
          );
        }

        // Return relevant information about the created student
        return {
          id: student._id, // Return the MongoDB ID of the student
          sf: sfStudentResponse, // Return the Salesforce response
          partnerId: contactDetails?.Student_ID__c, // Return the partner ID from Salesforce
        };
      }
      return {
        id: student._id,
        sf: sfStudentResponse,
        partnerId: contactDetails?.Student_ID__c,
        counsellorId: studentData?.Counsellor__c,
      };
    } catch (error) {
      // Handle any errors that occur during the process
      console.error("Error in createStudent:", error);
      throw error;
    }
  }

  async createStudentFromSf(studentInformation, salesforceId) {
    try {
      let staffId = studentInformation.studentInformation.partnerAccount;
      let counsellorId = studentInformation.studentInformation.partneruser;

      const [staff, counsellor] = await Promise.all([
        this.staffService.findByAgentIdForSf(staffId),
        this.staffService.findByIdForSf(counsellorId),
      ]);

      // Check if either staff or counsellor is not found
      if (!staff || !counsellor) {
        throw new Error("Staff or counsellor not found");
      }

      // Prepare the student data
      studentInformation.studentInformation.staffId = staff._id.toString();
      studentInformation.studentInformation.counsellorId =
        counsellor._id.toString();
      studentInformation.agentId = staff._id.toString();
      studentInformation.createdBy = counsellor._id.toString();
      studentInformation.modifiedBy = counsellor._id.toString();
      studentInformation.salesforceId = salesforceId;
      studentInformation.demographicInformation.haveMedicalHistory =
        studentInformation?.demographicInformation?.haveMedicalHistory
          ? true
          : false;
      studentInformation.backgroundInformation.isRefusedVisa =
        studentInformation?.backgroundInformation?.isRefusedVisa ? true : false;

      // Check if the student already exists
      let student = await StudentModel.findOne({ salesforceId });

      if (student) {
        // Update the existing student
        Object.assign(student, studentInformation);
        await student.save();
      } else {
        // Create a new student
        const externalId = uuid();
        student = await StudentModel.create({
          ...studentInformation,
          externalId,
          currentStage: 1,
        });
      }

      return {
        id: student._id,
      };
    } catch (error) {
      // Handle any errors that occur during the process
      console.error("Error in createStudent:", error);
      throw error;
    }
  }

  async preferredCountries() {
    return PreferredCountries;
  }

  async getStudent(
    agentId,
    query,
    role,
    createdBy,
    searchData,
    accessibility,
    branchId
  ) {
    let filter;
    if (accessibility?.length > 0 && accessibility?.includes("Student")) {
      const userIds = await staffModel.find({ branchId }, { _id: 1 });
      // Extract the user IDs from the result
      const userIdsArray = userIds.map((user) => user._id);
      // Use the extracted user IDs in your filter
      filter = {
        createdBy: { $in: userIdsArray },
      };
    } else {
      filter = role === "consultant" ? { createdBy } : { agentId };
    }
    const sortByType = query.sortByType === "Ascending" ? 1 : -1;
    const sortBy = {};
    if (query.sortBy) {
      sortBy[`${query.sortBy}`] = sortByType;
    }

    // Incorporate search query into filter
    if (searchData) {
      switch (searchData.searchType) {
        case "name":
          filter["$or"] = [
            {
              "studentInformation.firstName": new RegExp(
                searchData.searchTerm,
                "i"
              ),
            },
            {
              "studentInformation.middleName": new RegExp(
                searchData.searchTerm,
                "i"
              ),
            },
            {
              "studentInformation.lastName": new RegExp(
                searchData.searchTerm,
                "i"
              ),
            },
            {
              $expr: {
                $regexMatch: {
                  input: {
                    $concat: [
                      "$studentInformation.firstName",
                      " ",
                      "$studentInformation.middleName",
                      " ",
                      "$studentInformation.lastName",
                    ],
                  },
                  regex: new RegExp(searchData.searchTerm, "i"),
                },
              },
            },
          ];
          break;
        case "email":
          filter["studentInformation.email"] = new RegExp(
            searchData.searchTerm,
            "i"
          );
          break;
        case "mobile":
          filter["studentInformation.mobile"] = new RegExp(
            searchData.searchTerm,
            "i"
          );
          break;
        case "country":
          filter["address.country"] = new RegExp(searchData.searchTerm, "i");
          break;
        case "createdBy":
          filter["createdBy"] = new RegExp(searchData.searchTerm, "i");
          break;
        default:
          console.log("Invalid search type");
          break;
      }
    }

    if (query.eligibility) {
      const testScoreData = await TestScore.find(
        {},
        {
          studentId: 1,
          _id: 0,
        }
      );

      const filterUnique = testScoreData
        .map((obj) => obj.studentId)
        .filter((value, index, self) => self.indexOf(value) === index);
      filter = {
        _id: { $in: filterUnique },
      };
    }

    const student = await StudentModel.find(filter)
      .skip(parseInt(query.perPage) * (parseInt(query.pageNo) - 1))
      .sort(sortBy)
      .limit(parseInt(query.perPage));
    const count = await StudentModel.countDocuments(filter);
    const studentList = [];
    for (let i = 0; i < student.length; i++) {
      const staff = await Staff.findOne({ _id: student[i].createdBy });
      const counsellor = await Staff.findOne({
        _id: student[i].studentInformation.counsellorId,
      });
      console.log("staff", staff);

      if (staff) {
        student[i].createdBy = staff.fullName;
      }

      if (counsellor) {
        student[i].studentInformation.counsellorId = staff.fullName;
      }

      studentList.push(student[i]);
    }
    return { studentList, count };
  }

  async getStudentGeneralInformation(studentId) {
    const objId = parseInMongoObjectId(studentId);
    const student = await StudentModel.aggregate([
      {
        $match: { _id: objId }, // Replace studentId with the specific student ID you're querying
      },
      {
        $lookup: {
          from: "staffs",
          let: {
            councellorId: { $toObjectId: "$studentInformation.counsellorId" },
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$councellorId"] },
              },
            },
          ],
          as: "staff",
        },
      },
      {
        $lookup: {
          from: "agents",
          let: { staffId: { $toObjectId: "$studentInformation.staffId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$staffId"] },
              },
            },
          ],
          as: "agent",
        },
      },

      {
        $unwind: "$staff",
      },
      {
        $unwind: "$agent",
      },
      {
        $project: {
          studentData: "$$ROOT",
          councellorName: "$staff.fullName",
          agentName: "$agent.company.companyName",
        },
      },
      {
        $addFields: {
          "studentdata.studentInformation.counsellorName": "$councellorName",
          "studentData.studentInformation.staffName": "$agentName",
        },
      },
      {
        $replaceRoot: { newRoot: "$studentData" },
      },
    ]);

    // const objId = parseInMongoObjectId(studentId);

    // const student = await StudentModel.aggregate([
    //   {
    //     $match: { _id: objId },
    //   },
    //   {
    //     $lookup: {
    //       from: "staffs",
    //       localField: "studentInformation.counsellorId",
    //       foreignField: "_id",
    //       as: "staff",
    //     },
    //   },
    //   {
    //     $unwind: "$staff",
    //   },
    //   {
    //     $lookup: {
    //       from: "agents",
    //       localField: "studentInformation.staffId",
    //       foreignField: "_id",
    //       as: "agent",
    //     },
    //   },
    //   {
    //     $unwind: "$agent",
    //   },
    //   {
    //     $lookup: {
    //       from: "educations",
    //       localField: "_id",
    //       foreignField: "studentId",
    //       as: "education",
    //     },
    //   },
    //   {
    //     $unwind: "$education",
    //   },
    //   {
    //     $lookup: {
    //       from: "testscores",
    //       localField: "_id",
    //       foreignField: "studentId",
    //       as: "testscores",
    //     },
    //   },
    //   {
    //     $unwind: "$testscores",
    //   },
    //   {
    //     $project: {
    //       _id: 0, // Exclude _id from final output if not needed
    //       studentData: "$$ROOT",
    //       councellorName: "$staff.fullName",
    //       agentName: "$agent.company.companyName",
    //       education: "$education",
    //       testscore: "$testscores", // Changed from testscores to testscore
    //     },
    //   },
    //   {
    //     $addFields: {
    //       "studentData.studentInformation.counsellorName": "$councellorName",
    //       "studentData.studentInformation.staffName": "$agentName",
    //     },
    //   },
    //   {
    //     $replaceRoot: { newRoot: "$studentData" },
    //   },
    // ]);
    if (!student) throw new Error("Student not found");
    return student[0];
  }
  async getStudentGeneralInformationWithSfId(studentId) {
    const student = await StudentModel.findOne({ salesforceId: studentId });
    if (!student) throw new Error("Student not found");
    return student;
  }

  async updateStudentGeneralInformation(
    studentId,
    modifiedBy,
    studentDetails,
    isFrontend
  ) {
    try {
      if (isFrontend) {
        if (studentDetails.studentInformation) {
          await this.checkForValidUsers(
            studentDetails.studentInformation.staffId,
            studentDetails.studentInformation.counsellorId
          );
        }
      }
      if (!isFrontend) {
        const haveMedicalHistorystring =
          studentDetails?.demographicInformation?.haveMedicalHistory;
        studentDetails.demographicInformation.haveMedicalHistory =
          haveMedicalHistorystring.toLowerCase() === "yes";
        const isRefusedVisaString =
          studentDetails?.backgroundInformation?.isRefusedVisa;
        studentDetails.backgroundInformation.isRefusedVisa =
          isRefusedVisaString.toLowerCase() === "yes";
        const student = await StudentModel.findOne({ salesforceId: studentId });
        studentDetails.studentInformation["staffId"] =
          student?.studentInformation?.staffId;
        studentDetails.studentInformation["counsellorId"] =
          student?.studentInformation?.counsellorId;
      }

      const query = isFrontend
        ? { _id: studentId }
        : { salesforceId: studentId };
      // const update = {
      //   $set: {
      //     ...studentDetails,
      //     modifiedBy,
      //   },
      // };
      // const options = { new: true, runValidators: true };

      // const updatedStudent = await StudentModel.findOneAndUpdate(
      //   query,
      //   update,
      //   options
      // );

      const update = {
        $set: {
          ...studentDetails,
          modifiedBy,
        },
      };

      // Add upsert option
      const options = { new: true, runValidators: true, upsert: true };

      const updatedStudent = await StudentModel.findOneAndUpdate(
        query,
        update,
        options
      );

      if (isFrontend) {
        const studentData = this.converttoSfBody(studentDetails);
        const studentUrl = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Contact/${updatedStudent.salesforceId}`;
        const sfCompanyData = await updateDataToSF(studentData, studentUrl);
        const contactDetails = await getContactId(updatedStudent.salesforceId);
        return {
          id: updatedStudent.id,
          partnerId: contactDetails?.Student_ID__c,
        };
      } else {
        return { id: updatedStudent.id };
      }
    } catch (error) {
      console.log(error);
    }
  }

  async deleteStudent(studentId) {
    return await StudentModel.findByIdAndDelete(studentId);
  }

  getStudentEducation(studentId) {
    return this.educationService.getByStudentId(studentId);
  }

  async getStudentCounsellor(agentId) {
    return staffModel.find(
      { agentId, role: "consultant" },
      { _id: 1, fullName: 1, sfId: 1 }
    );
  }

  async addStudentEducation(studentId, modifiedBy, body) {
    try {
      const education = await this.educationService.add(
        studentId,
        modifiedBy,
        body
      );

      const checkEducationExist = await StudentModel.findById(studentId);
      let result;
      if (checkEducationExist.educations.length === 0) {
        result = await StudentModel.updateOne(
          { _id: studentId },
          {
            $push: { educations: education.id },
            $set: { modifiedBy, currentStage: 2 },
          }
        );
      } else {
        result = await StudentModel.updateOne(
          { _id: studentId },
          { $push: { educations: education.id }, $set: { modifiedBy } }
        );
      }

      if (result.modifiedCount === 0) {
        throw new Error("Student not found");
      }
      const educationData = this.convertEducationData(body);
      const educationUrl = `${process.env.SF_API_URL}services/data/v55.0/sobjects/Education__c`;
      const sfEducationResponse = await sendDataToSF(
        educationData,
        educationUrl
      );
      console.log("sfEducationResponse---", sfEducationResponse);
      if (sfEducationResponse?.id) {
        await this.educationService.updateSfId(
          education.id,
          sfEducationResponse?.id
        );
      }
      return { id: education.id, sf: sfEducationResponse };
    } catch (error) {
      console.log("error---", error);
    }
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

  // async updateStudentEducation(studentId, modifiedBy, educationId, body) {
  //   try {
  //     // Fetch education and student asynchronously
  //     const [education, student] = await Promise.all([
  //       this.educationService.getEducationFromSFID(educationId),
  //       StudentModel.findOne({ salesforceId: studentId }),
  //     ]);

  //     // Check if education and student exist
  //     if (!education || !student) {
  //       throw new Error("Education or student not found.");
  //     }

  //     // Check if the education belongs to the student
  //     const isStudent = await this.checkIfEducationBelongsToStudent(
  //       student._id,
  //       education._id
  //     );
  //     if (!isStudent) {
  //       throw new Error("Education does not belong to the student.");
  //     }

  //     const data = {
  //       institutionName: body?.Name_of_Institution__c,
  //       level: body?.Level_of_Education__c,
  //       isDegreeAwarded: body?.Degree_Awarded__c.toLowerCase() === "yes",
  //       country: body?.Country_of_Institution__c,
  //       affiliatedUniversity: body?.Affiliated_University__c,
  //       attendedFrom: body?.Attended_Institution_From__c,
  //       attendedTo: body?.Attended_Institution_To__c,
  //       degreeAwardedOn: body?.Degree_Awarded_On__c,
  //       class: body?.Class__c,
  //       // educationSfId: body?.Id,
  //       studentId: student._id,
  //       showInProfile: body?.ShowInProfile__c,
  //       degree: body?.Name,
  //     };
  //     // Update education
  //     const updatedEducation = await this.educationService.update(
  //       modifiedBy,
  //       education._id,
  //       data
  //     );

  //     // Return success response if education is updated
  //     if (updatedEducation) {
  //       return {
  //         status: 200,
  //         success: true,
  //         message: "Education updated successfully",
  //       };
  //     }
  //   } catch (error) {
  //     // Handle errors
  //     console.error("Error in updateStudentEducation:", error);
  //     throw error; // Rethrow the error for the caller to handle
  //   }
  // }

  async updateStudentEducation(studentId, modifiedBy, educationId, body) {
    try {
      // Fetch student asynchronously
      const student = await StudentModel.findOne({ salesforceId: studentId });

      // Check if student exists
      if (!student) {
        throw new Error("Student not found.");
      }

      // Helper function to get the name of the grading scheme field
      const getGradingSchemeFieldName = (body) => {
        const fields = [
          { name: "percentage", value: body?.Percentage__c },
          { name: "Grade__c", value: body?.Grade__c },
          { name: "CGPA__c", value: body?.CGPA__c },
          { name: "GPA__c", value: body?.GPA__c },
          { name: "Score__c", value: body?.Score__c },
          { name: "Class__c", value: body?.Class__c },
        ];
        // Return the name of the first non-empty value
        const foundField = fields.find(
          (field) =>
            field.value !== null &&
            field.value !== "" &&
            field.value !== undefined
        );
        return foundField ? foundField.name : null; // Return the field name or null
      };

      const gradingScheme = getGradingSchemeFieldName(body); // Get the grading scheme field name

      const data = {
        educationSfId: body?.Id,
        institutionName: body?.Name_of_Institution__c,
        level: body?.Level_of_Education__c,
        isDegreeAwarded: body?.Degree_Awarded__c
          ? body.Degree_Awarded__c.toLowerCase() === "yes"
          : false,
        country: body?.Country_of_Institution__c,
        affiliatedUniversity: body?.Affiliated_University__c,
        attendedFrom: body?.Attended_Institution_From__c,
        attendedTo: body?.Attended_Institution_To__c,
        degreeAwardedOn: body?.Degree_Awarded_On__c,
        class: body?.Class__c,
        studentId: student._id,
        showInProfile: body?.ShowInProfile__c,
        degree: body?.Name,
        gradingScheme: gradingScheme,
        cgpa: body?.CGPA__c,
        percentage: body?.Percentage__c,
        gpa: body?.GPA__c,
        score: body?.Score__c,
        grade: body?.Grade__c,
      };

      const checkEducation = await Education.findOne({
        educationSfId: educationId,
        studentId: student._id,
      });
      if (checkEducation) {
        // Update education
        const updatedEducation = await this.educationService.update(
          modifiedBy,
          checkEducation._id,
          data
        );
        return {
          status: 200,
          success: true,
          message: "Education updated successfully",
        };
      } else {
        // Create new education record
        const education = await this.educationService.add(
          student._id,
          modifiedBy,
          data
        );
        if (education) {
          const checkEducationExist = await StudentModel.findById(student._id);
          let result;
          if (checkEducationExist.educations.length === 0) {
            result = await StudentModel.updateOne(
              { _id: student._id },
              {
                $push: { educations: education.id },
                $set: { modifiedBy, currentStage: 2 },
              }
            );
          } else {
            result = await StudentModel.updateOne(
              { _id: student._id },
              { $push: { educations: education.id }, $set: { modifiedBy } }
            );
          }
        }
        return {
          status: 201,
          success: true,
          message: "Education created successfully",
        };
      }
    } catch (error) {
      // Handle errors
      console.error("Error in updateStudentEducation:", error);
      throw error; // Rethrow the error for the caller to handle
    }
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
    return student;
  }

  async addStudentWorkHistory(
    studentId,
    modifiedBy,
    body,
    agentId,
    addStudentPage
  ) {
    const student = await this.findById(studentId);
    const workHistory = await this.workHistoryService.add(
      studentId,
      modifiedBy,
      body
    );

    const checkWorkHistoryExist = await StudentModel.findById(studentId);
    let result;
    if (addStudentPage && checkWorkHistoryExist.workHistory.length === 0) {
      result = await StudentModel.updateOne(
        { _id: studentId },
        {
          $push: { workHistory: workHistory.id },
          $set: { modifiedBy, currentStage: 4, noWorkHistory: true },
        }
      );
    } else {
      result = await StudentModel.updateOne(
        { _id: studentId },
        { $push: { workHistory: workHistory.id }, $set: { modifiedBy } }
      );
    }

    if (result.modifiedCount === 0) {
      throw new Error("student not found");
    }
    const workHistoryData = this.convertWorkHistoryData(
      body,
      student?.salesforceId
    );
    console.log(workHistory);
    const workHistoryUrl = `${process.env.SF_API_URL}services/data/v55.0/sobjects/Work_history__c`;
    const sfWorkHistoryResponse = await sendDataToSF(
      workHistoryData,
      workHistoryUrl
    );
    console.log("sfWorkHistoryResponse===>", sfWorkHistoryResponse);
    if (sfWorkHistoryResponse?.id) {
      await this.workHistoryService.updateSFID(
        workHistory?.id,
        sfWorkHistoryResponse?.id
      );
    }
    return workHistory;
  }

  // async updateStudentWorkHistory(studentId, modifiedBy, workHistoryId, body) {
  //   try {
  //     // Fetch work history and student asynchronously
  //     const [workHistory, student] = await Promise.all([
  //       this.workHistoryService.getDatafromSfid(workHistoryId),
  //       StudentModel.findOne({ salesforceId: studentId }),
  //     ]);

  //     // Check if work history and student exist
  //     if (!workHistory || !student) {
  //       throw new Error("Work history or student not found.");
  //     }
  //     // Check if the work history belongs to the student
  //     const isStudent = await this.checkIfWorkHistoryBelongsToStudent(
  //       student?._id,
  //       workHistory?._id
  //     );
  //     if (!isStudent) {
  //       throw new Error("Work history does not belong to the student.");
  //     }

  //     const data = {
  //       employerName: body?.Name,
  //       studentId: student._id,
  //       contactInfo: body?.Contact_info__c,
  //       doj: body?.Date_of_Joining__c,
  //       dor: body?.Date_of_relieving__c,
  //       designation: body?.Designation__c,
  //       email: body?.Email_Id__c,
  //       "signingAuthority.email": body?.Signing_Contact_Email__c,
  //       "signingAuthority.phone": body?.Signing_Contact_Phone__c,
  //       "signingAuthority.name": body?.Signing_Contact_Name__c,
  //       signedPersonPhone: body?.Phone_Number_of_the_Signed_Person__c,
  //       signedPersonEmail: body?.Email_ID_of_the_Signed_Person__c,
  //       signedPersonName: body?.Name_of_the_Signed_Person__c,
  //       countryCode: body?.Country_Code__c,
  //       signedPersonCountryCode: body?.Signed_Country_Code__c,
  //     };
  //     // Update work history
  //     const updatedWorkHistory = await this.workHistoryService.update(
  //       modifiedBy,
  //       workHistory?._id,
  //       data
  //     );

  //     if (updatedWorkHistory) {
  //       return {
  //         status: 200,
  //         success: true,
  //         message: "Work history updated successfully",
  //       };
  //     }
  //   } catch (error) {
  //     // Handle errors
  //     console.error("Error in updateStudentWorkHistory:", error);
  //     throw error; // Rethrow the error for the caller to handle
  //   }
  // }

  async updateStudentWorkHistory(studentId, modifiedBy, workHistoryId, body) {
    try {
      // Fetch student asynchronously
      const student = await StudentModel.findOne({ salesforceId: studentId });

      // Check if student exists
      if (!student) {
        throw new Error("Student does not exist.");
      }

      // Fetch work history
      const workHistory = await this.workHistoryService.getDatafromSfid(
        workHistoryId
      );

      // Prepare the data object for both creation and update
      const data = {
        employerName: body?.Name,
        studentId: student._id,
        contactInfo: body?.Contact_info__c,
        doj: new Date(body?.Date_of_Joining__c),
        dor: new Date(body?.Date_of_relieving__c),
        designation: body?.Designation__c,
        email: body?.Email_Id__c,
        "signingAuthority.email": body?.Signing_Contact_Email__c,
        "signingAuthority.phone": body?.Signing_Contact_Phone__c,
        "signingAuthority.name": body?.Signing_Contact_Name__c,
        signedPersonPhone: body?.Phone_Number_of_the_Signed_Person__c,
        signedPersonEmail: body?.Email_ID_of_the_Signed_Person__c,
        signedPersonName: body?.Name_of_the_Signed_Person__c,
        countryCode: body?.Country_Code__c,
        signedPersonCountryCode: body?.Signed_Country_Code__c,
      };
      console.log(workHistory, "===================");

      // If work history doesn't exist, create it
      if (!workHistory) {
        data["WorkHistorySfId"] = workHistoryId;
        console.log(data);
        const newWorkHistory = await this.workHistoryService.add(
          student?._id,
          modifiedBy,
          data
        );
        if (newWorkHistory?._id) {
          await StudentModel.updateOne(
            { _id: student?._id },
            {
              $push: { workHistory: newWorkHistory?._id },
              $set: { modifiedBy },
            }
          );
        }
        return {
          status: 201,
          success: true,
          message: "Work history created successfully",
          workHistory: newWorkHistory,
        };
      }

      // Check if the work history belongs to the student
      const isStudent = await this.checkIfWorkHistoryBelongsToStudent(
        student._id,
        workHistory._id
      );
      if (!isStudent) {
        throw new Error("Work history does not belong to the student.");
      }

      // Update the existing work history
      const updatedWorkHistory = await this.workHistoryService.update(
        modifiedBy,
        workHistory._id,
        data
      );

      if (updatedWorkHistory) {
        return {
          status: 200,
          success: true,
          message: "Work history updated successfully",
          workHistory: updatedWorkHistory,
        };
      }

      // If for some reason the update fails
      return {
        status: 400,
        success: false,
        message: "Failed to update work history",
      };
    } catch (error) {
      // Handle errors
      console.error("Error in updateStudentWorkHistory:", error);
      throw error; // Rethrow the error for the caller to handle
    }
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
    try {
      const student = await StudentModel.findById(studentId);
      if (!student) {
        throw new Error("Student not found");
      }

      const workHistoryIdString = workHistoryId.toString(); // Convert ObjectId to string
      if (!student.workHistory.includes(workHistoryIdString)) {
        throw new Error("Work history does not belong to student");
      } else {
        return true;
      }
    } catch (error) {
      throw error;
    }
  }

  // async addStudentTestScore(studentId, modifiedBy, body, agentId) {
  //   console.log("yaha aya")
  //   if (body.scoreInformation.length) {
  //     for (let i = 0; i < body.scoreInformation.length; i++) {
  //       let key = body.scoreInformation[i].key;
  //       if (
  //         ["Total Percentile", "Percentile", "Total Score", ""].includes(key)
  //       ) {
  //         body.scoreInformation.push({
  //           key: "ts",
  //           value: body.scoreInformation[i].value,
  //         });
  //       }
  //     }
  //   }

  //   const testScore = await this.testScoreService.add(
  //     studentId,
  //     modifiedBy,
  //     body,
  //     agentId
  //   );
  //   const result = await StudentModel.updateOne(
  //     { _id: studentId },
  //     { $push: { testScore: testScore.id }, $set: { modifiedBy } }
  //   );

  //   if (result.modifiedCount === 0) {
  //     throw new Error("Student not found");
  //   }

  //   const testScoreSfData = this.convertTestScoreData(body);
  //   const testScoreUrl = `${process.env.SF_API_URL}services/data/v55.0/sobjects/Test_Score__c`;
  //   const testScoreSfResponse = await sendDataToSF(
  //     testScoreSfData,
  //     testScoreUrl
  //   );

  //   console.log("testScoreSfResponse: ", testScoreSfResponse);
  //   return { id: testScore.id ,sfId:testScoreSfResponse?.id};
  // }

  async deleteStudentTestScore(studentId, modifiedBy, testScoreId) {
    await this.checkIfTestScoreBelongsToStudent(studentId, testScoreId);
    await this.testScoreService.delete(testScoreId);
    return StudentModel.updateOne(
      { _id: studentId },
      { $pull: { testScore: testScoreId }, $set: { modifiedBy } }
    );
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
    const checkTestScoreExist = await StudentModel.findById(studentId);
    let result;
    if (checkTestScoreExist.testScore.length === 0) {
      result = await StudentModel.updateOne(
        { _id: studentId },
        {
          $push: { testScore: testScore.id },
          $set: { modifiedBy, currentStage: 3 },
        }
      );
    } else {
      result = await StudentModel.updateOne(
        { _id: studentId },
        { $push: { testScore: testScore.id }, $set: { modifiedBy } }
      );
    }
    if (result.modifiedCount === 0) {
      throw new Error("Student not found");
    }

    const testScoreSfData = this.convertTestScoreData(body);
    const testScoreUrl = `${process.env.SF_API_URL}services/data/v55.0/sobjects/Test_Score__c`;
    const testScoreSfResponse = await sendDataToSF(
      testScoreSfData,
      testScoreUrl
    );

    if (testScoreSfResponse?.id) {
      await this.testScoreService.updateTestScoreSfId(
        testScore?.id,
        testScoreSfResponse?.id
      );
    }
    return { id: testScore.id, sfId: testScoreSfResponse?.id };
  }

  async updateStudentTestScore(
    studentId,
    modifiedBy,
    testScoreId,
    isFrontend,
    body,
    agentId
  ) {
    try {
      // Fetch test score and student asynchronously
      let student;
      if (mongoose.isValidObjectId(studentId)) {
        student = await StudentModel.findById(studentId);
      } else {
        student = await StudentModel.findOne({ salesforceId: studentId });
      }

      // Check if student exists
      if (!student) {
        return { status: 404, error: "Student not found." };
      }

      // Determine if testScoreId is an ObjectId or a Salesforce ID
      let testScore;
      if (mongoose.isValidObjectId(testScoreId)) {
        testScore = await TestScore.findOne({
          _id: testScoreId,
          studentId: student._id,
        });
      } else {
        testScore = await TestScore.findOne({
          trfId: testScoreId,
          studentId: student._id,
        });
      }
      if (testScore) {
        const updateTestScore = await this.testScoreService.update(
          modifiedBy,
          testScore?._id,
          isFrontend,
          body,
          student._id
        );
        return {
          status: 200,
          success: true,
          message: "Test score updated successfully",
        };
      } else {
        const addTestScore = await this.testScoreService.addTestScoreFromSf(
          student._id,
          modifiedBy,
          body,
          agentId,
          testScoreId
        );
        if (addTestScore) {
          // update mongodb _id in student collection
          const checkTestScoreExist = await StudentModel.findById(student._id);
          let result;
          if (checkTestScoreExist.testScore.length === 0) {
            result = await StudentModel.updateOne(
              { _id: student._id },
              {
                $push: { testScore: addTestScore._id },
                $set: { modifiedBy, currentStage: 3 },
              }
            );
          } else {
            result = await StudentModel.updateOne(
              { _id: student._id },
              { $push: { testScore: addTestScore._id }, $set: { modifiedBy } }
            );
          }
        }
        return {
          status: 201,
          success: true,
          message: "Test score created successfully",
        };
      }
    } catch (error) {
      throw error;
    }
  }
  // updateStudentTestScore(studentId, modifiedBy, testScoreId, isFrontend, body) {
  //   return new Promise((resolve, reject) => {
  //     // Fetch test score and student asynchronously
  //     Promise.all([
  //       this.testScoreService.getTestScoreFromSfId(testScoreId),
  //       StudentModel.findOne({ salesforceId: studentId }),
  //     ])
  //       .then(([testScore, student]) => {
  //         // Check if test score and student exist
  //         if (!testScore || !student) {
  //           reject({
  //             status: 404,
  //             error: new Error("Test score or student not found."),
  //           });
  //           return;
  //         }
  //         // Check if the test score belongs to the student
  //         this.checkIfTestScoreBelongsToStudent(student?._id, testScore?._id)
  //           .then((isStudent) => {
  //             if (!isStudent) {
  //               reject({
  //                 status: 403,
  //                 error: new Error(
  //                   "Test score does not belong to the student."
  //                 ),
  //               });
  //               return;
  //             }
  //             // Update test score
  //             const studentId = student._id;
  //             this.testScoreService
  //               .update(modifiedBy, testScore?._id, isFrontend, body, studentId)
  //               .then((updatedTestScore) => {
  //                 if (!updatedTestScore) {
  //                   reject({
  //                     status: 500,
  //                     error: new Error("Test score not updated"),
  //                   });
  //                   return;
  //                 }
  //                 resolve({
  //                   status: 200,
  //                   success: true,
  //                   message: "Test score updated successfully",
  //                 });
  //               })
  //               .catch((error) => reject({ status: 500, error }));
  //           })
  //           .catch((error) => reject({ status: 500, error }));
  //       })
  //       .catch((error) => reject({ status: 500, error }));
  //   });
  // }

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
    return student;
  }

  async addStudentDocuments(studentId, modifiedBy, body) {
    const documents = await this.documentService.addDocuments(
      modifiedBy,
      studentId,
      body
    );
    const applicationId = body?.applicationId;
    let result;
    const documentIds = documents.map((document) => document.id);

    if (applicationId && body?.usedFor === "Both") {
      result = await StudentModel.updateOne(
        { _id: studentId },
        { $set: { documents: documentIds, modifiedBy } }
      );
    }
    if (!applicationId) {
      result = await StudentModel.updateOne(
        { _id: studentId },
        { $set: { documents: documentIds, modifiedBy } }
      );
    }
    if (applicationId) {
      await Application.updateOne(
        { _id: applicationId },
        { $set: { documents: documentIds, modifiedBy } }
      );
    }

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

  // async updateStudentDocument(studentId, modifiedBy, body, isFrontend, applicationId) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const student = isFrontend? await StudentModel.findById({ _id: studentId }): await StudentModel.findOne({ salesforceId: studentId });
  //       if (!student) throw "student not found";
  //       if(applicationId) {
  //         const application = isFrontend? await ApplicationModel.findById({ _id: applicationId }): await ApplicationModel.findOne({ salesforceId: applicationId });
  //         if(!application) throw "Application not found";
  //       }
  //       const document = await this.documentService.addOrUpdateStudentDocument(
  //         modifiedBy,
  //         student?._id,
  //         body,
  //         applicationId
  //       );
  //       const documentIds = document.map((document) => document.id);
  //       if (application && body?.usedFor === "Both") {
  //         result = await StudentModel.updateOne(
  //           { _id: studentId },
  //           { $set: { documents: documentIds, modifiedBy } }
  //         );
  //       }
  //       if (!applicationId) {
  //         result = await StudentModel.updateOne(
  //           { _id: studentId },
  //           { $set: { documents: documentIds, modifiedBy } }
  //         );
  //       }
  //       if (application) {
  //         await Application.updateOne(
  //           { _id: application._id },
  //           { $set: { documents: documentIds, modifiedBy } }
  //         );
  //       }

  //       if (isFrontend) {
  //         await Promise.all(
  //           document.map(async (doc) => {
  //             // let dtype = await this.documentTypeService.findById(doc.documentTypeId);
  //             const data = {
  //               Name: doc?.name,
  //               Lock_Record__c: false,
  //               Active__c: "",
  //               LatestDocumentId__c: "",
  //               ReviewRemarks__c: "",
  //               BypassDocumentation__c: false,
  //               Status__c: doc?.status,
  //               IsPublic__c: "",
  //               IsNewDoc__c: true,
  //               FileType__c: "",
  //               ExpiryDate__c: "2023-01-25",
  //               Is_Downloaded__c: false,
  //               Sequence__c: 30,
  //               Mandatory__c: doc?.mandatory,
  //               Entity_Type__c: "", //Individual,Private,Proprietor,Partnership,Trust
  //               Document_Category__c: doc?.category,
  //               ObjectType__c: doc?.objectType, //Student,Application,Agent
  //               Account__c: "",
  //               School__c: "",
  //               Student__c: student?.salesforceId,
  //               // Document_Master__c: "",
  //               Application__c: application?.salesforceId || "",
  //               Programme__c: "",
  //               Used_For__c: doc?.usedFor,
  //               S3_DMS_URL__c: doc?.url,
  //               ContentUrl__c: doc?.url,
  //             };
  //             let sfIdFound = false;
  //             for (const document of body.documents) {
  //               if (document.sfId) {
  //                 const url = `${process.env.SF_API_URL}services/data/v50.0/sobjects/DMS_Documents__c/${document.sfId}`;
  //                 const sfRes = await sendDataToSF(data, url);
  //                 sfIdFound = true; // Set the flag to true if sfId is found
  //               }
  //             }

  //             if (!sfIdFound) {
  //               const url = `${process.env.SF_API_URL}services/data/v50.0/sobjects/DMS_Documents__c`;
  //               const sfRes = await sendDataToSF(data, url);
  //               doc["sfId"] = sfRes.id;
  //               await Document.findOneAndUpdate(
  //                 { _id: doc._id },
  //                 { $set: { sfId: sfRes.id } },
  //                 { new: true }
  //               );
  //             }
  //           })
  //         );
  //       }

  //       resolve(document);
  //     } catch (error) {
  //       console.log(error);
  //       reject(error);
  //     }
  //   });
  // }

  async updateStudentDocument(
    studentId,
    modifiedBy,
    body,
    isFrontend,
    applicationId
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        const student = isFrontend
          ? await StudentModel.findById({ _id: studentId })
          : await StudentModel.findOne({ salesforceId: studentId });
        if (!student) throw "student not found";

        let applicationSalesforceId = "";

        let application = {};
        if (applicationId) {
          application = isFrontend
            ? await ApplicationModel.findById({ _id: applicationId })
            : await ApplicationModel.findOne({ salesforceId: applicationId });
          if (!application) throw "Application not found";

          applicationSalesforceId = application.salesforceId;
        }
        const document = await this.documentService.addOrUpdateStudentDocument(
          modifiedBy,
          student?._id,
          body,
          application._id
        );
        // const documentIds = document.map((document) => document.id);

        // await StudentModel.updateOne(
        //   { _id: student?._id },
        //   { $set: { documents: documentIds} }
        // );

        if (isFrontend) {
          await Promise.all(
            document.map(async (doc) => {
              // let dtype = await this.documentTypeService.findById(doc.documentTypeId);
              const data = {
                Name: doc?.name,
                Lock_Record__c: false,
                Active__c: "",
                LatestDocumentId__c: "",
                ReviewRemarks__c: "",
                BypassDocumentation__c: false,
                Status__c: "Uploaded",
                IsPublic__c: "",
                IsNewDoc__c: true,
                FileType__c: "",
                ExpiryDate__c: "2023-01-25",
                Is_Downloaded__c: false,
                Sequence__c: 30,
                Mandatory__c: doc?.mandatory,
                Entity_Type__c: "", //Individual,Private,Proprietor,Partnership,Trust
                Document_Category__c: doc?.category,
                ObjectType__c: doc?.objectType, //Student,Application,Agent
                Account__c: "",
                School__c: "",
                Student__c: student?.salesforceId,
                // Document_Master__c: "",
                Application__c: applicationSalesforceId,
                Programme__c: "",
                Used_For__c: doc?.usedFor,
                S3_DMS_URL__c: doc?.url,
                ContentUrl__c: doc?.url,
              };
              let sfIdFound = false;
              for (const document of body.documents) {
                if (document.sfId) {
                  const url = `${process.env.SF_API_URL}services/data/v50.0/sobjects/DMS_Documents__c/${document.sfId}`;
                  const sfRes = await updateDataToSF(data, url);
                  console.log("sfRes____", sfRes);
                  sfIdFound = true; // Set the flag to true if sfId is found
                }
              }

              if (!sfIdFound) {
                const url = `${process.env.SF_API_URL}services/data/v50.0/sobjects/DMS_Documents__c`;
                const sfRes = await sendDataToSF(data, url);
                console.log("sfRes___2", sfRes);
                doc["sfId"] = sfRes?.id;
                await Document.findOneAndUpdate(
                  { _id: doc._id },
                  { $set: { sfId: sfRes?.id } },
                  { new: true }
                );
              }
            })
          );
        }

        resolve(document);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  async updateApplicationDocumentService(modifiedBy, body, applicationId) {
    return new Promise(async (resolve, reject) => {
      try {
        let application = {};
        if (applicationId) {
          application = await ApplicationModel.findOne({
            salesforceId: applicationId,
          });
          if (!application) throw "Application not found";
        }
        const document = await this.documentService.addOrUpdateStudentDocument(
          modifiedBy,
          "",
          body,
          application._id
        );
        resolve(document);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  async updateStudentCurrentStage(studentId, noWorkHistory, addStudentPage) {
    return new Promise(async (resolve, reject) => {
      try {
        let currentStage;
        if (noWorkHistory && addStudentPage) {
          currentStage = 4;
        } else {
          currentStage = 5;
        }
        const student = await StudentModel.findOneAndUpdate(
          { _id: studentId },
          { $set: { currentStage, noWorkHistory: true } },
          { new: true }
        );
        resolve(student);
      } catch (error) {
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
    const student = await this.checkIfPaymentBelongsToStudent(
      studentId,
      paymentId
    );
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
    console.log("sfCompanyData--442", sfCompanyData);
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

    const taskSfData = this.convertTaskData(body);
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

  async addStudentComment(studentId, modifiedBy, body, sfId) {
    try {
      const comment = await this.commentService.add(
        body.message,
        modifiedBy,
        studentId,
        body.attachment
      );

      // Update student with the new comment
      // const result = await StudentModel.updateOne(
      //   { _id: studentId },
      //   { $push: { comments: comment.comment.id }, $set: { modifiedBy } }
      // );

      const studentData = await StudentModel.findById(studentId);
      // Check if student was found and updated
      if (!studentData) {
        throw new Error("Student not found");
      }

      const data = {
        Application__c: null,
        Student__c: studentData?.salesforceId,
        Message_Body__c: body.message,
        Type__c: "Outbound",
        Lead__c: null,
        Partner_Contact__c: sfId,
        External__c: true,
        Cases__c: null,
      };
      // Send comment data to Salesforce endpoint
      const url = `${process.env.SF_API_URL}services/data/v55.0/sobjects/NoteMark__c/`;
      const sendingComment = await sendDataToSF(data, url);
      console.log("sendingComment", sendingComment);
      if (sendingComment?.id && comment?.comment?._id) {
        await this.commentService.updateCommentSfId(
          comment?.comment?._id,
          studentData?.salesforceId
        );
      }
      return comment;
    } catch (error) {
      console.error("Error in addStudentComment:", error);
      throw error;
    }
  }

  // getStudentEducation(studentId) {
  //   return this.educationService.getByStudentId(studentId);
  // }

  getStudentWorkHistory(studentId) {
    return this.workHistoryService.getByStudentId(studentId);
  }

  getStudentTestScore(studentId) {
    return this.testScoreService.getByStudentId(studentId);
  }

  getStudentDocuments(req, studentId) {
    return this.documentService.getSfDataStudentId(req, studentId);
  }

  async getStudentPayments(studentId) {
    const payments = await this.studentPaymentService.getByStudentId(studentId);
    return this.applicationService.parsePaymentsResponse(payments);
  }

  getStudentTasks(studentId, status) {
    return this.taskService.getByStudentId(studentId, status);
  }

  async getStudentComments(studentId) {
    try {
      // const student = await StudentModel.findById(studentId);
      // console.log("sfId----", student);
      // const sfId = student?.salesforceId;
      // if (!student) throw new Error("Student not found");

      // return Promise.all(
      //   student.comments.map(async (comment) => {
      return await this.commentService.getComment(studentId);
      // })
      // );
    } catch (error) {
      console.error("Error fetching student:", error);
    }
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
    if ((student.testScore.length ? student.testScore.length : 0) > 0) {
      progress++;
    }
    if (student?.noWorkHistory === true) {
      progress++;
    }
    if (student?.currentStage === 5) {
      progress++;
    }
    return (progress / total) * 100;
  }

  async getStudentSearchData(req) {
    try {
      const { searchType, searchTerm } = req.query;
      let query;
      switch (searchType) {
        case "name":
          query = {
            $or: [
              { "studentInformation.firstName": new RegExp(searchTerm, "i") },
              { "studentInformation.middleName": new RegExp(searchTerm, "i") },
              { "studentInformation.lastName": new RegExp(searchTerm, "i") },
              {
                $expr: {
                  $regexMatch: {
                    input: {
                      $concat: [
                        "$studentInformation.firstName",
                        " ",
                        "$studentInformation.middleName",
                        " ",
                        "$studentInformation.lastName",
                      ],
                    },
                    regex: new RegExp(searchTerm, "i"),
                  },
                },
              },
            ],
          };
          break;
        case "email":
          query = { "studentInformation.email": new RegExp(searchTerm, "i") };
          break;
        case "mobile":
          query = { "studentInformation.mobile": new RegExp(searchTerm, "i") };
          break;
        case "country":
          query = { "address.country": new RegExp(searchTerm, "i") };
          break;
        case "createdBy":
          query = { createdBy: new RegExp(searchTerm, "i") };
          break;
        default:
          console.log("Invalid search type");
          return;
      }
      query.agentId = req?.user?.agentId;
      const student = await StudentModel.find(query).sort({ createdBy: -1 });
      const count = await StudentModel.countDocuments();
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
      console.log(studentList, count);
      return { studentList, count };
    } catch (error) {
      return error.message;
    }
  }

  async findById(id) {
    const student = await StudentModel.findById(id);
    if (!student) {
      throw new Error("Student not found");
    }
    return student;
  }

  async findBySFId(id) {
    const student = await StudentModel.findOne({ salesforceId: id });

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
    try {
      // Fetch staff and counsellor concurrently
      const [staff, counsellor] = await Promise.all([
        this.staffService.findByAgentId(staffId),
        this.staffService.findById(counsellorId),
      ]);

      // Check if either staff or counsellor is not found
      if (!staff || !counsellor) {
        throw new Error("Student not found");
      }

      // Return true if both staff and counsellor are found
      return true;
    } catch (error) {
      // Handle any errors that occur during the process
      console.error("Error in checkForValidUsers:", error);
      throw error;
    }
  }

  async findById(studentId) {
    const student = await StudentModel.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    return student;
  }

  async getStudentsByStudentId(studentId) {
    return StudentModel.findOne({ _id: studentId }).populate(
      "testScore educations"
    );
  }
}

module.exports = StudentService;
