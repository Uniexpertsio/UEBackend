const WorkHistory = require("../models/WorkHistory");
const uuid = require("uuid");
const {sendToSF} = require("./salesforce.service");
const { MappingFiles } = require('./../constants/Agent.constants');


class WorkHistoryService {
  constructor() {
    this.workHistoryModel = WorkHistory;
  }

  async add(studentId, modifiedBy, body) {
    
    const externalId = uuid();
    const workHistory = await this.workHistoryModel.create({ ...body, studentId, modifiedBy, createdBy: modifiedBy, externalId });
    const url = "Work_history__c/ExternalId__c/11995"
    // const sf = await sendToSF(MappingFiles.STUDENT_work_history, {
    //   ...workHistory,
    //   externalId: externalId,
    //   _user: { agentId, id: modifiedBy },
    //   url
    // });

    // console.log("sf work history: "+sf);
    return workHistory;
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
