// controllers/commissionController.js
const CommissionService = require("../service/commission.service"); // Assuming you have a CommissionService defined
const sendResponse = require("../utils/errorHandler");

const createCommission = async (req, res) => {
  const { modifiedBy, agentId, body } = req.body;
  try {
    const commission = await CommissionService.createCommission(modifiedBy, agentId, body);
    res.status(201).json(commission);
  } catch (error) {
    const { statusCode, errorMessage } = await sendResponse(error);
    res.status(statusCode).json({ error: errorMessage });
  }
};

const getCommissions = async (req, res) => {
  const { agentId, query } = req.query;
  try {
    const commissions = await CommissionService.getCommission(agentId, query);
    res.status(200).json(commissions);
  } catch (error) {
    const { statusCode, errorMessage } = await sendResponse(error);
    res.status(statusCode).json({ error: errorMessage });
  }
};

module.exports = {
  createCommission,
  getCommissions,
};
