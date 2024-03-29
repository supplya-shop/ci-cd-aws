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

    return res
      .status(StatusCodes.OK)
      .json({ status: "success", data: otplogs, totalCount });
  } catch (error) {
    // logger.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to fetch otplogs",
    });
  }
};

const bulkdeleteOtpLogs = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Invalid input. Please provide an array of otplogs IDs.",
      });
      throw new NotFoundError("Unable to find otplogs");
    }
    const result = await OtpLogs.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: "No otplogs found with the provided IDs.",
      });
    }
    return res.status(StatusCodes.OK).json({
      status: "success",
      message: `${result.deletedCount} otplog(s) deleted successfully.`,
    });
  } catch (error) {
    console.error("Error in bulk delete operation:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
};

module.exports = {
  getAllOtpLogs,
  bulkdeleteOtpLogs,
};
