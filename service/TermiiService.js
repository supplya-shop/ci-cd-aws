const axios = require("axios");

const termiiConfig = {
  baseUrl: process.env.TERMII_BASE_URL,
  apiKey: process.env.TERMII_API_KEY,
  deviceId: process.env.TERMII_DEVICE_ID,
  customerTemplateId: process.env.TERMII_CUSTOMER_TEMPLATE_ID,
  vendorTemplateId: process.env.TERMII_VENDOR_TEMPLATE_ID,
  customerOrderCancelledTemplateId:
    process.env.TERMII_ORDER_CANCELLED_TEMPLATE_ID,
  migrationTemplateId: process.env.TERMII_MIGRATION_TEMPLATE_ID,
};

const sendOtpViaTermii = async (phoneNumber, otp) => {
  try {
    const requestBody = {
      to: phoneNumber,
      from: "Supplya",
      sms: otp,
      type: "plain",
      channel: "generic",
      api_key: termiiConfig.apiKey,
      time_in_minutes: "30 minutes",
    };

    const response = await axios.post(
      `${termiiConfig.baseUrl}/sms/send`,
      requestBody
    );
    console.log("response: ", response);

    return response.data;
  } catch (error) {
    console.error("Error sending OTP via Termii:", error);
    throw new Error("Failed to send OTP. Please try again later.");
  }
};

const sendSMSNotification = async (phoneNumber, data) => {
  try {
    const requestBody = {
      to: phoneNumber,
      from: "Supplya",
      sms: data,
      type: "plain",
      channel: "generic",
      api_key: termiiConfig.apiKey,
    };

    const response = await axios.post(
      `${termiiConfig.baseUrl}/sms/send`,
      requestBody
    );

    return response.data;
  } catch (error) {
    console.error("Error sending SMS notification:", error);
    throw new Error("Failed to send custom message. Please try again later.");
  }
};

const sendOrderCancellationSMS = async (
  phoneNumber,
  userFirstName,
  orderId,
  cancellationReason
) => {
  const message = `Hello ${userFirstName}, unfortunately, your order ${orderId} has been cancelled due to: ${cancellationReason}. We apologize for any inconvenience. Contact us for assistance. - Powered by Supplya`;
  await sendSMSNotification(phoneNumber, message);
};

const sendCustomerNewOrderSMS = async (phoneNumber, userFirstName, orderId) => {
  const message = `Hello ${userFirstName}, your order ${orderId} has been received successfully. The vendor will contact you within 30 minutes. Thank you. - Powered by Supplya`;
  await sendSMSNotification(phoneNumber, message);
};

// const sendVendorNewOrderSMS = async (
//   phoneNumber,
//   vendorFirstName,
//   orderId,
//   websiteUrl = `https://supplya.shop`
// ) => {
//   const message = `Hello ${vendorFirstName}, a customer just placed an order with ID : ${orderId}. Please login at ${websiteUrl} to fulfil the order. Thank you. - Powered by Supplya`;
//   await sendSMSNotification(phoneNumber, message);
// };

const sendUpdateOrderStatusSMS = async (
  phoneNumber,
  userFirstName,
  orderId,
  orderStatus,
  websiteUrl = `https://supplya.shop`
) => {
  const message = `Hello ${userFirstName}, the status of your order ${orderId} has been updated to ${orderStatus}. Login in to your dashboard at ${websiteUrl} for more information. - Supplya`;
  await sendSMSNotification(phoneNumber, message);
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

// WhatsApp notification for customer order cancellation
const sendCustomerOrderCancelledNotification = async (
  phoneNumber,
  firstName,
  orderId,
  cancellationReason
) => {
  const data = {
    user_firstname: firstName,
    order_id: orderId,
    cancellation_reason: cancellationReason,
  };
  return sendWhatsAppNotification(
    phoneNumber,
    termiiConfig.customerOrderCancelledTemplateId,
    data
  );
};

const sendMigrationNotification = async (
  firstName,
  phoneNumber,
  websiteUrl = `https://supplya.shop`,
  password
) => {
  const data = {
    user_firstname: firstName,
    website_url: websiteUrl,
    user_phoneno: phoneNumber,
    user_pass: password,
  };
  return sendWhatsAppNotification(
    phoneNumber,
    termiiConfig.migrationTemplateId,
    data
  );
};

module.exports = {
  sendOtpViaTermii,
  sendVendorWhatsAppOrderNotification,
  sendCustomerWhatsAppOrderNotification,
  sendCustomerOrderCancelledNotification,
  sendOrderCancellationSMS,
  sendUpdateOrderStatusSMS,
  sendMigrationNotification,
  sendCustomerNewOrderSMS,
  // sendVendorNewOrderSMS,
};
