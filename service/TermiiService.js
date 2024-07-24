const axios = require("axios");
const { StatusCodes } = require("http-status-codes");

this.baseUrl = process.env.TERMII_BASE_URL;
this.apiKey = process.env.TERMII_API_KEY;
this.deviceId = process.env.TERMII_DEVICE_ID;
this.customertemplateId = process.env.TERMII_CUSTOMER_TEMPLATE_ID;
this.vendortemplateId = process.env.TERMII_VENDOR_TEMPLATE_ID;

const sendOtpViaTermii = async (phoneNumber, otp) => {
  try {
    const requestBody = {
      to: phoneNumber,
      from: "Supplya",
      sms: otp,
      type: "plain",
      channel: "whatsapp_otp",
      api_key: this.apiKey,
      time_in_minutes: "30 minutes",
    };

    const response = await axios.post(`${this.baseUrl}/sms/send`, requestBody);

    return response.data;
  } catch (error) {
    console.error("Error sending OTP via Termii:", error);
    throw new Error("Failed to send OTP. Please try again later.");
  }
};

// const sendVendorWhatsAppOrderNotification = async (
//   phoneNumber,
//   firstName,
//   orderId,
//   timeFrame
// ) => {
//   try {
//     const requestBody = {
//       phone_number: phoneNumber,
//       device_id: this.deviceId,
//       template_id: this.vendortemplateId,
//       api_key: this.apiKey,
//       data: {
//         first_name: firstName,
//         order_id: orderId,
//         time_frame: "30 minutes",
//       },
//     };

//     const response = await axios.post(
//       `${process.env.TERMII_BASE_URL}/send/template`,
//       requestBody
//     );

//     return response.data;
//   } catch (error) {
//     console.error("Error sending message:", error);
//     throw new Error("Failed to send custom message. Please try again later.");
//   }
// };

const sendCustomerWhatsAppOrderNotification = async (
  phoneNumber,
  firstName,
  orderId,
  timeFrame
) => {
  try {
    const requestBody = {
      phone_number: phoneNumber,
      device_id: this.deviceId,
      template_id: this.customertemplateId,
      api_key: this.apiKey,
      data: {
        first_name: firstName,
        order_id: orderId,
        time_frame: "30 minutes",
      },
    };

    const response = await axios.post(
      `${process.env.TERMII_BASE_URL}/send/template`,
      requestBody
    );

    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send custom message. Please try again later.");
  }
};

module.exports = {
  sendOtpViaTermii,
  //   sendVendorWhatsAppOrderNotification,
  sendCustomerWhatsAppOrderNotification,
};
