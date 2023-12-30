const Case = require('../models/Case');

class CaseService {
  async getAllCases() {
    return await Case.find();
  }

  async getCaseById(id) {
    return await Case.findById(id);
  }

  async createCase(caseData) {
    return await Case.create(caseData);
  }

  async updateCase(id, caseData) {
    return await Case.findByIdAndUpdate(id, caseData, { new: true });
  }

  async deleteCase(id) {
    return await Case.findByIdAndDelete(id);
  }
}

module.exports = CaseService;
