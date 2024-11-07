const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  orderId: { type: Number, index: true, unique: true, required: true },
  orderItems: [
    {
      _id: false,
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },

      quantity: {
        type: Number,
        default: 1,
      },
      vendorDetails: {
        vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        firstName: String,
        lastName: String,
        storeName: String,
        storeUrl: String,
        phoneNumber: String,
        email: String,
      },
    },
  ],
  city: {
    type: String,
  },
  zip: {
    type: String,
  },
  country: {
    type: String,
    default: "Nigeria",
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  paymentRefId: {
    type: String,
  },
  paymentMethod: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ["paid", "unpaid", "refunded"],
    default: "unpaid",
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  orderNote: {
    type: String,
  },
  discount: {
    type: String,
  },
  promoCode: {
    type: String,
  },

  orderStatus: {
    type: String,
    enum: ["new", "confirmed", "packaged", "shipped", "delivered", "cancelled"],
    default: "new",
  },

  dateOrdered: {
    type: Date,
    default: Date.now,
  },
  deliveryDate: {
    type: Date,
  },
});

orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Order", orderSchema);
