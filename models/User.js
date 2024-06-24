const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please provide your firstName"],
    minlength: [2, "Name too short"],
    maxLength: [50, "Name too long"],
  },
  lastName: {
    type: String,
    required: [true, "Please provide your lastName"],
    minlength: [2, "Name too short"],
    maxLength: [50, "Name too long"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
  },
  phoneNumber: {
    type: String,
    default: "",
  },
  uniqueKey: {
    type: Number,
    default: 9292,
  },
  displayName: {
    type: String,
    lowercase: true,
  },
  country: {
    type: String,
    default: "Nigeria",
  },
  state: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  postalCode: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
  },
  bvn: {
    type: String,
  },
  role: {
    type: String,
    enum: ["customer", "admin", "vendor"],
    default: "customer",
    required: [true, "Please select a role"],
    lowercase: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  otp: {
    type: Number,
  },
  dob: {
    type: Date,
    default: "",
  },
  isSoleProprietor: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
  },
  profileImage: {
    type: String,
    default: "",
  },
  storeName: {
    type: String,
    default: "",
    unique: true,
  },
  storeImage: {
    type: String,
    default: "",
  },
  storeUrl: {
    type: String,
    unique: true,
    sparse: true,
    default: "",
  },
  storeAddress: {
    type: String,
    default: "",
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  accountNumber: {
    type: String,
    default: "",
  },
  bank: {
    type: String,
    default: "",
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalStock: {
    type: Number,
    default: 0,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre("remove", async function (next) {
  try {
    await Product.deleteMany({ createdBy: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.createJWT = function () {
  return jwt.sign(
    {
      userid: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      country: this.country,
      state: this.state,
      address: this.address,
      city: this.city,
      postalCode: this.postalCode,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      isSoleProprietor: this.isSoleProprietor,
      description: this.description,
      businessName: this.businessName,
      googleId: this.googleId,
      phoneNumber: this.phoneNumber,
      uniqueKey: this.uniqueKey,
      email: this.email,
      accountNumber: this.accountNumber,
      bank: this.bank,
      role: this.role,
      createdAt: this.createdAt,
      dob: this.dob,
      blocked: this.blocked,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};

userSchema.methods.createRefreshToken = function () {
  return jwt.sign(
    {
      userid: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      country: this.country,
      state: this.state,
      address: this.address,
      city: this.city,
      postalCode: this.postalCode,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      isSoleProprietor: this.isSoleProprietor,
      description: this.description,
      businessName: this.businessName,
      googleId: this.googleId,
      phoneNumber: this.phoneNumber,
      uniqueKey: this.uniqueKey,
      email: this.email,
      blocked: this.blocked,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};

userSchema.methods.comparePassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);
  console.log("isMatch:", isMatch);
  return isMatch;
};

module.exports = mongoose.model("User", userSchema);
