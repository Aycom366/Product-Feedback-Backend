const CustomAPIError = require("./Custom-Error");
const UnauthorizedError = require("./Unauthorized");

const Unauthenticated = require("./Unauthenticated");

const BadRequestError = require("./BadRequest");
const NotFoundError = require("./NotFound");

module.exports = {
  CustomAPIError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  Unauthenticated,
};
