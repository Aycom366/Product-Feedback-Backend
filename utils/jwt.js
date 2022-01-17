const jwt = require("jsonwebtoken");

//changing users information into token
const createJWT = ({ payload }) => {
  //sign : creating the token
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return token;
};

//verifying the token, verifying the token coming from req
const isTokenValid = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

//attaching cookies to browser, taking in response, user to changed into token, and refreshToken if accessToken as expired
const attachCookiesToBrowser = ({ res, user, refreshToken }) => {
  //create the accessToken
  const accessTokenJwt = createJWT({ payload: user });

  const refreshTokenJwt = createJWT({ payload: { user, refreshToken } });

  const oneDay = 1000 * 60 * 60 * 24;
  const longerExp = oneDay * 5;

  //now we can attach the cookies to the browser
  res.cookie("accessToken", accessTokenJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });

  res.cookie("refreshToken", refreshTokenJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + longerExp),
  });
};

module.exports = { attachCookiesToBrowser, isTokenValid, createJWT };
