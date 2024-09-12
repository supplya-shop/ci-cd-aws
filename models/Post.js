const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "title is required"],
    trim: true,
    maxlength: [100, "title cannot exceed 100 characters"],
  },
  content: {
    type: String,
    required: [true, "content is required"],
    maxlength: [5000, "content cannot exceed 5000 characters"],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["publish", "draft"],
    default: "publish",
  },
  images: [
    {
      type: String,
    },
  ],
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  dateModified: {
    type: Date,
  },
});

module.exports = mongoose.model("Post", postSchema);
