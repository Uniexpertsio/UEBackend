const DocumentTypeService = require("../service/documentType.service");

const documentTypeService = new DocumentTypeService();

const getStudentDocumentType = async (req, res) => {
  try {
    const studentDocumentTypes = await documentTypeService.getStudentDocumentType();
    res.status(200).json(studentDocumentTypes);
  } catch (error) {
    logger.error(`Endpoint: ${req.originalUrl} - Status: 400 - Message: ${error?.response?.data[0]?.message}`);
    res.status(500).json({ error: error.message });
  }
};

const addDocumentType = async (req, res) => {
  try {
    const studentDocumentType = await documentTypeService.addDocumentType(req.body);
    res.status(200).json(studentDocumentType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStudentApplicationDocumentType = async (req, res) => {
  try {
    const applicationDocumentTypes = await documentTypeService.getStudentApplicationDocumentType();
    res.status(200).json(applicationDocumentTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPartnerDocumentType = async (req, res) => {
  try {
    const { agentId } = req.user;
    const partnerDocumentTypes = await documentTypeService.getPartnerDocumentType(agentId);
    res.status(200).json(partnerDocumentTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getStudentDocumentType,
  getStudentApplicationDocumentType,
  getPartnerDocumentType,
  addDocumentType
};
