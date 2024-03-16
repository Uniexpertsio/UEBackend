const express = require("express");
const CaseController = require("../controllers/Case");

const router = express.Router();
const caseController = new CaseController();

router.get("/", caseController.getAllCases.bind(caseController));
router.get("/:id", caseController.getCaseById.bind(caseController));
router.post("/", caseController.createCase.bind(caseController));
router.put("/:id", caseController.updateCase.bind(caseController));
router.delete("/:id", caseController.deleteCase.bind(caseController));
module.exports = router;
