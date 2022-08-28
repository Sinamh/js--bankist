const express = require("express");
const router = express.Router();

// const { authenticateUser } = require("../middleware/authentication");

const {
  register,
  verifyEmail,
  login,
  logout
} = require("../controllers/auth");

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);

module.exports = router;
