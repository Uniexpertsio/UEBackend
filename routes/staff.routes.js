const express = require("express");
const router = express.Router();
const StaffController = require("../controllers/Staff"); 
const Middleware = require("../controllers/Middleware");


// GET /api/staff
router.get("/", Middleware.checkAuth, StaffController.getAllStaff);

// POST /api/staff
router.post("/", Middleware.checkAuth, StaffController.addStaff);

// POST /api/staff/:staffId
router.post("/:staffId",  Middleware.checkAuth, StaffController.updateStaff);

// GET /api/staff/:staffId
router.get("/:staffId",  Middleware.checkAuth, StaffController.getStaff);

// PATCH /api/staff/:staffId/password
router.patch("/:staffId/password",  Middleware.checkAuth, StaffController.changePassword);

// PATCH /api/staff/:staffId/active-status
router.patch("/:staffId/active-status",  Middleware.checkAuth, StaffController.changeActiveStatus);

// GET /api/staff/me/details
router.get("/me/details",  Middleware.checkAuth, StaffController.getMyProfile);

// PATCH /api/staff/me/notifications
router.patch("/me/notifications",  Middleware.checkAuth, StaffController.updateNotifications);

// PATCH /api/staff/me/dp
router.patch("/me/dp",  Middleware.checkAuth, StaffController.updateDp);

module.exports = router;