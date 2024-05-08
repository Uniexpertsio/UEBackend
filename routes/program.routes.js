const express = require("express");

const ProgramController = require("../controllers/Program");
const Middleware = require("../controllers/Middleware")

const router = express.Router();
const programController = new ProgramController();

router.put(
  "/",
  Middleware.checkAuth,
  programController.addOrUpdateProgram
);

router.get("/school/:schoolId", Middleware.checkAuth, programController.getPrograms);

router.post("/search", Middleware.checkAuth, programController.searchProgram);

router.get("/:programId", Middleware.checkAuth, programController.getProgram);

router.get("/:programId/similar", Middleware.checkAuth, programController.getSimilarProgram);

router.get("/:programId/eligibility", Middleware.checkAuth, programController.checkEligibility);

router.get("/by/country-and-discipline", Middleware.checkAuth, programController.getProgramByCountryAndDiscipline);

router.get("/", Middleware.checkAuth, programController.getAllProgram);

module.exports = router;
