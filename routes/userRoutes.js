const express = require("express");
const {
  signUp,
  verifyEmail,
  resendVerificationOtp,
  login,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signUp);

router.post("/login", login);

router.post("/verify-email", verifyEmail);

router.get("/verification-otp", resendVerificationOtp);

module.exports = router;
