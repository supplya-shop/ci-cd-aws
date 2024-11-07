const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./custom-api");

class InvalidPhoneFormatError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

module.exports = InvalidPhoneFormatError;
