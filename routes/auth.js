const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  registerUser,
  verifyOTPAndGenerateToken,
  resendOTP,
  login,
  verifyOTP,
  // getBanks,
  googleAuth,
  googleAuthCallback,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");

// Google Auth routes
router.get("/google", googleAuth);
router.get("/google/redirect", googleAuthCallback);

// Regular Auth routes
router.post("/login", login);
// router.post("/vendor/login", vendorLogin);
router.post("/register", registerUser);
router.post("/verifyotp", verifyOTP);
router.post("/verify-otp", verifyOTPAndGenerateToken);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
// router.get('/banks', getBanks)

module.exports = router;
