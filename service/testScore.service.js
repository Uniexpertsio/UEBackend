const uuid = require("uuid");
const ConfigService = require("../service/config.service");
const TestScore = require("../models/TestScore")
const { MappingFiles } = require('./../constants/Agent.constants');
const {sendToSF} = require("./salesforce.service");


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

 async add(studentId, modifiedBy, body) {
    const externalId = uuid.v4();
    const testScore = this.testScoreModel.create({ ...body, studentId, modifiedBy, createdBy: modifiedBy, externalId });
    const url = "Test_Score__c/ExternalId__c/2573t236423ev"
    const sf = await sendToSF(MappingFiles.STUDENT_test_score, {
      ...testScore,
      externalId: externalId,
      _user: { agentId, id: modifiedBy },
      url
    });

    console.log("sf test score: "+sf);
    return testScore;
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
