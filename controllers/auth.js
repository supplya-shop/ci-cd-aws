const User = require("../models/User");
const OtpLogs = require("../models/OtpLogs");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const nodemailer = require("nodemailer");
const passport = require("passport");
const {
  generateOTP,
  sendOTP,
  resendOTPEmail,
  sendConfirmationEmail,
  resetPasswordMail,
} = require("../middleware/mailUtil");
// const logger = require("../middleware/logging/logger");

const userRegistrationCache = new Map();

// EMAIL AND PASSWORD REGISTER AND LOGIN
const registerUser = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      shopName,
      phoneNumber,
    } = req.body;
    if (!email) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", message: "Please enter your email" });
    }
    if (!password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", message: "Please enter your password" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message:
          "This email already exists within our records. Please use a unique email or reset your password if you don't remember it.",
      });
    }

    if (req.body.uniqueKey === 1212) {
      req.body.role = "admin";
    } else {
      req.body.role = "customer";
    }

    let shopUrl;

    let userData = {
      email,
      password,
      firstName,
      lastName,
      role: role || "customer",
    };

    if (role === "vendor") {
      if (!shopName || !phoneNumber) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: "error",
          message:
            "Please provide shopName and phoneNumber for vendor registration",
        });
      }
      shopUrl = `https://supplya.shop/store/${shopName}`;
      userData = {
        ...userData,
        shopName,
        shopUrl,
        phoneNumber,
      };
    }

    const otpData = generateOTP();
    const otp = otpData.otp;
    userRegistrationCache.set(email, {
      firstName,
      lastName,
      password,
      otp,
      role,
      shopName,
      shopUrl,
      phoneNumber,
    });

    await sendOTP(email, otp);

    userData.createdAt = Date.now();
    userData.otp = otp;

    await OtpLogs.create(userData);

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    if (error.name === "ValidatorError") {
      return res.status(400).json({ status: "error", message: error.message });
    }
    console.error(`error: ${error}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to register user. Please try again later.",
    });
  }
};

const verifyOTPAndGenerateToken = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Please enter your email.",
      });
    }
    if (!otp) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Please enter OTP.",
      });
    }
    const user = await OtpLogs.findOne({ email, otp });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: "Wrong OTP. Please verify and retry.",
      });
    }
    const userData = userRegistrationCache.get(email);
    if (!userData) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: "An error occurred.",
      });
    }
    const newUser = new User({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email,
      password: userData.password,
      otp: otp,
      role: userData.role,
      shopName: userData.shopName,
      shopUrl: userData.shopUrl,
      phoneNumber: userData.phoneNumber,
    });
    await newUser.save();
    await sendConfirmationEmail(email);
    await OtpLogs.findOneAndDelete({ email, otp });

    const token = newUser.createJWT();

    return res.status(StatusCodes.CREATED).json({
      status: "success",
      message: "Congratulations! You have successfully registered on Supplya.",
      data: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        shopName: newUser.shopName,
        shopUrl: newUser.shopUrl,
        dob: newUser.dob,
        role: newUser.role,
        gender: newUser.gender,
        country: newUser.country,
        city: newUser.city,
        state: newUser.state,
        address: newUser.address,
        createdAt: newUser.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Internal server error. Please try again later.",
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Please provide your email.",
      });
    }

    const userData = userRegistrationCache.get(email);
    if (!userData) {
      console.log(`User with email ${email} not found in cache.`);
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: "User not found. Please register first.",
      });
    }

    const newOTPData = generateOTP();
    const newOTP = newOTPData.otp;

    userRegistrationCache.set(email, { ...userData, otp: newOTP });

    await OtpLogs.updateOne({ email }, { otp: newOTP });

    await resendOTPEmail(email, newOTP);

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "New OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    // console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to re-send OTP. Please try again later.",
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { password, email, shopName } = req.body;

    if ((!email || !password) && !shopName) {
      throw new BadRequestError(
        "Please provide your email and password or shopName and password"
      );
    }

    let user;

    // Check if the login attempt is using shopName
    if (shopName) {
      user = await User.findOne({ shopName });
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      throw new NotFoundError("User does not exist");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new BadRequestError("You have entered an invalid password");
    }

    const token = user.createJWT();
    const refreshToken = user.createRefreshToken();

    // logger.info(user.role + " " + user.email + " just logged in.");

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Login successful",
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dob: user.dob,
        role: user.role,
        gender: user.gender,
        businessName: user.businessName,
        isSoleProprietor: user.isSoleProprietor,
        bvn: user.bvn,
        bank: user.bank,
        accountNumber: user.accountNumber,
        country: user.country,
        state: user.state,
        address: user.address,
        createdAt: user.createdAt,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    if (error.status === 404) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: error.message, status: "error" });
    }
    // logger.error(error.message);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: error.message, status: "error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new Error("Please provide your email");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Invalid Email");
    }

    // Generate a random 5-digit code
    const resetCode = Math.floor(10000 + Math.random() * 90000).toString();

    // Set expiry for 30 minutes
    const resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: resetCode,
          resetPasswordExpires: resetPasswordExpires,
        },
      }
    );

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p style="font-size:16px;">You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
        <p style="font-size:16px;">Your password reset code is:</p>
        <p style="font-size:24px; color: blue;">${resetCode}</p>
        <p style="font-size:16px;">This code will expire in 30 minutes. Please go to the following page and enter this code to reset your password:</p>
        <a href="https:/localhost:3000/auth/reset" style="font-size:16px;">Reset Password</a>
        <p style="font-size:16px;">If you did not request a password reset, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Password reset code sent to your email",
    });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message,
    });
  }
};

// Reset password action
const resetPassword = async (req, res) => {
  try {
    const { resetCode, newPassword } = req.body;

    if (!resetCode || !newPassword) {
      throw new Error("Reset code and new password are required");
    }

    const user = await User.findOne({
      resetPasswordToken: resetCode,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      throw new Error("Invalid reset code or code expired");
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    await resetPasswordMail(user.email);

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message,
    });
  }
};

// Google OAuth authentication route
const googleAuth = (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
};

// Google OAuth callback route
const googleAuthCallback = (req, res, next) => {
  passport.authenticate("google", {
    successRedirect: "/api/v1/products",
    failureRedirect: "/",
    session: false,
  })(req, res, next);
};

module.exports = {
  login,
  registerUser,
  verifyOTPAndGenerateToken,
  resendOTP,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleAuthCallback,
};
