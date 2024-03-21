const mongoose = require("mongoose");

const OtpLogs = new mongoose.Schema({
  email: {
    type: String,
  },
  otp: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("OtpLogs", OtpLogs);
