const express = require("express");
const router = express.Router();
const TestScoreController = require("../controllers/TestScore"); 
const Middleware = require("../controllers/Middleware");

// GET /api/test-score/exam-type
router.get("/exam-type", Middleware.checkAuth, TestScoreController.getExamType);

// GET /api/test-score/fields
router.get("/fields",  Middleware.checkAuth, TestScoreController.getTestScoreFields);

module.exports = router;
