const express = require("express");
const router = express.Router();

const { authenticateUser } = require("../middleware/authentication");

const {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
