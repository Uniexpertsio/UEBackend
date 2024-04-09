const Agent = require("../models/Agent");
const { MappingFiles } = require("./../constants/Agent.constants");
const Staff = require("../models/Staff");
const {
  sendToSF,
  getTnc,
  downloadTnc,
  getDataFromSF,
} = require("../service/salesforce.service");
const DocumentService = require("../service/document.service");
const DocumentTypeService = require("../service/documentType.service");
const AgentService = require("../service/agent.service");

const documentService = new DocumentService();
const documentTypeService = new DocumentTypeService();
const agentService = new AgentService();

const {
  generateAuthResponse,
  generateToken,
} = require("../service/auth.service");

const acceptTnc = async (req, res, next) => {
  try {
    const { id, agentId } = req.user;
    const agent = await Agent.findByIdAndUpdate(agentId, { tncMeta: req.body });

    if (!agent) throw new Error("Agent not found");
    const staff = await Staff.findById(id);
    const token = await generateToken(agentId);
    const staffResponse = generateAuthResponse(staff, agent, token);
    const url = "Contact/ExternalId__c/2573t236423eva";
    const data = await sendToSF(MappingFiles.AGENT_account, {
      ...req.body,
      commonId: agent.commonId,
      url,
    });

    return res.status(200).json({ statusCode: 200, data: staffResponse });
  } catch (err) {
    return res.status(200).json({ statusCode: 400, message: err.message });
  }
};

const getTnC = async (req, res, next) => {
  try {
    const data = await getTnc(req.params.sfId);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(200).json({ statusCode: 400, message: err.message });
  }
};

const downloadTncData = async (req, res, next) => {
  try {
    const data = await downloadTnc(req.params?.sfId, req.params?.ip);

    return res.status(200).json(data);
  } catch (err) {
    return res.status(200).json({ statusCode: 400, message: err.message });
  }
};

const getGeneralInformation = async (req, res, next) => {
  try {
    const { agentId } = req.user;
    const agent = await Agent.findById(agentId);
    if (!agent) {
      throw "Agent not found";
    } else {
      const moreDetails = await getDataFromSF(
        `${process.env.SF_API_URL}services/data/v55.0/sobjects/Account/${agent?.commonId}`
      );
      const newObj = { ...agent?._doc, ...moreDetails };
      return res.status(200).json({ statusCode: 200, data: newObj });
    }
  } catch (err) {
    return res.status(200).json({ statusCode: 400, message: err.message });
  }
};

const updateGeneralInformation = async (req, res) => {
  const { agentId } = req.user;
  console.log(agentId);
  const result = await Agent.findOneAndUpdate(
    { _id: agentId },
    { $set: { ...req.body } },
    { new: true }
  );
  if (!result)
    return res.status(200).json({ statusCode: 400, message: "Bad Request" });

  if (result.modifiedCount === 0) {
    return res
      .status(200)
      .json({ statusCode: 400, message: "Agent not found" });
  }

  const externalId = "";
  const url = "Contact/ExternalId__c/2573t236423eva";
  await sendToSF(MappingFiles.AGENT_account, {
    ...req.body,
    externalId,
    _user: { agentId },
    url,
  });

  return res.status(200).json({ statusCode: 200, data: result });
};

const getBankInformation = async (req, res) => {
  const { agentId } = req.user;
  const agent = await Agent.findById(agentId);
  if (!agent) {
    return res
      .status(200)
      .json({ statusCode: 400, message: "Agent not found" });
  }

  return res
    .status(200)
    .json({ statusCode: 400, data: agent.getBankInformation() });
};

const updateBankInformation = async (req, res) => {
  const { id, agentId } = req.user;
  const result = await Agent.findByIdAndUpdate(
    agentId,
    { $set: { bank: req.body } },
    { new: true }
  );

  if (result.modifiedCount === 0) {
    return res
      .status(200)
      .json({ statusCode: 400, message: "Agent not found" });
  }

  const url = "BankDetail__c/ExternalId__c/" + result.commonId;
  const data = await sendToSF(MappingFiles.AGENT_bank, {
    bank: req.body,
    externalId: result.commonId,
    _user: { agentId: id },
    url,
  });
  return res.status(200).json({ statusCode: 200, data: result });
};

const getAccountManager = async (req, res) => {
  const { agentId } = req.user;
  const agent = await Agent.findById(agentId);
  if (!agent) {
    return res
      .status(200)
      .json({ statusCode: 400, message: "Agent not found" });
  }
  if (agent.accountManager) {
    return Staff.findById(agent.accountManager);
  } else {
    return res
      .status(200)
      .json({ statusCode: 400, message: "Account manager not found" });
  }
};

const updateDocuments = async (req, res) => {
  try {
    const { id, agentId } = req.user;
    const updateDocumentsResponse = await agentService.updateDocuments(
      id,
      agentId,
      req.body
    );
    return res
      .status(200)
      .json({ statusCode: 200, data: updateDocumentsResponse });
  } catch (err) {
    return res.status(400).json({ statusCode: 400, message: err.message });
  }
};

const updateDocument = async (req, res) => {
  try {
    const { id, agentId } = req.user;
    const updateDocumentsResponse = await documentService.updateDocument(
      id,
      req.params.documentId,
      req.body
    );
    return res
      .status(200)
      .json({ statusCode: 200, data: updateDocumentsResponse });
  } catch (err) {
    return res.status(200).json({ statusCode: 200, message: err.message });
  }
};

const getDocuments = async (req, res) => {
  try {
    const { agentId } = req.user;
    const documents = await documentService.getByUserId(agentId);
    return res.status(200).json({ statusCode: 200, data: documents });
  } catch (err) {
    return res.status(200).json({ statusCode: 200, message: err.message });
  }
};

module.exports = {
  acceptTnc,
  getGeneralInformation,
  updateGeneralInformation,
  getBankInformation,
  updateBankInformation,
  getAccountManager,
  updateDocument,
  updateDocuments,
  getDocuments,
  getTnC,
  downloadTncData,
};
