const uuid = require("uuid");
const StaffService = require("./staff.service")
const SchoolService = require("./school.service")
const ApplicationService = require("./application.service")

const Commission = require("../models/Commission"); // Assuming you have a Commission model defined

class CommissionService {
  constructor() {
    this.schoolService = new SchoolService();
    this.commissionTypeService = commissionTypeService;
    this.applicationService = new ApplicationService();
    this.staffService = new StaffService();
  }

  async createCommission(modifiedBy, agentId, body) {
    await this.schoolService.findById(body.schoolId);
    await this.commissionTypeService.findTypeById(body.commissionTypeId);
    await this.applicationService.findById(body.applicationId);
    const externalId = uuid.v4();
    const commission = new Commission({ ...body, agentId, modifiedBy, createdBy: modifiedBy, externalId });
    await commission.save();
    return commission.toObject();
  }

  async getCommission(agentId, query) {
    let filter = { agentId };

    if (query.startDate && query.endDate) {
      filter = {
        agentId,
        createdAt: {
          $gte: new Date(query.startDate).toISOString(),
          $lte: new Date(query.endDate).toISOString(),
        },
      };
    }

    const perPage = parseInt(query.perPage) || 10;
    const pageNo = parseInt(query.pageNo) || 1;

    const commissions = await Commission.find(filter)
      .skip(perPage * (pageNo - 1))
      .limit(perPage);

    const total = await Commission.find(filter).countDocuments();

    return {
      data: await this.mapCommissions(commissions),
      meta: {
        perPage,
        pageNo,
        total,
      },
    };
  }

  async mapCommissions(commissions) {
    return Promise.all(
      commissions.map(async (commission) => {
        const type = await this.commissionTypeService.findTypeById(commission.commissionTypeId);
        const school = await this.schoolService.findById(commission.schoolId);
        const application = await this.applicationService.findById(commission.applicationId);
        const createdBy = await this.staffService.findById(commission.createdBy);
        const modifiedBy = await this.staffService.findById(commission.modifiedBy);
        return {
          id: commission._id,
          name: commission.salesforceId,
          type: type,
          slabs: await Promise.all(
            type.commissionSlabIds.map(async (id) => await this.commissionTypeService.findSlabById(id))
          ),
          status: commission.status,
          school: {
            id: commission.schoolId,
            name: school.basicDetails.name,
          },
          application: {
            id: commission.applicationId,
            name: application.applicationId,
          },
          commission: commission.commission,
          commissionRate: commission.commissionRate,
          currency: commission.currency,
          createdBy: {
            id: commission.createdBy,
            name: createdBy.fullName,
          },
          modifiedBy: {
            id: commission.modifiedBy,
            name: modifiedBy.fullName,
          },
          createdAt: commission.createdAt,
          updatedAt: commission.updatedAt,
        };
      })
    );
  }
}

module.exports = CommissionService;
