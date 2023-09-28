const uuid = require("uuid");
const ConfigService = require("../service/config.service");
const TestScore = require("../models/TestScore")

class TestScoreService {
  constructor() {
    this.configService = new ConfigService();
    this.testScoreModel = TestScore;
  }

  async getExamType() {
    const config = await this.configService.getConfig("TEST_SCORE_EXAM_TYPE");
    return config.value;
  }

  async getScoreTestFields(examType) {
    const config = await this.configService.getConfig("TEST_SCORE_FIELDS");
    return config.value[examType];
  }

  add(studentId, modifiedBy, body) {
    const externalId = uuid.v4();
    return this.testScoreModel.create({ ...body, studentId, modifiedBy, createdBy: modifiedBy, externalId });
  }

  update(modifiedBy, testScoreId, body) {
    return this.testScoreModel.updateOne({ _id: testScoreId }, { $set: { ...body, modifiedBy } });
  }

  delete(testScoreId) {
    return this.testScoreModel.deleteOne({ _id: testScoreId });
  }

  getByStudentId(studentId) {
    return this.testScoreModel.find({ studentId });
  }
}

module.exports = TestScoreService;
