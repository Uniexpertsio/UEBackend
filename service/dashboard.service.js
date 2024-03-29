const ConfigService = require("./config.service");
const IntakeService = require("./intake.service");
const ApplicationService = require("./application.service");
const PaymentService = require("./payment.service");
const StudentService = require("./student.service");
const SchoolService = require("./school.service");
const ProgramService = require("./program.service");
const InterviewService = require("./interview.service");

class DashboardService {
  constructor() {
    this.configService = new ConfigService();
    this.intakeService = new IntakeService();
    this.applicationService = new ApplicationService();
    this.paymentService = new PaymentService();
    this.studentService = new StudentService();
    this.schoolService = new SchoolService();
    this.programService = new ProgramService();
    this.interviewService = new InterviewService();
  }

  async getBanners() {
    const bannersConfig = await this.configService.getConfig("DASHBOARD_BANNERS");
    return bannersConfig.value;
  }

  getIntakes() {
    return this.intakeService.getOngoingIntakes();
  }

  async getCount(agentId) {
    return {
      application: await this.applicationService.getApplicationCount(agentId),
      acceptedApplication: await this.applicationService.getSelectedApplicationCount(agentId),
      payments: await this.paymentService.getPaymentsCount(agentId),
      student: await this.studentService.getStudentCount(agentId),
    };
  }

  async getTopSchools() {
    return Promise.all(
      (await this.applicationService.getApplicationCountWithSchool()).map(async (school) => {
        return {
          name: (await this.schoolService.findById(school._id)).basicDetails.name,
          count: school.count,
        };
      })
    );
  }

  getRecentPrograms() {
    return this.programService.getRecentPrograms();
  }

  async getInterviews(id) {
    const interviews = await this.interviewService.getPartnerUpcomingInterviews(id, {});
    const dates = [];

    for (const interview of interviews) {
      const date = interview.startTime.toDateString();
      if (!dates.includes(date)) {
        dates.push(date);
      }
    }

    return dates.map((date) => {
      return {
        date,
        interviews: interviews.filter((interview) => interview.startTime.toDateString() === date),
      };
    });
  }

  getReport(agentId, query) {
    if (query.type === "PAID_APPLICATION") {
      return this.applicationService.getPaidApplications(agentId, query.year);
    } else {
      return this.studentService.getPaidStudents(agentId, query.year);
    }
  }
}

module.exports = DashboardService;
