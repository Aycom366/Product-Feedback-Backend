const express = require("express");
const router = express.Router();
const uploadImage = require("../middlewares/uploadImage");
const { authenticateUser } = require("../middlewares/authentication");

const {
  Register,
  VerifyEmail,
  Login,
  ForgotPassowrd,
  ResetPassword,
  Logout,
  GoogleLogin,
} = require("../controllers/authController");

router.route("/register").post(uploadImage, Register);
router.post("/login", Login);
router.post("/google-login", GoogleLogin);
router.route("/logout").post(authenticateUser, Logout);
router.post("/reset-password", ResetPassword);
router.post("/forgot-password", ForgotPassowrd);
router.route("/verify-email").post(VerifyEmail);

module.exports = router;
