// Importing the CaseService module
const CaseService = require("../service/case.service");

// Defining the CaseController class
class CaseController {
  constructor() {
    this.caseService = new CaseService();
  }

  // Method to get all cases associated with a user
  async getAllCases(req, res) {
    const { sfId } = req.user;
    const cases = await this.caseService.getAllCases(sfId);
    res.json(cases);
  }

  // Method to get a case by its ID
  async getCaseById(req, res) {
    const { id } = req.params;
    const caseData = await this.caseService.getCaseById(id);
    res.json(caseData);
  }

  // Method to get reason for a case
  async getReason(req, res) {
    const caseData = await this.caseService.getReasonService();
    res.json(caseData);
  }

  // Method to get sub-reason for a case
  async getSubReason(req, res) {
    const caseData = await this.caseService.getSubReasonService();
    res.json(caseData);
  }

  // Method to create a new case
  async createCase(req, res) {
    const caseData = req.body;
    const newCase = await this.caseService.createCase(caseData, res);
    res.status(201).send({
      statuscode: 201,
      message: "Case created successfully",
      data: newCase,
    });
  }

  // Method to create a comment for a case
  async createCaseComment(req, res) {
    const commentData = req.body;
    const { caseId } = req.params;
    const { id, sfId } = req.user;
    const newCase = await this.caseService.createCaseComment(
      commentData,
      id,
      caseId,
      sfId
    );
    res.status(201).send({
      statuscode: 201,
      message: "Case created successfully",
      data: newCase,
    });
  }

  // Method to get comments for a case
  getCaseComments = async (req, res) => {
    try {
      const { caseId } = req.params;
      const { id } = req.user;
      const comments = await this.caseService.getCaseComments(caseId, id);
      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // Method to update a case
  async updateCase(req, res) {
    const { id } = req.params;
    const caseData = req.body;
    const updatedCase = await this.caseService.updateCase(id, caseData, res);
    res.status(200).json(updatedCase);
  }

  // Method to update attachment data for a case
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

  // Method to delete a case
  async deleteCase(req, res) {
    const { id } = req.params;
    await this.caseService.deleteCase(id);
    res.sendStatus(204);
  }

  // Method to reply to a comment on a case
  async replyComment(req, res) {
    try {
      const commentData = req.body;
      const { id } = req.user;
      const replyComment = await this.caseService.ReplyComment(commentData, id);
      res.status(200).json(replyComment);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

// Exporting the CaseController class
module.exports = CaseController;
