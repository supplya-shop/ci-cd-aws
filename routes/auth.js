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
  resetPassword,
  initiateOauth,
  googleCallback,
} = require("../controllers/auth");

// Google Auth routes
router.get("/google", initiateOauth);
router.get("/google/redirect", googleCallback);
router.post("/google/mobile", mobileCallback);


// Auth routes
router.post("/login", login);
router.post("/sign-up", signUp);
router.post("/sign-up-complete", signUpComplete);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


module.exports = router;
