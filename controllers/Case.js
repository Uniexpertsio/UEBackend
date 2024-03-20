const CaseService = require("../service/case.service");

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

  async getReason(req, res) {
    const caseData = await this.caseService.getReasonService();
    res.json(caseData);
  }

  async getSubReason(req, res) {
    const caseData = await this.caseService.getSubReasonService();
    res.json(caseData);
  }

  async createCase(req, res) {
    const caseData = req.body;
    const newCase = await this.caseService.createCase(caseData, res);
    res.status(201).send({
      statuscode: 201,
      message: "Case created successfully",
      data: newCase,
    });
  }

  async updateCase(req, res) {
    const { id } = req.params;
    const caseData = req.body;
    const updatedCase = await this.caseService.updateCase(id, caseData, res);
    res.status(200).json(updatedCase);
  }

  async updateAttachment(req, res) {
    const { id } = req.params;
    const caseData = req.body;
    const data = await this.caseService.updateAttachmentService(
      id,
      caseData,
      res
    );
    return res.status(200).send({
      statuscode: 200,
      message: "Attachment data updated succesfully",
      data: data,
    });
  }

  async deleteCase(req, res) {
    const { id } = req.params;
    await this.caseService.deleteCase(id);
    res.sendStatus(204);
  }
}

module.exports = CaseController;
