const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  orderId: {
    type: Number,
    required: true,
    unique: true,
  },
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
        firstName: String,
        lastName: String,
        storeName: String,
        storeUrl: String,
        phoneNumber: String,
        email: String,
      },
    },
  ],
  shippingAddress1: {
    type: String,
  },
  shippingAddress2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
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
  totalPrice: {
    type: String,
    required: true,
  },
  orderNote: {
    type: String,
  },

  orderStatus: {
    type: String,
    enum: ["received", "processing", "dispatched", "delivered", "cancelled"],
    default: "received",
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
