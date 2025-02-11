const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const Wallet = require("./Wallet");

require("dotenv");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      // required: [true, "Please provide your firstName"],
      // minlength: [2, "Name too short"],
      maxLength: [50, "Name too long"],
    },
    lastName: {
      type: String,
      // required: [true, "Please provide your lastName"],
      // minlength: [2, "Name too short"],
      maxLength: [50, "Name too long"],
    },
    email: {
      type: String,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
      unique: true,
      lowercase: true,
      sparse: true,
    },
    password: {
      type: String,
    },
    phoneNumber: {
      type: String,
      sparse: true,
      unique: true,
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
    updatedAt: {
      type: Date,
    },
    otp: {
      type: Number,
    },
    referralCode: {
      type: String,
      unique: true,
    },
    referredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    referralCodeUsageCount: {
      type: Number,
      default: 0, // Tracks how many times the referral code was used
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId, // References the referrer (User)
      ref: "User",
      default: null, // Null if no referrer
    },
    dob: {
      type: Date,
      default: "",
    },
    isSoleProprietor: {
      type: Boolean,
      default: false,
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
    lastLogin: {
      type: Date,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
    },
  },
  { timestamps: true }
);

userSchema.index(
  { phoneNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { phoneNumber: { $type: "string", $ne: "" } },
  }
);

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre("save", function (next) {
  if (!this.isModified("referralCode")) {
    // Generate a unique referral code (e.g., based on user's firstName and ObjectId)
    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    this.referralCode = `SPLY-${randomString}`;
  }
  next();
});

userSchema.pre("remove", async function (next) {
  try {
    await Product.deleteMany({ createdBy: this._id });
    next();
  } catch (err) {
    console.error("Error in pre remove middleware:", err);
    next(err);
  }
});

userSchema.post("save", async function (doc, next) {
  try {
    if (!doc.walletId) {
      const wallet = await Wallet.create({ userId: doc._id });
      doc.walletId = wallet._id;
      await doc.save();
    }
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.createJWT = function () {
  return jwt.sign(
    {
      userid: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      googleId: this.googleId,
      phoneNumber: this.phoneNumber,
      uniqueKey: this.uniqueKey,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      dob: this.dob,
      blocked: this.blocked,
      lastLogin: this.lastLogin,
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
      googleId: this.googleId,
      phoneNumber: this.phoneNumber,
      email: this.email,
      dob: this.dob,
      uniqueKey: this.uniqueKey,
      role: this.role,
      createdAt: this.createdAt,
      blocked: this.blocked,
      lastLogin: this.lastLogin,
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
