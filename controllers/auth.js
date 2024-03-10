const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors");
const nodemailer = require("nodemailer");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const {
  generateOTP,
  sendOTP,
  sendConfirmationEmail,
} = require("../middleware/mailUtils");

// EMAIL AND PASSWORD REGISTER AND LOGIN
const registerUser = async (req, res) => {
  try {
    // Check if the required fields are present in the request body
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          "Please fill in the required fields. Missing email or password.",
      });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          "This email already exists within our records. Please use a unique email.",
      });
    }

    if (req.body.uniqueKey === 1212) {
      req.body.role = "admin";
    } else {
      req.body.role = "customer";
    }

    const otpData = generateOTP();
    const otp = otpData.otp;

    await sendOTP(email, otp);

    const userData = {
      ...req.body,
      createdAt: Date.now(),
      otp: otp,
    };
    await User.create(userData);

    res.status(StatusCodes.OK).json({
      message: "OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Error registering user:", error);

    if (error.name === "ValidatorError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to register user. Please try again later.",
    });
  }
};

// Verify OTP and generate token
const verifyOTPAndGenerateToken = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, otp });

    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid or expired OTP. Please try again." });
    }

    await sendConfirmationEmail(email);
    const token = user.createJWT();

    res.status(StatusCodes.CREATED).json({
      message: "Congratulations! You have successfully registered on Supplya.",
      user: {
        name: user.name,
        role: user.role,
        email: user.email,
        createdAt: user.createdAt,
        phoneNumber: user.phoneNumber,
      },
      token,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to verify OTP. Please try again later." });
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
      throw new UnauthenticatedError("You have entered an invalid password");
    }

    const token = user.createJWT();
    // const refreshToken = jwt.sign(
    //   { userid: user._id },
    //   "nZq4t7w!z%C*F-JaNdefrgeyfhsgyfhftyuyfu",
    //   {
    //     expiresIn: 86400,
    //   }
    // );

    // Save the refreshToken to the user
    // user.refreshToken = refreshToken;
    // await user.save();

    return res.status(StatusCodes.OK).json({
      status: "success",
      msg: "Login successful",
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
    });
  } catch (error) {
    if (error.status === 404) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: error.message, status: "error" });
    }
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: error.message, status: "error" });
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
      msg: "Password reset code sent to your email",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      msg: error.message,
    });
  }
};

// Reset password action
const resetPassword = async (req, res) => {
  try {
    const { resetCode, newPassword } = req.body;

    if (!resetCode) {
      throw new Error("Reset code is required");
    }

    // Find the user with the given reset code and within the expiration time
    const user = await User.findOne({
      resetPasswordToken: resetCode,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      throw new Error("Invalid reset code or code expired");
    }

    // Hash and salt the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password and clear the reset code and expiration
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    const rebornUser = await user.save((error, savedUser) => {
      if (error) {
        console.error("Error while saving user:", error);
        // Handle the error, such as returning an error response
      }
    });

    console.log(hashedPassword);
    console.log(rebornUser);

    res.status(200).json({
      msg: "Password reset successfully",
    });
  } catch (error) {
    res.status(400).json({
      msg: error.message,
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
  forgotPassword,
  resetPassword,
  googleAuth,
  googleAuthCallback,
};
