const express = require("express");
const {
  signUp,
  verifyEmail,
  resendVerificationOtp,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signUp);

router.post("/login", login);

router.post("/verify-email", verifyEmail);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
