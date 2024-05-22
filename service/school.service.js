const uuid = require("uuid");
const School = require("../models/School");
const Currency = require("../models/Currency");
const { sendToSF, sendDataToSF } = require("../service/salesforce.service");
const { MappingFiles } = require("./../constants/Agent.constants");
const Program = require("../models/Program");

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
}

module.exports = SchoolService;
