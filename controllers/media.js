const Media = require("../models/Media");
const { StatusCodes } = require("http-status-codes");

// Create Media
const createMedia = async (req, res) => {
  try {
    const { tag, image, description } = req.body;
    if (!image) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: false, message: "Image is required." });
    }

    const newMedia = new Media({ tag, image, description });
    await newMedia.save();

    return res.status(StatusCodes.CREATED).json({
      status: true,
      message: "Media created successfully",
      data: newMedia,
    });
  } catch (error) {
    console.error("Error creating media:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to create media.",
    });
  }
};

// Get All Media (with pagination & search)
const getAllMedia = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const searchQuery = req.query.search || "";

  try {
    let filter = {};
    if (searchQuery) {
      filter.$or = [
        { tag: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const totalMedia = await Media.countDocuments(filter);
    const mediaItems = await Media.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 });

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Media fetched successfully",
      data: mediaItems,
      currentPage: page,
      totalPages: Math.ceil(totalMedia / limit),
      totalMedia,
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch media.",
    });
  }
};

// Get Single Media by ID
const getMediaById = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Media not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Media fetched successfully",
      data: media,
    });
  } catch (error) {
    console.error("Error fetching media by ID:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch media.",
    });
  }
};

// Update Media
const updateMedia = async (req, res) => {
  try {
    const { tag, image, description } = req.body;
    const updatedMedia = await Media.findByIdAndUpdate(
      req.params.id,
      { tag, image, description },
      { new: true, runValidators: true }
    );

    if (!updatedMedia) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Media not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Media updated successfully",
      data: updatedMedia,
    });
  } catch (error) {
    console.error("Error updating media:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to update media.",
    });
  }
};

// Delete Media
const deleteMedia = async (req, res) => {
  try {
    const deletedMedia = await Media.findByIdAndDelete(req.params.id);
    if (!deletedMedia) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Media not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to delete media.",
    });
  }
};

module.exports = {
  createMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
};
