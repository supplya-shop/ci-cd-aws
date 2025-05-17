// const User = require("../models/User");
// const TemporarySignup = require("../models/TemporarySignup");
// // const Notification = require("../models/Notification");
// const OtpLogs = require("../models/OtpLogs");
// const { StatusCodes } = require("http-status-codes");
// const { BadRequestError, NotFoundError } = require("../errors");
// const passport = require("passport");
// const bcrypt = require("bcryptjs");
// const {
//   generateOTP,
//   sendOTPMail,
//   resendOTPMail,
//   sendConfirmationMail,
//   forgotPasswordMail,
//   resetPasswordMail,
//   newUserSignUpMail,
//   newVendorSignUpMail,
// } = require("../middleware/mailUtil");
// const { sendOtpViaTermii } = require("../service/TermiiService");
// // const logger = require("../middleware/logging/logger");
// const oauth2Client = require("../oauth2Client");
// const jwt = require("jsonwebtoken");

// const signUp = async (req, res) => {
//   try {
//     const {
//       email,
//       password,
//       firstName,
//       lastName,
//       role,
//       storeName,
//       phoneNumber,
//       referralCode,
//     } = req.body;

//     if (!email && !phoneNumber) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: false,
//         message: "Provide email or phone number.",
//       });
//     }

//     if (!password || !firstName || !lastName) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: false,
//         message: "Incomplete signup details.",
//       });
//     }

//     let existingUser = null;
//     if (email) {
//       existingUser = await User.findOne({ email });
//     } else if (phoneNumber) {
//       existingUser = await User.findOne({ phoneNumber });
//     }

//     if (existingUser) {
//       return res.status(StatusCodes.CONFLICT).json({
//         status: false,
//         message: "User already exists.",
//       });
//     }

//     await TemporarySignup.deleteOne({
//       $or: [{ email }, { phoneNumber }],
//     });

//     if (role === "vendor" && storeName) {
//       const storeExists = await User.findOne({ storeName });
//       if (storeExists) {
//         return res.status(StatusCodes.CONFLICT).json({
//           status: false,
//           message: "Store name already taken.",
//         });
//       }
//     }

//     let referringUser = null;
//     if (referralCode) {
//       referringUser = await User.findOne({ referralCode });
//       if (!referringUser) {
//         return res.status(StatusCodes.BAD_REQUEST).json({
//           status: false,
//           message: "Invalid referral code.",
//         });
//       }
//     }

//     if (
//       referringUser &&
//       ((email && referringUser.email === email) ||
//         (phoneNumber && referringUser.phoneNumber === phoneNumber))
//     ) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: false,
//         message: "You cannot use your own referral code.",
//       });
//     }

//     const { otp } = generateOTP();

//     let tempSignup = null;
//     if (email) {
//       tempSignup = await TemporarySignup.findOne({ email });
//     } else if (phoneNumber) {
//       tempSignup = await TemporarySignup.findOne({ phoneNumber });
//     }
//     if (tempSignup) {
//       tempSignup.set({
//         otp,
//         password,
//         firstName,
//         lastName,
//         role: role || "customer",
//         storeName,
//         storeUrl: storeName ? `https://supplya.store/store/${storeName}` : null,
//         referralCode,
//         expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Extend expiry
//       });
//       await tempSignup.save();
//     } else {
//       tempSignup = new TemporarySignup({
//         email,
//         phoneNumber,
//         firstName,
//         lastName,
//         password,
//         otp,
//         role: role || "customer",
//         storeName,
//         storeUrl: storeName ? `https://supplya.store/store/${storeName}` : null,
//         referralCode,
//         expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10-minute expiry
//       });
//       await tempSignup.save();
//     }
//     if (email) await sendOTPMail(email, otp);
//     if (phoneNumber) await sendOtpViaTermii(phoneNumber, otp);

//     return res.status(StatusCodes.OK).json({
//       status: true,
//       message: `OTP sent. Check your ${phoneNumber ? "WhatsApp" : "email"}.`,
//     });
//   } catch (error) {
//     console.error("Signup error:", error);
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       status: false,
//       message: "Signup failed.",
//     });
//   }
// };

// const signUpComplete = async (req, res) => {
//   try {
//     const { email, phoneNumber, otp } = req.body;
//     const identifier = phoneNumber || email;

//     if (!identifier || !otp) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: false,
//         message: "Missing identifier or OTP.",
//       });
//     }

//     let tempSignup = null;
//     if (email) {
//       tempSignup = await TemporarySignup.findOne({ email });
//     } else if (phoneNumber) {
//       tempSignup = await TemporarySignup.findOne({ phoneNumber });
//     }

//     if (!tempSignup || new Date() > tempSignup.expiresAt) {
//       return res.status(StatusCodes.NOT_FOUND).json({
//         status: false,
//         message: "OTP expired or not found.",
//       });
//     }

//     if (tempSignup.otp !== otp) {
//       return res.status(StatusCodes.UNAUTHORIZED).json({
//         status: false,
//         message: "Invalid OTP.",
//       });
//     }

//     const decryptedPassword = tempSignup.getDecryptedPassword();

//     const newUser = new User({
//       firstName: tempSignup.firstName,
//       lastName: tempSignup.lastName,
//       email: tempSignup.email,
//       phoneNumber: tempSignup.phoneNumber,
//       password: decryptedPassword,
//       role: tempSignup.role,
//       storeName: tempSignup.storeName,
//       storeUrl: tempSignup.storeUrl,
//     });

//     await newUser.save();

//     if (tempSignup.referralCode) {
//       const referringUser = await User.findOne({
//         referralCode: tempSignup.referralCode,
//       });

//       if (referringUser) {
//         referringUser.referralCodeUsageCount += 1;
//         referringUser.referredUsers.push(newUser._id);
//         await referringUser.save();

//         newUser.referredBy = referringUser._id;
//       }
//     }

//     await newUser.save();

//     if (tempSignup.email) {
//       if (tempSignup.role === "vendor") {
//         await newVendorSignUpMail(tempSignup.email);
//         await sendConfirmationMail(tempSignup.email);
//       } else {
//         await newUserSignUpMail(tempSignup.email);
//         await sendConfirmationMail(tempSignup.email);
//       }
//     } else if (tempSignup.phoneNumber) {
//       await newUserSignUpMail(tempSignup.phoneNumber);
//     }

//     await TemporarySignup.deleteOne({ _id: tempSignup._id });

//     const token = newUser.createJWT();
//     newUser.lastLogin = Date.now();

//     return res.status(StatusCodes.CREATED).json({
//       status: true,
//       message: "Signup completed successfully.",
//       data: {
//         _id: newUser._id,
//         firstName: newUser.firstName,
//         lastName: newUser.lastName,
//         email: newUser.email,
//         phoneNumber: newUser.phoneNumber,
//         role: newUser.role,
//         storeName: newUser.storeName,
//         storeUrl: newUser.storeUrl,
//         referralCode: newUser.referralCode,
//         referredBy: newUser.referredBy,
//         walletId: newUser.walletId,
//         referralCodeUsageCount: newUser.referralCodeUsageCount,
//         referredUsers: newUser.referredUsers,
//         gender: newUser.gender,
//         country: newUser.country,
//         city: newUser.city,
//         state: newUser.state,
//         address: newUser.address,
//         createdAt: newUser.createdAt,
//         lastLogin: newUser.lastLogin,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("Error completing signup:", error);
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       status: false,
//       message: "Signup failed.",
//     });
//   }
// };

// const resendOTP = async (req, res) => {
//   try {
//     const { email, phoneNumber } = req.body;
//     const identifier = phoneNumber || email;

//     if (!identifier) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: false,
//         message: "Provide email or phone number.",
//       });
//     }

//     const tempSignup = await TemporarySignup.findOne({
//       $or: [{ email }, { phoneNumber }],
//     });

//     if (!tempSignup || new Date() > tempSignup.expiresAt) {
//       return res.status(StatusCodes.NOT_FOUND).json({
//         status: false,
//         message: "No active signup session found.",
//       });
//     }

//     const { otp } = generateOTP();
//     tempSignup.otp = otp;
//     tempSignup.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
//     await tempSignup.save();

//     if (tempSignup.email) {
//       await resendOTPMail(tempSignup.email, otp);
//     }
//     if (tempSignup.phoneNumber) {
//       await sendOtpViaTermii(tempSignup.phoneNumber, otp);
//     }

//     return res.status(StatusCodes.OK).json({
//       status: true,
//       message: `New OTP sent successfully. Please check your ${
//         phoneNumber ? "WhatsApp" : "email"
//       }.`,
//     });
//   } catch (error) {
//     console.error("Error resending OTP:", error);
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       status: false,
//       message: "Failed to resend OTP. Please try again later.",
//     });
//   }
// };

// const login = async (req, res, next) => {
//   try {
//     const { password, email, storeName, phoneNumber } = req.body;

//     if ((!email || !password) && !storeName && !phoneNumber) {
//       throw new BadRequestError(
//         "Please provide either one of your email, phone number or store name and password to proceed."
//       );
//     }

//     let user;

//     if (storeName) {
//       user = await User.findOne({ storeName });
//     } else if (phoneNumber) {
//       user = await User.findOne({ phoneNumber });
//     } else {
//       user = await User.findOne({ email });
//     }

//     if (!user) {
//       throw new NotFoundError("User does not exist.");
//     }

//     const isPasswordValid = await user.comparePassword(password);

//     if (!isPasswordValid) {
//       throw new BadRequestError("You have entered an invalid password.");
//     }

//     const token = user.createJWT();
//     const refreshToken = user.createRefreshToken();
//     user.lastLogin = Date.now();
//     user.save();

//     return res.status(StatusCodes.OK).json({
//       status: true,
//       message: "Login successful",
//       data: {
//         _id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         phoneNumber: user.phoneNumber,
//         dob: user.dob,
//         profileImage: user.profileImage,
//         role: user.role,
//         gender: user.gender,
//         storeName: user.storeName,
//         storeUrl: user.storeUrl,
//         storeImage: user.storeImage,
//         storeAddress: user.storeAddress,
//         bvn: user.bvn,
//         bank: user.bank,
//         blocked: user.blocked,
//         accountNumber: user.accountNumber,
//         country: user.country,
//         state: user.state,
//         address: user.address,
//         createdAt: user.createdAt,
//         lastLogin: user.lastLogin,
//       },
//       token,
//       refreshToken,
//     });
//   } catch (error) {
//     if (error.status === 404) {
//       return res
//         .status(StatusCodes.NOT_FOUND)
//         .json({ message: error.message, status: false });
//     }
//     // logger.error(error.message);
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .json({ message: error.message, status: false });
//   }
// };

// const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ message: "Please provide your email.", status: false });
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res
//         .status(StatusCodes.NOT_FOUND)
//         .json({ message: "User not found.", status: false });
//     }

//     const { otp, expiration } = generateOTP();
//     user.resetPasswordToken = await bcrypt.hash(otp.toString(), 10);
//     user.resetPasswordExpires = expiration;

//     await user.save();

//     await forgotPasswordMail(email, otp.toString());

//     return res.status(StatusCodes.OK).json({
//       status: true,
//       message: "Password reset code sent to your email.",
//     });
//   } catch (error) {
//     console.error("Error sending password reset code:", error);
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       status: false,
//       message: "Failed to send password reset code. " + error.message,
//     });
//   }
// };

// const verifyOTP = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     if (!email) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: false,
//         message: "Email is required.",
//       });
//     }
//     if (!otp) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: false,
//         message: "OTP is required.",
//       });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(StatusCodes.NOT_FOUND).json({
//         status: false,
//         message: "User not found.",
//       });
//     }

//     if (user.resetPasswordExpires < Date.now()) {
//       return res.status(StatusCodes.UNAUTHORIZED).json({
//         status: false,
//         message: "OTP expired.",
//       });
//     }

//     const isMatch = await bcrypt.compare(
//       otp.toString(),
//       user.resetPasswordToken
//     );
//     if (!isMatch) {
//       return res.status(StatusCodes.UNAUTHORIZED).json({
//         status: false,
//         message: "Invalid OTP.",
//       });
//     }

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "30m",
//     });

//     return res.status(StatusCodes.OK).json({
//       status: true,
//       message: "OTP verified successfully.",
//       token,
//     });
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       status: false,
//       message: "Failed to verify OTP. " + error.message,
//     });
//   }
// };

// const resetPassword = async (req, res) => {
//   try {
//     const { newPassword, confirmPassword, token } = req.body;

//     if (!newPassword) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         message: "New password is required",
//         status: false,
//       });
//     }

//     if (!confirmPassword) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         message: "Confirm the password entered above.",
//         status: false,
//       });
//     }

//     if (newPassword !== confirmPassword) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         message: "Passwords do not match",
//         status: false,
//       });
//     }

//     let userId;
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       userId = decoded.userId;
//     } catch (error) {
//       return res.status(StatusCodes.UNAUTHORIZED).json({
//         message: "Invalid or expired token",
//         status: false,
//       });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(StatusCodes.NOT_FOUND).json({
//         message: "User not found",
//         status: false,
//       });
//     }

//     user.password = newPassword;
//     user.resetPasswordToken = null;
//     user.resetPasswordExpires = null;

//     await user.save();
//     await resetPasswordMail(user.email);

//     return res.status(StatusCodes.OK).json({
//       status: true,
//       message: "Password reset successfully",
//     });
//   } catch (error) {
//     console.error("Error resetting password:", error);
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       status: false,
//       message: error.message,
//     });
//   }
// };

// const changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword, confirmPassword } = req.body;

//     if (!currentPassword) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: false,
//         message: "Please provide current password",
//       });
//     }
//     if (!newPassword) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: false,
//         message: "Please provide new password",
//       });
//     }
//     if (!confirmPassword) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: false,
//         message: "Please confirm new password",
//       });
//     }
//     if (newPassword !== confirmPassword) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: false,
//         message: "New password and confirm new password do not match",
//       });
//     }
//     const user = await User.findById(req.user.userid);
//     if (!user) {
//       return res.status(StatusCodes.NOT_FOUND).json({
//         status: false,
//         message: "User not found",
//       });
//     }
//     const isMatch = await user.comparePassword(currentPassword);
//     if (!isMatch) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: false,
//         message: "Current password is incorrect",
//       });
//     }
//     user.password = newPassword;
//     await user.save();

//     return res.status(StatusCodes.OK).json({
//       status: true,
//       message: "Password changed successfully",
//     });
//   } catch (error) {
//     console.error("Error changing password:", error);
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       status: false,
//       message: "Internal server error",
//     });
//   }
// };

// // const googleAuth = (req, res, next) => {
// //   passport.authenticate("google", {
// //     scope: ["profile", "email"],
// //   })(req, res, next);
// // };

// // const googleAuthCallback = (req, res, next) => {
// //   passport.authenticate("google", {
// //     successRedirect: "/api/v1/products",
// //     failureRedirect: "/",
// //     session: false,
// //   })(req, res, next);
// // };

// //Osama's Oauth

// const initiateOauth = async (req, res) => {
//   const authUrl = oauth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: [
//       "https://www.googleapis.com/auth/plus.login",
//       "https://www.googleapis.com/auth/userinfo.email",
//     ],
//   });
//   res.json(authUrl);
// };

// const googleCallback = async (req, res) => {
//   const { code } = req.query;

//   if (!code) {
//     return res.status(400).json({ message: "Authorization code is missing." });
//   }

//   try {
//     const { tokens } = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials({
//       access_token: tokens.access_token,
//       refresh_token: tokens.refresh_token,
//       scope: [
//         "https://www.googleapis.com/auth/plus.login",
//         "https://www.googleapis.com/auth/userinfo.email",
//       ],
//       token_type: tokens.token_type,
//       expiry_date: tokens.expiry_date,
//     });

//     const ticket = await oauth2Client.verifyIdToken({
//       idToken: tokens.id_token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const { given_name, family_name, email } = ticket.getPayload();

//     if (!email) {
//       return res
//         .status(400)
//         .json({ message: "Email is required but not provided." });
//     }

//     let user = await User.findOne({ email: email });

//     const isNewUser = !user;
//     if (isNewUser) {
//       user = await User.create({
//         firstName: given_name,
//         lastName: family_name,
//         email: email,
//       });
//     }

//     const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_LIFETIME,
//     });

//     const responseMessage = isNewUser
//       ? "New User Created Successfully"
//       : "Login successful";

//     return res.status(200).json({
//       status: true,
//       message: responseMessage,
//       token: jwtToken,
//       user: {
//         _id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error("Google authentication error:", error);
//     return res.status(500).json({
//       message: "Failed to authenticate with Google. Please try again.",
//     });
//   }
// };

// //Mobile callback url
// const mobileCallback = async (req, res) => {
//   const { user, access_token } = req.body;

//   if (!user || !user.email || !access_token) {
//     return res
//       .status(400)
//       .json({ message: "Missing required users information or tokens." });
//   }

//   try {
//     let existingUser = await User.findOne({ email: user.email });

//     const isNewUser = !existingUser;
//     if (isNewUser) {
//       existingUser = await User.create({
//         firstName: user.givenName,
//         lastName: user.familyName,
//         email: user.email,
//         //   googleId: user.id,
//         //  profilePicture: user.photo,
//         //access_token,
//       });
//     }

//     const jwtToken = jwt.sign(
//       { userId: existingUser._id },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: process.env.JWT_LIFETIME,
//       }
//     );

//     const responseMessage = isNewUser
//       ? "New User Created Successfully"
//       : "Login successful";

//     return res.status(200).json({
//       status: true,
//       message: responseMessage,
//       token: jwtToken,
//       user: {
//         _id: existingUser._id,
//         firstName: existingUser.firstName,
//         lastName: existingUser.lastName,
//         email: existingUser.email,
//         googleId: existingUser.googleId,
//         profilePicture: existingUser.profilePicture,
//       },
//     });
//   } catch (error) {
//     console.error("Error in user registration/login:", error);
//     return res.status(500).json({
//       message: "Failed to register or log in the user. Please try again.",
//     });
//   }
// };

// module.exports = {
//   login,
//   signUp,
//   signUpComplete,
//   verifyOTP,
//   resendOTP,
//   forgotPassword,
//   resetPassword,
//   changePassword,
//   initiateOauth,
//   googleCallback,
//   mobileCallback,
// };

const User = require("../models/User");
// const Notification = require("../models/Notification");
const OtpLogs = require("../models/OtpLogs");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const {
  generateOTP,
  sendOTPMail,
  resendOTPMail,
  sendConfirmationMail,
  forgotPasswordMail,
  resetPasswordMail,
  newUserSignUpMail,
  newVendorSignUpMail,
} = require("../middleware/mailUtil");
const { sendOtpViaTermii } = require("../service/TermiiService");
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

    if (!email && !phoneNumber) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Please enter either an email or phone number.",
      });
    }

    if (!password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Please enter your password",
      });
    }

    if (!firstName) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Please enter your first name",
      });
    }

    if (!lastName) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Please enter your last name",
      });
    }

    let existingUser = null;
    if (email) {
      existingUser = await User.findOne({ email });
    } else if (phoneNumber) {
      existingUser = await User.findOne({ phoneNumber });
    }

    if (existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message:
          "This email or phone number already exists within our records. Please use a unique email or phone number.",
      });
    }

    req.body.role = req.body.uniqueKey === 1212 ? "admin" : "customer";

    let userData = {
      firstName,
      lastName,
      role: role || "customer",
      email,
      phoneNumber,
    };

    let storeUrl;
    if (role === "vendor" && storeName) {
      const storeNameExists = await User.findOne({ storeName });
      if (storeNameExists) {
        return res.status(StatusCodes.CONFLICT).json({
          status: false,
          message: "This store name is already taken",
        });
      }
      storeUrl = `https://supplya.store/store/${storeName}`;
      userData = {
        ...userData,
        storeName,
        storeUrl,
      };
    }

    const otpData = generateOTP();
    const otp = otpData.otp;

    userRegistrationCache.set(phoneNumber || email, {
      ...userData,
      password,
      otp,
    });

    const sendOtpPromises = [];
    if (email) {
      sendOtpPromises.push(sendOTPMail(email, otp));
    }
    if (phoneNumber) {
      sendOtpPromises.push(sendOtpViaTermii(phoneNumber, otp));
    }

    const createOtpLogPromise = OtpLogs.create({
      ...userData,
      createdAt: Date.now(),
      otp,
    });

    await Promise.all([...sendOtpPromises, createOtpLogPromise]);

    return res.status(StatusCodes.OK).json({
      status: true,
      message: `OTP sent successfully. Please check your ${
        phoneNumber ? "SMS" : "email"
      }.`,
    });
  } catch (error) {
    console.error(`error: ${error}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to register user. Please try again later.",
    });
  }
};

const signUpComplete = async (req, res) => {
  try {
    const { email, phoneNumber, otp } = req.body;

    if (!otp) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Please enter OTP.",
      });
    }

    const identifier = phoneNumber || email;

    if (!identifier) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Email or phone number is required to complete signup.",
      });
    }

    const otpLog = await OtpLogs.findOne({
      $or: [{ email }, { phoneNumber }],
      otp,
    });

    if (!otpLog) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Wrong OTP. Please verify and retry.",
      });
    }

    const userData = userRegistrationCache.get(identifier);

    if (!userData) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "An error occurred.",
        message: "Registration data not found. Please retry signup.",
      });
    }

    const newUser = new User({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      password: userData.password,
      otp: otp,
      role: userData.role,
      storeName: userData.storeName || null,
      storeUrl: userData.storeUrl || null,
    });

    await newUser.save();

    if (email) {
      await sendConfirmationMail(email);

      if (userData.role === "vendor") {
        await newVendorSignUpMail(email);
      } else {
        await newUserSignUpMail(email);
      }
    }

    await OtpLogs.findOneAndDelete({
      $or: [{ email }, { phoneNumber }],
      otp,
    });

    userRegistrationCache.delete(identifier);

    const token = newUser.createJWT();

    return res.status(StatusCodes.CREATED).json({
      status: true,
      message: "Congratulations! You have successfully registered on Supplya.",
      data: {
        _id: newUser._id,
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        storeName: newUser.storeName,
        storeUrl: newUser.storeUrl,
        referralCode: newUser.referralCode,
        referredBy: newUser.referredBy,
        walletId: newUser.walletId,
        referralCodeUsageCount: newUser.referralCodeUsageCount,
        referredUsers: newUser.referredUsers,
        gender: newUser.gender,
        country: newUser.country,
        city: newUser.city,
        state: newUser.state,
        address: newUser.address,
        createdAt: newUser.createdAt,
        lastLogin: newUser.lastLogin,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    console.error("Error completing signup:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    const identifier = phoneNumber || email;

    if (!identifier) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Please provide either an email or phone number.",
      });
    }

    let userData = userRegistrationCache.get(identifier);

    if (!userData) {
      const existingUser = await User.findOne({
        $or: [{ email }, { phoneNumber }],
      });

      if (!existingUser) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: false,
          message: "User not found. Please register first.",
        });
      }

      userData = { email, phoneNumber };
      const newOTPData = generateOTP();
      const newOTP = newOTPData.otp;
      existingUser.resetPasswordToken = newOTP;
      existingUser.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
      await existingUser.save();

      if (phoneNumber) {
        await sendOtpViaTermii(phoneNumber, newOTP);
      }
      await resendOTPMail(email, newOTP);
    } else {
      const newOTPData = generateOTP();
      const newOTP = newOTPData.otp;
      userRegistrationCache.set(identifier, { ...userData, otp: newOTP });

      await OtpLogs.updateOne(
        { $or: [{ email }, { phoneNumber }] },
        { otp: newOTP }
      );

      if (phoneNumber) {
        await sendOtpViaTermii(phoneNumber, newOTP);
      } else {
        await resendOTPMail(email, newOTP);
      }
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: `New OTP sent successfully. Please check your ${
        phoneNumber ? "SMS" : "email"
      }.`,
    });
  } catch (error) {
    console.error("Error resending OTP:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to re-send OTP. Please try again later.",
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { password, email, storeName, phoneNumber } = req.body;

    if ((!email || !password) && !storeName && !phoneNumber) {
      throw new BadRequestError(
        "Please provide either one of your email, phone number or store name and password to proceed."
      );
    }

    let user;

    if (storeName) {
      user = await User.findOne({ storeName });
    } else if (phoneNumber) {
      user = await User.findOne({ phoneNumber });
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
    user.lastLogin = Date.now();
    user.save();

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Login successful",
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dob: user.dob,
        profileImage: user.profileImage,
        role: user.role,
        gender: user.gender,
        storeName: user.storeName,
        storeUrl: user.storeUrl,
        storeImage: user.storeImage,
        storeAddress: user.storeAddress,
        bvn: user.bvn,
        bank: user.bank,
        blocked: user.blocked,
        accountNumber: user.accountNumber,
        country: user.country,
        state: user.state,
        address: user.address,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    if (error.status === 404) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: error.message, status: false });
    }
    // logger.error(error.message);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: error.message, status: false });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Please provide your email.", status: false });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found.", status: false });
    }

    const { otp, expiration } = generateOTP();
    user.resetPasswordToken = await bcrypt.hash(otp.toString(), 10);
    user.resetPasswordExpires = expiration;

    await user.save();

    await forgotPasswordMail(email, otp.toString());

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Password reset code sent to your email.",
    });
  } catch (error) {
    console.error("Error sending password reset code:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to send password reset code. " + error.message,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Email is required.",
      });
    }
    if (!otp) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "OTP is required.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "User not found.",
      });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: false,
        message: "OTP expired.",
      });
    }

    const isMatch = await bcrypt.compare(
      otp.toString(),
      user.resetPasswordToken
    );
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: false,
        message: "Invalid OTP.",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30m",
    });

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "OTP verified successfully.",
      token,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to verify OTP. " + error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword, token } = req.body;

    if (!newPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "New password is required",
        status: false,
      });
    }

    if (!confirmPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Confirm the password entered above.",
        status: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Passwords do not match",
        status: false,
      });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid or expired token",
        status: false,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "User not found",
        status: false,
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();
    await resetPasswordMail(user.email);

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Please provide current password",
      });
    }
    if (!newPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Please provide new password",
      });
    }
    if (!confirmPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Please confirm new password",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "New password and confirm new password do not match",
      });
    }
    const user = await User.findById(req.user.userid);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "User not found",
      });
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Current password is incorrect",
      });
    }
    user.password = newPassword;
    await user.save();

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
    });
  }
};

// const googleAuth = (req, res, next) => {
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//   })(req, res, next);
// };

// const googleAuthCallback = (req, res, next) => {
//   passport.authenticate("google", {
//     successRedirect: "/api/v1/products",
//     failureRedirect: "/",
//     session: false,
//   })(req, res, next);
// };

//Osama's Oauth

const initiateOauth = async (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
  res.json(authUrl);
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
      status: true,
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
    console.error("Google authentication error:", error);
    return res.status(500).json({
      message: "Failed to authenticate with Google. Please try again.",
    });
  }
};

//Mobile callback url
const mobileCallback = async (req, res) => {
  const { user, access_token } = req.body;

  if (!user || !user.email || !access_token) {
    return res
      .status(400)
      .json({ message: "Missing required users information or tokens." });
  }

  try {
    let existingUser = await User.findOne({ email: user.email });

    const isNewUser = !existingUser;
    if (isNewUser) {
      existingUser = await User.create({
        firstName: user.givenName,
        lastName: user.familyName,
        email: user.email,
        //   googleId: user.id,
        //  profilePicture: user.photo,
        //access_token,
      });
    }

    const jwtToken = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_LIFETIME,
      }
    );

    const responseMessage = isNewUser
      ? "New User Created Successfully"
      : "Login successful";

    return res.status(200).json({
      status: true,
      message: responseMessage,
      token: jwtToken,
      user: {
        _id: existingUser._id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        googleId: existingUser.googleId,
        profilePicture: existingUser.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error in user registration/login:", error);
    return res.status(500).json({
      message: "Failed to register or log in the user. Please try again.",
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
  changePassword,
  initiateOauth,
  googleCallback,
  mobileCallback,
};
