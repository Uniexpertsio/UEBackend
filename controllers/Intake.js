const IntakeService = require("../service/intake.service"); 

const intakeService = new IntakeService();

// Controller functions
async function addOrUpdateIntake(req, res) {
  try {
    // const { id } = req.user;
    const body = req.body;
    const intake = await intakeService.addOrUpdateIntake(body);
    res.status(200).json({ success: true, data: intake });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getIntakeList(req, res) {
  try {
    const { page, limit } = req.query;
    const intakeList = await intakeService.getIntakeList(page,limit);
    res.status(200).json(intakeList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getIntake(req, res) {
  try {
    const programId = req.params.programId;
    const intakeList = await intakeService.getIntake(programId);
    res.status(200).json(intakeList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  addOrUpdateIntake,
  getIntakeList,
  getIntake,
};
