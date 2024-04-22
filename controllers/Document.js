const uuid = require('uuid');
const Document = require('../models/Document');
const DocumentService = require('../service/document.service');
const sendResponse = require("../utils/errorHandler");


const documentService = new DocumentService();

const addDocuments = async (req, res) => {
  const { modifiedBy, userId, body } = req;
  try {
    for (const document of body.documents) {
      await documentService.findById(document.documentTypeId ? document.documentTypeId: '');
    }
    const insertedDocuments = await Document.insertMany(
      body.documents.map((doc) => ({
        ...doc,
        userId,
        modifiedBy,
        createdBy: modifiedBy,
        externalId: uuid.v4(),
      }))
    );
    res.status(200).json(insertedDocuments);
  } catch (error) {
    const { statusCode, errorMessage } = await sendResponse(error);
    res.status(statusCode).json({ error: errorMessage });
  }
};

const addDocument = async (req, res) => {
  const { modifiedBy, userId, body } = req;
  try {
    const externalId = uuid.v4();
    const insertedDocument = await Document.create({
      ...body,
      userId,
      modifiedBy,
      createdBy: modifiedBy,
      externalId,
    });
    res.status(200).json(insertedDocument);
  } catch (error) {
    const { statusCode, errorMessage } = await sendResponse(error);
    res.status(statusCode).json({ error: errorMessage });
  }
};

const updateDocument = async (req, res) => {
  const { modifiedBy, documentId, body } = req;
  try {
    await documentService.updateDocument(modifiedBy, documentId, body);
    res.status(200).json({ message: 'Document updated successfully' });
  } catch (error) {
    const { statusCode, errorMessage } = await sendResponse(error);
    res.status(statusCode).json({ error: errorMessage });
  }
};

const deleteDocument = async (req, res) => {
  const { documentId } = req;
  try {
    await documentService.deleteDocument(documentId);
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    const { statusCode, errorMessage } = await sendResponse(error);
    res.status(statusCode).json({ error: errorMessage });
  }
};

const getByUserId = async (req, res) => {
  const { userId } = req;
  try {
    const documents = await documentService.getByUserId(userId);
    res.status(200).json(documents);
  } catch (error) {
    const { statusCode, errorMessage } = await sendResponse(error);
    res.status(statusCode).json({ error: errorMessage });
  }
};

const findById = async (req, res) => {
  const { id } = req.params;
  try {
    const document = await documentService.findById(id);
    res.status(200).json(document);
  } catch (error) {
    const { statusCode, errorMessage } = await sendResponse(error);
    res.status(statusCode).json({ error: errorMessage });
  }
};

const searchStudentDocument = async (req, res) => {
  try {
    const { searchType, searchTerm } = req.query;
    let query;
    switch (searchType) {
      case 'name':
      query = { name: new RegExp(searchTerm, 'i') };
      break;
      case 'category':
        query = { category: new RegExp(searchTerm, 'i') };
        break;
      case 'used for':
        query = { 'used for': new RegExp(searchTerm, 'i') };
        break;
      case 'status':
        query = { status: new RegExp(searchTerm, 'i') };
        break;
      default:
        console.log('Invalid search type');
        return;
    }
    query["userId"] = studentId;
    const results = await Document.find(query);
    res.status(200).json(results);
  } catch(error) {
    const { statusCode, errorMessage } = await sendResponse(error);
    res.status(statusCode).json({ error: errorMessage });
  }
}

module.exports = {
    addDocument,
    addDocuments,
    findById,
    getByUserId,
    deleteDocument,
    updateDocument,
    searchStudentDocument
}
