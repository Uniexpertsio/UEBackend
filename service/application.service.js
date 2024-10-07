const uuid = require("uuid");
const SchoolService = require("./school.service");
const ProgramService = require("./program.service");
const StaffService = require("./staff.service");
const IntakeService = require("./intake.service");
const TaskService = require("./task.service");
const CommentService = require("./comment.service");
const DocumentService = require("./document.service");
const StudentPaymentService = require("./studentPayment.service");
const CurrencyService = require("./currency.service");
const Student = require("../models/Student");
const School = require("../models/School");
const Application = require("../models/Application");
const {
  sendDataToSF,
  getDataFromSF,
  updateDataToSF,
} = require("./salesforce.service");
const Agent = require("../models/Agent");
const Document = require("../models/Document");
const staffModel = require("../models/Staff");

const ApplicationStatus = {
  NEW: "New",
  ACCEPTED: "Accepted",
  PROGRAM_CLOSED: "Program Closed",
  WITHDRAWN: "Withdrawn",
  CANCELLED: "Cancelled",
  NOT_PAID: "Not Paid",
};

const ApplicationStage = {
  PRE_SUBMISSION: "Pre-Submission",
  APPLICATION_SUBMITTED: "Application Submitted",
  ACCEPTED_CONDITIONAL: "Accepted(Conditional)",
  ACCEPTED_UNCONDITIONAL: "Accepted(Unconditional)",
  PAYMENT: "Payment",
  VISA_LETTER_REQUESTED: "Visa Letter Requested",
  ADDITIONAL_DOCUMENTS_REQ: "Additional Documents Req.",
  VISA_LETTER_APPROVED: "Visa Letter Approved",
  VISA_APPLIED: "Visa Applied",
  VISA_APPROVED: "Visa Approved",
  PRE_DEPARTURE: "Pre Departure",
  POST_ARRIVAL: "Post-Arrival",
  COMMISSION: "Commission",
  REJECTED: "Rejected",
};

class ApplicationService {
  constructor() {
    this.studentModel = Student;
    this.schoolModel = School;
    this.schoolService = new SchoolService();
    this.programService = new ProgramService();
    this.staffService = new StaffService();
    this.intakeService = new IntakeService();
    this.taskService = new TaskService();
    this.commentService = new CommentService();
    this.documentService = new DocumentService();
    this.studentPaymentService = new StudentPaymentService();
    this.currencyService = new CurrencyService();
  }

  convertApplicationData(data, agentData, partnerContact) {
    const convertedData = {
      Student__c: data.studentId,
      Partner_Account__c: agentData?.commonId, // Pass agent company Id
      Partner_Contact__c: partnerContact,
      Processing_Officer__c: "",
      BDM_User__c: "", // Pass BDM user Id
      School__c: data.schoolId, // Pass School Id
      Programme__c: data.programId, // Pass programme Id
      Intake__c: data.intakeId, // Pass Intake Id
      DocumentCreated__c: true,
      Current_Stage__c: "Pre-Submission", // This will be enum please refer CAP-27 On Jira
      Source__c: "Sales",
      EntryRequirement__c: false,
    };

    return convertedData;
  }

  async addApplication(id, agentId, body, partnerContact) {
    try {
      await this.findStudentById(body.studentId);
      await this.schoolService.findBySfId(body.schoolId);
      await this.programService.findById(body.programId);
      await this.intakeService.findById(body.intakeId);
      const data = await Agent.findById(agentId);
      const externalId = uuid.v4();
      const checkApplicationExist = await Application.findOne({
        intakeId: body.intakeId,
        programId: body.programId,
        studentId: body.studentId,
      });
      if (checkApplicationExist) {
        throw { status: 409, message: `Application already exists` };
      }
      const application = await Application.create({
        ...body,
        agentId,
        modifiedBy: id,
        createdBy: id,
        externalId,
      });
      const applicationSfData = this.convertApplicationData(
        body,
        data,
        partnerContact
      );
      const applicationSfUrl = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Application__c`;
      const applicationSfResponse = await sendDataToSF(
        applicationSfData,
        applicationSfUrl
      );
      const sfId = applicationSfResponse?.id;
      const url = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Application__c/${applicationSfResponse?.id}`;
      const sfData = await getDataFromSF(url);

      if (sfId) {
        await Application.updateOne(
          { _id: application._id },
          {
            $set: {
              salesforceId: sfId,
              applicationId: sfData.Name,
              country: sfData.RecordTypeId,
            },
          },
          { new: true }
        );
      }
      application["salesforceId"] = sfId;
      application["applicationId"] = sfData?.Name;
      application["country"] = sfData?.RecordTypeId;

      return application;
    } catch (error) {
      return error;
    }
  }

  async getApplicationById(id) {
    return Application.findById(id);
  }

  async findStudentById(id) {
    const student = await this.studentModel.findOne({ salesforceId: id });
    if (!student) {
      throw Error("Student " + id + " does not exist");
    }

    return student;
  }

  async getApplications(agentId, query, role, createdBy) {
    let filter = role === "consultant" ? { createdBy } : { agentId };

    if (query.studentId) {
      const studentData = await this.studentModel.findById(query.studentId);
      filter = { ...filter, studentId: studentData.salesforceId };
    }

    if (query.status) {
      filter = { ...filter, status: query.status };
    }

    const data = await Promise.all(
      (
        await Application.find(filter)
          .skip(query.perPage * (query.pageNo - 1))
          .limit(query.perPage)
      ).map(async (application) => {
        const student = await this.findStudentById(application.studentId);
        const studentName = parseStudentName(student);
        let counsellor = "";
        if (application?.counsellorId) {
          counsellor = (
            await this.staffService.findById(application.counsellorId)
          ).fullName;
        }
        let intake = "";
        if (application?.intakeId) {
          intake = (await this.intakeService.findById(application.intakeId))
            .Name;
        }
        const school = await this.schoolService.findBySfId(
          application.schoolId
        );
        return {
          id: application?.id,
          applicationId: application?.applicationId,
          student: studentName,
          studentId: application?.studentId,
          school: school?.Name,
          schoolId: application?.schoolId,
          program: (await this.programService.findById(application.programId))
            .Name,
          programId: application?.programId,
          partner: (await this.staffService.findById(application.createdBy))
            .fullName,
          partnerId: application?.createdBy,
          counsellor,
          counsellorId: application?.counsellorId,
          intake,
          intakeId: application?.intakeId,
          status: application?.status,
          stage: application?.stage,
          createdAt: application?.createdAt,
          payments: await this.getPayments(application.id),
          currency: school?.currency,
        };
      })
    ).catch((err) => {
      console.error(err);
    });

    return {
      data: data,
      meta: {
        perPage: query.perPage,
        pageNo: query.pageNo,
        total: (await Application.find(filter)).length,
        ApplicationStatus,
      },
    };
  }

  getTasks(applicationId, status) {
    return this.taskService.getByApplicationId(applicationId, status);
  }

  async updateTask(applicationId, modifiedBy, taskId, data) {
    return this.taskService.addResponse(modifiedBy, taskId, data);
  }

  getTaskComments(applicationId, taskId) {
    return this.taskService.getComments(taskId);
  }

  async addTaskComment(studentId, taskId, id, body) {
    return this.taskService.addComment(taskId, body, id);
  }

  async getComments(applicationId) {
    const student = await Application.findById(applicationId);
    if (!student) throw new Error("student not found");

    return await this.commentService.getComment(applicationId);
  }

  async addComment(applicationId, modifiedBy, body, sfId) {
    const comment = await this.commentService.add(
      body.message,
      modifiedBy,
      applicationId,
      body.attachment
    );
    const application = await Application.findById(applicationId);
    const data = {
      Application__c: application?.salesforceId,
      Student__c: null,
      Message_Body__c: body?.message,
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
        application?.salesforceId
      );
    }
    const result = await Application.updateOne(
      { _id: applicationId },
      { $push: { comments: comment.comment.id }, $set: { modifiedBy } }
    );
    if (result.modifiedCount === 0) {
      throw new Error("Application " + applicationId + " not found");
    }
    return comment;
  }

  async getDocuments(applicationId) {
    return await this.documentService.getByUserId(applicationId);
  }

  async getApplicationCount(agentId) {
    return (await Application.find({ agentId })).length;
  }

  async getSelectedApplicationCount(agentId) {
    return (
      await Application.find({ agentId, status: ApplicationStatus.ACCEPTED })
    ).length;
  }

  getApplicationCountWithSchool() {
    return Application.aggregate([
      { $group: { _id: "$schoolId", count: { $sum: 1 } } },
    ]);
  }

  async addOrupdatePayment(applicationId, id, body) {
    const application = await this.findById(applicationId);
    const school = await this.schoolService.findById(application.schoolId);

    const payment = await this.studentPaymentService.addApplicationPayment(
      applicationId,
      application.studentId,
      application.schoolId,
      application.programId,
      id,
      body.currency,
      body
    );
    return Application.updateOne(
      { _id: applicationId },
      { $push: { payments: payment.id } }
    );
  }

  async findById(id) {
    const application = await Application.findById(id);
    if (!application) throw new Error("Application not found");
    return application;
  }

  async getPayments(applicationId) {
    // const payments = await this.studentPaymentService.getByApplicationId(applicationId);
    // return this.parsePaymentsResponse(payments);
    const application = await Application.findById(applicationId);
    if (application) {
      const url = `${process.env.SF_API_URL}services/data/v50.0/query?q=SELECT+Id,Name,School__c,Programme__c,Student__c,Amount__c,Application__c,Payment_Date__c,Status__c,CurrencyIsoCode+FROM+Payment__c+WHERE+Application__c+=+'${application?.salesforceId}'`;
      console.log(url);
      const result = await getDataFromSF(url);
      return result?.records;
    }
    throw new Error("No Application Found");
  }

  async parsePaymentsResponse(payments) {
    return Promise.all(
      payments.map(async (payment) => {
        const student = await this.findStudentById(payment.studentId);
        const studentName = parseStudentName(student);
        const school = await this.schoolService.findById(payment.schoolId);
        const application = await this.findById(payment.applicationId);
        const program = await this.programService.findById(payment.programmeId);
        return {
          id: payment?.id,
          paymentName: payment?.paymentName,
          student: studentName,
          studentId: payment?.studentId,
          school: school?.basicDetails?.name,
          schoolId: payment?.schoolId,
          application: application?.applicationId,
          applicationId: payment?.applicationId,
          program: program?.Name,
          programId: payment?.programmeId,
          amount: payment?.amount,
          currency: await this.currencyService.getCurrency(payment.currency),
          date: payment?.date,
          status: payment?.status,
        };
      })
    );
  }

  async getApplication(applicationId) {
    try {
      const application = await Application.findById(applicationId);
      const student = await this.studentModel.findOne({
        salesforceId: application.studentId,
      });
      const school = await this.schoolService.findBySfId(application.schoolId);
      const program = await this.programService.findById(application.programId);
      // const stages = await Stages.findOne({schoolId: application.schoolId});

      let processingOfficerResponse = null;
      if (application.processingOfficerId) {
        const processingOfficer = await this.staffService.findById(
          application.processingOfficerId
        );
        processingOfficerResponse = {
          id: application.processingOfficerId,
          name: processingOfficer.fullName,
          dp: processingOfficer.dp,
        };
      }

      // let stages = application.stages;
      // if (stages.length < 1) {
      //   let isCurrentStage = true;
      //   Object.values(ApplicationStage).forEach((key) => {
      //     let date = null;
      //     if (isCurrentStage) {
      //       const stage = application.stage;
      //       if (key === stage) {
      //         isCurrentStage = false;
      //       }
      //       date = application.createdAt;
      //     }
      //     stages.push({ key: key, value: date });
      //   });
      // }

      let intake = null;
      if (application.intakeId) {
        intake = await this.intakeService.findById(application.intakeId);
      }

      const url = `${process.env.SF_API_URL}services/data/v50.0/ui-api/object-info/Application__c/picklist-values/${application?.country}/Current_Stage__c`;
      const countryListFromSf = await getDataFromSF(url);

      const sfUrl = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Application__c/${application?.salesforceId}`;
      const sfData = await getDataFromSF(sfUrl);

      return {
        student: {
          id: student.id,
          name: parseStudentName(student),
          studentId: student?.salesforceId,
          email: student?.studentInformation?.email,
          mobile: student?.studentInformation?.mobile,
          dp: student?.studentInformation?.dp,
        },
        school: {
          id: school?.id,
          name: school?.Name,
          schoolId: school?.Id,
          logo: school?.Logo__c,
          currency: school?.CurrencyIsoCode,
        },
        program: {
          id: program?.id,
          name: program?.Name,
          programLevel: program?.Program_level__c,
          requiredProgramLevel: program?.Required_Level__c,
          length: program?.about?.details?.length,
          deliveryMethod: program?.Delivery_Method__c,
        },
        application: {
          id: application.id,
          applicationId: application?.applicationId,
          processingOfficer: processingOfficerResponse,
          currentStage: sfData?.Current_Stage__c,
          stages: countryListFromSf?.values,
          currency: school.currency,
        },
        intake: {
          name: intake?.Name,
        },
      };
    } catch (error) {
      console.log("errror", error);
    }
  }

  // async updateApplication(applicationSfId, body) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       // const checkApplicationExist = await Application.findOne({
  //       //   salesforceId: applicationSfId,
  //       // });
  //       // if (!checkApplicationExist) {
  //       //   return reject({
  //       //     message: `Application does not exist with ${applicationSfId}`,
  //       //   });
  //       // }
  //       const payload = {
  //         applicationId: body.Name,
  //         salesforceId: body.Id,
  //         schoolId: body.School__c,
  //         programId: body.Programme__c,
  //         status: body.Status__c,
  //         stage: body.Current_Stage__c,
  //         intakeId: body.Intake__c,
  //         studentId: body.Student__c,
  //         country: body.RecordTypeId,
  //       };
  //       await Application.updateOne(
  //         {
  //           salesforceId: applicationSfId,
  //         },
  //         { $set: payload },
  //         { upsert: true, new: true }
  //       );
  //       if (result.nModified === 0 && result.upsertedCount === 0) {
  //         // If no document was modified or created
  //         return reject({
  //           message: `Failed to update or create application with ${applicationSfId}`,
  //         });
  //       }
  //       resolve({ message: "Success", status: 200, sf: applicationSfId });
  //     } catch (error) {
  //       console.log(error);
  //       reject(error);
  //     }
  //   });
  // }

  async updateApplication(applicationSfId, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [agent, staff] = await Promise.all([
          Agent.findOne({ commonId: body?.Partner_Account__c }),
          staffModel.findOne({ sfId: body?.Partner_Contact__c }),
        ]);
        if(!agent) {
          console.log('agent not found')
          return reject({
            message: `Agent not found`,
          });
        }
        if(!staff) {
          console.log('staff not found')
          return reject({
            message: `Staff not found`,
          });
        }
  
        const agentId = agent ? agent._id : null; // Retrieve agent ID if found
        const createdBy = staff ? staff._id : null; // Retrieve staff ID if found
        const modifiedBy = staff ? staff._id : null;

        const externalId = uuid.v4();
        const payload = {
          applicationId: body?.Name,
          salesforceId: body?.Id,
          schoolId: body?.School__c,
          programId: body?.Programme__c,
          status: body?.Status__c,
          stage: body?.Current_Stage__c,
          intakeId: body?.Intake__c,
          studentId: body?.Student__c,
          country: body?.RecordTypeId,
          agentId,
          createdBy,
          modifiedBy
        };
  
        // Use upsert to add or update the document
        const result = await Application.updateOne(
          { salesforceId: applicationSfId },
          {
            $set: {
              ...payload,
              externalId,
            },
          },
          { upsert: true, new: true }
        );
  
        if (result.upsertedCount > 0) {
          return resolve({ message: "Application created successfully", status: 201, sf: applicationSfId });
        }
  
        if (result.nModified === 0) {
          return reject({
            message: `No changes made to application with ${applicationSfId}`,
          });
        }
        resolve({ message: "Application updated successfully", status: 200, sf: applicationSfId });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  async createApplicationStages() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = `${process.env.SF_API_URL}services/data/v50.0/ui-api/object-info/Application__c/`;
        const sfData = await getDataFromSF(url);

        const picklisturl = `${process.env.SF_API_URL}services/data/v50.0/ui-api/object-info/Application__c/picklist-values/${sfData}/Current_Stage__c`;
        const sfResponse = await getDataFromSF(picklisturl);

        const currentStageIndex = checkApplicationExist.stages.findIndex(
          (stage) => stage.key === requestData.Current_Stage__c
        );
        if (currentStageIndex === -1) {
          return reject({
            message: `Stage ${requestData.Current_Stage__c} not found`,
          });
        }

        checkApplicationExist.stages[currentStageIndex].value = new Date();

        checkApplicationExist.stages[0].value = checkApplicationExist.createdAt;

        await checkApplicationExist.save();
        resolve({ message: "Success", status: 200, sf: applicationSfId });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  getPaidApplications(agentId, year) {
    const MonthFilter = {
      $addFields: {
        key: {
          $let: {
            vars: {
              monthsInString: MONTHS,
            },
            in: {
              $arrayElemAt: ["$$monthsInString", "$_id"],
            },
          },
        },
      },
    };
    return Application.aggregate([
      { $match: { agentId: agentId, createdAt: { $exists: true } } },
      {
        $redact: {
          $cond: [
            { $eq: [{ $year: "$createdAt" }, parseInt(year.toString())] },
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

  async createApplicationFromSf(id, agentId, body) {
    try {
      await this.findStudentById(body.Student__c);
      await this.schoolService.findBySfId(body.School__c);
      await this.programService.findById(body.Programme__c);
      await this.intakeService.findById(body.Intake__c);

      const externalId = uuid.v4();
      const checkApplicationExist = await Application.findOne({
        intakeId: body.Intake__c,
        programId: body.Programme__c,
        studentId: body.Student__c,
      });
      if (checkApplicationExist) {
        throw { status: 409, message: `Application already exists` };
      }
      const payload = {
        applicationId: body.Name,
        salesforceId: body.Id,
        schoolId: body.School__c,
        programId: body.Programme__c,
        status: body.Status__c,
        stage: body.Current_Stage__c,
        intakeId: body.Intake__c,
        studentId: body.Student__c,
        country: body.RecordTypeId,
      };
      const application = await Application.create({
        ...payload,
        agentId,
        modifiedBy: id,
        createdBy: id,
        externalId,
      });
      if (!application) {
        throw new Error("Application not created");
      }

      return {
        message: "Application created successfully",
        Id: body.Id,
        status: 200,
      };
    } catch (error) {
      return error;
    }
  }

  async addApplicationDocuments(modifiedBy, applicationId, body, isFrontend) {
    try {
      // Find the application
      const checkApplication = isFrontend
        ? await Application.findById({ _id: applicationId })
        : await Application.findOne({ salesforceId: applicationId });
      if (!checkApplication) throw "Application not found";

      // Add or update application document
      const document =
        await this.documentService.addOrUpdateApplicationDocument(
          modifiedBy,
          checkApplication?._id,
          body
        );

      // Update Salesforce if it's a frontend request
      if (isFrontend) {
        await Promise.all(
          document.map(async (doc) => {
            const data = {
              Name: doc?.name,
              Lock_Record__c: false,
              Active__c: "",
              LatestDocumentId__c: "",
              ReviewRemarks__c: "",
              BypassDocumentation__c: false,
              Status__c: doc?.status,
              IsPublic__c: "",
              IsNewDoc__c: true,
              FileType__c: "",
              Is_Downloaded__c: false,
              Sequence__c: 30,
              Mandatory__c: doc?.mandatory,
              Entity_Type__c: "",
              ObjectType__c: doc?.objectType,
              Account__c: "",
              School__c: "",
              Student__c: "",
              Application__c: checkApplication?.salesforceId,
              Programme__c: "",
              Used_For__c: doc?.usedFor,
              S3_DMS_URL__c: doc?.url,
              ContentUrl__c: doc?.url,
            };

            // Check if there's an existing Salesforce ID
            const existingDocument = body.documents.find(
              (document) => document.sfId
            );

            if (existingDocument) {
              // Update existing Salesforce document
              const url = `${process.env.SF_API_URL}services/data/v50.0/sobjects/DMS_Documents__c/${existingDocument.sfId}`;
              await updateDataToSF(data, url);
            } else {
              // Create new Salesforce document
              const url = `${process.env.SF_API_URL}services/data/v50.0/sobjects/DMS_Documents__c`;
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
      }

      return document;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

function parseStudentName(student) {
  let studentName = student.studentInformation.firstName;
  if (
    student.studentInformation.middleName &&
    student.studentInformation.middleName.length > 0
  ) {
    studentName += ` ${student.studentInformation.middleName}`;
  }
  studentName += ` ${student.studentInformation.lastName}`;
  return studentName;
}

module.exports = ApplicationService;
