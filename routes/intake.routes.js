const express = require("express");
const router = express.Router();
const IntakeController = require("../controllers/Intake"); 

const Middleware = require("../controllers/Middleware")


// PUT /api/intake
router.put("/", Middleware.checkAuth, IntakeController.addOrUpdateIntake);

// GET /api/intake
router.get("/", Middleware.checkAuth, IntakeController.getIntakeList);

// GET /api/intake/program/:programId
router.get("/intake/:programId", Middleware.checkAuth, IntakeController.getIntake);

module.exports = router;
