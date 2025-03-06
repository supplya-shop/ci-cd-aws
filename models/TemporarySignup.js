const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../middleware/encryption");

const temporarySignupSchema = new mongoose.Schema({
  email: { type: String, lowercase: true, sparse: true },
  phoneNumber: { type: String, sparse: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ["customer", "vendor"], default: "customer" },
  password: { type: String, required: true },
  otp: { type: String, required: true },
  storeName: { type: String, sparse: true },
  storeUrl: {
    type: String,
    unique: true,
    sparse: true,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  expiresAt: { type: Date, required: true },
});

temporarySignupSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = encrypt(this.password);
  }
  next();
});

temporarySignupSchema.index(
  { referralCode: 1 },
  { unique: true, sparse: true }
);

temporarySignupSchema.methods.getDecryptedPassword = function () {
  return decrypt(this.password);
};

module.exports = mongoose.model("TemporarySignup", temporarySignupSchema);
