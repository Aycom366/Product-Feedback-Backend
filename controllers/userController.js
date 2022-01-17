const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

const ShowCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json(req.user);
};

module.exports = { ShowCurrentUser };
