const IntakeService = require("../service/intake.service"); 

const intakeService = new IntakeService();

// Controller functions
async function addIntake(req, res) {
  try {
    const { id } = req.user;
    const body = req.body;
    const intake = await intakeService.addIntake(id, body);
    res.status(201).json(intake);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getIntakeList(req, res) {
  try {
    const intakeList = await intakeService.getIntakeList();
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
  addIntake,
  getIntakeList,
  getIntake,
};
