const axios = require("axios");
const { StatusCodes } = require("http-status-codes");

this.baseUrl = process.env.DIKRIPT_BASE_URL;
this.secretKey = process.env.DIKRIPT_SECRET_KEY;

const verifyPhoneNo = async (req, res) => {
  const { phoneNo } = req.query;

  if (!phoneNo) {
    return res
      .status(400)
      .json({ status: "error", message: "Phone number is required" });
  }

  try {
    const response = await axios.get(
      `${this.baseUrl}/dikript/verification/api/v1/getphonenumber`,
      {
        headers: {
          "x-api-key": this.secretKey,
        },
        params: {
          phoneNo,
        },
      }
    );

    return res
      .status(StatusCodes.OK)
      .json({ status: "success", data: response.data });
  } catch (error) {
    console.error("Error verifying phone number:", error);
    if (error.response && error.response.data) {
      return res.status(error.response.status).json({
        error: error.response.data,
      });
    } else {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: "error",
        message: "Internal server error",
        error: error.message,
      });
    }
  }
};

module.exports = { verifyPhoneNo };
