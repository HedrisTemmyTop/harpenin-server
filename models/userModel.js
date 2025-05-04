const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const generateOTP = require("../utils/otp");
const Email = require("../utils/Email");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "A user must have a firstname"],
  },
  lastname: {
    type: String,
    required: [true, "A user must have a lastname"],
  },
  email: {
    type: String,
    required: [true, "A user must have a valid email"],
    unique: true,
    lowercase: true,
    validate: [
      validator.isEmail,
      "Invalid E-mail pls provide a valid e-mail address",
    ],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },

  password: {
    type: String,
    required: [true, "A user must have a password"],
    minLength: [8, "A passowrd must have at least 8 characters"],
    select: false,
  },

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationOtp: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  verificationOtpExpiresAt: {
    type: Date,
  },
  resetPasswordOtp: String,
  resetPasswordOtpExpiresAt: Date,
  verifiedAt: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre("save", async function (next) {
  console.log(this, this.isNew, this.isVerified, "is new");
  if (!this.isNew || this.isVerified) return next();
  const otp = generateOTP();
  this.verificationOtp = crypto.createHash("sha256").update(otp).digest("hex");
  this.verificationOtpExpiresAt = Date.now() + 10 * 60 * 1000;

  await new Email(this).sendVerify(otp);

  next();
});

userSchema.methods.correctPassword = async function (password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

userSchema.methods.createResetOtp = function () {
  const otp = generateOTP();

  this.resetPasswordOtp = crypto.createHash("sha256").update(otp).digest("hex");
  this.resetPasswordOtpExpiresAt = Date.now() + 10 * 60 * 1000;

  return otp;
};

// userSchema.pre(/^find/, function (next) {
//   this.find({ active: { $ne: false } });
//   next();
// });

// userSchema.pre("save", function (next) {
//   if (!this.isModified("password") || this.isNew) return next();
//   this.passwordChangedAt = Date.now() - 1000;
//   next();
// });

// userSchema.methods.createPasswordResetToken = function () {
//   const resetToken = crypto.randomBytes(32).toString("hex");

//   this.passwordResetToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");
//   this.passwordResetExpires = Date.now() + 600000;
//   return resetToken;
// };

// userSchema.methods.correctPassword = async function (
//   candidatePassword,
//   userPassword
// ) {
//   const result = await bcrypt.compare(candidatePassword, userPassword);
//   return result;
// };

// userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const timeChanged = this.passwordChangedAt.getTime() / 1000;
//     const changedTimestamp = parseInt(timeChanged, 10);
//     return JWTTimestamp < changedTimestamp;
//   }
//   return false;
// };

const User = mongoose.model("User", userSchema);

module.exports = User;
