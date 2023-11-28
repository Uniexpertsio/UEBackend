const ApplicationService = require("../service/application.service"); // Import your service

const applicationService = new ApplicationService();

// Controller functions
async function addApplication(req, res) {
  try {
    const { id, agentId } = req.user;
    const body = req.body;
    const application = await applicationService.addApplication(id, agentId, body);
    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getApplications(req, res) {
  try {
    console.log("Getting applications")
    const { agentId } = req.user;
    const query = req.query;
    const applications = await applicationService.getApplications(agentId, query);
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getTasks(req, res) {
  try {
    const applicationId = req.params.applicationId;
    const status = req.query.status;
    const tasks = await applicationService.getTasks(applicationId, status);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateTask(req, res) {
  try {
    const { id } = req.user;
    const applicationId = req.params.applicationId;
    const taskId = req.params.taskId;
    const data = req.query.data;
    await applicationService.updateTask(applicationId, id, taskId, data);
    res.sendStatus(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Define other controller functions in a similar manner...

module.exports = {
  addApplication,
  getApplications,
  getTasks,
  updateTask,
  // Define other controller functions here...
};
