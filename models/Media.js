const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  tag: {
    type: String,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

module.exports = mongoose.model("Media", mediaSchema);
