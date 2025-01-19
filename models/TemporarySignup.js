const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../middleware/encryption"); // Path to your encryption utility

const temporarySignupSchema = new mongoose.Schema({
  email: { type: String, lowercase: true, sparse: true },
  phoneNumber: { type: String, sparse: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ["customer", "vendor"], default: "customer" },
  password: { type: String, required: true },
  otp: { type: String, required: true },
  storeName: { type: String },
  storeUrl: { type: String },
  expiresAt: { type: Date, required: true },
});

temporarySignupSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = encrypt(this.password);
  }
  next();
});

temporarySignupSchema.methods.getDecryptedPassword = function () {
  return decrypt(this.password);
};

module.exports = mongoose.model("TemporarySignup", temporarySignupSchema);
