const uuid = require("uuid");
const ConfigService = require("../service/config.service");
const TestScore = require("../models/TestScore");
const { MappingFiles } = require("./../constants/Agent.constants");
const { sendToSF } = require("./salesforce.service");

class TestScoreService {
  constructor() {
    this.configService = new ConfigService();
    this.testScoreModel = TestScore;
  }

  async getExamType() {
    const config = await this.configService.getConfig("TEST_SCORE_EXAM_TYPE");
    return config?.value;
  }

  async getScoreTestFields(examType) {
    const config = await this.configService.getConfig("TEST_SCORE_FIELDS");
    return config.value[examType];
  }

  async add(studentId, modifiedBy, body, agentId) {
    const externalId = uuid.v4();
    let totalMarks;
    switch (body.examType) {
      case "12th Standard English Mark":
        totalMarks = body?.englishMarks; // Placeholder
        break;
      case "GRE":
        totalMarks = body?.percentile;
        break;
      case "GMAT":
        totalMarks = body?.totalPercentile;
        break;
      case "Duolingo":
        totalMarks = body?.overall; // Placeholder

        break;
      case "TOEFL / IELTS / PTE":
        totalMarks = body?.overall; // Placeholder
      default:
        break;
    }
    const testScore = this.testScoreModel.create({
      ...body,
      totalMarks,
      studentId,
      modifiedBy,
      createdBy: modifiedBy,
      externalId,
    });
    // const url = "Test_Score__c/ExternalId__c/2573t236423ev"
    // const sf = await sendToSF(MappingFiles.STUDENT_test_score, {
    //   ...testScore,
    //   externalId: externalId,
    //   _user: { agentId, id: modifiedBy },
    //   url
    // });

    // console.log("sf test score: "+sf);
    return testScore;
  }


  async updateTestScoreSfId(testScoreId,id){
    return this.testScoreModel.updateOne(
      { _id: testScoreId },
      { $set: { testScoreSfId:id } }
    );
  }

  async getTestScoreFromSfId(sfId){
    return this.testScoreModel.findOne(
      { testScoreSfId: sfId },
    );
  }

  update(modifiedBy, testScoreId, body, studentId) {
    try {
    let totalMarks;
    switch (body.examType) {
      case "12th Standard English Mark":
        totalMarks = body?.englishMarks; // Placeholder
        break;
      case "GRE":
        totalMarks = body?.percentile;
        break;
      case "GMAT":
        totalMarks = body?.totalPercentile;
        break;
      case "Duolingo":
        totalMarks = body?.overall; // Placeholder

        break;
      case "TOEFL / IELTS / PTE":
        totalMarks = body?.overall; // Placeholder
      default:
        break;
    }
    return this.testScoreModel.updateOne(
      { _id: testScoreId },
      { $set: { ...body,totalMarks, modifiedBy,studentId: studentId } }
    );
    } catch(error) {
      console.log('error>>',error)
    }
  }

  delete(testScoreId) {
    return this.testScoreModel.deleteOne({ _id: testScoreId });
  }

  getByStudentId(studentId) {
    return this.testScoreModel.find({ studentId });
  }
}

module.exports = TestScoreService;
