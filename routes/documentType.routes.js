const express = require('express');
const router = express.Router();
const {
  getStudentDocumentType,
  getStudentApplicationDocumentType,
  getPartnerDocumentType,
  addDocumentType
} = require("../controllers/DocumentType");
const Middleware = require("../controllers/Middleware")

// Routes
router.get('/student', Middleware.checkAuth, getStudentDocumentType);
router.get('/application', Middleware.checkAuth, getStudentApplicationDocumentType);
router.get('/partner', Middleware.checkAuth, getPartnerDocumentType);
router.post('/', addDocumentType);

module.exports = router;
