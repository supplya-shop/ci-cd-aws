const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const PromoCode = require("../models/PromoCode");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, InvalidPhoneFormatError } = require("../errors");
const Notification = require("../models/Notification");
const {
  sendOrderSummaryMail,
  sendCustomerOrderSummaryMail,
  sendVendorOrderSummaryMail,
} = require("../middleware/mailUtil");
const mongoose = require("mongoose");
const termiiService = require("../service/TermiiService");

const phonePattern = /^234\d{10}$/;

const generateOrderId = async () => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const shortTimestamp = currentTimestamp % 1000000;

  const lastOrder = await Order.findOne().sort({ orderId: -1 });

  let counter = 0;
  if (lastOrder && lastOrder.orderId) {
    const lastOrderIdString = String(lastOrder.orderId);
    const lastCounter = parseInt(lastOrderIdString.slice(-3), 10);
    counter = (lastCounter + 1) % 1000;
  }

  const orderId = `${shortTimestamp}${counter.toString().padStart(3, "0")}`;

  return orderId;
};

const createOrder = async (req, res) => {
  let session;
  try {
    const userId = req.user.userid;
    const {
      orderItems,
      promoCode,
      city,
      zip,
      country,
      phone,
      address,
      orderNote,
      paymentRefId,
      paymentMethod,
    } = req.body;
    const formattedPhone = formatPhoneNumber(phone);

    session = await mongoose.startSession();
    session.startTransaction();

    const [user, orderId] = await Promise.all([
      User.findById(userId).select("firstName lastName email").session(session),
      generateOrderId(),
    ]);

    const {
      totalPrice,
      productUpdates,
      orderItems: populatedItems,
    } = await populateOrderItems(orderItems, session);
    const { discount, updatedTotal } = await applyPromoCodeInOrder(
      promoCode,
      totalPrice,
      session
    );

    await Product.bulkWrite(productUpdates, { session });

    const createdOrder = await Order.create(
      [
        {
          orderId,
          user: {
            _id: userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
          orderItems: populatedItems,
          city,
          zip,
          country,
          phone: formattedPhone || user.phoneNumber,
          email: req.user.email,
          address,
          orderNote,
          totalPrice: updatedTotal,
          discount,
          promoCode,
          paymentRefId,
          paymentMethod,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const order = await Order.findById(createdOrder[0]._id)
      .populate({ path: "orderItems.product", model: "Product" })
      .populate({
        path: "orderItems.product.createdBy",
        model: "User",
        select:
          "firstName lastName email storeName storeUrl phoneNumber country state city role",
      })
      .populate({
        path: "user",
        model: "User",
        select:
          "firstName lastName email phoneNumber address city state country",
      });

    await notifyUsers(order, user, req.user.email, formattedPhone);

    return res.status(StatusCodes.CREATED).json({
      status: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    if (session && session.inTransaction()) await session.abortTransaction();
    console.error("Error creating order:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: `Failed to create order. ${error.message}`,
    });
  } finally {
    if (session) session.endSession();
  }
};

const getOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const orders = await Order.find()
      .populate({
        path: "orderItems.product",
        populate: [
          {
            path: "createdBy",
            select:
              "firstName lastName email country state city postalCode businessName phoneNumber accountNumber bank",
          },
          {
            path: "category",
            select: "name",
          },
        ],
      })
      .populate({
        path: "user",
        select: "firstName lastName email",
      })
      .sort({ dateOrdered: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments();

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Orders fetched successfully",
      data: orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch orders: " + error.message,
    });
  }
};

const getOrdersByUserId = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    let orders;
    let totalOrdersCount;

    if (user.role === "vendor") {
      const vendorProducts = await Product.find({ createdBy: userId }).select(
        "quantity"
      );
      const productIds = vendorProducts.map((product) => product._id);

      totalOrdersCount = await Order.countDocuments({
        "orderItems.product": { $in: productIds },
      });

      orders = await Order.find({
        "orderItems.product": { $in: productIds },
      })
        .sort({ dateOrdered: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user")
        .populate({
          path: "orderItems.product",
          populate: [
            {
              path: "createdBy",
              select:
                "firstName lastName email country state city postalCode businessName phoneNumber accountNumber bank",
            },
            {
              path: "category",
              select: "name",
            },
          ],
        });
    }

    if (user.role === "customer") {
      totalOrdersCount = await Order.countDocuments({ user: userId });

      orders = await Order.find({ user: userId })

        .skip(skip)
        .limit(limit)
        .populate("user")
        .populate({
          path: "orderItems.product",
          populate: [
            {
              path: "createdBy",
              select:
                "firstName lastName email country state city postalCode businessName phoneNumber accountNumber bank",
            },
            {
              path: "category",
              select: "name",
            },
          ],
        });
    }

    if (!orders || orders.length === 0) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "No orders found for this user",
        data: orders,
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Orders fetched successfully",
      data: orders,
      totalOrders: totalOrdersCount,
      totalPages: Math.ceil(totalOrdersCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch orders. " + error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId)
      .populate({
        path: "orderItems.product",
        populate: [
          {
            path: "createdBy",
            select:
              "firstName lastName email country state city postalCode businessName phoneNumber accountNumber bank",
          },
          {
            path: "category",
            select: "name",
          },
        ],
      })
      .populate({
        path: "user",
        select: "firstName lastName email",
      });

    if (!order) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: "Order not found" });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch order: " + error.message,
    });
  }
};

const getOrderByOrderId = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const orderId = req.params.orderId;
    const order = await Order.findOne({ orderId: orderId })
      .populate({
        path: "orderItems.product",
        populate: [
          {
            path: "createdBy",
            select:
              "firstName lastName email country state city postalCode businessName phoneNumber accountNumber bank",
          },
          {
            path: "category",
            select: "name",
          },
        ],
      })
      .populate("user");

    if (!order) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: "Order not found" });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch order: " + error.message,
    });
  }
};

const getOrdersByStatus = async (req, res, next) => {
  try {
    const userId = req.user.userid;
    const userRole = req.user.role;
    const orderStatus = req.params.orderStatus;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const validStatuses = [
      "new",
      "confirmed",
      "packaged",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!orderStatus || !validStatuses.includes(orderStatus.toLowerCase())) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: `Invalid status: ${orderStatus}. Please provide one of: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    let orders, totalOrders;

    if (userRole === "vendor") {
      // For vendors
      orders = await Order.find({
        orderStatus: orderStatus.toLowerCase(),
        "orderItems.product": { $exists: true },
      })
        .populate({
          path: "orderItems.product",
          populate: [
            {
              path: "createdBy",
              select:
                "firstName lastName email country state city postalCode businessName phoneNumber accountNumber bank",
            },
            {
              path: "category",
              select: "name",
            },
          ],
        })
        .populate("user")
        .sort({ dateOrdered: -1 })
        .skip(skip)
        .limit(limit);

      orders = orders.filter((order) =>
        order.orderItems.some(
          (item) => item.product && item.product.createdBy.equals(userId)
        )
      );

      totalOrders = orders.length;
    } else {
      // For customers
      orders = await Order.find({
        user: userId,
        orderStatus: orderStatus.toLowerCase(),
      })
        .populate({
          path: "orderItems.product",
          populate: [
            {
              path: "createdBy",
              select:
                "firstName lastName email country state city postalCode businessName phoneNumber accountNumber bank",
            },
            {
              path: "category",
              select: "name",
            },
          ],
        })
        .populate("user")
        .sort({ dateOrdered: -1 })
        .skip(skip)
        .limit(limit);

      totalOrders = await Order.countDocuments({
        user: userId,
        orderStatus: orderStatus.toLowerCase(),
      });
    }

    if (!orders || orders.length === 0) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: `No orders found`,
        data: orders,
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Orders fetched successfully",
      data: orders,
      totalOrders: totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: `Failed to fetch orders with status ${orderStatus}: ${error.message}`,
    });
  }
};

const getLatestOrder = async (req, res) => {
  try {
    const order = await Order.findOne().sort({ dateOrdered: -1 });

    if (!order) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "No order found",
        data: order,
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error fetching latest order: ", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch latest order",
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const updatedOrderData = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updatedOrderData,
      { new: true }
    );

    if (!updatedOrder) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: "Order not found" });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  let session;

  try {
    const orderId = req.params.orderId;
    session = await mongoose.startSession();
    session.startTransaction();

    // Find the order
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      throw new Error("Order not found");
    }

    // Check if the order can be cancelled
    if (
      order.orderStatus === "confirmed" ||
      order.orderStatus === "shipped" ||
      order.orderStatus === "Delivered"
    ) {
      throw new Error("Confirmed orders cannot be cancelled");
    }

    // Update the order status
    order.orderStatus = "cancelled";
    await order.save({ session });

    // Restore product quantities
    for (const item of order.orderItems) {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { quantity: item.quantity } },
        { session }
      );
    }

    // Commit the transaction
    await session.commitTransaction();

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    if (session && session.inTransaction()) await session.abortTransaction();

    console.error("Error cancelling order: ", error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        status: false,
        message: "Failed to cancel order. " + error.message,
      });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

const deleteOrder = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Order not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to delete order",
    });
  }
};

// helper functions
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  if (/^0\d{10}$/.test(phone)) return "234" + phone.slice(1);
  if (!phonePattern.test(phone)) throw new Error("Invalid phone format.");
  return phone;
};

const applyPromoCodeInOrder = async (promoCode, totalPrice, session) => {
  if (!promoCode) return { discount: 0, updatedTotal: totalPrice };

  const promo = await PromoCode.findOne({
    code: promoCode,
    isActive: true,
  }).session(session);

  if (!promo || promo.expirationDate < new Date())
    throw new Error("Invalid or expired promo code.");
  if (totalPrice < promo.minimumOrderAmount)
    throw new Error(
      `Minimum order amount for this promo code is ₦${promo.minimumOrderAmount}.`
    );

  const discount = Math.min(
    (totalPrice * promo.discountPercentage) / 100,
    promo.maxDiscountAmount
  );

  promo.usedCount += 1;
  await promo.save({ session });

  return { discount, updatedTotal: totalPrice - discount };
};

const populateOrderItems = async (orderItems, session) => {
  let totalPrice = 0;
  const productUpdates = [];
  const insufficientStock = [];
  const moqFailures = [];

  await Promise.all(
    orderItems.map(async (item) => {
      const product = await Product.findById(item.product)
        .populate("createdBy")
        .session(session);
      if (!product) throw new Error(`Product not found: ${item.product}`);

      const { moq, unit_price, discounted_price, createdBy, quantity } =
        product;
      if (item.quantity < moq) moqFailures.push(product.name);
      const price = discounted_price || unit_price;
      totalPrice += item.quantity * price;

      if (quantity < item.quantity) insufficientStock.push(product.name);
      else {
        item.vendorDetails = {
          vendorId: createdBy._id,
          ...createdBy.toObject(),
        };
        productUpdates.push({
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { quantity: -item.quantity } },
          },
        });
      }
    })
  );

  if (insufficientStock.length > 0)
    throw new Error(`Insufficient stock for ${insufficientStock.join(", ")}`);
  if (moqFailures.length > 0)
    throw new Error(`MOQ not met for products: ${moqFailures.join(", ")}`);

  return { totalPrice, productUpdates, orderItems };
};

const notifyUsers = async (order, user, email, phone) => {
  const customerNotifications = [];
  const vendorNotifications = [];

  customerNotifications.push(
    Notification.create({
      userId: order.user._id,
      message: `Your order with ID: ${order.orderId} has been created successfully.`,
      title: "Order successful!",
    }),
    sendOrderSummaryMail(order),
    sendCustomerOrderSummaryMail(order, user, email),
    termiiService.sendCustomerWhatsAppOrderNotification(
      phone,
      user.firstName,
      order.orderId,
      "30 minutes"
    )
  );

  for (const item of order.orderItems) {
    const vendor = item.vendorDetails;

    vendorNotifications.push(
      sendVendorOrderSummaryMail(order, vendor),
      Notification.create({
        userId: vendor.vendorId,
        message: `A new order with ID: ${order.orderId} has been placed. Please contact the customer and update the order status once delivered.`,
        title: "Order notification",
      }),
      termiiService.sendVendorWhatsAppOrderNotification(
        vendor.phoneNumber,
        vendor.firstName,
        order.orderId,
        phone,
        email
      )
    );
  }

  await Promise.all([...customerNotifications, ...vendorNotifications]);
};

// const createOrder = async (req, res) => {
//   let session;

//   try {
//     const userId = req.user.userid;
//     const email = req.user.email;
//     const {
//       orderItems,
//       city,
//       zip,
//       country,
//       phone,
//       address,
//       orderNote,
//       paymentRefId,
//       paymentMethod,
//       PromoCode, // Extract PromoCode from the request
//     } = req.body;

//     let formattedPhone = phone;

//     if (phone) {
//       if (/^0\d{10}$/.test(phone)) {
//         formattedPhone = "234" + phone.slice(1);
//       } else if (!phonePattern.test(phone)) {
//         return res.status(StatusCodes.BAD_REQUEST).json({
//           status: false,
//           message: "Phone number must start with 234 followed by 10 digits.",
//         });
//       }
//     }

//     session = await mongoose.startSession();
//     session.startTransaction();

//     const [user, orderId] = await Promise.all([
//       User.findById(userId).select("firstName lastName email").session(session),
//       generateOrderId(),
//     ]);

//     let totalPrice = 0;
//     const productUpdates = [];
//     const insufficientStockProducts = [];
//     const moqProducts = [];

//     for (const item of orderItems) {
//       const product = await Product.findById(item.product)
//         .populate("createdBy")
//         .session(session);

//       if (!product) {
//         await session.abortTransaction();
//         return res.status(StatusCodes.NOT_FOUND).json({
//           status: false,
//           message: `Product not found: ${item.product}`,
//         });
//       }
//       if (item.quantity < product.moq) {
//         moqProducts.push(product.name);
//       }
//       const price = product.discounted_price || product.unit_price;

//       totalPrice += item.quantity * price;

//       if (product.quantity < item.quantity) {
//         insufficientStockProducts.push(product.name);
//       }

//       item.vendorDetails = product.createdBy._id;

//       const newQuantity = product.quantity - item.quantity;

//       productUpdates.push({
//         updateOne: {
//           filter: { _id: item.product },
//           update: {
//             $inc: { quantity: -item.quantity },
//             $set: {
//               status: newQuantity <= product.moq ? "outOfStock" : "inStock",
//             },
//           },
//         },
//       });
//     }

//     if (insufficientStockProducts.length > 0) {
//       await session.abortTransaction();
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: false,
//         message: `Insufficient stock for products: ${insufficientStockProducts.join(
//           ", "
//         )}`,
//       });
//     }

//     if (moqProducts.length > 0) {
//       await session.abortTransaction();
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: false,
//         message: `Your order quantity does not meet the minimum order quantity (MOQ) for products: ${moqProducts.join(
//           ", "
//         )}`,
//       });
//     }

//     // Promo Code Handling
//     let discount = 0;
//     if (PromoCode) {
//       const promo = await PromoCode.findOne({
//         code: PromoCode,
//         isActive: true,
//       });

//       if (!promo) {
//         return res.status(StatusCodes.BAD_REQUEST).json({
//           status: false,
//           message: "Invalid or expired promo code.",
//         });
//       }
//       if (promo.expirationDate < new Date()) {
//         return res.status(StatusCodes.BAD_REQUEST).json({
//           status: false,
//           message: "This promo code has expired.",
//         });
//       }
//       if (totalPrice < promo.minimumOrderAmount) {
//         return res.status(StatusCodes.BAD_REQUEST).json({
//           status: false,
//           message: `Minimum order amount for this promo code is ₦${promo.minimumOrderAmount}.`,
//         });
//       }

//       // Calculate and cap discount
//       discount = Math.min(
//         (totalPrice * promo.discountPercentage) / 100,
//         promo.maxDiscountAmount
//       );

//       // Update the total price
//       totalPrice -= discount;

//       // Update used count
//       promo.usedCount += 1;
//       await promo.save({ session });
//     }

//     // Bulk update product stock
//     await Product.bulkWrite(productUpdates, { session });

//     for (const item of orderItems) {
//       const product = await Product.findById(item.product)
//         .populate({
//           path: "createdBy", // Populate createdBy to get vendor details
//           select: "firstName lastName email storeName storeUrl phoneNumber _id",
//         })
//         .session(session);

//       if (product && product.createdBy) {
//         item.vendorDetails = {
//           vendorId: product.createdBy._id,
//           firstName: product.createdBy.firstName,
//           lastName: product.createdBy.lastName,
//           storeName: product.createdBy.storeName,
//           storeUrl: product.createdBy.storeUrl,
//           phoneNumber: product.createdBy.phoneNumber,
//           email: product.createdBy.email,
//         };
//       } else {
//         console.warn(
//           `Product or vendor not found for item with ID ${item.product}`
//         );
//       }
//     }

//     // Create the order with the populated orderItems
//     const createdOrders = await Order.create(
//       [
//         {
//           orderId: orderId,
//           user: {
//             _id: userId,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             email: user.email,
//           },
//           orderItems, // Use modified orderItems with populated vendorDetails
//           city,
//           zip,
//           country,
//           phone: formattedPhone || user.phoneNumber,
//           email,
//           address,
//           orderNote,
//           totalPrice,
//           discount, // Add discount to the order data
//           PromoCode, // Reference PromoCode on the order
//           paymentRefId,
//           paymentMethod,
//         },
//       ],
//       { session }
//     );

//     // Commit the transaction and end the session
//     await session.commitTransaction();
//     session.endSession();

//     const order = await Order.findById(createdOrders[0]._id)
//       .populate({
//         path: "orderItems.product",
//         model: "Product",
//       })
//       .populate({
//         path: "orderItems.product.createdBy",
//         model: "User",
//         select:
//           "firstName lastName email storeName storeUrl phoneNumber country state city role",
//       })
//       .populate({
//         path: "user",
//         model: "User",
//         select:
//           "firstName lastName email phoneNumber address city state country",
//       });

//     if (formattedPhone) {
//       await notifyUsers(order, user, email, formattedPhone);
//     }

//     return res.status(StatusCodes.CREATED).json({
//       status: true,
//       message: "Order created successfully",
//       data: order,
//     });
//   } catch (error) {
//     if (session && session.inTransaction()) await session.abortTransaction();

//     console.error("Error creating order: ", error);
//     return res
//       .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({
//         status: false,
//         message: "Failed to create order. " + error.message,
//       });
//   } finally {
//     if (session) session.endSession();
//   }
// };

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByUserId,
  getOrderByOrderId,
  getOrdersByStatus,
  getLatestOrder,
  updateOrder,
  cancelOrder,
  deleteOrder,
};
