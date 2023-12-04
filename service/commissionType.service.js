const uuid = require("uuid");
const SchoolService = require("./school.service");
const ProgramService = require("./program.service");
const IntakeService = require("./intake.service");
const StaffService = require("./staff.service");


const CommissionType = require("../models/CommissionType");
const CommissionSlab = require("../models/CommissionSlab");

class CommissionTypeService {
  constructor() {
    this.schoolService = new SchoolService();
    this.programService = new ProgramService();
    this.intakeService = new IntakeService();
    this.staffService = new StaffService();
  }

  async findTypeById(id) {
    const type = await CommissionType.findById(id);
    if (!type) {
      throw new new Error();
    }
    return type;
  }

  async findSlabById(id) {
    const slab = await CommissionSlab.findById(id);
    if (!slab) {
      throw new new Error();
    }
    return slab;
  }

  async addCommissionType(modifiedBy, body) {
    await this.schoolService.findById(body.schoolId);
    await this.programService.findById(body.programId);
    await this.intakeService.findById(body.intakeId);
    const externalId = uuid.v4();
    return CommissionType.create({ ...body, modifiedBy, createdBy: modifiedBy, externalId });
  }

  async addCommissionSlab(modifiedBy, body) {
    await this.findTypeById(body.commissionTypeId);
    const externalId = uuid.v4();
    const slab = await CommissionSlab.create({ ...body, modifiedBy, createdBy: modifiedBy, externalId });
    return CommissionType.updateOne(
      { _id: body.commissionTypeId },
      { $push: { commissionSlabIds: slab.id } }
    );
  }

  async getCommissionType(agentId, query) {
    let filter = {};

    if (query.schoolId) {
      filter = {
        schoolId: query.schoolId,
      };
    }

    const commissionTypes = await CommissionType.find(filter);
    let result = commissionTypes;
    commissionTypes.forEach((type) => {
      if (type.agentId === agentId) {
        result = result.filter(
          (t) =>
            type.schoolId !== t.schoolId ||
            type.programId !== t.programId ||
            type.intakeId !== t.intakeId ||
            type.agentId === t.agentId
        );
      }
    });

    return Promise.all(result.map(async (type) => await this.parseCommissionType(type)));
  }

  async parseCommissionType(data) {
    data = data["_doc"];
    data.id = data._id;
    const school = await this.schoolService.findById(data.schoolId);
    const program = await this.programService.findById(data.programId);
    const intake = await this.intakeService.findById(data.intakeId);
    const createdBy = await this.staffService.findById(data.createdBy);
    const modifiedBy = await this.staffService.findById(data.modifiedBy);

    delete data._id;
    delete data.__v;
    delete data.schoolId;
    delete data.programId;
    delete data.intakeId;
    return {
      ...data,
      school: {
        id: school.id,
        name: school.basicDetails.name,
      },
      program: {
        id: program.id,
        name: program.name,
      },
      intake: intake,
      createdBy: {
        id: modifiedBy.id,
        name: createdBy.fullName,
      },
      modifiedBy: {
        id: modifiedBy.id,
        name: modifiedBy.fullName,
      },
      slabs: await Promise.all(data.commissionSlabIds.map(async (id) => await this.findSlabById(id))),
    };
  }
}

module.exports = CommissionTypeService;
