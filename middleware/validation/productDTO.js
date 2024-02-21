const Joi = require("joi");

const productDTO = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().default(0).required(),
  description: Joi.string().required(),
  quantity: Joi.number().required(),
  category: Joi.string().required(),
  image: Joi.string().default(""),
  images: Joi.array().items(Joi.string()),
  brand: Joi.string().default(""),
  createdBy: Joi.string().required(),
  inStock: Joi.boolean().default(true),
  rating: Joi.number().default(0),
  numReviews: Joi.number().default(0),
  isFeatured: Joi.boolean().default(false),
  hasDiscount: Joi.boolean(),
  dateCreated: Joi.date().default(Date.now),
  dateModified: Joi.date().allow(null).optional(),
});

module.exports = function validateProduct(data) {
  return productDTO.validate(data, { abortEarly: false, escapeHtml: false });
};
