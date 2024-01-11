const InterviewService = require('../service/interview.service');
const interviewService = new InterviewService();

const createInterview = async (req, res) => {
  try {
    const { id } = req.user;
    const body = req.body;
    const result = await interviewService.createInterview(id, body);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getPartnerInterviews = async (req, res) => {
  try {
    const { id } = req.user;
    const query = req.query;
    const result = await interviewService.getPartnerUpcomingInterviews(id, query);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createInterview,
  getPartnerInterviews,
};
