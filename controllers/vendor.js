const Store = require("../models/Store");

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
    res.status(201).json(store);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};
