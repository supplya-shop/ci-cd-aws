const {
  sendOtpViaTermii,
  sendVendorWhatsAppOrderNotification,
  sendCustomerWhatsAppOrderNotification,
  sendMigrationNotification,
} = require("../service/TermiiService");
const express = require("express");
const router = express.Router();
const { StatusCodes } = require("http-status-codes");

router.use(express.json());

// TermiiService -> termii route

const handleSendOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Phone number and OTP are required.",
      });
    }

    const response = await sendOtpViaTermii(phoneNumber, otp);
    res.status(StatusCodes.OK).json({
      status: true,
      message: "OTP sent successfully.",
      data: response,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
};

const handleSendOrderNotification = async (req, res) => {
  try {
    const { phoneNumber, firstName, orderId, timeFrame } = req.body;

    if (!phoneNumber || !firstName || !orderId || !timeFrame) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message:
          "Phone number, first name, order ID, and time frame are required.",
      });
    }

    const response = await sendCustomerWhatsAppOrderNotification(
      phoneNumber,
      firstName,
      orderId,
      timeFrame
    );
    res.status(StatusCodes.OK).json({
      status: true,
      message: "Custom message sent successfully.",
      data: response,
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
};

const handleSendVendorOrderNotification = async (req, res) => {
  try {
    const { phoneNumber, firstName, orderId, email, phone } = req.body;

    if (!phoneNumber || !firstName || !orderId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Phone number, first name, and order ID are required.",
      });
    }

    const response = await sendVendorWhatsAppOrderNotification(
      phoneNumber,
      firstName,
      orderId,
      phone,
      email
    );
    res.status(StatusCodes.OK).json({
      status: true,
      message: "Custom message sent successfully.",
      data: response,
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
};

const handleSendMigrationNotification = async (req, res) => {
  try {
    const { firstName, websiteUrl, phoneNumber, password } = req.body;

    const response = await sendMigrationNotification(
      phoneNumber,
      firstName,
      websiteUrl,
      password
    );
    res.status(StatusCodes.OK).json({
      status: true,
      message: "Custom message sent successfully.",
      data: response,
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
};

router.post("/sms/send", handleSendOtp);
router.post("/send/template", handleSendOrderNotification);
router.post("/send/template/vendor", handleSendVendorOrderNotification);
router.post("/send/template/migration", handleSendMigrationNotification);

module.exports = router;
