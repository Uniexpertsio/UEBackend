const uuid = require("uuid");
const School = require("../models/School");
const Currency = require("../models/Currency");
const { sendToSF, sendDataToSF } = require("../service/salesforce.service");
const { MappingFiles } = require("./../constants/Agent.constants");
const Program = require("../models/Program");
const Intake = require("../models/Intake");
const { returnField } = require("../utils/emailValidator");
const Eligibility = require("../models/Eligibility");

class SchoolService {
  async createSchool(id, body) {
    const externalId = uuid.v4();
    body.entryRequirements.push(
      `This program does${
        body.offerConditionalAdmission ? "" : " not"
      } offer conditional admission`
    );

    const school = await School.create({
      ...body,
      modifiedBy: id,
      createdBy: id,
      externalId,
    });

    const url = "School__c/a006D00000AgAT5QAN";
    const sf = await await sendToSF(MappingFiles.SCHOOL_school, {
      ...school,
      _user: { id },
      url,
    });
    console.log("sf: ", sf);
    return { id: school._id };
  }

  async createOrUpdateSchool(body) {
    return new Promise(async (resolve, reject) => {
      try {
        let schoolSfId = body?.Id;

        const checkSchoolExist = await School.findOne({ Id: schoolSfId });

        if (checkSchoolExist?.Id) {
          await School.updateOne(
            { Id: schoolSfId },
            { $set: { ...body } },
            { new: true }
          );
          resolve({ message: "Success", status: 200, sf: schoolSfId });
        } else {
          const school = await School.create({ ...body });
          resolve({ message: "Success", status: 201, sf: schoolSfId, school });
        }
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }

  async getAllSchool(page, limit, schoolFilter, searchType, searchTerm) {
    try {
      const skip = (page - 1) * limit;
      let filter = {};
      let sortQuery = {};
      switch (schoolFilter) {
        case "Top 100 Schools":
          filter = { Top_Hundred_School__c: { $ne: null } };
          sortQuery = { Top_Hundred_School__c: 1 };
          break;
        case "Recommended":
          filter = { Recommended__c: true };
          sortQuery = { Name: 1 };
          break;
        case "First Choice of Students":
          filter = { First_Choice_of_Students__c: true };
          sortQuery = { Name: 1 };
          break;
        case "Fast Offers":
          filter = { Fast_Offers__c: true };
          sortQuery = { Name: 1 };
          break;
        case "Highest Acceptance Rate":
          filter = { Highest_Acceptance_Rate__c: true };
          sortQuery = { Name: 1 };
          break;
        case "Offers in 48 Hours":
          filter = { Offers_in_48_Hrs__c: true };
          sortQuery = { Name: 1 };
          break;
        case "All School":
          sortQuery = { Name: 1 };
          break;
        default:
          break;
      }

      let countryQuery = {};
      let schoolIds = [];
      let nameQuery = {};

      if (searchType === "Country__c") {
        countryQuery = { Country__c: new RegExp(searchTerm, "i") };
      } else if (searchType === "Program_level__c&&Country__c") {
        const programLevelQuery = {
          Program_level__c: new RegExp(searchTerm[0], "i"),
        };
        const programs = await Program.find(programLevelQuery, {
          School__c: 1,
        });
        if (programs.length === 0) {
          return { schools: [], totalSchools: 0 };
        }
        countryQuery = { Country__c: new RegExp(searchTerm[1], "i") };
        schoolIds = [...new Set(programs.map((program) => program.School__c))];
      } else if (searchType === "Name") {
        nameQuery = { Name: new RegExp(searchTerm, "i") };
      }

      const query = {
        ...nameQuery,
        ...countryQuery,
        ...filter,
        ...(schoolIds.length > 0 ? { Id: { $in: schoolIds } } : {}),
      };

      const schools = await School.find({ ...query })
        .sort(sortQuery)
        .limit(limit)
        .skip(skip);

      const totalSchools = await School.countDocuments(query);
      return { schools, totalSchools };
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async getSchoolByCountryStateOrSchoolType(query) {
    let filter = {};

    if (query.country) {
      filter = {
        ...filter,
        "address.country": { $regex: query.country },
      };
    }

    if (query.states && query.states.length) {
      filter = {
        ...filter,
        "address.state": { $in: query.states },
      };
    }

    if (query.schoolTypes) {
      filter = {
        ...filter,
        "basicDetails.schoolType": { $in: query.schoolTypes },
      };
    }

    const schools = await School.find(filter);
    return this.parseSchoolList(schools);
  }

  async parseSchool(school) {
    school = school["_doc"];
    school.id = school._id;

    const currency = await Currency.findOne({ symbol: school.currency });

    delete school._id;
    delete school.__v;
    return {
      ...school,
      currency,
    };
  }

  async parseSchoolList(schools) {
    return Promise.all(
      schools.map(async (school) => {
        return this.parseSchool(school);
      })
    );
  }

  async findById(id) {
    const school = await School.findById(id);

    if (!school) {
      throw new Error(`No school found for id - ${id}`);
    }

    return await this.parseSchool(school);
  }

  async findBySfId(id) {
    const school = await School.findOne({ Id: id });
    if (!school) {
      throw new Error(`No school found for id - ${id}`);
    }

    return await this.parseSchool(school);
  }

  async getSchoolProgram(schoolId, page, limit) {
    try {
      const skip = (page - 1) * limit;
      const programPromise = await Program.find({ School__c: schoolId })
        .skip(skip)
        .limit(limit);
      const countPromise = await Program.countDocuments({
        School__c: schoolId,
      });

      const [programs, count] = await Promise.all([
        programPromise,
        countPromise,
      ]);

      return {
        programs,
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      console.error("Error fetching school list:", error);
      throw error;
    }
  }

  async schoolFilter(req, res) {
    try {
      const filterData = req.body;
      const { limit, page } = req.query;
      const skip = (page - 1) * limit;

      const programIdsFromIntake = [];
      let filter = {};
      let sortQuery = {};
      let eligibilitySchools = [];
      let schoolIdsFromSchool = [];
      let schoolIdsFromProgram = [];

      if (filterData.eligibility) {
        const { examType, totalMark } = filterData.eligibility;

        const isExamTypeArray = Array.isArray(examType);
        const isTotalMarkArray = Array.isArray(totalMark);

        const examTypes = isExamTypeArray ? examType : [examType];
        const totalMarks = isTotalMarkArray ? totalMark : [totalMark];

        // Construct the $or query array for bulk query
        const orQuery = examTypes.map((examType, index) => ({
          Exam_Type__c: examType,
          [returnField(examType)]: { $gte: totalMarks[index] },
        }));

        // Execute the bulk query for eligibility data
        const data = await Eligibility.find(
          { $or: orQuery },
          { School__c: 1, _id: 0 }
        );
        if (data.length === 0) {
          return { schools: [], totalSchools: 0 }; // No eligible data found
        }

        eligibilitySchools = data.map((item) => item.School__c);
      }
      if (filterData.school) {
        const {
          preferredCountry,
          schoolType,
          schoolName,
          moi,
          interviewRequired,
          waiverOnClass12English,
        } = filterData.school;

        const query = {
          ...(preferredCountry && { Country__c: preferredCountry }),
          ...(schoolType && { School_Type__c: schoolType }),
          ...(schoolName && { Name: schoolName }),
          ...(moi && { MOI__c: moi }),
          ...(interviewRequired && {
            Interview_Required__c: interviewRequired,
          }),
          ...(waiverOnClass12English && {
            waiver_on_class_12_English__c: waiverOnClass12English,
          }),
        };

        // Execute the bulk query for School data
        const data = await School.find(query, { Id: 1, _id: 0 });
        if (data.length === 0) {
          return { schools: [], totalSchools: 0 }; // No eligible data found
        }

        schoolIdsFromSchool = data.map((item) => item.Id);
      }
      if (filterData.program) {
        const { programLevel, intake, discipline, subDiscipline } =
          filterData.program;
        if (intake) {
          const intakeProgramIds = await Intake.find(
            { Name: intake },
            { Programme__c: 1, _id: 0 }
          );
          const intakePrograms = intakeProgramIds.map(
            (item) => item.Programme__c
          );
          programIdsFromIntake.push(...intakePrograms);
        }

        const query = {
          ...(programLevel && { Program_level__c: { $in: programLevel } }),
          ...(intake && { Id: { $in: programIdsFromIntake } }),
          ...(discipline && { Discipline__c: discipline }),
          ...(subDiscipline && { Sub_Discipline__c: { $in: subDiscipline } }),
        };

        // Execute the bulk query for Program data
        const schoolIdsFromProgram = await Program.distinct(
          "School__c",
          query,
          { _id: 0 }
        );
        if (schoolIdsFromProgram.length === 0) {
          return { schools: [], totalSchools: 0 }; // No eligible data found
        }
      }
      if (filterData.filterBy) {
        switch (filterData.filterBy) {
          case "Top 100 Schools":
            filter = { Top_Hundred_School__c: { $ne: null } };
            sortQuery = { Top_Hundred_School__c: 1 };
            break;
          case "Recommended":
            filter = { Recommended__c: true };
            sortQuery = { Name: 1 };
            break;
          case "First Choice of Students":
            filter = { First_Choice_of_Students__c: true };
            sortQuery = { Name: 1 };
            break;
          case "Fast Offers":
            filter = { Fast_Offers__c: true };
            sortQuery = { Name: 1 };
            break;
          case "Highest Acceptance Rate":
            filter = { Highest_Acceptance_Rate__c: true };
            sortQuery = { Name: 1 };
            break;
          case "Offers in 48 Hours":
            filter = { Offers_in_48_Hrs__c: true };
            sortQuery = { Name: 1 };
            break;
          case "All School":
            sortQuery = { Name: 1 };
            break;
          default:
            break;
        }
      }

      const arrays = [
        eligibilitySchools,
        schoolIdsFromSchool,
        schoolIdsFromProgram,
      ];
      // Filter out empty arrays
      const nonEmptyArrays = arrays.filter((array) => array.length > 0);

      // Find common elements
      const commonElements = nonEmptyArrays.reduce(
        (acc, curr) => acc.filter((element) => curr.includes(element)),
        nonEmptyArrays[0]
      );
      const commonQuery = {
        ...(commonElements && { Id: { $in: commonElements } }),
        ...filter,
      };
      // Execute the bulk query for program data
      const schools = await School.find(commonQuery)
        .sort({
          ...sortQuery,
        })
        .skip(skip)
        .limit(limit);

      const totalSchools = await School.countDocuments(commonQuery);
      return { schools: schools, totalSchools: totalSchools };
    } catch (error) {
      console.error("Error in programFilter:", error);
      throw error;
    }
  }
}

module.exports = SchoolService;
