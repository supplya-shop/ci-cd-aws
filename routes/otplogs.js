const express = require("express");
const router = express.Router();
const OtpLogs = require("../models/OtpLogs");
const { getAllOtpLogs } = require("../controllers/otplogs");

const {
  authenticateUser,
  roleMiddleware,
} = require("../middleware/authenticateUser");

//user routes
router.get("/", getAllOtpLogs);

module.exports = router;
