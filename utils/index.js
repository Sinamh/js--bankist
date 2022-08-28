const sendVerificationEmail = require("./sendVerficationEmail");
const createHash = require("./createHash");
const createTokenUser = require("./createTokenUser");
const checkPermissions = require("./checkPermissions");
const { createJWT, isTokenValid, attachCookiesToResponse } = require("./jwt");

module.exports = {
  sendVerificationEmail,
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  createTokenUser,
  checkPermissions,
  createHash,
};
