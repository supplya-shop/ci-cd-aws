const express = require("express");
const router = express.Router();
const OtpLogs = require("../models/OtpLogs");
const { getAllOtpLogs, bulkdeleteOtpLogs } = require("../controllers/otplogs");

const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");

//user routes
router.get("/", getAllOtpLogs);
router.delete("/", bulkdeleteOtpLogs);

module.exports = router;
