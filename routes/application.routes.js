const express = require("express");
const Middleware = require("../controllers/Middleware");

const router = express.Router();
const ApplicationController = require("../controllers/Application"); // Import your controller

// POST /api/application
router.post("/", Middleware.checkAuth, ApplicationController.addApplication);

// GET /api/application
router.get("/", Middleware.checkAuth, ApplicationController.getApplications);

// GET /api/application/:applicationId/task
router.get("/:applicationId/task", Middleware.checkAuth, ApplicationController.getTasks);

// PATCH /api/application/:applicationId/task/:taskId
router.patch("/:applicationId/task/:taskId", Middleware.checkAuth, ApplicationController.updateTask);

// Define other routes in a similar manner...

module.exports = router;
