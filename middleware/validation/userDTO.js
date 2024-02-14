const Joi = require("joi");

const userDTO = Joi.object({
  firstName: Joi.string().required().min(2).max(50).lowercase(),
  lastName: Joi.string().required().min(2).max(50).lowercase(),
  country: Joi.string(),
  state: Joi.string(),
  address: Joi.string(),
  city: Joi.string(),
  postalCode: Joi.number(),
  gender: Joi.string(),
  bvn: Joi.string(),
  isSoleProprietor: Joi.boolean(),
  description: Joi.string(),
  businessName: Joi.string(),
  googleId: Joi.string(),
  phoneNumber: Joi.string().required(),
  uniqueKey: Joi.number().default(9292),
  password: Joi.string().required().min(3),
  email: Joi.string().required().email(),
  accountNumber: Joi.string(),
  bank: Joi.string(),
  role: Joi.string().valid("customer", "admin", "vendor").default("customer"),
  createdAt: Joi.date().default(Date.now()),
  dob: Joi.date(),
  resetPasswordToken: Joi.number(),
  resetPasswordExpires: Joi.date(),
});

module.exports = function validateUser(data) {
  return userDTO.validate(data, { abortEarly: false });
};
