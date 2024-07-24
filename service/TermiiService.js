const axios = require("axios");

const termiiConfig = {
  baseUrl: process.env.TERMII_BASE_URL,
  apiKey: process.env.TERMII_API_KEY,
  deviceId: process.env.TERMII_DEVICE_ID,
  customerTemplateId: process.env.TERMII_CUSTOMER_TEMPLATE_ID,
  vendorTemplateId: process.env.TERMII_VENDOR_TEMPLATE_ID,
};

const sendOtpViaTermii = async (phoneNumber, otp) => {
  try {
    const requestBody = {
      to: phoneNumber,
      from: "Supplya",
      sms: otp,
      type: "plain",
      channel: "whatsapp_otp",
      api_key: termiiConfig.apiKey,
      time_in_minutes: "30 minutes",
    };

    const response = await axios.post(
      `${termiiConfig.baseUrl}/sms/send`,
      requestBody
    );

    return response.data;
  } catch (error) {
    console.error("Error sending OTP via Termii:", error);
    throw new Error("Failed to send OTP. Please try again later.");
  }
};

const sendWhatsAppNotification = async (phoneNumber, templateId, data) => {
  try {
    const requestBody = {
      phone_number: phoneNumber,
      device_id: termiiConfig.deviceId,
      template_id: templateId,
      api_key: termiiConfig.apiKey,
      data,
    };

    const response = await axios.post(
      `${termiiConfig.baseUrl}/send/template`,
      requestBody
    );

    return response.data;
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
    throw new Error("Failed to send custom message. Please try again later.");
  }
};

const sendVendorWhatsAppOrderNotification = async (
  phoneNumber,
  firstName,
  orderId,
  customerPhone,
  email
) => {
  const data = {
    vendor_firstname: firstName,
    order_id: orderId,
    phone_number: customerPhone,
    email,
  };
  return sendWhatsAppNotification(
    phoneNumber,
    termiiConfig.vendorTemplateId,
    data
  );
};

const sendCustomerWhatsAppOrderNotification = async (
  phoneNumber,
  firstName,
  orderId,
  timeFrame
) => {
  const data = {
    first_name: firstName,
    order_id: orderId,
    time_frame: timeFrame,
  };
  return sendWhatsAppNotification(
    phoneNumber,
    termiiConfig.customerTemplateId,
    data
  );
};

module.exports = {
  sendOtpViaTermii,
  sendVendorWhatsAppOrderNotification,
  sendCustomerWhatsAppOrderNotification,
};
