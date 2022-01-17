const CustomError = require("../errors");

const checkPermission = (requestUser, resourceUserId) => {
  if (requestUser === resourceUserId.toString()) return true;
  throw new CustomError.UnauthorizedError(
    "Not authorized to access this route"
  );
};

module.exports = checkPermission;
