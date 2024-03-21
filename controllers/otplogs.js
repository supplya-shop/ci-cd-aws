const OtpLogs = require("../models/OtpLogs");
const validateUser = require("../middleware/validation/userDTO");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors");
const multer = require("../middleware/upload");
// const logger = require("../middleware/logging/logger");

const getAllOtpLogs = async (req, res) => {
  try {
    const [otplogs, totalCount] = await Promise.all([
      OtpLogs.find(),
      OtpLogs.countDocuments(),
    ]);

    res.status(200).json({ otplogs, totalCount });
  } catch (error) {
    // logger.error(error.message);
    res.status(500).json({
      error: {
        status: "error",
        message: "Failed to fetch otplogs",
      },
    });
  }
};

const bulkdeleteOtpLogs = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      res.status(400).json({
        status: "error",
        message: "Invalid input. Please provide an array of otplogs IDs.",
      });
      throw new NotFoundError("Unable to find otplogs");
    }
    const result = await OtpLogs.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "No otplogs found with the provided IDs.",
      });
    }
    res.json({
      status: "success",
      message: `${result.deletedCount} otplog(s) deleted successfully.`,
    });
  } catch (error) {
    console.error("Error in bulk delete operation:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

module.exports = {
  getAllOtpLogs,
  bulkdeleteOtpLogs,
};
