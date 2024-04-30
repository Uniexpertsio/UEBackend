// Import necessary modules
const { Router } = require("express");
const Auth = require("../controllers/Auth");
const Middleware = require("../controllers/Middleware");

// Create router instance
const router = Router();

// Route for getting background information
router.get("/background", Auth.get.background);

// Route for getting configuration
router.get("/config", Auth.get.config);

// Route for user login
router.post("/login", Auth.post.login);

// Route for user signup
router.post("/signup", Auth.post.signup);

// Route for updating signup information
router.patch("/signup/:agentId", Auth.patch.signup);

// Route for checking if email exists
router.post("/email-exist", Auth.post.emailExist);

// Route for initiating password reset
router.post("/forgot-password", Auth.post.forgotPassword);

// Route for verifying OTP (One Time Password)
router.post("/verify-otp", Auth.post.verifyOtp);

// Route for resetting password
router.post("/reset-password", Auth.post.resetPassword);

// Route for getting terms and conditions
router.get("/tnc", Auth.get.tnc);

// Route for getting user profile, requires authentication
router.get("/profile", Middleware.checkAuth, Auth.get.profile);

// Export the router
module.exports = router;
