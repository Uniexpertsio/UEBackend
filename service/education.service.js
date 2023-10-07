const { v4: uuidv4 } = require('uuid');
const Education = require("../models/Education");
const { MappingFiles } = require('./../constants/Agent.constants');
const {sendToSF} = require("./salesforce.service");

class EducationService {

  async add(studentId, modifiedBy, body) {
    const externalId = uuidv4();
    const education = await Education.create({ ...body, studentId, modifiedBy, createdBy: modifiedBy, externalId });
    
    const url = "Education__c/ExternalId__c/11996"
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
    return await Education.updateOne({ _id: educationId }, { $set: { ...body, modifiedBy } });
  }

  async delete(educationId) {
    return await Education.deleteOne({ _id: educationId });
  }

async getByStudentId(studentId) {
    return await Education.find({ studentId });
  }
}

module.exports = EducationService;
