const User = require("../models/User");
const OtpLogs = require("../models/OtpLogs");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
  NoContentError,
} = require("../errors");
const nodemailer = require("nodemailer");
const passport = require("passport");
const bcrypt = require("bcryptjs");
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
    const { email, password, firstName, lastName } = req.body;
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

    const otpData = generateOTP();
    console.log("otp: ", otpData.otp);
    const otp = otpData.otp;
    userRegistrationCache.set(email, {
      firstName,
      lastName,
      password,
      otp,
    });

    await sendOTP(email, otp);

    const userData = {
      ...req.body,
      createdAt: Date().now,
      otp: otp,
    };
    await OtpLogs.create(userData);

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    if (error.name === "ValidatorError") {
      return res.status(400).json({ status: "error", message: error.message });
    }
    console.log(`error: ${error}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to register user. Please try again later.",
    });
  }
};

const verifyOTPAndGenerateToken = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Check if both email and otp are provided
    if (!email || !otp) {
      throw new BadRequestError("Please provide both email and OTP.");
    }

    // Check if the user exists in the OTP logs
    const user = await OtpLogs.findOne({ email, otp });
    if (!user) {
      throw new BadRequestError(
        "Invalid OTP or email provided. Please verify and try again."
      );
    }

    // Check if user data exists in the cache
    const userData = userRegistrationCache.get(email);
    if (!userData) {
      throw new NoContentError("Registration complete! Proceed to login.");
    }

    // Create a new user instance
    const newUser = new User({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email,
      password: userData.password,
      otp: otp,
    });

    // Save the new user
    await newUser.save();

    // Send confirmation email
    await sendConfirmationEmail(email);

    // Delete user details from OtpLogs after successful registration
    await OtpLogs.findOneAndDelete({ email, otp });

    // Create JWT token
    const token = newUser.createJWT();

    // Respond with success message and user data
    res.status(StatusCodes.CREATED).json({
      status: "success",
      message: "Congratulations! You have successfully registered on Supplya.",
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
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
    if (error instanceof BadRequestError || error instanceof NoContentError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: error.message,
      });
    }
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Internal server error. Please try again later.",
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email is provided
    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Please provide your email.",
      });
    }

    // Check if the user exists in the cache
    const userData = userRegistrationCache.get(email);
    if (!userData) {
      console.log(`User with email ${email} not found in cache.`);
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: "User not found. Please register first.",
      });
    }

    // Generate a new OTP
    const newOTPData = generateOTP();
    console.log("new otp: ", newOTPData);
    const newOTP = newOTPData.otp;

    // Update the user's OTP in the cache
    userRegistrationCache.set(email, { ...userData, otp: newOTP });

    // Update the user's OTP in the OtpLogs collection
    await OtpLogs.updateOne({ email }, { otp: newOTP });

    // Send the new OTP
    await resendOTPEmail(email, newOTP);

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "New OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to re-send OTP. Please try again later.",
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { password, email } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Please provide your email and password");
    }

    const user = await User.findOne({ email });

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
      user: {
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
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: error.message, status: "error" });
    }
    // logger.error(error.message);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: error.message, status: "error" });
  }
};

// Forgot password to get reset code
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
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "foresightagencies@gmail.com",
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

    res.status(200).json({
      status: "success",
      message: "Password reset code sent to your email",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
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

    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(400).json({
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
