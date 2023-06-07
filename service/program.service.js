const { v4: uuid } = require("uuid");
const Program = require("../models/Program");
const School = require("../models/School");
const Intake = require("../models/Intake");
const Student = require("../models/Student");
const Currency = require("../models/Currency");
const TestScore = require("../models/TestScore");
const SchoolService = require("../service/school.service");
// const SalesforceService = require("src/salesforce/salesforce.service");
// const { MappingFiles } = require("src/salesforce/salesforce.enum");

class ProgramService {
  constructor() {
    this.programModel = Program;
    this.schoolModel = School;
    this.intakeModel = Intake;
    this.studentModel = Student;
    this.currencyModel = Currency;
    this.testScoreModel = TestScore;
    this.schoolService = new SchoolService();
    //this.salesforceService = SalesforceService;
  }

  async getProgram(programId) {
    let data = { ...(await this.programModel.findById(programId)) };
    return this.parseProgram(data);
  }

  async parseProgram(data) {
    data = data["_doc"];
    data.id = data._id;

    const school = await this.schoolModel.findById(data.schoolId);
    const currency = await this.currencyModel.findOne({ symbol: school?.currency });

    delete data._id;
    delete data.__v;
    return {
      ...data,
      currency,
      intakes: await this.getLast5Intakes(data.id),
    };
  }

  getLast5Intakes(programId) {
    return this.intakeModel
      .find({ programId, endDate: { $gte: new Date() } })
      .sort({ endDate: 1 })
      .limit(5);
  }

  async createProgram(id, schoolId, programCreateDto) {
    const externalId = uuid();
    const program = await this.programModel.create({
      ...programCreateDto,
      modifiedBy: id,
      createdBy: id,
      externalId,
      schoolId,
    });
    await this.schoolModel.updateOne(
      { _id: schoolId },
      { $push: { programmes: program._id }, $set: { modifiedBy: id } }
    );
    // this.salesforceService.sendToSF(MappingFiles.SCHOOL_programme, {
    //   ...program,
    //   schoolId: (await this.schoolService.findById(program.schoolId)).externalId,
    //   _user: { id }
    // });
    return { id: program._id };
  }

  getSortingMap() {
    return {
      SchoolRank: { schoolRank: 1 },
      Commission: { "about.cost.commission": 1 },
      TuitionFeeHigh: { "about.cost.tuitionFees": -1 },
      TuitionFeeLow: { "about.cost.tuitionFees": 1 },
      ApplicationFeeHigh: { "about.cost.applicationFees": -1 },
      ApplicationFeeLow: { "about.cost.applicationFees": 1 },
    };
  }

  async searchProgram(programFilterDto) {
    let schoolFilter = {};
    let programFilter = {};

    if (programFilterDto.eligibilityFilter) {
      if (programFilterDto.eligibilityFilter.studentId) {
        // it's just being used to fill the other fields in filter and looks of no use here
      }
      if (programFilterDto.eligibilityFilter.hasValidVisa) {
        //both program and school does not have this field so not considering here
      }
      if (programFilterDto.eligibilityFilter.nationality) {
        //both program and school does not have this field so not considering here
      }
      if (programFilterDto.eligibilityFilter.educationCountry) {
        //both program and school does not have this field so not considering here
      }
      if (programFilterDto.eligibilityFilter.gradingScheme) {
        //both program and school does not have this field so not considering here
      }
      if (programFilterDto.eligibilityFilter.examType) {
        //both program and school does not have this field so not considering here
      }
      if (programFilterDto.eligibilityFilter.marks && programFilterDto.eligibilityFilter.marks.length > 0) {
        //both program and school does not have this field so not considering here
      }
      if (programFilterDto.eligibilityFilter.shouldShowOnlyDirect) {
        //both program and school does not have this field so not considering here
      }
    }

    if (programFilterDto.schoolFilter) {
      if (programFilterDto.schoolFilter.preferredCountry) {
        schoolFilter = {
          ...schoolFilter,
          "address.country": { $regex: programFilterDto.schoolFilter.preferredCountry, $options: "i" },
        };
      }
      if (programFilterDto.schoolFilter.state && programFilterDto.schoolFilter.state.length > 0) {
        schoolFilter = {
          ...schoolFilter,
          "address.state": { $in: programFilterDto.schoolFilter.state },
        };
      }
      if (programFilterDto.schoolFilter.schoolIds && programFilterDto.schoolFilter.schoolIds.length > 0) {
        schoolFilter = {
          ...schoolFilter,
          _id: { $in: programFilterDto.schoolFilter.schoolIds },
        };
      }
      if (programFilterDto.schoolFilter.schoolType && programFilterDto.schoolFilter.schoolType.length > 0) {
        schoolFilter = {
          ...schoolFilter,
          "about.details.schoolType": { $in: programFilterDto.schoolFilter.schoolType },
        };
      }
    }

    if (programFilterDto.programFilters) {
      if (programFilterDto.programFilters.programLevels && programFilterDto.programFilters.programLevels.length > 0) {
        programFilter = {
          ...programFilter,
          "about.details.programLevel": { $in: programFilterDto.programFilters.programLevels },
        };
      }
      if (programFilterDto.programFilters.intakeId) {
        const intake = await this.intakeModel.findById(programFilterDto.programFilters.intakeId);
        const program = intake?.programId;
        programFilter = {
          ...programFilter,
          _id: program,
        };
      }
      if (programFilterDto.programFilters.discipline?.length && programFilterDto.programFilters.discipline.length > 0) {
        programFilter = {
          ...programFilter,
          discipline: {
            $in: programFilterDto.programFilters.discipline,
          },
        };
      }
      if (
        programFilterDto.programFilters.subDiscipline?.length &&
        programFilterDto.programFilters.subDiscipline.length > 0
      ) {
        programFilter = {
          ...programFilter,
          subDiscipline: {
            $in: programFilterDto.programFilters.subDiscipline,
          },
        };
      }
      if (programFilterDto.programFilters.showCommission) {
        // not sure what to do with this
      }
      if (programFilterDto.programFilters.tuitionFee) {
        programFilter = {
          ...programFilter,
          "about.cost.tuitionFees": { $lte: programFilterDto.programFilters.tuitionFee },
        };
      }
      if (programFilterDto.programFilters.applicationFee) {
        programFilter = {
          ...programFilter,
          "about.cost.applicationFees": { $lte: programFilterDto.programFilters.applicationFee },
        };
      }
      if (programFilterDto.programFilters.includeLivingCost) {
        // bigger change
      }
    }

    if (Object.keys(schoolFilter).length && Object.keys(programFilter).length) {
      programFilter = {
        ...programFilter,
        isRecommended: true,
      };
    }

    let sort = {};
    if (programFilterDto.sortBy) {
      sort = this.getSortingMap()[programFilterDto.sortBy] || {};
    }

    try {
      const schools = await this.schoolModel.find(schoolFilter).sort(sort);
      const programs = await this.programModel.find(programFilter);
      const programsIds = programs.map((p) => p.id);

      return this.createProgramSchoolResponse(schools, programsIds, sort);
    } catch (ex) {
      throw new Error(
        "please verify the filters, hint: check if you're providing a valid id for school and programs"
      );
    }

  }

  async findById(id) {
    const program = await this.programModel.findById(id);

    if (!program) {
      throw new Error(`No program found for id - ${id}`);
    }

    return program;
  }

  async getProgramByCountryAndDiscipline(countryDisciplineFilter) {
    let filter = {};

    if (countryDisciplineFilter.country) {
      filter = {
        ...filter,
        country: { $regex: countryDisciplineFilter.country },
      };
    }

    if (countryDisciplineFilter.discipline) {
      filter = {
        ...filter,
        discipline: { $in: countryDisciplineFilter.discipline },
      };
    }

    let sort = {};
    if (countryDisciplineFilter.sortBy) {
      sort = this.getSortingMap()[countryDisciplineFilter.sortBy] || {};
    }

    const programs = await this.programModel.find(filter);
    const programsIds = programs.map((p) => p.id);
    const schools = await this.schoolModel.find({}).sort(sort);

    return this.createProgramSchoolResponse(schools, programsIds, sort);
  }

  async createProgramSchoolResponse(schools, programsIds, sort = {}) {
    const parsedSchools = await this.schoolService.parseSchoolList(schools);
    const response = await Promise.all(
      parsedSchools.map(async (school) => {
        const programIdsAvailable = programsIds.filter((pid) => school.programmes.includes(pid));
        const programs = await this.programModel.find({ _id: { $in: programIdsAvailable } }).sort(sort);
        return {
          school,
          programs: await Promise.all(programs.map(async (program) => await this.parseProgram(program))),
        };
      })
    );

    return response.filter((res) => res.programs.length);
  }

  getRecentPrograms() {
    return this.programModel.find({}).sort({ createdAt: 1 });
  }

  async getPrograms(schoolId) {
    const school = await this.schoolModel.findById(schoolId);
    if (!school) {
      throw new Error("School width id: " + schoolId + " not found");
    }

    return Promise.all(school.programmes.map(async (id) => await this.getProgram(id)));
  }

  async getSimilarProgram(programId) {
    const program = await this.programModel.findById(programId);
    if (!program) throw new Error();
    const filter = {
      discipline: { $in: program.discipline },
      subDiscipline: { $in: program.subDiscipline },
    };

    const schools = await this.schoolModel.find({});
    const programs = await this.programModel.find(filter);
    const programsIds = programs.map((p) => p.id);

    return this.createProgramSchoolResponse(schools, programsIds);
  }

  async isEligibleForProgram(programId, schoolId, studentId, intakeId) {
    const program = await this.programModel.findById(programId);
    const examTypeRequired = program?.requirementExamType;
    const scoreRequired = program?.requirementScoreInformation || [];

    const testScores = await this.testScoreModel.findOne({ studentId, examType: examTypeRequired });
    const studentScores = testScores?.scoreInformation || [];

    if (!testScores) return false;

    return scoreRequired.every((requiredScore) => {
      return studentScores.some((studentScore) => {
        if (requiredScore.key == studentScore.key) {
          return +studentScore.value >= +requiredScore.value;
        }
        return false;
      });
    });
  }
}

module.exports = ProgramService;
