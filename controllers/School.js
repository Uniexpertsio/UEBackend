const SchoolService = require("../service/school.service");

class SchoolController {
  constructor() {
    this.schoolService = new SchoolService();
  }

async addOrUpdateSchool(req, res) {
    // const { id } = req.user;
    return res.status(200).json(await this.schoolService.createOrUpdateSchool(req.body));
  }

  async getAllSchool(req, res) {
    return res.status(200).json(await this.schoolService.getAllSchool());
  }

  async getSchool(req, res) {
    return res.status(200).json(await this.schoolService.findById(req.params.schoolId));
  }

  async getSchoolByCountryStateOrSchoolType(req, res) {
    return res.status(200).json(await this.schoolService.getSchoolByCountryStateOrSchoolType(req.query));
  }
}

module.exports = SchoolController;
