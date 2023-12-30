const CaseService = require('../service/case.service');

class CaseController {
  constructor() {
    this.caseService = new CaseService();
  }

  async getAllCases(req, res) {
    const cases = await this.caseService.getAllCases();
    res.json(cases);
  }

  async getCaseById(req, res) {
    const { id } = req.params;
    const caseData = await this.caseService.getCaseById(id);
    res.json(caseData);
  }

  async createCase(req, res) {
    const caseData = req.body;
    const newCase = await this.caseService.createCase(caseData);
    res.status(201).json(newCase);
  }

  async updateCase(req, res) {
    const { id } = req.params;
    const caseData = req.body;
    const updatedCase = await this.caseService.updateCase(id, caseData);
    res.json(updatedCase);
  }

  async deleteCase(req, res) {
    const { id } = req.params;
    await this.caseService.deleteCase(id);
    res.sendStatus(204);
  }
}

module.exports = CaseController;
