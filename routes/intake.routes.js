const express = require("express");
const router = express.Router();
const IntakeController = require("../controllers/Intake"); 

const Middleware = require("../controllers/Middleware")


// POST /api/intake
router.post("/", Middleware.checkAuth, IntakeController.addIntake);

// GET /api/intake
router.get("/", Middleware.checkAuth, IntakeController.getIntakeList);

// GET /api/intake/program/:programId
router.get("/program/:programId", Middleware.checkAuth, IntakeController.getIntake);

module.exports = router;
