const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const crypto = require("crypto");
const Email = require("../utils/Email");
const generateOTP = require("../utils/otp");
const jwt = require("jsonwebtoken");
// const Email = require("../utils/Email");

const generateJWT = function (id, expiresIn) {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn,
    }
  );
};

exports.signUp = catchAsync(async (req, res, next) => {
  const userAlreadyExist = await User.findOne({
    email: req.body.email,
  });

  if (userAlreadyExist) {
    const { isVerified } = userAlreadyExist;
    let message = "This user already exist, proceed to login";

    if (!isVerified) {
      message = "This user already exist, proceed to verify";
    }

    return next(new AppError(message, 400));
  }

  const data = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
  };

  await User.create({
    ...data,
  });

  delete data.password;
  res.status(201).json({
    status: "success",
    message: "Account created successfully, verify your e-mail",
    data: {
      user: data,
    },
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new AppError("Email and otp is required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new AppError(
        "This user does not exist, proceed to create an account",
        400
      )
    );
  }

  if (user.isVerified) {
    return next(
      new AppError(
        "This user has already been verified, proceed to login ",
        400
      )
    );
  }

  if (user.verificationOtpExpiresAt < Date.now()) {
    return next(new AppError("OTP has expired, request a new one", 400));
  }
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
  if (hashedOtp !== user.verificationOtp) {
    return next(new AppError("OTP is incorrect", 400));
  }

  await User.findOneAndUpdate(
    { email },
    {
      isVerified: true,
    }
  );
  res.status(200).json({
    status: "success",
    message: "Email has been verified successfully",
  });
});

exports.resendVerificationOtp = catchAsync(async function (req, res, next) {
  console.log(req.params, "req params");
  const { email } = req.query;

  if (!email) {
    return next(new AppError("Email is required to get new otp", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(
      new AppError(
        "This user does not exist, proceed to create an account",
        400
      )
    );
  }
  if (user.isVerified) {
    return next(
      new AppError(
        "This user has already been verified, proceed to login ",
        400
      )
    );
  }
  const otp = generateOTP();

  user.verificationOtp = crypto.createHash("sha256").update(otp).digest("hex");

  user.verificationOtpExpiresAt = Date.now() + 10 * 60 * 1000;

  await new Email(user).sendVerify(otp);

  await user.save();

  res.status(200).json({
    status: "success",
    message: "OTP has been resent to your email successfully",
  });
});

exports.login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password is required", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  console.log(user);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect e-mail and password"));
  }

  const refreshToken = generateJWT(user._id, "30d");
  const authToken = generateJWT(user._id, "2h");
  res.status(200).json({
    status: "success",
    message: "login successful, proceed to hapenin  😊",
    data: {
      refreshToken,
      authToken,
    },
  });
});
