const express = require("express");
const SchoolController = require("../controllers/School");
const Middleware = require("../controllers/Middleware");

const router = express.Router();
const schoolController = new SchoolController();

router.put(
    "/",
    Middleware.checkAuth,
    schoolController.addOrUpdateSchool.bind(schoolController)
);
router.get(
    "/",
    Middleware.checkAuth,
    schoolController.getAllSchool.bind(schoolController)
);
router.get(
    "/:schoolId",
    Middleware.checkAuth,
    schoolController.getSchool.bind(schoolController)
);
router.get(
    "/by/country-state-or-school-type",
    Middleware.checkAuth,
    schoolController.getSchoolByCountryStateOrSchoolType.bind(schoolController)
);
router.get(
    "/programList/:schoolId",
    schoolController.getSchoolProgram.bind(schoolController)
);
router.get(
    "/school/:schoolSfId",
    Middleware.checkAuth,
    schoolController.getSchoolId.bind(schoolController)
);

module.exports = router;
