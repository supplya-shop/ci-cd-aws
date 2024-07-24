const {
  sendOtpViaTermii,
  sendVendorWhatsAppOrderNotification,
  sendCustomerWhatsAppOrderNotification,
} = require("../service/TermiiService");
const express = require("express");
const router = express.Router();

router.use(express.json());
// router.use((req, res, next) => {
//   console.log("Incoming request body:", req.body);
//   next();
// });

const handleSendOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        status: false,
        message: "Phone number and OTP are required.",
      });
    }

    const response = await sendOtpViaTermii(phoneNumber, otp);
    res.status(200).json({
      status: true,
      message: "OTP sent successfully.",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const handleSendOrderNotification = async (req, res) => {
  try {
    const { phoneNumber, firstName, orderId, timeFrame } = req.body;

    if (!phoneNumber || !firstName || !orderId || !timeFrame) {
      return res.status(400).json({
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
    res.status(200).json({
      status: true,
      message: "Custom message sent successfully.",
      data: response,
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const handleSendVendorOrderNotification = async (req, res) => {
  try {
    const { phoneNumber, firstName, orderId, email, phone } = req.body;

    if (!phoneNumber || !firstName || !orderId || !timeFrame) {
      return res.status(400).json({
        status: false,
        message:
          "Phone number, first name, order ID, and time frame are required.",
      });
    }

    const response = await sendVendorWhatsAppOrderNotification(
      phoneNumber,
      firstName,
      orderId,
      phone,
      email
    );
    res.status(200).json({
      status: true,
      message: "Custom message sent successfully.",
      data: response,
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

router.post("/sms/send", handleSendOtp);
router.post("/send/template", handleSendOrderNotification);
router.post("/send/template/vendor", handleSendVendorOrderNotification);

module.exports = router;
