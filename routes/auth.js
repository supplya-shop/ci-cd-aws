const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  registerUser,
  login,
  getBanks,
  googleAuth,
  googleAuthCallback,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");

// Google Auth routes
router.get("/google/authenticate", googleAuth);
router.get("/google/callback", googleAuthCallback);

// router.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/login",
//     session: false,
//   }),
//   (req, res) => {
//     // Redirect user to the appropriate page after successful authentication
//     res.redirect("/");
//   }
// );

router.post("/login", login);
router.post("/register", registerUser);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
// router.get('/banks', getBanks)

module.exports = router;
