const Category = require("../models/BlogCategory");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { StatusCodes } = require("http-status-codes");

const createPost = async (req, res) => {
  try {
    const { title, content, author, categories, tags } = req.body;

    const newPost = new Post({
      title,
      content,
      author,
      categories,
      tags,
      dateCreated: new Date(),
    });

    const savedPost = await newPost.save();

    return res.status(201).json({
      status: true,
      message: "Blog post created successfully",
      data: savedPost,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Failed to create blog post",
    });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.aggregate([
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "categories",
          localField: "categories",
          foreignField: "_id",
          as: "categories",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      { $sort: { dateCreated: -1 } },
    ]);

    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    return res.status(200).json({
      status: true,
      message: "Posts fetched successfully",
      data: posts,
      currentPage: page,
      totalPages,
      totalPosts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch posts",
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate("author", "firstName email")
      .populate("categories", "name")
      .populate({
        path: "comments",
        populate: { path: "author", select: "firstName email" },
      });

    if (!post) {
      return res.status(404).json({
        status: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Post fetched successfully",
      data: post,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch post",
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, categories, tags } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title, content, categories, tags, dateModified: new Date() },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({
        status: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Failed to update post",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({
        status: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Failed to delete post",
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, author } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        status: false,
        message: "Post not found",
      });
    }

    const newComment = new Comment({
      content,
      author,
      post: postId,
      dateCreated: new Date(),
    });

    const savedComment = await newComment.save();

    post.comments.push(savedComment._id);
    await post.save();

    return res.status(201).json({
      status: true,
      message: "Comment added successfully",
      data: savedComment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Failed to add comment",
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const newCategory = new Category({
      name,
      dateCreated: new Date(),
    });

    const savedCategory = await newCategory.save();

    return res.status(201).json({
      status: true,
      message: "Category created successfully",
      data: savedCategory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Failed to create category",
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});

    return res.status(200).json({
      status: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch categories",
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findById(categoryId).populate(
      "parentCategory",
      "name"
    );

    if (!category) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: "Category not found" });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const updates = req.body;

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res
        .status(StatusCodes.OK)
        .json({ status: false, message: "Category not found" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      updates,
      { new: true }
    );

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Category fetched successfully",
      data: updatedCategory,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to update category: " + error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Failed to delete category",
    });
  }
};

const searchPosts = async (req, res) => {
  try {
    const { keyword } = req.query;
    let { page, limit } = req.query;

    // Default values if page or limit are not specified
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;

    const skip = (page - 1) * limit;

    // Construct search criteria
    const searchCriteria = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { content: { $regex: keyword, $options: "i" } },
        { tags: { $regex: keyword, $options: "i" } },
        { "categories.name": { $regex: keyword, $options: "i" } },
        { "author.firstName": { $regex: keyword, $options: "i" } },
        { "author.lastName": { $regex: keyword, $options: "i" } },
      ],
    };

    // Aggregate query with pagination
    const posts = await Post.aggregate([
      { $match: searchCriteria },
      { $sort: { dateCreated: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }, { $addFields: { page, limit } }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);

    const totalResults =
      posts[0].metadata.length > 0 ? posts[0].metadata[0].total : 0;

    if (totalResults === 0) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "No posts found",
        data: [],
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Posts fetched successfully",
      data: posts[0].data,
      metadata: {
        totalResults,
        currentPage: page,
        totalPages: Math.ceil(totalResults / limit),
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error searching posts:", error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to search posts",
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  addComment,
  searchPosts,
};
