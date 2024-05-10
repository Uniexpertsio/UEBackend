const express = require("express");
const ScriptController =require("../controllers/Script")
const router = express.Router();
const scriptController = new ScriptController();

router.get("/school",scriptController.schoolSync.bind(scriptController))
router.get("/program",scriptController.programSync.bind(scriptController))

module.exports = router;
