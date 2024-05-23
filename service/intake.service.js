const Intake = require("../models/Intake");
const SchoolService = require("./school.service");
const ProgramService = require("./program.service");

const IntakeStatus = {
  Closed: "Closed",
  Open: "Open",
  ClosingSoon: "Closing soon",
};

class IntakeService {
  constructor() {
    this.intakeModel = Intake;
    this.schoolService = new SchoolService();
    this.programService = new ProgramService();
  }

  async addOrUpdateIntake(intakeCreateDto) {
    return new Promise(async (resolve, reject) => {
      let intakeSfId = intakeCreateDto.Id;
      try {
        const checkIntakeExist = await this.intakeModel.findOne({
          Id: intakeSfId,
        });
        if (checkIntakeExist?.Id) {
          await this.intakeModel.updateOne(
            { Id: intakeSfId },
            { $set: { ...intakeCreateDto } },
            { new: true }
          );
          return resolve({ message: "Success", status: 200, sf: intakeSfId });
        } else {
          await this.intakeModel.create({
            ...intakeCreateDto,
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
    const intake = await this.intakeModel.findOne({ Id: id });

    if (!intake) {
      throw new Error(`No intake found for id - ${id}`);
    }

    return intake;
  }

  async getIntakeList(page, limit) {
    try {
      const skip = (page - 1) * limit;
      const intakePromise = await this.intakeModel
        .find({ Status__c: "Open" })
        .skip(skip)
        .limit(limit);
      const countPromise = await this.intakeModel.countDocuments({});

      const [intakes, count] = await Promise.all([intakePromise, countPromise]);

      return {
        intakes,
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      console.error("Error fetching intake list:", error);
      throw error;
    }
  }

  async getOngoingIntakes() {
    const intakes = await this.intakeModel.find({
      endDate: { $gte: new Date() },
      $or: [
        { status: IntakeStatus.Open },
        { status: IntakeStatus.ClosingSoon },
      ],
    });
    return Promise.all(
      intakes.map(async (intake) => {
        let data = { ...intake };
        data = data["_doc"];
        data.id = data._id;
        delete data._id;
        delete data.__v;
        return {
          ...data,
          school: (await this.schoolService.findById(intake.schoolId))
            .basicDetails.name,
          program: (await this.programService.findById(intake.programId)).name,
        };
      })
    );
  }

  async getIntake(programId, page, limit) {
    try {
      const skip = (page - 1) * limit;
      const intakePromise = await this.intakeModel
        .find({ Programme__c: programId })
        .skip(skip)
        .limit(limit);

      const countPromise = await this.intakeModel.countDocuments({
        Programme__c: programId,
      });

      const [intakes, count] = await Promise.all([intakePromise, countPromise]);

      return {
        intakes,
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw error;
    }
  }
  async getUniqueIntakeList() {
    try {
      return await this.intakeModel.distinct("Name");
    } catch (error) {
      console.error("Error fetching unique intake list:", error);
      return {
        success: false,
        status: 500,
        error: "Internal Server Error",
      };
    }
  }
}

module.exports = IntakeService;
