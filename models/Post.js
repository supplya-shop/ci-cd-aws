const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "title is required"],
    trim: true,
    maxlength: [50, "title cannot exceed 50 characters"],
  },
  content: {
    type: String,
    required: [true, "content is required"],
    maxlength: [1000, "content cannot exceed 1000 characters"],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogCategory",
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
