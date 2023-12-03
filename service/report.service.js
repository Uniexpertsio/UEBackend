const ConfigService = require('./config.service');
const SalesforceService = require('./salesforce.service');
const Staff = require('../models/Staff');
const Application = require('../models/Application');
const Commission = require('../models/Commission');
const { getReportHeaders } = require('./salesforce.service');

const MONTHS = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

const MonthFilter = {
  $addFields: {
    key: {
      $let: {
        vars: {
          monthsInString: MONTHS,
        },
        in: {
          $arrayElemAt: ['$$monthsInString', '$_id'],
        },
      },
    },
  },
};

class ReportService {
  constructor() {
    this.configService = new ConfigService();
  }

  async getTotalEarning(agentId, query) {
    let group = { $month: '$createdAt' };
    let monthFilter = MonthFilter;

    if (query.time === 'YEAR') {
      group = { $year: '$createdAt' };
      monthFilter = { $addFields: { key: '$_id' } };
    }

    return Commission.aggregate([
      { $match: { agentId: agentId } },
      {
        $group: {
          _id: group,
          value: { $sum: '$commission' },
        },
      },
      monthFilter,
      { $project: { _id: 0, key: 1, value: 1 } },
    ]);
  }

  async getAgentEarning(agentId, query) {
    let group = { $month: '$createdAt' };
    let monthFilter = MonthFilter;

    if (query.time === 'YEAR') {
      group = { $year: '$createdAt' };
      monthFilter = { $addFields: { key: '$_id' } };
    }

    const staffs = await Staff.find({ agentId });
    return Promise.all(
      staffs.map(async (staff) => {
        const applications = await Application.find({ createdBy: staff.id });
        const commission = await Promise.all(
          applications.map(async (application) => {
            const c = await Commission.aggregate([
              { $match: { applicationId: application.id } },
              {
                $group: {
                  _id: group,
                  commission: { $sum: '$commission' },
                },
              },
              monthFilter,
            ]);
            return c.map((a) => a.commission).reduce((a, b) => a + b, 0);
          })
        );
        return {
          key: staff.fullName,
          value: commission.reduce((a, b) => a + b, 0),
        };
      })
    );
  }

  async getReportData(id, agentId) {
    return {
      agentApplications: await Application.find({ createdBy: id }).count(),
      thisMonthApplications: (
        await Application.aggregate([
          { $match: { agentId, createdAt: { $exists: true } } },
          {
            $redact: {
              $cond: [{ $eq: [{ $month: '$createdAt' }, new Date().getMonth() + 1] }, '$$KEEP', '$$PRUNE'],
            },
          },
        ])
      ).length,
      totalApplications: await Application.find({ agentId }).count(),
    };
  }

  async getReportType() {
    return (await this.configService.getConfig(ConfigType.REPORT_TYPE))?.value;
  }

  async getReportList() {
    return {
      AGENT_WISE_CLOSED_APPLICATIONS: '00O5g00000FqllmEAB',
      AGENT_WISE_EARNINGS: '00O5g00000FqllmEAB',
      APPLICATION_BY_BRANCH: '00O5g00000FqllmEAB',
      CLOSED_APPLICATIONS_BY_BRANCH: '00O5g00000FqllmEAB',
      COMMISSION_BY_BRANCH: '00O5g00000FqllmEAB',
      INCOMPLETE_APPLICATIONS: '00O5g00000FqllmEAB',
      STUDENT_BY_BRANCH: '00O5g00000FqllmEAB',
      STUDENT_PAYMENT_BY_BRANCH: '00O5g00000FqllmEAB',
      TOTAL_APPLICATIONS_CLOSED: '00O5g00000FqllmEAB',
      TOTAL_APPLICATIONS_OPEN: '00O5g00000FqllmEAB',
      TOTAL_COURSE_ENQUIRIES: '00O5g00000FqllmEAB',
      TOTAL_REVENUE_EARNED: '00O5g00000FqllmEAB',
    };
  }

  async getReport(agentId, body) {
    let url = 'https://uniexperts--uxuat.sandbox.my.salesforce.com/services/data/v56.0/analytics/reports/';
    let headers = await getReportHeaders();

    switch (body.type) {
      case 'AGENT_WISE_CLOSED_APPLICATIONS':
      case 'TOTAL_APPLICATIONS_CLOSED':
      case 'TOTAL_APPLICATIONS_OPEN':
      case 'AGENT_WISE_EARNINGS':
      case 'TOTAL_COURSE_ENQUIRIES':
      case 'INCOMPLETE_APPLICATIONS':
      case 'COMMISSION_BY_BRANCH':
      case 'APPLICATION_BY_BRANCH':
      case 'STUDENT_BY_BRANCH':
      case 'STUDENT_PAYMENT_BY_BRANCH':
      case 'CLOSED_APPLICATIONS_BY_BRANCH':
      case 'TOTAL_REVENUE_EARNED':
        url += this.getReportList()[body.type];
        break;
    }

    return { url, headers };
  }

  async getTotalApplicationsOpen(agentId, body) {
    const filter = {
      createdAt: {
        $gte: new Date(body.startDate).toISOString(),
        $lte: new Date(body.endDate).toISOString(),
      },
      status: { $ne: 'PROGRAM_CLOSED' },
    };

    const result = await Application.find(filter);

    const fields = [
      'applicationId',
      'studentId',
      'agentId',
      'counsellorId',
      'intakeId',
      'schoolId',
      'programId',
      'status',
      'stage',
      'stages',
      'tasks',
      'comments',
      'documents',
      'payments',
      'externalId',
      'createdBy',
      'modifiedBy',
      'processingOfficerId',
      'id',
    ];
    const opts = { fields };

    const { parse } = require('json2csv');
    return parse(result, opts);
  }

  async getTotalApplicationsClosed(agentId, body) {
    const filter = {
      createdAt: {
        $gte: new Date(body.startDate).toISOString(),
        $lte: new Date(body.endDate).toISOString(),
      },
      status: 'PROGRAM_CLOSED',
    };

    const result = await Application.find(filter);

    const fields = [
      'applicationId',
      'studentId',
      'agentId',
      'counsellorId',
      'intakeId',
      'schoolId',
      'programId',
      'status',
      'stage',
      'stages',
      'tasks',
      'comments',
      'documents',
      'payments',
      'externalId',
      'createdBy',
      'modifiedBy',
      'processingOfficerId',
      'id',
    ];
    const opts = { fields };

    const { parse } = require('json2csv');
    return parse(result, opts);
  }

  async getAgentWiseClosedApplications(agentId, body) {
    const filter = {
      agentId,
      createdAt: {
        $gte: new Date(body.startDate).toISOString(),
        $lte: new Date(body.endDate).toISOString(),
      },
      status: 'PROGRAM_CLOSED',
    };

    const result = await Application.find(filter);

    const fields = [
      'applicationId',
      'studentId',
      'agentId',
      'counsellorId',
      'intakeId',
      'schoolId',
      'programId',
      'status',
      'stage',
      'stages',
      'tasks',
      'comments',
      'documents',
      'payments',
      'externalId',
      'createdBy',
      'modifiedBy',
      'processingOfficerId',
      'id',
    ];
    const opts = { fields };

    const { parse } = require('json2csv');
    return parse(result, opts);
  }

  async getTotalRevenueEarned(agentId, body) {
    const filter = {
      agentId,
      createdAt: {
        $gte: new Date(body.startDate).toISOString(),
        $lte: new Date(body.endDate).toISOString(),
      },
    };

    const result = await Commission.find(filter);

    const fields = [
      'commissionTypeId',
      'status',
      'schoolId',
      'applicationId',
      'agentId',
      'commission',
      'commissionRate',
      'currency',
      'salesforceId',
      'externalId',
      'createdBy',
      'modifiedBy',
      'createdAt',
      'updatedAt',
      'id',
    ];
    const opts = { fields };

    const { parse } = require('json2csv');
    return parse(result, opts);
  }
}

module.exports = ReportService;
