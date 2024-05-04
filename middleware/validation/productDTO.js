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
  brand: Joi.string().default(""),
  status: Joi.string().default("instock").required(),
  createdBy: Joi.string(),
  flashsale: Joi.boolean().default(false),
  saleCount: Joi.number().default(0),
  sku: Joi.string().required(),
  moq: Joi.number().required(),
  rating: Joi.number().default(0),
  numReviews: Joi.number().default(0),
  isFeatured: Joi.boolean().default(false),
  dateCreated: Joi.date().default(Date.now),
  dateModified: Joi.date().allow(null).optional(),
});

module.exports = function validateProduct(data) {
  return productDTO.validate(data, { abortEarly: false, escapeHtml: false });
};
