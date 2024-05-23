const TestScoreService = require("../service/testScore.service");

const testScoreService = new TestScoreService();

// Controller functions
async function getExamType(req, res) {
  try {
    const examTypes = await testScoreService.getExamType();
    res.status(200).json(examTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getTestScoreFields(req, res) {
  try {
    const examType = req.query.examType;
    const fields = await testScoreService.getScoreTestFields(examType);
    res.status(200).json(fields);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getExamType,
  getTestScoreFields,
};
