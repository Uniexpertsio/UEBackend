const { v4: uuidv4 } = require("uuid");
const BranchModel = require("../models/Branch");

class BranchService {
  async addBranch(id, agentId, body) {
    const externalId = uuidv4();
    return BranchModel.create({ ...body, agentId, modifiedBy: id, createdBy: id, externalId });
  }

  updateActiveStatus(id, branchId, body) {
    return BranchModel.updateOne({ _id: branchId }, { ...body, modifiedBy: id });
  }

  getBranches(agentId) {
    return BranchModel.find({ agentId });
  }

  async findById(id) {
    const branch = await BranchModel.findById(id);
    if (!branch) throw new Error("Branch not found");
    return branch;
  }
}

module.exports = BranchService;
