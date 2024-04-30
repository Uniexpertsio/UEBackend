// Importing required modules
const express = require("express");
const CaseController = require("../controllers/Case");
const Middleware = require("../controllers/Middleware");

// Creating router instance
const router = express.Router();
const caseController = new CaseController();

// Route to get all cases, with authentication middleware
router.get(
  "/",
  Middleware.checkAuth,
  caseController.getAllCases.bind(caseController)
);

// Route to get a specific case by ID
router.get("/:id", caseController.getCaseById.bind(caseController));

// Route to create a new case
router.post("/", caseController.createCase.bind(caseController));

// Route to create a comment for a specific case, with authentication middleware
router.post(
  "/:caseId/comment",
  Middleware.checkAuth,
  caseController.createCaseComment.bind(caseController)
);

// Route to get comments for a specific case, with authentication middleware
router.get(
  "/:caseId/comment",
  Middleware.checkAuth,
  caseController.getCaseComments.bind(caseController)
);

// Route to update a case by ID
router.put("/:id", caseController.updateCase.bind(caseController));

// Route to delete a case by ID
router.delete("/:id", caseController.deleteCase.bind(caseController));

// Route to reply to a comment on a case, with authentication middleware
router.patch(
  "/replyComment",
  Middleware.checkAuth,
  caseController.replyComment.bind(caseController)
);

// Exporting the router instance
module.exports = router;
