const CustomError = require("../errors");
const Token = require("../models/Token");
const { isTokenValid, attachCookiesToBrowser } = require("../utils");

//Authentication middleware
//basically checking if  user is authenticated or not
const authenticateUser = async (req, res, next) => {
  //get the access and refreshToken from the cookies
  const { refreshToken, accessToken } = req.signedCookies;

  try {
    //if accessToken still exists, check if it is valid and puhsed payload to request

    if (accessToken) {
      const payload = isTokenValid(accessToken);
      req.user = payload;
      next();
      return;
    }

    //if accessToken has expired
    const payload = isTokenValid(refreshToken);

    //check if refreshToken is valid
    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });

    //if the above token is not found, throw an error
    if (!existingToken) {
      throw new CustomError.Unauthenticated("Authorization Invalid");
    }

    //setup the accessToken and refreshToken if accessToken as expired
    //creating a new Tokens
    attachCookiesToBrowser({
      res,
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });
    req.user = payload;
    next();
  } catch (error) {
    throw new CustomError.Unauthenticated("Authorization Invalid");
  }
};

const authorizeUser = async (req, res, next) => {};

module.exports = { authenticateUser };
