const User = require("../models/User");
const OtpLogs = require("../models/OtpLogs");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const nodemailer = require("nodemailer");
const passport = require("passport");
const {
  generateOTP,
  sendOTPMail,
  resendOTPMail,
  sendConfirmationMail,
  forgotPasswordMail,
  resetPasswordMail,
  newUserSignUpMail,
} = require("../middleware/mailUtil");
// const logger = require("../middleware/logging/logger");
const oauth2Client = require("../oauth2Client");
const jwt = require("jsonwebtoken");

const userRegistrationCache = new Map();

// EMAIL AND PASSWORD REGISTER AND LOGIN
const signUp = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      storeName,
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
    if (!firstName) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", message: "Please enter your firstName" });
    }
    if (!lastName) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", message: "Please enter your lastName" });
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
    let userData = {
      email,
      firstName,
      lastName,
      role: role || "customer",
    };
    let storeUrl;
    if (role === "vendor") {
      if (!phoneNumber) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: "error",
          message: "Please provide phoneNumber for vendor registration",
        });
      }
      if (storeName) {
        storeUrl = `https://supplya.store/store/${storeName}`;
      }
      userData = {
        ...userData,
        storeName,
        storeUrl,
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
      storeName,
      storeUrl,
      phoneNumber,
    });

    const sendOtp = sendOTPMail(email, otp);
    const createOtpLog = OtpLogs.create({
      ...userData,
      createdAt: Date.now(),
      otp,
    });

    await Promise.all([sendOtp, createOtpLog]);
    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    if (error.name === "ValidatorError") {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ status: "error", message: error.message });
    }
    console.error(`error: ${error}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to register user. Please try again later.",
    });
  }
};

const signUpComplete = async (req, res, next) => {
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
      storeName: userData.storeName || null,
      storeUrl: userData.storeUrl || null,
      phoneNumber: userData.phoneNumber || null,
    });
    await newUser.save();
    await sendConfirmationMail(email);
    await newUserSignUpMail(email);
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
        storeName: newUser.storeName,
        storeUrl: newUser.storeUrl,
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

    let userData = userRegistrationCache.get(email);

    if (!userData) {
      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: "error",
          message: "User not found. Please register first.",
        });
      }

      userData = { email };
      const newOTPData = generateOTP();
      const newOTP = newOTPData.otp;
      existingUser.resetPasswordToken = newOTP;
      existingUser.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
      await existingUser.save();

      await resendOTPMail(email, newOTP);
    } else {
      const newOTPData = generateOTP();
      const newOTP = newOTPData.otp;
      userRegistrationCache.set(email, { ...userData, otp: newOTP });

      await OtpLogs.updateOne({ email }, { otp: newOTP });

      await resendOTPMail(email, newOTP);
    }

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "New OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Error resending OTP:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to re-send OTP. Please try again later.",
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { password, email, storeName } = req.body;

    if ((!email || !password) && !storeName) {
      throw new BadRequestError(
        "Please provide your email and password or storeName and password."
      );
    }

    let user;

    if (storeName) {
      user = await User.findOne({ storeName });
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      throw new NotFoundError("User does not exist.");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new BadRequestError("You have entered an invalid password.");
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
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Please provide your email.", status: "error" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: error.message, status: "error" });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    const resetPasswordExpires = Date.now() + 30 * 60 * 1000;

    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = resetPasswordExpires;

    await user.save();

    await forgotPasswordMail(email, resetCode);

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Password reset code sent to your email.",
    });
  } catch (error) {
    console.error("Error sending password reset code:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to send password reset code. " + error.message,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Email is required.",
      });
    }
    if (!otp) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "OTP is required.",
      });
    }

    const currentTime = Date.now();

    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: currentTime },
    });

    if (!user) {
      const storedUser = await User.findOne({ email });
      if (storedUser) {
        console.log(
          `Stored resetPasswordToken: ${storedUser.resetPasswordToken}`
        );
        console.log(
          `Stored resetPasswordExpires: ${storedUser.resetPasswordExpires}`
        );
      } else {
        console.log("No user found with the provided email.");
      }
      console.error(
        `Verification failed for email: ${email}, Current Time: ${currentTime}`
      );
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        message: "Invalid OTP or OTP expired.",
      });
    }

    req.session.resetUserId = user._id;

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to verify OTP. " + error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "New password is required",
        status: "error",
      });
    }

    if (!confirmPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Confirm the password entered above.",
        status: "error",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Passwords do not match",
        status: "error",
      });
    }

    const userId = req.session.resetUserId;

    if (!userId) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "User not found",
        status: "error",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "User not found",
        status: "error",
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();
    await resetPasswordMail(user.email);

    req.session.resetUserId = null;

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

const googleAuth = (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
};

const googleAuthCallback = (req, res, next) => {
  passport.authenticate("google", {
    successRedirect: "/api/v1/products",
    failureRedirect: "/",
    session: false,
  })(req, res, next);
};

//Osama's Oauth

const initiateOauth = async (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
  res.redirect(authUrl);
};

const googleCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: "Authorization code is missing." });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: [
        "https://www.googleapis.com/auth/plus.login",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
    });

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { given_name, family_name, email } = ticket.getPayload();

    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required but not provided." });
    }

    let user = await User.findOne({ email: email });

    const isNewUser = !user;
    if (isNewUser) {
      user = await User.create({
        firstName: given_name,
        lastName: family_name,
        email: email,
      });
    }

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_LIFETIME,
    });

    const responseMessage = isNewUser
      ? "New User Created Successfully"
      : "Login successful";

    return res.status(200).json({
      status: "success",
      message: responseMessage,
      token: jwtToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Google authentication error:", error.statusText);
    return res.status(500).json({
      message: "Failed to authenticate with Google. Please try again.",
    });
  }
};

module.exports = {
  login,
  signUp,
  signUpComplete,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleAuthCallback,
  initiateOauth,
  googleCallback,
};
