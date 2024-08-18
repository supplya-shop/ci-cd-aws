const Store = require("../models/Store");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const Order = require("../models/Order");
const {
  sendCustomerOrderConfirmedMail,
  sendCustomerOrderDeliveredMail,
  sendVendorOrderDeliveredMail,
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
      address: { street, city, state, country },
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

const updateOrderStatus = async (req, res) => {
  const orderId = req.params.orderId;
  const { orderStatus, deliveryDate, paymentStatus } = req.body;

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

    if (
      deliveryDate &&
      (orderStatus === "confirmed" || orderStatus === "delivered")
    ) {
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

    const order = await Order.findOneAndUpdate(
      {
        orderId,
        "orderItems.vendorDetails.email": req.user.email,
      },
      updateFields,
      { new: true }
    )
      .populate("user")
      .populate("orderItems.product");

    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message:
          "Order not found or you are not authorized to update this order",
      });
    }

    const emailPromises = [];
    if (orderStatus === "confirmed" && deliveryDate) {
      emailPromises.push(sendCustomerOrderConfirmedMail(order, order.user));
    } else if (orderStatus === "delivered") {
      emailPromises.push(
        sendCustomerOrderDeliveredMail(order, order.user),
        sendVendorOrderDeliveredMail(order, order.user)
      );
    }

    await Promise.all(emailPromises);

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to update order status. " + error.message,
    });
  }
};

const deleteVendor = async () => {
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

module.exports = {
  createVendor,
  checkStoreNameAvailability,
  createStore,
  getAllVendors,
  getVendorById,
  getVendorByStoreName,
  updateOrderStatus,
  deleteVendor,
};
