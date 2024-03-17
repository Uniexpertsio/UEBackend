const express = require("express");
const CaseController = require("../controllers/Case");

const router = express.Router();
const caseController = new CaseController();

router.put("/:id", caseController.updateAttachment.bind(caseController));

module.exports = router;
