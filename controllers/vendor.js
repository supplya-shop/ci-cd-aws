const Store = require("../models/Store");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");

const createVendor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      shopName,
      phoneNumber,
      street,
      state,
      country,
      city,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !shopName ||
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

    const shopUrl = `https://supplya.shop/store/${shopName.replace(
      /\s+/g,
      "-"
    )}`;

    const vendor = await User.create({
      firstName,
      lastName,
      displayName: `${lastName}${firstName}`,
      shopName,
      shopUrl,
      phoneNumber,
      address: { street, state, country, city },
      role: "vendor",
    });

    return res.status(201).json({
      status: "success",
      message: "Vendor created successfully",
      data: vendor,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

const createStore = async (req, res) => {
  try {
    const { userId, name } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }
    if (user.role !== "vendor") {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: "error",
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
      status: "success",
      message: "Store created successfully",
      data: store,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" });
    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Vendors fetched successfully",
      data: vendors,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
};

const getVendorById = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor || vendor.role !== "vendor") {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", message: "Vendor not found" });
    }
    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Vendor fetched successfully",
      data: vendor,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
};

const updateVendor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      shopName,
      phoneNumber,
      dob,
      state,
      city,
      country,
      street,
      address,
    } = req.body;
    let updatedData = {
      firstName,
      lastName,
      shopName,
      phoneNumber,
      dob,
      state,
      city,
      country,
      street,
      address,
    };

    if (shopName) {
      updatedData = {
        ...updatedData,
        shopName,
        shopUrl: `https://supplya.shop/store/${shopName.replace(/\s+/g, "-")}`,
      };
    }

    const user = await User.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });

    if (!user || user.role !== "vendor") {
      return res
        .status(404)
        .json({ status: "error", message: "Vendor not found" });
    }

    return res.status(200).json({
      status: "success",
      message: "Vendor updated successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

const deleteVendor = async () => {
  try {
    const vendor = await User.findByIdAndDelete(req.params.id);
    if (!vendor || vendor.role !== "vendor") {
      return res
        .status(404)
        .json({ status: "error", message: "Vendor not found" });
    }
    return res
      .status(200)
      .json({ status: "success", message: "Vendor deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

module.exports = {
  createVendor,
  createStore,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
};
