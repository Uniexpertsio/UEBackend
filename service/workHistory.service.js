const WorkHistory = require("../models/WorkHistory");
const uuid = require("uuid");
const { ObjectId } = require("mongodb");
const { sendToSF } = require("./salesforce.service");
const { MappingFiles } = require("./../constants/Agent.constants");
const Student = require("../models/Student");

class WorkHistoryService {
  constructor() {
    this.workHistoryModel = WorkHistory;
  }

  async add(studentId, modifiedBy, body) {
    const externalId = uuid();
    const workHistory = await this.workHistoryModel.create({
      ...body,
      studentId,
      modifiedBy,
      createdBy: modifiedBy,
      externalId,
    });
    const url = "Work_history__c/ExternalId__c/11995";
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
    return await this.workHistoryModel.updateOne(
      { _id: workHistoryId },
      { $set: { ...body, modifiedBy } }
    );
  }

  async updateSFID(id, SfId) {
    return await this.workHistoryModel.updateOne(
      { _id: id },
      { $set: { WorkHistorySfId: SfId } }
    );
  }

  async getDatafromSfid(sfId) {
    return await this.workHistoryModel.findOne({ WorkHistorySfId: sfId });
  }
  async delete(workHistoryId) {
    return await this.workHistoryModel.deleteOne({ _id: workHistoryId });
  }

  async getByStudentId(studentId) {
    try {
      if (ObjectId.isValid(studentId)) {
        return await this.workHistoryModel.find({ studentId });
      } else {
        const student = await Student.findOne(
          { salesforceId: studentId },
          { _id: 1 }
        );
        return await this.workHistoryModel.find({ studentId: student._id });
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = WorkHistoryService;
