const uuid = require("uuid");
const School = require("../models/School");
const Currency = require("../models/Currency");
const { sendToSF, sendDataToSF } = require("../service/salesforce.service");
const { MappingFiles } = require('./../constants/Agent.constants');
const Program = require("../models/Program");

class SchoolService {

  async createSchool(id, body) {
    const externalId = uuid.v4();
    body.entryRequirements.push(
      `This program does${body.offerConditionalAdmission ? "" : " not"} offer conditional admission`
    );

    const school = await School.create({ ...body, modifiedBy: id, createdBy: id, externalId });

    const url = "School__c/a006D00000AgAT5QAN"
    const sf = await await sendToSF(MappingFiles.SCHOOL_school, {
      ...school,
      _user: { id },
      url
    });
    console.log("sf: ", sf)
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


  // async getAllSchool() {
  //   const schools = await School.find({});
  //   return this.parseSchoolList(schools);
  // }

  async getAllSchool(page, limit) {
    try {
      const skip = (page - 1) * limit;
      const schoolPromise = await School.find({}).skip(skip).limit(limit);
      const countPromise = await School.countDocuments({});

      const [schools, count] = await Promise.all([schoolPromise, countPromise]);

      return {
        schools,
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error("Error fetching school list:", error);
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
    const school = await School.findOne({ Id: id });

    if (!school) {
      throw new Error(`No school found for id - ${id}`);
    }

    return await this.parseSchool(school);
  }

  async getSchoolProgram(schoolId, page, limit) {
    try {
      const skip = (page - 1) * limit;
      const programPromise = await Program.find({School__c: schoolId}).skip(skip).limit(limit);
      const countPromise = await Program.countDocuments({ School__c: schoolId });

      const [programs, count] = await Promise.all([programPromise, countPromise]);

      return {
        programs,
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error("Error fetching school list:", error);
      throw error;
    }
  }
}

module.exports = SchoolService;
