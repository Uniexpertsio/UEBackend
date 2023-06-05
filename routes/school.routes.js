const express = require("express");
const SchoolController =  require("../controllers/School");

const router = express.Router();
const schoolController = new SchoolController();

router.post("/", schoolController.addSchool.bind(schoolController));
router.get("/", schoolController.getAllSchool.bind(schoolController));
router.get("/:schoolId", schoolController.getSchool.bind(schoolController));
router.get("/by/country-state-or-school-type", schoolController.getSchoolByCountryStateOrSchoolType.bind(schoolController));

module.exports = router;
