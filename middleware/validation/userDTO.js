const Joi = require("joi");
const crypto = require("crypto");
const User = require("../../models/User");

const phonePattern = /^234\d{10}$/;

const generatePassword = () => {
  return crypto.randomBytes(8).toString("base64").slice(0, 12) + "!@#";
};

// const userDTO = Joi.object({
//   firstName: Joi.string().required().min(2).max(50).lowercase(),
//   lastName: Joi.string().required().min(2).max(50).lowercase(),
//   country: Joi.string(),
//   state: Joi.string(),
//   address: Joi.string(),
//   city: Joi.string(),
//   postalCode: Joi.number(),
//   gender: Joi.string(),
//   bvn: Joi.string(),
//   isSoleProprietor: Joi.boolean(),
//   description: Joi.string(),
//   businessName: Joi.string(),
//   googleId: Joi.string(),
//   phoneNumber: Joi.string(),
//   uniqueKey: Joi.number().default(9292),
//   password: Joi.string().required().min(3),
//   email: Joi.string().required().email(),
//   accountNumber: Joi.string(),
//   bank: Joi.string(),
//   role: Joi.string().valid("customer", "admin", "vendor").default("customer"),
//   createdAt: Joi.date().default(Date.now()),
//   dob: Joi.date(),
//   resetPasswordToken: Joi.number(),
//   resetPasswordExpires: Joi.date(),
// });

const validateUserData = (user) => {
  const { email, password, phoneNumber } = user;

  if (!email || !email.includes("@")) return "Invalid or missing email";
  if (!password || typeof password !== "string")
    return "Invalid or missing password";
  return null;
};

const existingUserCheck = async ({ email = null, phoneNumber = null } = {}) => {
  const query = {};
  if (email) query.email = email;
  if (phoneNumber) query.phoneNumber = phoneNumber;

  if (Object.keys(query).length === 0) {
    return false;
  }

  const existingUser = await User.findOne(query);
  return Boolean(existingUser);
};

const processUsers = async (rows) => {
  const users = [];
  const errors = [];
  const emailsToSend = [];

  for (const [index, row] of rows.entries()) {
    const password = generatePassword();
    const user = {
      firstName: row.firstName || "",
      lastName: row.lastName || "",
      email: row.email,
      password,
      phoneNumber: row.phoneNumber,
      role: row.role || "customer",
      displayName: row.displayName || "",
      createdAt: row.createdAt ? new Date(row.createdAt) : null,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : null,
      storeName: row.storeName || "",
    };

    const duplicateUser = await existingUserCheck(user.email, user.phoneNumber);
    if (duplicateUser) {
      errors.push(
        `Row ${index + 1}: Duplicate user (email/phone number already exists)`
      );
      continue;
    }

    const error = validateUserData(user);
    if (error) {
      errors.push(`Row ${index + 1}: ${error}`);
    } else {
      users.push(user);

      if (user.email) {
        emailsToSend.push({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password,
        });
      }
    }
  }

  return { users, errors, emailsToSend };
};

module.exports = {
  validateUserData,
  existingUserCheck,
  processUsers,
  generatePassword,
  validateWithJoi: function (data) {
    return userDTO.validate(data, { abortEarly: false, escapeHtml: false });
  },
};
