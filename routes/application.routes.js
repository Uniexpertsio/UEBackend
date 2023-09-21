const express = require("express");
const router = express.Router();
const ApplicationController = require("../controllers/Application"); // Import your controller

// POST /api/application
router.post("/", checkJwtAuthGuard, ApplicationController.addApplication);

// GET /api/application
router.get("/", checkJwtAuthGuard, ApplicationController.getApplications);

// GET /api/application/:applicationId/task
router.get("/:applicationId/task", checkJwtAuthGuard, ApplicationController.getTasks);

// PATCH /api/application/:applicationId/task/:taskId
router.patch("/:applicationId/task/:taskId", checkJwtAuthGuard, ApplicationController.updateTask);

// Define other routes in a similar manner...

module.exports = router;
