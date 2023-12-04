// controller.js
const CommissionTypeService = require('../service/commissionType.service');

class CommissionTypeController {
  constructor() {
    this.commissionTypeService = new CommissionTypeService();
  }

  addCommissionType(req, res) {
    const { id } = req.user;
    const body = req.body;
    this.commissionTypeService.addCommissionType(id, body)
      .then((result) => res.status(200).json(result))
      .catch((error) => res.status(500).json({ error: error.message }));
  }

  getCommissionType(req, res) {
    const { agentId } = req.user;
    const query = req.query;
    this.commissionTypeService.getCommissionType(agentId, query)
      .then((result) => res.status(200).json(result))
      .catch((error) => res.status(500).json({ error: error.message }));
  }

  addCommissionSlab(req, res) {
    const { id } = req.user;
    const body = req.body;
    this.commissionTypeService.addCommissionSlab(id, body)
      .then((result) => res.status(200).json(result))
      .catch((error) => res.status(500).json({ error: error.message }));
  }
}

module.exports = CommissionTypeController;
