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
      let intakeId = intakeCreateDto.Intake_Id__c;
      try {
        const checkIntakeExist = await this.intakeModel.findOne({ Intake_Id__c: intakeId })
        if (checkIntakeExist?.Intake_Id__c) {
          await this.intakeModel.updateOne(
            { Intake_Id__c: intakeId },
            { $set: { ...intakeCreateDto } },
            { new: true }
          );
          return resolve({ message: "Success", status: 200, sf: intakeId });
        } else {
          await this.intakeModel.create({
            ...intakeCreateDto
          });
          resolve({ message: "Success", status: 201, sf: intakeId });
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  async findById(id) {
    const intake = await this.intakeModel.findOne({ Intake_Id__c: id });

    if (!intake) {
      throw new Error(`No intake found for id - ${id}`);
    }

    return intake;
  }

  getIntakeList() {
    return this.intakeModel.find({});
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
