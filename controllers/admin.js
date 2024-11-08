const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const csv = require("csv-parser");
const moment = require("moment");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const {
  validateWithJoi,
  validateUserData,
  processUsers,
  generatePassword,
  existingUserCheck,
} = require("../middleware/validation/userDTO");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors");
const { sendMigratedCustomersMail } = require("../middleware/mailUtil");
const termiiService = require("../service/TermiiService");

const { isNull } = require("util");

const getDashboardStats = async (req, res) => {
  try {
    const today = moment().startOf("day").toDate();
    const yesterday = moment().subtract(1, "day").startOf("day").toDate();
    const lastWeek = moment().subtract(10, "days").startOf("day").toDate();
    const lastMonth = moment().subtract(30, "days").startOf("day").toDate();

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $group: { _id: null, total: { $sum: { $toDouble: "$totalPrice" } } } },
    ]);

    const yesterdayRevenue = await Order.aggregate([
      { $match: { dateOrdered: { $gte: yesterday, $lt: today } } },
      { $group: { _id: null, total: { $sum: { $toDouble: "$totalPrice" } } } },
    ]);

    const totalOrders = await Order.countDocuments();
    const todayOrders = await Order.countDocuments({
      dateOrdered: { $gte: today },
    });
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const newCustomersLastWeek = await User.countDocuments({
      role: "customer",
      createdAt: { $gte: lastWeek },
    });
    const totalVendors = await User.countDocuments({ role: "vendor" });
    const newVendorsLastWeek = await User.countDocuments({
      role: "vendor",
      createdAt: { $gte: lastWeek },
    });

    const topSellingProducts = await Order.aggregate([
      { $unwind: "$orderItems" },
      { $match: { orderStatus: "Delivered" } },
      {
        $group: {
          _id: "$orderItems.product",
          totalSold: { $sum: "$orderItems.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "users",
          localField: "product.createdBy",
          foreignField: "_id",
          as: "vendor",
        },
      },
      { $unwind: "$vendor" },
      {
        $project: {
          totalSold: 1,
          "product.name": 1,
          "product.image": 1,
          "vendor.firstName": 1,
          "vendor.lastName": 1,
          "vendor.storeUrl": 1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalTopSellingProducts = await Order.aggregate([
      { $unwind: "$orderItems" },
      { $match: { orderStatus: "Delivered" } },
      { $group: { _id: "$orderItems.product" } },
      { $count: "total" },
    ]);

    const totalPages = Math.ceil(
      (totalTopSellingProducts[0]?.total || 0) / limit
    );

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Dashboard data fetched successfully",
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        yesterdayRevenue: yesterdayRevenue[0]?.total || 0,
        totalOrders,
        todayOrders,
        totalCustomers,
        newCustomersLastWeek,
        totalVendors,
        newVendorsLastWeek,
        topSellingProducts: topSellingProducts.map((item) => ({
          totalSold: item.totalSold,
          product: item.product.name,
          image: item.product.image,
          vendor: `${item.vendor.firstName} ${item.vendor.lastName}`,
          storeUrl: item.vendor.storeUrl,
        })),
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getProductDashboardStats = async (req, res) => {
  try {
    const today = moment().startOf("day").toDate();
    const startOfMonth = moment().startOf("month").toDate();
    const startOfWeek = moment().startOf("week").toDate();

    const totalProducts = await Product.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } },
    ]);

    const totalProductsAddedLastMonth = await Product.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } },
    ]);

    const totalProductsAddedLastWeek = await Product.aggregate([
      { $match: { createdAt: { $gte: startOfWeek } } },
      { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } },
    ]);

    const newProductsAddedToday = await Product.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } },
    ]);

    const totalProductsInStock = await Product.aggregate([
      { $match: { quantity: { $gt: 0 } } },
      { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } },
    ]);

    const totalProductsOutOfStock = await Product.countDocuments({
      quantity: { $lte: 0 },
    });

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Product data fetched successfully",
      data: {
        totalProducts: totalProducts[0]?.totalQuantity || 0,
        totalProductsAddedLastMonth:
          totalProductsAddedLastMonth[0]?.totalQuantity || 0,
        totalProductsAddedLastWeek:
          totalProductsAddedLastWeek[0]?.totalQuantity || 0,
        newProductsAddedToday: newProductsAddedToday[0]?.totalQuantity || 0,
        totalProductsInStock: totalProductsInStock[0]?.totalQuantity || 0,
        totalProductsOutOfStock,
      },
    });
  } catch (error) {
    console.error("Error fetching product statistics: ", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getOrderDashboardStats = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const past7Days = new Date();
    past7Days.setDate(past7Days.getDate() - 7);

    const currentDayStart = new Date();
    currentDayStart.setHours(0, 0, 0, 0);

    const totalOrders = await Order.countDocuments({});
    const totalOrdersLast7Days = await Order.countDocuments({
      dateOrdered: { $gte: past7Days },
    });
    const totalNewOrdersToday = await Order.countDocuments({
      dateOrdered: { $gte: currentDayStart },
    });
    const totalDeliveredOrders = await Order.countDocuments({
      orderStatus: "Delivered",
    });
    const totalDeliveredOrdersToday = await Order.countDocuments({
      orderStatus: "Delivered",
      dateOrdered: { $gte: currentDayStart },
    });
    const totalPendingOrders = await Order.countDocuments({
      orderStatus: "new",
    });
    const totalCancelledOrders = await Order.countDocuments({
      orderStatus: "cancelled",
    });

    const orders = await Order.find({})
      .skip(skip)
      .limit(limit)
      .sort({ dateOrdered: -1 })
      .populate({
        path: "orderItems.product",
        select:
          "name unit_price discounted_price description status quantity category image",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .populate({
        path: "user",
        select: "firstName lastName email phoneNumber",
      });

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Order data fetched successfully",
      data: {
        totalOrders,
        totalOrdersLast7Days,
        totalNewOrdersToday,
        totalDeliveredOrders,
        totalDeliveredOrdersToday,
        totalPendingOrders,
        totalCancelledOrders,
        orders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch order statistics: " + error.message,
    });
  }
};

const getCustomerStats = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const currentDate = new Date();
    const past7Days = new Date(currentDate);
    past7Days.setDate(currentDate.getDate() - 7);

    const past90Days = new Date(currentDate);
    past90Days.setDate(currentDate.getDate() - 90);

    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const totalCustomers = await User.countDocuments({ role: "customer" });
    const newCustomersLast7Days = await User.countDocuments({
      role: "customer",
      createdAt: { $gte: past7Days },
    });
    const newCustomersToday = await User.countDocuments({
      role: "customer",
      createdAt: { $gte: startOfDay },
    });
    const activeCustomers = await User.countDocuments({
      role: "customer",
      lastLogin: { $gte: past90Days },
    });
    const inactiveCustomers = await User.countDocuments({
      role: "customer",
      $or: [
        { lastLogin: { $lt: past90Days } },
        { lastLogin: { $exists: false } },
      ],
    });

    const customers = await User.find({ role: "customer" })
      .skip(skip)
      .limit(limit);

    const customerIds = customers.map((customer) => customer._id);

    const orders = await Order.aggregate([
      { $match: { user: { $in: customerIds } } },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalPrice" },
        },
      },
    ]);

    const customerStats = customers.map((customer) => {
      const order = orders.find(
        (order) => order._id.toString() === customer._id.toString()
      );
      return {
        ...customer._doc,
        totalSpent: order ? order.totalSpent : 0,
      };
    });

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Customer data fetched successfully",
      data: {
        totalCustomers,
        newCustomersLast7Days,
        newCustomersToday,
        activeCustomers,
        inactiveCustomers,
        customers: customerStats,
        totalPages: Math.ceil(totalCustomers / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch customer statistics: " + error.message,
    });
  }
};

const getVendorStats = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const currentDate = new Date();
    const past7Days = new Date(currentDate);
    past7Days.setDate(currentDate.getDate() - 7);

    const past90Days = new Date(currentDate);
    past90Days.setDate(currentDate.getDate() - 90);

    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const totalVendors = await User.countDocuments({ role: "vendor" });
    const newVendorsLast7Days = await User.countDocuments({
      role: "vendor",
      createdAt: { $gte: past7Days },
    });
    const newVendorsToday = await User.countDocuments({
      role: "vendor",
      createdAt: { $gte: startOfDay },
    });
    const activeVendors = await User.countDocuments({
      role: "vendor",
      lastLogin: { $gte: past90Days },
    });
    const inactiveVendors = await User.countDocuments({
      role: "vendor",
      $or: [
        { lastLogin: { $lt: past90Days } },
        { lastLogin: { $exists: false } },
      ],
    });

    const vendors = await User.find({ role: "vendor" }).skip(skip).limit(limit);

    const vendorIds = vendors.map((vendor) => vendor._id);

    const orders = await Order.aggregate([
      { $match: { vendor: { $in: vendorIds } } },
      {
        $group: {
          _id: "$vendor",
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    const vendorStats = vendors.map((vendor) => {
      const order = orders.find(
        (order) => order._id.toString() === vendor._id.toString()
      );
      return {
        ...vendor._doc,
        totalRevenue: order ? order.totalRevenue : 0,
      };
    });

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Vendor data fetched successfully",
      data: {
        totalVendors,
        newVendorsLast7Days,
        newVendorsToday,
        activeVendors,
        inactiveVendors,
        vendors: vendorStats,
        totalPages: Math.ceil(totalVendors / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch vendor statistics: " + error.message,
    });
  }
};

const getAdminStats = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const currentDate = new Date();
    const past7Days = new Date(currentDate);
    past7Days.setDate(currentDate.getDate() - 7);

    const past90Days = new Date(currentDate);
    past90Days.setDate(currentDate.getDate() - 90);

    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const totalAdmins = await User.countDocuments({ role: "admin" });
    const newAdminsLast7Days = await User.countDocuments({
      role: "admin",
      createdAt: { $gte: past7Days },
    });
    const newAdminsToday = await User.countDocuments({
      role: "admin",
      createdAt: { $gte: startOfDay },
    });
    const activeAdmins = await User.countDocuments({
      role: "admin",
      lastLogin: { $gte: past90Days },
    });
    const inactiveAdmins = await User.countDocuments({
      role: "admin",
      $or: [
        { lastLogin: { $lt: past90Days } },
        { lastLogin: { $exists: false } },
      ],
    });

    const admins = await User.find({ role: "admin" }).skip(skip).limit(limit);

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Admin data fetched successfully",
      data: {
        totalAdmins,
        newAdminsLast7Days,
        newAdminsToday,
        activeAdmins,
        inactiveAdmins,
        admins,
        totalPages: Math.ceil(totalAdmins / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch admin statistics: " + error.message,
    });
  }
};

const getUserSignupStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const signups = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      status: true,
      message: "Stats fetched successfully",
      data: signups,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch sign-up statistics: " + error.message,
    });
  }
};

const getOrderStats = async (req, res) => {
  const { period } = req.query;
  let groupBy;

  switch (period) {
    case "daily":
      groupBy = {
        year: { $year: "$dateOrdered" },
        month: { $month: "$dateOrdered" },
        day: { $dayOfMonth: "$dateOrdered" },
      };
      break;
    case "weekly":
      groupBy = {
        year: { $year: "$dateOrdered" },
        week: { $week: "$dateOrdered" },
      };
      break;
    case "monthly":
      groupBy = {
        year: { $year: "$dateOrdered" },
        month: { $month: "$dateOrdered" },
      };
      break;
    default:
      groupBy = {
        year: { $year: "$dateOrdered" },
        month: { $month: "$dateOrdered" },
        day: { $dayOfMonth: "$dateOrdered" },
      };
  }

  try {
    const salesStats = await Order.aggregate([
      {
        $match: { orderStatus: "Delivered" },
      },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Sales statistics fetched successfully",
      data: salesStats,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Failed to fetch sales statistics: ${error.message}`,
    });
  }
};

const createUser = async (req, res) => {
  const { error, value } = validateWithJoi(req.body);
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: false,
      message:
        "Validation error. Please confirm that all required fields are entered and try again.",
    });
  }
  const newUser = new User(value);
  try {
    await newUser.save();
    return res
      .status(StatusCodes.CREATED)
      .json({ message: "User created successfully.", status: true });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to create user.", status: false });
  }
};

const assignProductToVendor = async (req, res) => {
  const { productId, vendorId } = req.body;

  if (!productId || !vendorId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: "Product ID and Vendor ID are required",
    });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Product not found",
      });
    }

    const vendor = await User.findById(vendorId);
    if (!vendor) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Vendor not found",
      });
    }

    product.createdBy = vendorId;
    await product.save();

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Product assigned to vendor successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error assigning product to vendor:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to assign product to vendor. " + error.message,
    });
  }
};

const getMostBoughtProducts = async (req, res) => {
  try {
    const products = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          purchaseCount: { $sum: "$orderItems.quantity" },
        },
      },
      { $sort: { purchaseCount: -1 } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "users",
          localField: "product.createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: "$product._id",
          name: "$product.name",
          unit_price: "$product.unit_price",
          description: "$product.description",
          quantity: "$product.quantity",
          category: {
            _id: "$category._id",
            name: "$category.name",
          },
          image: "$product.image",
          images: "$product.images",
          brand: "$product.brand",
          createdBy: {
            _id: "$createdBy._id",
            firstName: "$createdBy.firstName",
            lastName: "$createdBy.lastName",
            email: "$createdBy.email",
            country: "$createdBy.country",
            state: "$createdBy.state",
            city: "$createdBy.city",
            phoneNumber: "$createdBy.phoneNumber",
          },
          status: "$product.status",
          rating: "$product.rating",
          isFeatured: "$product.isFeatured",
          flashsale: "$product.flashsale",
          salesCount: "$product.salesCount",
          approved: "$product.approved",
          dateCreated: "$product.dateCreated",
          dateModified: "$product.dateModified",
          sku: "$product.sku",
          moq: "$product.moq",
          purchaseCount: "$purchaseCount",
        },
      },
    ]);

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch products: " + error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [users, totalCount] = await Promise.all([
      User.find(),
      User.countDocuments(),
    ]);

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Users fetched successfully",
      data: users,
      totalCount: totalCount,
    });
  } catch (error) {
    // logger.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch users",
    });
  }
};

const getAdminUsers = async (req, res, next) => {
  try {
    const adminUsers = await User.find({ role: "admin" }).select("_id email");
    const adminIds = adminUsers.map((user) => user._id);
    console.log("Admin users:", adminUsers);

    return res.status(200).json({
      status: true,
      message: "Admin users fetched successfully",
      data: adminIds,
      adminUsers: adminUsers,
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.id;
  await User.findById(userId)
    .then((User) => {
      if (!User) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: false,
          message: "user not found",
        });
      }
      User.firstName =
        User.firstName.charAt(0).toUpperCase() + User.firstName.slice(1);
      User.lastName =
        User.lastName.charAt(0).toUpperCase() + User.lastName.slice(1);
      return res.status(StatusCodes.OK).json({
        status: true,
        message: "User fetched successfully",
        data: User,
      });
    })
    .catch((error) => {
      // logger.error(error.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch user",
      });
    });
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    delete updates.password;
    delete updates.role;

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "User not found",
      });
    }

    if (updates.storeName) {
      updates.storeName = updates.storeName.toLowerCase();

      if (updates.storeName !== existingUser.storeName) {
        const storeNameExists = await User.findOne({
          storeName: updates.storeName,
        });
        if (storeNameExists) {
          return res.status(StatusCodes.CONFLICT).json({
            status: false,
            message: "This store name is already taken",
          });
        }
        updates.storeUrl = `https://supplya.shop/store/${updates.storeName.replace(
          /\s+/g,
          "-"
        )}`;
      }
    }

    const updatedData = {};
    for (const key in updates) {
      if (updates[key] !== undefined) {
        updatedData[key] = updates[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    const response = updatedUser.toObject();
    delete response.password;

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "User updated successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: "User not found" });
    }
    const result = await User.findByIdAndDelete(userId);
    if (!result) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ status: false, message: "Failed to delete user" });
    }
    return res.status(StatusCodes.OK).json({
      status: true,
      message: "User deleted successfully",
      data: user,
    });
  } catch (error) {
    // logger.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: "Internal Server Error" });
  }
};

const getUserOrders = async (req, res) => {
  const userId = req.user.userid;
  const userRole = req.user.role;

  try {
    const past24Hours = new Date();
    past24Hours.setDate(past24Hours.getDate() - 1);

    if (userRole === "vendor") {
      const vendorProducts = await Product.find({
        createdBy: userId,
      }).select("quantity");

      const productIds = vendorProducts.map((product) => product._id);

      const orders = await Order.find({
        "orderItems.product": { $in: productIds },
      });

      const receivedOrdersCount = orders.filter(
        (order) => order.orderStatus === "received"
      ).length;
      const deliveredOrdersCount = orders.filter(
        (order) => order.orderStatus === "delivered"
      ).length;

      const newOrdersCount = orders.filter(
        (order) => new Date(order.dateOrdered) >= past24Hours
      ).length;

      const totalOrders = orders.length;

      const totalStock = vendorProducts.reduce(
        (acc, product) => acc + product.quantity,
        0
      );

      const totalAmountSold = orders.reduce(
        (acc, order) => acc + parseFloat(order.totalPrice),
        0
      );

      const dailySales = await Order.aggregate([
        { $match: { "orderItems.product": { $in: productIds } } },
        {
          $group: {
            _id: {
              year: { $year: "$dateOrdered" },
              month: { $month: "$dateOrdered" },
              day: { $dayOfMonth: "$dateOrdered" },
            },
            totalSales: { $sum: "$totalPrice" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
      ]);

      const monthlySales = await Order.aggregate([
        { $match: { "orderItems.product": { $in: productIds } } },
        {
          $group: {
            _id: {
              year: { $year: "$dateOrdered" },
              month: { $month: "$dateOrdered" },
            },
            totalSales: { $sum: "$totalPrice" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
      ]);

      return res.status(StatusCodes.OK).json({
        status: true,
        data: {
          totalOrders,
          totalStock,
          totalAmountSold,
          dailySales,
          monthlySales,
          orders,
          receivedOrdersCount,
          deliveredOrdersCount,
          newOrdersCount,
        },
      });
    } else {
      // Fetch orders for the customer
      const orders = await Order.find({ user: userId })
        .populate({
          path: "orderItems.product",
          populate: {
            path: "createdBy",
            select:
              "firstName lastName email country state city postalCode businessName phoneNumber accountNumber bank",
          },
        })
        .populate({
          path: "user",
          select: "firstName lastName email",
        });

      if (!orders) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ status: false, data: orders });
      }

      const pendingOrdersCount = orders.filter(
        (order) => order.orderStatus === "received"
      ).length;
      const deliveredOrdersCount = orders.filter(
        (order) => order.orderStatus === "delivered"
      ).length;

      const newOrdersCount = orders.filter(
        (order) => new Date(order.dateOrdered) >= past24Hours
      ).length;

      const totalOrders = orders.length;

      const totalAmountSpent = orders.reduce(
        (acc, order) => acc + parseFloat(order.totalPrice),
        0
      );

      const totalProductsOrdered = orders.reduce(
        (acc, order) =>
          acc + order.orderItems.reduce((acc, item) => acc + item.quantity, 0),
        0
      );

      return res.status(StatusCodes.OK).json({
        status: true,
        data: {
          totalOrders,
          totalAmountSpent,
          totalProductsOrdered,
          orders,
          pendingOrdersCount,
          deliveredOrdersCount,
          newOrdersCount,
        },
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch orders: " + error.message,
    });
  }
};

const bulkUploadUsers = async (req, res) => {
  const filePath = req.file.path;

  const deleteFile = () => {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`Error deleting file: ${err.message}`);
    }
  };

  const handleValidationErrors = (errors, message) => {
    deleteFile();
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message,
      errors,
    });
  };

  const handleSuccessResponse = (userCount) => {
    deleteFile();
    return res.status(StatusCodes.OK).json({
      status: true,
      message: `${userCount} user(s) imported successfully`,
    });
  };

  if (path.extname(filePath).toLowerCase() === ".xlsx") {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet);

      const users = [];
      const errors = [];
      const notifications = [];

      for (const [index, row] of rows.entries()) {
        const phoneNumber = row.phoneNumber
          ? String(row.phoneNumber)
              .replace(/\.\d+$/, "")
              .trim()
          : null;
        const email = row.email ? row.email.trim() : null;

        const user = {
          firstName: row.firstName || "User",
          lastName: row.lastName || null,
          email,
          phoneNumber,
          password: generatePassword(),
          role: row.role || "customer",
          displayName: row.displayName || "",
          storeName: row.storeName || "",
        };

        if (!user.email && !user.phoneNumber) {
          errors.push(
            `Row ${index + 1}: Either email or phone number is required`
          );
          continue;
        }

        if (user.phoneNumber && !/^234\d{10}$/.test(user.phoneNumber)) {
          errors.push(`Row ${index + 1}: Invalid phone number format`);
          continue;
        }

        if (user.storeName) {
          const storeNameExists = await User.findOne({
            storeName: user.storeName,
          });
          if (storeNameExists) {
            errors.push(
              `Row ${index + 1}: Store name "${
                user.storeName
              }" is already taken.`
            );
            continue;
          }
        }

        // Skip duplicate check if email or phoneNumber is blank or whitespace
        if (
          (user.email && user.email !== "") ||
          (user.phoneNumber && user.phoneNumber !== "")
        ) {
          const isDuplicate = await User.findOne({
            $or: [
              { email: user.email || { $exists: false } },
              { phoneNumber: user.phoneNumber || { $exists: false } },
            ],
          });
          if (isDuplicate) {
            errors.push(`Row ${index + 1}: Duplicate user found`);
            continue;
          }
        }

        users.push(user);

        const notificationData = {
          firstName: user.firstName,
          phoneNumber: user.phoneNumber,
          password: user.password,
          websiteUrl: "https://supplya.shop",
        };

        if (user.email) {
          notifications.push({
            method: "email",
            data: { email: user.email, ...notificationData },
          });
        } else if (user.phoneNumber) {
          notifications.push({
            method: "whatsapp",
            data: notificationData,
          });
        }
      }

      if (errors.length > 0) {
        return handleValidationErrors(errors, "Validation errors occurred");
      }

      await User.create(users);

      await Promise.all(
        notifications.map(async ({ method, data }) => {
          if (method === "email") {
            return sendMigratedCustomersMail(
              data.firstName,
              data.phoneNumber,
              data.email,
              data.password
            );
          } else {
            return termiiService.sendMigrationNotification(
              data.firstName,
              data.phoneNumber,
              data.websiteUrl,
              data.password
            );
          }
        })
      );

      return handleSuccessResponse(users.length);
    } catch (error) {
      console.error("Error importing XLSX file:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: `Failed to import users: ${error.message}`,
      });
    } finally {
      deleteFile();
    }
  } else {
    deleteFile();
    res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: "Unsupported file format. Please upload an XLSX file.",
    });
  }
};

const searchUsers = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: "Please provide a search query",
    });
  }

  try {
    const user = await User.findOne({
      $or: [
        { firstName: new RegExp(query, "i") },
        { lastName: new RegExp(query, "i") },
        { email: new RegExp(`^${query}$`, "i") },
        { phoneNumber: new RegExp(`^${query}$`, "i") },
      ],
    });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "User not found",
      });
    }

    const response = user.toObject();
    delete response.password;

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "User found",
      data: response,
    });
  } catch (error) {
    console.error("Error finding user:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const bulkdeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Invalid input. Please provide an array of user IDs.",
      });
    }
    const result = await User.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "No users found with the provided IDs.",
      });
    }
    return res.status(StatusCodes.OK).json({
      status: true,
      message: `${result.deletedCount} user(s) deleted successfully.`,
    });
  } catch (error) {
    console.error("Error in bulk delete operation:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: "Internal server error" });
  }
};

const exportUsers = async (req, res) => {
  try {
    const users = await User.find({}, "email phoneNumber role");

    const userData = users.map((user) => ({
      Email: user.email || "",
      PhoneNumber: user.phoneNumber || "",
      Role: user.role || "",
    }));

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(userData);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Export Users");

    const directoryPath = path.join(__dirname, "../exports");
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }

    const filePath = path.join(directoryPath, "users_export.xlsx");
    xlsx.writeFile(workbook, filePath);

    res.download(filePath, "users_exports.xlsx", (err) => {
      if (err) {
        res.status(500).json({ message: "Error downloading file." });
      } else {
        console.log("File exported successfully.");
      }
    });
  } catch (error) {
    console.error("Error exporting users:", error);
    res.status(500).json({ message: "Failed to export user data." });
  }
};

module.exports = {
  getDashboardStats,
  getProductDashboardStats,
  getOrderDashboardStats,
  getCustomerStats,
  getVendorStats,
  getAdminStats,
  assignProductToVendor,
  getMostBoughtProducts,
  getUserSignupStats,
  getOrderStats,
  bulkUploadUsers,
  searchUsers,
  exportUsers,
  // getAllUsers,
  // getAdminUsers,
  // getUserById,
  // createUser,
  // updateUser,
  // deleteUser,
  // getUserOrders,
  // bulkdeleteUsers,
};
