const PromoCode = require("../models/PromoCode");
const { StatusCodes } = require("http-status-codes");

const createPromoCode = async (req, res) => {
  try {
    const promoCodeData = req.body;
    const promoCode = await PromoCode.create(promoCodeData);
    return res.status(StatusCodes.CREATED).json({
      status: true,
      message: "Promo code created successfully",
      data: promoCode,
    });
  } catch (error) {
    console.error("Error creating promo code: ", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: `Failed to create promo code: ${error.message}`,
    });
  }
};

const getPromoCodes = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const promoCode = await PromoCode.findById(id);
      if (!promoCode) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: false,
          message: "Promo code not found",
        });
      }
      return res.status(StatusCodes.OK).json({
        status: true,
        message: "Promo code fetched successfully",
        data: promoCode,
      });
    } else {
      const promoCodes = await PromoCode.find();
      return res.status(StatusCodes.OK).json({
        status: true,
        message: "Promo codes fetched successfully",
        data: promoCodes,
      });
    }
  } catch (error) {
    console.error("Error fetching promo codes: ", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: `Failed to fetch promo codes: ${error.message}`,
    });
  }
};

const updatePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const promoCode = await PromoCode.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!promoCode) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Promo code not found",
      });
    }
    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Promo code updated successfully",
      data: promoCode,
    });
  } catch (error) {
    console.error("Error updating promo code: ", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: `Failed to update promo code: ${error.message}`,
    });
  }
};

const deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;

    const promoCode = await PromoCode.findByIdAndDelete(id);

    if (!promoCode) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Promo code not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Promo code deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting promo code: ", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: `Failed to delete promo code: ${error.message}`,
    });
  }
};

const applyPromoCode = async (req, res) => {
  const { promoCode, subtotal } = req.body;

  try {
    const code = await PromoCode.findOne({ code: promoCode, isActive: true });

    if (!code) {
      return res.status(400).json({
        status: false,
        message: "Promo code is invalid or expired.",
      });
    }

    // Check if the promo code has expired
    if (new Date() > code.expirationDate) {
      return res.status(400).json({
        status: false,
        message: "Promo code has expired.",
      });
    }

    // Check minimum order amount
    if (subtotal < code.minimumOrderAmount) {
      return res.status(400).json({
        status: false,
        message: `Promo code requires a minimum order amount of ₦${code.minimumOrderAmount}.`,
      });
    }

    // Calculate discount
    let discount = (code.discountPercentage / 100) * subtotal;
    if (code.maxDiscountAmount && discount > code.maxDiscountAmount) {
      discount = code.maxDiscountAmount; // Cap the discount at max amount if applicable
    }

    return res.status(200).json({
      status: true,
      message: "Promo code applied successfully",
      discount,
      newTotal: subtotal - discount,
    });
  } catch (error) {
    console.error("Error applying promo code:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to apply promo code. Please try again later.",
    });
  }
};

module.exports = {
  createPromoCode,
  getPromoCodes,
  updatePromoCode,
  deletePromoCode,
  applyPromoCode,
};
