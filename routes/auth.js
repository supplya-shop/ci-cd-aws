const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  signUp,
  signUpComplete,
  resendOTP,
  login,
  verifyOTP,
  mobileCallback,
  forgotPassword,
  changePassword,
  resetPassword,
  initiateOauth,
  googleCallback,
} = require("../controllers/auth");
const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");

// Google Auth routes
router.get("/google", initiateOauth);
router.get("/google/redirect", googleCallback);

// Auth routes
router.post("/login", login);
router.post("/sign-up", signUp);
router.post("/sign-up-complete", signUpComplete);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", authenticateUser, changePassword);
// router.get('/banks', getBanks)

module.exports = router;
