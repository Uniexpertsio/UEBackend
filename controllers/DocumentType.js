const DocumentTypeService = require("../service/documentType.service");
const sendResponse = require("../utils/errorHandler");

const documentTypeService = new DocumentTypeService();

const getStudentDocumentType = async (req, res) => {
  try {
    const studentDocumentTypes = await documentTypeService.getStudentDocumentType();
    res.status(200).json(studentDocumentTypes);
  } catch (error) {
    logger.error(`Endpoint: ${req.originalUrl} - Status: 400 - Message: ${error?.response?.data[0]?.message}`);
    const { statusCode, errorMessage } = await sendResponse(error);
    res.status(statusCode).json({ error: errorMessage });
  }
};

const addDocumentType = async (req, res) => {
  try {
    const studentDocumentType = await documentTypeService.addDocumentType(req.body);
    res.status(200).json(studentDocumentType);
  } catch (error) {
    const { statusCode, errorMessage } = await sendResponse(error);
    res.status(statusCode).json({ error: errorMessage });
  }
};

const getStudentApplicationDocumentType = async (req, res) => {
  try {
    const applicationDocumentTypes = await documentTypeService.getStudentApplicationDocumentType();
    res.status(200).json(applicationDocumentTypes);
  } catch (error) {
    const { statusCode, errorMessage } = await sendResponse(error);
    res.status(statusCode).json({ error: errorMessage });
  }
};

const getPartnerDocumentType = async (req, res) => {
  try {
    const { agentId } = req.user;
    const partnerDocumentTypes = await documentTypeService.getPartnerDocumentType(agentId);
    res.status(200).json(partnerDocumentTypes);
  } catch (error) {
    const { statusCode, errorMessage } = await sendResponse(error);
    res.status(statusCode).json({ error: errorMessage });
  }
};

module.exports = {
  getStudentDocumentType,
  getStudentApplicationDocumentType,
  getPartnerDocumentType,
  addDocumentType
};
