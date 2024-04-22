const { v4: uuidv4 } = require("uuid");
const Intake = require("../models/Intake");
const SchoolService = require("./school.service");
const ProgramService = require("./program.service");
const SalesforceService = require("./salesforce.service");
const { MappingFiles } = require('./../constants/Agent.constants');

const IntakeStatus = {
    Closed : "Closed",
    Open : "Open",
    ClosingSoon : "Closing soon"
  }

class IntakeService {
  constructor() {
    this.intakeModel = Intake;
    this.schoolService = new SchoolService();
    this.programService = new ProgramService();
  }

  // async addIntake(id, intakeCreateDto) {
  //   const externalId = uuidv4();
  //   const intake = new this.intakeModel({ ...intakeCreateDto, createdBy: id, updatedBy: id, externalId });
  //   // sendToSF(MappingFiles.SCHOOL_intake, {
  //   //   ...intake,
  //   //   schoolId: (await this.schoolService.findById(intake.schoolId)).externalId,
  //   //   programId: (await this.programService.findById(intake.programId)).externalId,
  //   //   _user: { id }
  //   // });
  //   return intake.save();
  // }

  async addOrUpdateIntake(intakeCreateDto) {
    return new Promise(async (resolve, reject) => {
      let intakeSfId = intakeCreateDto.Id;
      try {
        const checkIntakeExist = await this.intakeModel.findOne({ Id: intakeSfId })
        if (checkIntakeExist?.Id) {
          await this.intakeModel.updateOne(
            { Id: intakeSfId },
            { $set: { ...intakeCreateDto } },
            { new: true }
          );
          return resolve({ message: "Success", status: 200, sf: intakeSfId });
        } else {
          await this.intakeModel.create({
            ...intakeCreateDto
          });
          resolve({ message: "Success", status: 201, sf: intakeSfId });
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  async findById(id) {
    const intake = await this.intakeModel.findOne({ _id: id });

    if (!intake) {
      throw new Error(`No intake found for id - ${id}`);
    }

    return intake;
  }

  // getIntakeList() {
  //   return this.intakeModel.find({});
  // }

  async getIntakeList(page, limit) {
    try {
        const skip = (page - 1) * limit;
        const intakePromise = this.intakeModel.find({}).skip(skip).limit(limit);
        const countPromise = this.intakeModel.countDocuments({});
        
        const [intakes, count] = await Promise.all([intakePromise, countPromise]);
        
        return {
            intakes,
            totalCount: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit)
        };
    } catch (error) {
        console.error("Error fetching intake list:", error);
        throw error;
    }
}


  async getOngoingIntakes() {
    const intakes = await this.intakeModel.find({ endDate: { $gte: new Date() }, $or: [
      { status: IntakeStatus.Open },
      { status: IntakeStatus.ClosingSoon }
    ] });
    return Promise.all(intakes.map(async (intake) => {
      let data = { ...intake };
      data = data["_doc"];
      data.id = data._id;
      delete data._id;
      delete data.__v;
      return {
        ...data,
        school: (await this.schoolService.findById(intake.schoolId)).basicDetails.name,
        program: (await this.programService.findById(intake.programId)).name,
      };
    }));
  }

  getIntake(programId) {
    return this.intakeModel
      .find({ programId, endDate: { $gte: new Date() } })
      .sort({ endDate: 1 })
      .limit(5);
  }
}

module.exports = IntakeService;
