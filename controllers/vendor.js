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
      shopUrl,
      street,
      street2,
      city,
      country,
      state,
      phoneNumber,
    } = req.body;
    const existingVendor = await User.find({ email, shopUrl });
    if (existingVendor) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Vendor already exists",
      });
    }
  } catch (error) {}
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
    return res
      .status(StatusCodes.CREATED)
      .json({ status: "success", data: store });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
};

module.exports = createStore;
