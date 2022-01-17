const Origin = require("./origin");
const { attachCookiesToBrowser, createJWT, isTokenValid } = require("./jwt");
const createTokenUser = require("./createTokenUser");
const sendResetPassword = require("./sendResetPassword");
const sendVerificationEmail = require("./sendVerificationEmail");
const checkPermission = require("./checkPermisson");

module.exports = {
  Origin,
  attachCookiesToBrowser,
  createJWT,
  checkPermission,
  isTokenValid,
  createTokenUser,
  sendResetPassword,
  sendVerificationEmail,
};
