const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./custom-api");

class NoContentError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NO_CONTENT;
  }
}

module.exports = NoContentError;
