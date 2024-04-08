const express = require('express');
const router = express.Router();
const { addDocument, addDocuments, updateDocument, deleteDocument, getByUserId, findById, searchStudentDocument } = require('../controllers/Document');

// Routes
router.post('/addDocuments', addDocuments);
router.post('/addDocument', addDocument);
router.put('/updateDocument/:documentId', updateDocument);
router.delete('/deleteDocument/:documentId', deleteDocument);
router.get('/user/:userId', getByUserId);
router.get('/:id', findById);
router.post('/searchStudentDocument',searchStudentDocument);

module.exports = router;
