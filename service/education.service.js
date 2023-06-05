const { v4: uuidv4 } = require('uuid');
const Education = require("../models/Education");

class EducationService {

  async add(studentId, modifiedBy, body) {
    const externalId = uuidv4();
    return await Education.create({ ...body, studentId, modifiedBy, createdBy: modifiedBy, externalId });
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
