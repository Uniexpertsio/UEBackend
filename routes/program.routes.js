const express = require("express");

const ProgramController = require("../controllers/Program");
const Middleware = require("../controllers/Middleware")

const router = express.Router();
const programController = new ProgramController();

router.post(
  "/school/:schoolId",
  Middleware.checkAuth,
  programController.addProgram
);

router.get("/school/:schoolId", Middleware.checkAuth, programController.getPrograms);

router.post("/search", Middleware.checkAuth, programController.searchProgram);

router.get("/:programId", Middleware.checkAuth, programController.getProgram);

router.get("/:programId/similar", Middleware.checkAuth, programController.getSimilarProgram);

router.get("/:programId/eligibility", Middleware.checkAuth, programController.checkEligibility);

router.get("/by/country-and-discipline", Middleware.checkAuth, programController.getProgramByCountryAndDiscipline);

module.exports = router;
