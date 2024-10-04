const { v4: uuidv4 } = require("uuid");
const { ObjectId } = require("mongodb");
const Education = require("../models/Education");
const { MappingFiles } = require("./../constants/Agent.constants");
const { sendToSF } = require("./salesforce.service");
const Student = require("../models/Student");

class EducationService {
  async add(studentId, modifiedBy, body) {
    const externalId = uuidv4();
    const education = await Education.create({
      ...body,
      studentId,
      modifiedBy,
      createdBy: modifiedBy,
      externalId,
    });
    const url = "Education__c/ExternalId__c/11996";
    // const sf = await sendToSF(MappingFiles.STUDENT_education_history, {
    //   ...education,
    //   externalId: externalId,
    //   _user: { agentId, id: modifiedBy },
    //   url
    // });

    // console.log("sf education history: "+sf);
    return education;
  }

  async update(modifiedBy, educationId, body) {
    console.log('FFFFFFFFFFFFF', modifiedBy, educationId, body)
    return await Education.updateOne(
      { _id: educationId },
      { $set: { ...body, modifiedBy } }
    );
  }

  async updateSfId(educationId, id) {
    return await Education.updateOne(
      { _id: educationId },
      { $set: { educationSfId: id } }
    );
  }

  async delete(educationId) {
    return await Education.deleteOne({ _id: educationId });
  }
  async getEducationFromSFID(sfId) {
    return await Education.findOne({ educationSfId: sfId });
  }

  async getByStudentId(studentId) {
    try {
      if (ObjectId.isValid(studentId)) {
        return await Education.find({ studentId });
      } else {
        const student = await Student.findOne(
          { salesforceId: studentId },
          { _id: 1 }
        );
        return await Education.find({ studentId: student._id });
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EducationService;
