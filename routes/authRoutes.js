const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signUp);

router.get("/refresh-token", authController.refreshToken);

router.post("/login", authController.login);

router.post("/verify-email", authController.verifyEmail);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
