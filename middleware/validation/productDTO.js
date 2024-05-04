const Joi = require("joi");

const productDTO = Joi.object({
  name: Joi.string().required(),
  unit_price: Joi.number().default(0).required(),
  discounted_price: Joi.number().default(0).required(),
  description: Joi.string().required(),
  quantity: Joi.number().required(),
  category: Joi.string().required(),
  image: Joi.string().default(""),
  images: Joi.array().items(Joi.string()),
  status: Joi.string().default("instock").required(),
  createdBy: Joi.string(),
  sku: Joi.string().required(),
  moq: Joi.number().required(),
  dateCreated: Joi.date().default(Date.now),
  dateModified: Joi.date(),
});

module.exports = function validateProduct(data) {
  return productDTO.validate(data, { abortEarly: false, escapeHtml: false });
};
