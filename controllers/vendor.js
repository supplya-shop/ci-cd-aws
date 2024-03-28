const Store = require("../models/Store");
const { StatusCodes } = require("http-status-codes");

const createStore = async (req, res) => {
  try {
    const { name } = req.body;
    const newStore = new Store({
      name,
      wallet: { balance: 0 },
      products: [],
      owner: req.user._id,
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
