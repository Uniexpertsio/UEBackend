const express = require("express");
const CaseController = require("../controllers/Case");
const Middleware = require("../controllers/Middleware");

const router = express.Router();
const caseController = new CaseController();

router.get("/",Middleware.checkAuth, caseController.getAllCases.bind(caseController));
router.get("/:id", caseController.getCaseById.bind(caseController));
router.post("/", caseController.createCase.bind(caseController));
router.post("/:caseId/comment", Middleware.checkAuth, caseController.createCaseComment.bind(caseController));
router.get("/:caseId/comment", Middleware.checkAuth, caseController.getCaseComments.bind(caseController));
router.put("/:id", caseController.updateCase.bind(caseController));
router.delete("/:id", caseController.deleteCase.bind(caseController));
router.patch("/:sfId/replyComment", Middleware.checkAuth, caseController.replyComment.bind(caseController));
module.exports = router;
