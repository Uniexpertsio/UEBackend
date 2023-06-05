const SchoolService = require("../service/school.service");

class SchoolController {
  constructor() {
    this.schoolService = new SchoolService();
  }

async addSchool(req, res) {
    const { id } = req.user;
    return await this.schoolService.createSchool(id, req.body);
  }


  async getAllSchool(req, res) {
    return await this.schoolService.getAllSchool();
  }

  async getSchool(req, res) {
    return await this.schoolService.findById(req.params.schoolId);
  }

  async getSchoolByCountryStateOrSchoolType(req, res) {
    return await this.schoolService.getSchoolByCountryStateOrSchoolType(req.query);
  }
}

module.exports = SchoolController;
