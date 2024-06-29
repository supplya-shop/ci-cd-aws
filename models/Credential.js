const mongoose = require("mongoose");

const credentialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "credential name is required"],
    unique: true,
    maxlength: [50, "credential name cannot exceed 50 characters"],
  },
  description: {
    type: String,
    maxlength: [500, "credential description cannot exceed 500 characters"],
  },
  value: {
    type: String,
    maxlength: [200, "value cannot exceed 500 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("credential", credentialSchema);
