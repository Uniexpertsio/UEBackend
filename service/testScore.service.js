const uuid = require("uuid");
const ConfigService = require("../service/config.service");
const { ObjectId } = require("mongodb");
const TestScore = require("../models/TestScore");
const { MappingFiles } = require("./../constants/Agent.constants");
const { sendToSF } = require("./salesforce.service");
const Student = require("../models/Student");

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

  async updateTestScoreSfId(testScoreId, id) {
    return this.testScoreModel.updateOne(
      { _id: testScoreId },
      { $set: { testScoreSfId: id } }
    );
  }

  async getTestScoreFromSfId(sfId) {
    return this.testScoreModel.findOne({ testScoreSfId: sfId });
  }

  async update(modifiedBy, testScoreId, isFrontend, body, studentId) {
    try {
      if (isFrontend) {
        let totalMarks;
        switch (body?.examType) {
          case "12th Standard English Mark":
            totalMarks = body?.englishMarks;
            break;
          case "GRE":
            totalMarks = body?.percentile;
            break;
          case "GMAT":
            totalMarks = body?.totalPercentile;
            break;
          case "Duolingo":
            totalMarks = body?.overall;
            break;
          case "TOEFL / IELTS / PTE":
            totalMarks = body?.overall;
          default:
            break;
        }
        return await this.testScoreModel.findOneAndUpdate(
          { _id: testScoreId },
          {
            $set: {
              ...body,
              totalMarks,
              modifiedBy,
              studentId,
            },
          },
          {
            new: true,
          }
        );
      } else {
        console.log("body>>", body);
        let testScoreData = {
          status: body?.Verification_Status__c,
          showInProfile: body?.ShowInProfile__c,
          doe: body?.Date_of_Exam__c,
          certificateNo: body?.ID_Certificate_No__c,
        };
        switch (body.English_Exam_Type__c) {
          case "12th STD. English mark":
            testScoreData.totalMarks = body?.Total_Score__c;
            break;
          case "GRE":
            testScoreData.totalMarks =
              body?.Quantitative_reasoning_Percentile__c;
            break;
          case "GMAT":
            testScoreData.totalMarks = body?.Total_Percentile__c;
            break;
          default:
            testScoreData.totalMarks = body?.Overall__c;
            break;
        }
        console.log("testScoreData;;;;;", testScoreData);
        return this.testScoreModel.updateOne(
          { _id: testScoreId },
          {
            $set: {
              ...testScoreData,
            },
          },
          {
            new: true,
          }
        );
      }
    } catch (error) {
      console.log("error>>", error);
    }
  }

  delete(testScoreId) {
    return this.testScoreModel.deleteOne({ _id: testScoreId });
  }

  async getByStudentId(studentId) {
    try {
      if (ObjectId.isValid(studentId)) {
        return this.testScoreModel.find({ studentId });
      } else {
        const student = await Student.findOne(
          { salesforceId: studentId },
          { _id: 1 }
        );
        return await this.testScoreModel.find({ studentId: student._id });
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TestScoreService;
