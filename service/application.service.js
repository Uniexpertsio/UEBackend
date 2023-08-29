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

const ApplicationStatus = {
    NEW : "New",
    ACCEPTED : "Accepted",
    PROGRAM_CLOSED : "Program Closed",
    WITHDRAWN : "Withdrawn",
    CANCELLED : "Cancelled",
    NOT_PAID : "Not Paid",
  }

const ApplicationStage = {
    PRE_SUBMISSION : "Pre-Submission",
    APPLICATION_SUBMITTED : "Application Submitted",
    ACCEPTED_CONDITIONAL : "Accepted(Conditional)",
    ACCEPTED_UNCONDITIONAL : "Accepted(Unconditional)",
    PAYMENT : "Payment",
    VISA_LETTER_REQUESTED : "Visa Letter Requested",
    ADDITIONAL_DOCUMENTS_REQ : "Additional Documents Req.",
    VISA_LETTER_APPROVED : "Visa Letter Approved",
    VISA_APPLIED : "Visa Applied",
    VISA_APPROVED : "Visa Approved",
    PRE_DEPARTURE : "Pre Departure",
    POST_ARRIVAL : "Post-Arrival",
    COMMISSION : "Commission",
    REJECTED : "Rejected",
  }

class ApplicationService {
  constructor() { 
    this.studentModel = Student;
    this.schoolModel = School;
    this.schoolService= new SchoolService();
    this.programService= new ProgramService();
    this.staffService= new StaffService();
    this.intakeService= new IntakeService();
    this.taskService= new TaskService();
    this.commentService= new CommentService();
    this.documentService= new DocumentService();
    this.studentPaymentService= new StudentPaymentService();
    this.currencyService= new CurrencyService();
  }

  async addApplication(id, agentId, body) {
    let applicationCount = 1;
    try {
      let x = await this.applicationModel.find({}, {
        projection: {
          'applicationId': 1,
          '_id': 0
        },
        sort: {
          'applicationId': -1
        },
        limit: 1
      });
      applicationCount = +((x[0].applicationId).split('-'))[1];
    } catch (error) {
      console.log('new Application');
    }
    applicationCount = (applicationCount + 1).toString().padStart(6, "0");

    await this.findStudentById(body.studentId);
    await this.schoolService.findById(body.schoolId);
    await this.programService.findById(body.programId);
    await this.intakeService.findById(body.intakeId);

    const externalId = uuid.v4();
    return this.applicationModel.create({ ...body, agentId, modifiedBy: id, createdBy: id, externalId, applicationId: `A-${applicationCount}` });
  }

  async findStudentById(id) {
    const student = await this.studentModel.findById(id);

    if (!student) {
      throw Error("Student " + id + " does not exist");
    }

    return student;
  }

  async getApplications(agentId, query) {
    let filter = { agentId };

    if (query.studentId) {
      filter = { ...filter, studentId: query.studentId };
    }

    if (query.status) {
      filter = { ...filter, status: query.status };
    }

    const data = await Promise.all(
      (
        await this.applicationModel
          .find(filter)
          .skip(query.perPage * (query.pageNo - 1))
          .limit(query.perPage)
      ).map(async (application) => {
        const student = await this.findStudentById(application.studentId);
        const studentName = parseStudentName(student);
        let counsellor = "";
        if (application.counsellorId) {
          counsellor = (await this.staffService.findById(application.counsellorId)).fullName;
        }
        let intake = "";
        if (application.intakeId) {
          intake = (await this.intakeService.findById(application.intakeId)).name;
        }
        const school = await this.schoolService.findById(application.schoolId);
        return {
          id: application.id,
          applicationId: application.applicationId,
          student: studentName,
          studentId: application.studentId,
          school: school.basicDetails.name,
          schoolId: application.schoolId,
          program: (await this.programService.findById(application.programId)).name,
          programId: application.programId,
          partner: (await this.staffService.findById(application.createdBy)).fullName,
          partnerId: application.createdBy,
          counsellor,
          counsellorId: application.counsellorId,
          intake,
          intakeId: application.intakeId,
          status: application.status,
          stage: application.stage,
          createdAt: application.createdAt,
          payments: await this.getPayments(application.id),
          currency: school.currency,
        };
      })
    ).catch(err => {
      console.error(err);
    });

    return {
      data: data,
      meta: {
        perPage: query.perPage,
        pageNo: query.pageNo,
        total: (await this.applicationModel.find(filter)).length,
        ApplicationStatus
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
    const student = await this.applicationModel.findById(applicationId);
    if (!student) throw new Error("student not found");

    return Promise.all(
      student.comments.map(async (comment) => {
        return await this.commentService.getComment(comment);
      })
    );
  }

  async addComment(applicationId, modifiedBy, body) {
    const comment = await this.commentService.add(body.message, modifiedBy, applicationId, body.attachment);

    const result = await this.applicationModel.updateOne(
      { _id: applicationId },
      { $push: { comments: comment.comment.id }, $set: { modifiedBy } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Application " + applicationId +" not found");
    }

    return comment;
  }

  getDocuments(applicationId) {
    return this.documentService.getByUserId(applicationId);
  }

  async getApplicationCount(agentId) {
    return (await this.applicationModel.find({ agentId })).length;
  }

  async getSelectedApplicationCount(agentId) {
    return (await this.applicationModel.find({ agentId, status: ApplicationStatus.ACCEPTED })).length;
  }

  getApplicationCountWithSchool() {
    return this.applicationModel.aggregate([{ $group: { _id: "$schoolId", count: { $sum: 1 } } }]);
  }

  async addPayment(applicationId, id, body) {
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
    return this.applicationModel.updateOne({ _id: applicationId }, { $push: { payments: payment.id } });
  }

  async findById(id) {
    const application = await this.applicationModel.findById(id);
    if (!application) throw new Error("Application not found");
    return application;
  }

  async getPayments(applicationId) {
    const payments = await this.studentPaymentService.getByApplicationId(applicationId);
    return this.parsePaymentsResponse(payments);
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
          id: payment.id,
          paymentName: payment.paymentName,
          student: studentName,
          studentId: payment.studentId,
          school: school.basicDetails.name,
          schoolId: payment.schoolId,
          application: application.applicationId,
          applicationId: payment.applicationId,
          program: program.name,
          programId: payment.programmeId,
          amount: payment.amount,
          currency: await this.currencyService.getCurrency(payment.currency),
          date: payment.date,
          status: payment.status,
        };
      })
    );
  }

  async getApplication(applicationId) {
    const application = await this.findById(applicationId);
    const student = await this.findStudentById(application.studentId);
    const school = await this.schoolService.findById(application.schoolId);
    const program = await this.programService.findById(application.programId);

    let processingOfficerResponse = null;
    if (application.processingOfficerId) {
      const processingOfficer = await this.staffService.findById(application.processingOfficerId);
      processingOfficerResponse = {
        id: application.processingOfficerId,
        name: processingOfficer.fullName,
        dp: processingOfficer.dp,
      };
    }

    let stages = application.stages;
    if (stages.length < 1) {
      let isCurrentStage = true;
      Object.values(ApplicationStage).forEach((key) => {
        let date = null;
        if (isCurrentStage) {
          const stage = application.stage;
          if (key === stage) {
            isCurrentStage = false;
          }
          date = application.createdAt;
        }
        stages.push({ key: key, value: date });
      });
    }

    let intake = null;
    if (application.intakeId) {
      intake = await this.intakeService.findById(application.intakeId);
    }

    return {
      student: {
        id: student.id,
        name: parseStudentName(student),
        studentId: student.salesforceId,
        email: student.studentInformation.email,
        mobile: student.studentInformation.mobile,
        dp: student.studentInformation.dp,
      },
      school: {
        id: school.id,
        name: school.basicDetails.name,
        schoolId: school.basicDetails.schoolId,
        logo: school.basicDetails.logo,
      },
      program: {
        id: program.id,
        name: program.name,
        programLevel: program.about.details.programLevel,
        requiredProgramLevel: program.about.details.requiredProgramLevel,
        length: program.about.details.length,
        deliveryMethod: program.deliveryMethod,
      },
      application: {
        id: application.id,
        applicationId: application.applicationId,
        processingOfficer: processingOfficerResponse,
        stage: application.stage,
        stages,
        currency: school.currency,
      },
      intake,
    };
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
    return this.applicationModel.aggregate([
      { $match: { agentId: agentId, createdAt: { $exists: true } } },
      {
        $redact: {
          $cond: [{ $eq: [{ $year: "$createdAt" }, parseInt(year.toString())] }, "$$KEEP", "$$PRUNE"],
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
}

function parseStudentName(student) {
  let studentName = student.studentInformation.firstName;
  if (student.studentInformation.middleName && student.studentInformation.middleName.length > 0) {
    studentName += ` ${student.studentInformation.middleName}`;
  }
  studentName += ` ${student.studentInformation.lastName}`;
  return studentName;
}

module.exports = ApplicationService;
