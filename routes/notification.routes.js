const express = require("express");
const {
  addApplication,
  getApplications,
  getOneNotification,
  getNotificationController,
  dismissOneNotification,
} = require("../controllers/Notification");
const Middleware = require("../controllers/Middleware");

const router = express.Router();

router.post("/", Middleware.checkAuth, addApplication);
router.get("/", Middleware.checkAuth, getNotificationController);
router.get("/:id", Middleware.checkAuth, getOneNotification);
router.get("/:id/dismiss", Middleware.checkAuth, dismissOneNotification);

module.exports = router;
