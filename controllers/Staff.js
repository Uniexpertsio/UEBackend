const StaffService = require("../service/staff.service");

const staffService = new StaffService();

// Controller functions
async function getAllStaff(req, res) {
  try {
    const { agentId } = req.user;
    const staff = await staffService.getAllStaff(agentId);
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function addStaff(req, res) {
  try {
    const staffDetails = req.body;
    const staff = await staffService.addStaff(req.user, staffDetails);
    res.status(201).json({ id: staff._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function updateStaff(req, res) {
  try {
    const { agentId } = req.user;
    const staffId = req.params.staffId;
    const staffDetails = req.body;
    await staffService.updateStaff(agentId, staffId, staffDetails);
    res.sendStatus(201);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getStaff(req, res) {
  try {
    const { agentId } = req.user;
    const staffId = req.params.staffId;
    const staff = await staffService.getStaff(agentId, staffId);
    res.status(200).json(staff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function changePassword(req, res) {
  try {
    const { agentId } = req.user;
    const staffId = req.params.staffId;
    const passwordDto = req.body;
    await staffService.changePassword(agentId, staffId, passwordDto);
    res.sendStatus(201);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function changeActiveStatus(req, res) {
  try {
    const { agentId } = req.user;
    const staffId = req.params.staffId;
    const activeStatusDto = req.body;
    await staffService.changeActiveStatus(agentId, staffId, activeStatusDto);
    res.sendStatus(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getMyProfile(req, res) {
  try {
    const { agentId, id } = req.user;
    const staff = await staffService.getStaff(agentId, id);
    res.status(200).json(staff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function updateNotifications(req, res) {
  try {
    const { id } = req.user;
    const notificationsDto = req.body;
    await staffService.updateNotifications(id, notificationsDto);
    res.sendStatus(201);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function updateDp(req, res) {
  try {
    const { id } = req.user;
    const dp = req.body;
    await staffService.updateDp(id, dp);
    res.sendStatus(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  getAllStaff,
  addStaff,
  updateStaff,
  getStaff,
  changePassword,
  changeActiveStatus,
  getMyProfile,
  updateNotifications,
  updateDp,
};