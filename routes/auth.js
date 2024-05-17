const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  registerUser,
  verifyOTPAndGenerateToken,
  resendOTP,
  login,
  // vendorLogin,
  // getBanks,
  googleAuth,
  googleAuthCallback,
  forgotPassword,
  resetPassword,
  initiateOauth,
  googleCallback
} = require("../controllers/auth");

// Google Auth routes
router.get("/google", initiateOauth);
router.get("/google/redirect", googleCallback);

// Regular Auth routes
router.post("/login", login);
// router.post("/vendor/login", vendorLogin);
router.post("/register", registerUser);
router.post("/verify-otp", verifyOTPAndGenerateToken);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
// router.get('/banks', getBanks)

module.exports = router;
