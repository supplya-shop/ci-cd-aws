const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  orderId: { type: String, index: true, unique: true, required: true },
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
  city: {
    type: String,
    required: true,
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
    type: Number,
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
