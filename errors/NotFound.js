const { StatusCodes } = require("http-status-codes");

const CustomAPIError = require("./Custom-Error");

class NotFoundError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

module.exports = NotFoundError;
