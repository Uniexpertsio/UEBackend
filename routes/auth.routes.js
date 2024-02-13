const { Router } = require("express");
const Auth = require("../controllers/Auth");
const Middleware = require("../controllers/Middleware");

const router = Router();

router.get("/background", Auth.get.background);
router.get("/config", Auth.get.config);
router.post("/login", Auth.post.login);
router.post("/signup", Auth.post.signup);
router.patch("/signup/:agentId", Auth.patch.signup);
router.post("/email-exist", Auth.post.emailExist);
router.post("/forgot-password", Auth.post.forgotPassword);
router.post("/verify-otp", Auth.post.verifyOtp);
router.post("/reset-password", Auth.post.resetPassword);
router.get("/tnc", Auth.get.tnc);
router.get("/profile", Middleware.checkAuth, Auth.get.profile);

module.exports = router;
