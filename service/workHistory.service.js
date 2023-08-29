const WorkHistory = require("../models/WorkHistory");
const uuid = require("uuid");


class WorkHistoryService {
  constructor() {
    this.workHistoryModel = WorkHistory;
  }

  async add(studentId, modifiedBy, body) {
    const externalId = uuid();
    return await this.workHistoryModel.create({ ...body, studentId, modifiedBy, createdBy: modifiedBy, externalId });
  }

  async update(modifiedBy, workHistoryId, body) {
    return await this.workHistoryModel.updateOne({ _id: workHistoryId }, { $set: { ...body, modifiedBy } });
  }

  async delete(workHistoryId) {
    return await this.workHistoryModel.deleteOne({ _id: workHistoryId });
  }

  async getByStudentId(studentId) {
    return await this.workHistoryModel.find({ studentId });
  }
}

module.exports = WorkHistoryService;
