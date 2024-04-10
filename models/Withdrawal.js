const mongoose = require("mongoose");
const User = require("./User");

const withdrawalSchema = new mongoose.Schema({
  name: {
    type: String,
  },

  accountNumber: {
    type: Number,
    required: [true, "Please provide account number"],
  },

  pin: {
    type: Number,
  },

  bank: {
    type: String,
  },

  amount: {
    type: Number,
    required: [true, "Please provide withdrawal amount"],
  },

  withdrawalStatus: {
    type: String,
    enum: ["pending", "approved", "declined"],
    default: "pending",
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide a user"],
  },

  createdAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
