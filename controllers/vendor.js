const Store = require("../models/Store");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const Order = require("../models/Order");
const Wallet = require("../models/Wallet");
const Media = require("../models/Media");
const termiiService = require("../service/TermiiService");

const {
  sendCustomerOrderConfirmedMail,
  sendCustomerOrderPackagedMail,
  sendCustomerOrderShippedMail,
  sendCustomerOrderDeliveredMail,
  sendVendorOrderDeliveredMail,
  sendReferralRewardNotification,
  sendCustomerOrderCancelledMail,
} = require("../middleware/mailUtil");

const createVendor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      storeName,
      phoneNumber,
      street,
      state,
      country,
      city,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !storeName ||
      !phoneNumber ||
      !street ||
      !state ||
      !country ||
      !city
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }
    const storeNameExists = await User.findOne({ storeName });
    if (storeNameExists) {
      return res.status(StatusCodes.CONFLICT).json({
        status: false,
        message: "This store name is already taken",
      });
    }

    const storeUrl = `https://supplya.shop/store/${storeName.replace(
      /\s+/g,
      "-"
    )}`;

    const vendor = await User.create({
      firstName,
      lastName,
      displayName: `${lastName}${firstName}`,
      storeName,
      storeUrl,
      phoneNumber,
      street,
      city,
      state,
      country,
      role: "vendor",
    });

    return res.status(201).json({
      status: true,
      message: "Vendor created successfully",
      data: vendor,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

const checkStoreNameAvailability = async (req, res) => {
  try {
    const { storeName } = req.query;

    if (!storeName) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Store name is required",
      });
    }

    const user = await User.findOne({ storeName });

    if (user) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "This store name is already taken",
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Store name is available",
    });
  } catch (error) {
    console.error("Error checking store name availability:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const createStore = async (req, res) => {
  try {
    const { userId, name } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    if (user.role !== "vendor") {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: false,
        message: "User is not authorized to create a store",
      });
    }
    const newStore = new Store({
      name,
      wallet: { balance: 0 },
      products: [],
      vendor: req.user._id,
    });
    const store = await newStore.save();
    return res.status(StatusCodes.CREATED).json({
      status: true,
      message: "Store created successfully",
      data: store,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: "Internal server error" });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" });
    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Vendors fetched successfully",
      data: vendors,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: "Internal server error" });
  }
};

const getVendorById = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor || vendor.role !== "vendor") {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: "Vendor not found" });
    }
    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Vendor fetched successfully",
      data: vendor,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: "Internal server error" });
  }
};

const getVendorByStoreName = async (req, res) => {
  try {
    const { storeName } = req.params;

    const vendor = await User.findOne({ storeName: storeName })
      .select(
        "firstName lastName email phoneNumber storeName storeUrl address city state country"
      )
      .populate(
        "products",
        "name unit_price discounted_price description category image"
      );

    if (!vendor) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: `No vendor found with this store name.`,
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Vendor fetched successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("Error fetching vendor by store name: ", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: `Failed to fetch vendor by store name: ${error.message}`,
    });
  }
};

// const updateOrderStatus = async (req, res) => {
//   const orderId = req.params.orderId;
//   const { orderStatus, deliveryDate, paymentStatus } = req.body;

//   const validStatuses = [
//     "new",
//     "confirmed",
//     "packaged",
//     "shipped",
//     "delivered",
//     "cancelled",
//   ];

//   if (!validStatuses.includes(orderStatus)) {
//     return res.status(StatusCodes.BAD_REQUEST).json({
//       status: false,
//       message: `Invalid order status. Valid statuses are: ${validStatuses.join(
//         ", "
//       )}`,
//     });
//   }

//   try {
//     const updateFields = { orderStatus };

//     if (
//       deliveryDate &&
//       (orderStatus === "confirmed" || orderStatus === "delivered")
//     ) {
//       const parsedDeliveryDate = new Date(deliveryDate);
//       if (isNaN(parsedDeliveryDate.getTime())) {
//         return res.status(StatusCodes.BAD_REQUEST).json({
//           status: false,
//           message: "Invalid delivery date format.",
//         });
//       }
//       updateFields.deliveryDate = parsedDeliveryDate;
//     }

//     if (paymentStatus) {
//       updateFields.paymentStatus = paymentStatus;
//     }

//     const query =
//       req.user.role === "admin"
//         ? { orderId }
//         : { orderId, "orderItems.vendorDetails.email": req.user.email };

//     const order = await Order.findOneAndUpdate(query, updateFields, {
//       new: true,
//     })
//       .populate("user")
//       .populate("orderItems.product");

//     if (!order) {
//       return res.status(StatusCodes.NOT_FOUND).json({
//         status: false,
//         message:
//           "Order not found or you are not authorized to update this order",
//       });
//     }

//     const emailPromises = [];
//     if (orderStatus === "confirmed" && deliveryDate) {
//       emailPromises.push(sendCustomerOrderConfirmedMail(order, order.user));
//     } else if (orderStatus === "shipped") {
//       emailPromises.push(sendCustomerOrderShippedMail(order, order.user));
//     } else if (orderStatus === "delivered" && deliveryDate) {
//       emailPromises.push(
//         sendCustomerOrderDeliveredMail(order, order.user),
//         sendVendorOrderDeliveredMail(order, order.user)
//       );

//       if (order.appliedReferralCode) {
//         const result = await processReferralReward(order, 0.02);
//         if (result) {
//           emailPromises.push(
//             sendReferralRewardNotification(result.referringUser, result.reward)
//           );
//         }
//       }
//     } else if (orderStatus === "cancelled") {
//       emailPromises.push(sendCustomerOrderCancelledMail(order, order.user));
//     }

//     await Promise.all(emailPromises);

//     return res.status(StatusCodes.OK).json({
//       status: true,
//       message: "Order status updated successfully",
//       data: order,
//     });
//   } catch (error) {
//     console.error("Error updating order status:", error);
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       status: false,
//       message: "Failed to update order status. " + error.message,
//     });
//   }
// };

// const updateOrderStatus = async (req, res) => {
//   const orderId = req.params.orderId;
//   const { orderStatus, deliveryDate, paymentStatus, cancellationReason } =
//     req.body;

//   const validStatuses = [
//     "new",
//     "confirmed",
//     "packaged",
//     "shipped",
//     "delivered",
//     "cancelled",
//   ];

//   if (!validStatuses.includes(orderStatus)) {
//     return res.status(StatusCodes.BAD_REQUEST).json({
//       status: false,
//       message: `Invalid order status. Valid statuses are: ${validStatuses.join(
//         ", "
//       )}`,
//     });
//   }

//   try {
//     const updateFields = { orderStatus };

//     if (deliveryDate && orderStatus === "delivered") {
//       const parsedDeliveryDate = new Date(deliveryDate);
//       if (isNaN(parsedDeliveryDate.getTime())) {
//         return res.status(StatusCodes.BAD_REQUEST).json({
//           status: false,
//           message: "Invalid delivery date format.",
//         });
//       }
//       updateFields.deliveryDate = parsedDeliveryDate;
//     }

//     if (paymentStatus) {
//       updateFields.paymentStatus = paymentStatus;
//     }

//     const query =
//       req.user.role === "admin"
//         ? { orderId }
//         : { orderId, "orderItems.vendorDetails.email": req.user.email };

//     const order = await Order.findOneAndUpdate(query, updateFields, {
//       new: true,
//     })
//       .populate("user")
//       .populate("orderItems.product");

//     if (!order) {
//       return res.status(StatusCodes.NOT_FOUND).json({
//         status: false,
//         message:
//           "Order not found or you are not authorized to update this order",
//       });
//     }

//     if (!order.user) {
//       console.warn(`User details missing for order ID ${order.orderId}`);
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: false,
//         message: "Order has no associated user.",
//       });
//     }

//     const emailPromises = [];
//     if (orderStatus === "confirmed") {
//       emailPromises.push(sendCustomerOrderConfirmedMail(order, order.user));
//       await termiiService.sendUpdateOrderStatusSMS(
//         order.user.phoneNumber,
//         order.user.firstName,
//         order.orderId,
//         orderStatus
//       );
//     } else if (orderStatus === "packaged") {
//       emailPromises.push(sendCustomerOrderPackagedMail(order, order.user));
//       await termiiService.sendUpdateOrderStatusSMS(
//         order.user.phoneNumber,
//         order.user.firstName,
//         order.orderId,
//         orderStatus
//       );
//     } else if (orderStatus === "shipped") {
//       emailPromises.push(sendCustomerOrderShippedMail(order, order.user));
//       await termiiService.sendUpdateOrderStatusSMS(
//         order.user.phoneNumber,
//         order.user.firstName,
//         order.orderId,
//         orderStatus
//       );
//     } else if (orderStatus === "delivered" && deliveryDate) {
//       emailPromises.push(
//         sendCustomerOrderDeliveredMail(order, order.user),
//         sendVendorOrderDeliveredMail(order, order.user)
//       );
//       await termiiService.sendUpdateOrderStatusSMS(
//         order.user.phoneNumber,
//         order.user.firstName,
//         order.orderId,
//         orderStatus
//       );

//       if (order.appliedReferralCode) {
//         const result = await processReferralReward(order, 0.02);
//         if (result) {
//           emailPromises.push(
//             sendReferralRewardNotification(result.referringUser, result.reward)
//           );
//         }
//       }
//     } else if (orderStatus === "cancelled") {
//       if (!cancellationReason) {
//         return res.status(StatusCodes.BAD_REQUEST).json({
//           status: false,
//           message: "Cancellation reason is required.",
//         });
//       }
//       emailPromises.push(
//         sendCustomerOrderCancelledMail(order, order.user, cancellationReason)
//       );

//       if (order.user.phoneNumber) {
//         try {
//           console.log(`Sending cancellation SMS to: ${order.user.phoneNumber}`);
//           await termiiService.sendCustomerOrderCancelledNotification(
//             order.user.phoneNumber,
//             order.user.firstName,
//             order.orderId,
//             cancellationReason
//           );
//           await termiiService.sendOrderCancellationSMS(
//             order.user.phoneNumber,
//             order.user.firstName,
//             order.orderId,
//             cancellationReason
//           );
//         } catch (error) {
//           console.error("Error sending Termii notification: ", error);
//         }
//       } else {
//         console.log(
//           `User with ID ${order.user._id} does not have a phone number. Skipping SMS notification.`
//         );
//       }
//     }

//     await Promise.all(emailPromises);

//     return res.status(StatusCodes.OK).json({
//       status: true,
//       message: "Order status updated successfully",
//       data: order,
//     });
//   } catch (error) {
//     console.log("Error updating order status:", error);
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       status: false,
//       message: "Failed to update order status. " + error.message,
//     });
//   }
// };

const updateOrderStatus = async (req, res) => {
  const orderId = req.params.orderId;
  const { orderStatus, deliveryDate, paymentStatus, cancellationReason } =
    req.body;

  const validStatuses = [
    "new",
    "confirmed",
    "packaged",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!validStatuses.includes(orderStatus)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: `Invalid order status. Valid statuses are: ${validStatuses.join(
        ", "
      )}`,
    });
  }

  try {
    const updateFields = { orderStatus };

    if (orderStatus === "delivered" && deliveryDate) {
      const parsedDeliveryDate = new Date(deliveryDate);
      if (isNaN(parsedDeliveryDate.getTime())) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: false,
          message: "Invalid delivery date format.",
        });
      }
      updateFields.deliveryDate = parsedDeliveryDate;
    }

    if (paymentStatus) {
      updateFields.paymentStatus = paymentStatus;
    }

    const query =
      req.user.role === "admin"
        ? { orderId }
        : { orderId, "orderItems.vendorDetails.email": req.user.email };

    const order = await Order.findOneAndUpdate(query, updateFields, {
      new: true,
    })
      .populate("user")
      .populate("orderItems.product");

    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message:
          "Order not found or you are not authorized to update this order",
      });
    }

    if (!order.user) {
      console.warn(`User details missing for order ID ${order.orderId}`);
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Order has no associated user.",
      });
    }

    const notifications = [];

    // Define email and SMS logic
    const sendNotifications = async (emailFunc, smsFunc) => {
      notifications.push(emailFunc(order, order.user));
      if (order.user.phoneNumber) {
        notifications.push(
          smsFunc(
            order.user.phoneNumber,
            order.user.firstName,
            order.orderId,
            orderStatus
          )
        );
      }
    };

    switch (orderStatus) {
      case "confirmed":
        await sendNotifications(
          sendCustomerOrderConfirmedMail,
          termiiService.sendUpdateOrderStatusSMS
        );
        break;
      case "packaged":
        await sendNotifications(
          sendCustomerOrderPackagedMail,
          termiiService.sendUpdateOrderStatusSMS
        );
        break;
      case "shipped":
        await sendNotifications(
          sendCustomerOrderShippedMail,
          termiiService.sendUpdateOrderStatusSMS
        );
        break;
      case "delivered":
        if (!req.body.deliveryDate) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            status: false,
            message: "Delivery date is required.",
          });
        }
        notifications.push(
          sendCustomerOrderDeliveredMail(order, order.user),
          sendVendorOrderDeliveredMail(order, order.user)
        );
        if (order.user.phoneNumber) {
          notifications.push(
            termiiService.sendUpdateOrderStatusSMS(
              order.user.phoneNumber,
              order.user.firstName,
              order.orderId,
              orderStatus
            )
          );
        }
        // if (order.appliedReferralCode) {
        //   const result = await processReferralReward(order, 0.02);
        //   if (result) {
        //     notifications.push(
        //       sendReferralRewardNotification(
        //         result.referringUser,
        //         result.reward
        //       )
        //     );
        //   }
        // }
        break;
      case "cancelled":
        if (!cancellationReason) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            status: false,
            message: "Cancellation reason is required.",
          });
        }
        notifications.push(
          sendCustomerOrderCancelledMail(order, order.user, cancellationReason)
        );
        if (order.user.phoneNumber) {
          notifications.push(
            termiiService.sendCustomerOrderCancelledNotification(
              order.user.phoneNumber,
              order.user.firstName,
              order.orderId,
              cancellationReason
            ),
            termiiService.sendOrderCancellationSMS(
              order.user.phoneNumber,
              order.user.firstName,
              order.orderId,
              cancellationReason
            )
          );
        }
        break;
      default:
        break;
    }

    await Promise.all(notifications);

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.log("Error updating order status:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to update order status. " + error.message,
    });
  }
};

const deleteVendor = async (res) => {
  try {
    const vendor = await User.findByIdAndDelete(req.params.id);
    if (!vendor || vendor.role !== "vendor") {
      return res
        .status(404)
        .json({ status: false, message: "Vendor not found" });
    }
    return res
      .status(200)
      .json({ status: true, message: "Vendor deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

// const processReferralReward = async (order, rewardPercentage) => {
//   const referringUser = await User.findOne({
//     referralCode: order.appliedReferralCode,
//   });

//   if (referringUser) {
//     const reward = order.totalPrice * rewardPercentage;
//     const wallet = await Wallet.findOne({ userId: referringUser._id });

//     wallet.balance += reward;
//     wallet.transactions.push({
//       type: "credit",
//       amount: reward,
//       description: `Referral reward for Order ID ${order.orderId}`,
//     });

//     await wallet.save();

//     order.referralPayoutStatus = "completed";
//     await order.save();

//     return { referringUser, reward };
//   }
//   return null;
// };

const uploadStoreBanners = async (req, res) => {
  try {
    const vendorId = req.user?.userid;
    if (!vendorId) {
      return res
        .status(400)
        .json({ status: false, message: "Vendor ID missing from request." });
    }

    const banners = req.body.banners;

    if (!Array.isArray(banners) || banners.length < 1 || banners.length > 3) {
      return res.status(400).json({
        status: false,
        message: "You must upload between 1 and 3 store banners.",
      });
    }

    const existingBannerCount = await Media.countDocuments({
      section: "StoreBanner",
      vendor: vendorId,
    });

    if (existingBannerCount + banners.length > 3) {
      return res.status(400).json({
        status: false,
        message: `You can only upload up to 3 store banners. You currently have ${existingBannerCount}.`,
      });
    }

    const bannerDocs = banners.map((b) => ({
      section: "StoreBanner",
      image: b.image,
      description: b.description || "",
      platform: b.platform || "web",
      vendor: vendorId,
      redirectUrl: b.redirectUrl || null,
    }));

    const saved = await Media.insertMany(bannerDocs, { runValidators: true });

    return res.status(201).json({
      status: true,
      message: "Store banners created successfully.",
      data: saved,
    });
  } catch (error) {
    console.error("uploadStoreBanners error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to create store banners." });
  }
};

// ✅ Get store banners for current vendor
const getStoreBanners = async (req, res) => {
  try {
    const vendorId = req.user.userid;
    const banners = await Media.find({
      vendor: vendorId,
      section: "StoreBanner",
    });

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Store banners fetched successfully.",
      data: banners,
    });
  } catch (error) {
    console.error("getStoreBanners error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch store banners.",
    });
  }
};

// ✅ Selective PATCH update or create store banners (max 3)
const patchStoreBanners = async (req, res) => {
  try {
    const vendorId = req.user.userid;
    const { banners } = req.body;

    if (!Array.isArray(banners) || banners.length < 1 || banners.length > 3) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "You must submit between 1 and 3 store banners",
      });
    }

    for (const banner of banners) {
      if (!banner.image || typeof banner.image !== "string") {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: false,
          message: "Each banner must contain a valid 'image' field",
        });
      }

      const query = {
        section: "StoreBanner",
        vendor: vendorId,
        image: banner.image,
      };

      const update = {
        section: "StoreBanner",
        image: banner.image,
        description: banner.description || "",
        redirectUrl: banner.redirectUrl || null,
        vendor: vendorId,
        platform: banner.platform || "web",
      };

      await Media.findOneAndUpdate(query, update, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      });
    }

    const updatedBanners = await Media.find({
      section: "StoreBanner",
      vendor: vendorId,
    });

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Store banners updated successfully",
      data: updatedBanners,
    });
  } catch (error) {
    console.error("patchStoreBanners error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createVendor,
  checkStoreNameAvailability,
  createStore,
  getAllVendors,
  getVendorById,
  getVendorByStoreName,
  updateOrderStatus,
  deleteVendor,
  uploadStoreBanners,
  getStoreBanners,
  patchStoreBanners,
};
