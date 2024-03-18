const express = require("express");
const CaseController = require("../controllers/Case");

const router = express.Router();
const caseController = new CaseController();

router.get("/", caseController.getReason.bind(caseController));
router.get("/subReason", caseController.getSubReason.bind(caseController));
module.exports = router;
