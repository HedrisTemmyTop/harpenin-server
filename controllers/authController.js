const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const crypto = require("crypto");
const Email = require("../utils/Email");
const generateOTP = require("../utils/otp");
const jwt = require("jsonwebtoken");
// const Email = require("../utils/Email");

const generateJWT = function (id, type, expiresIn) {
  return jwt.sign(
    {
      id,
      type,
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
      verificationOtp: undefined,
      verificationOtpExpiresAt: undefined,
      verifiedAt: Date.now(),
    }
  );
  res.status(200).json({
    status: "success",
    message: "Email has been verified successfully",
  });
});

exports.resendVerificationOtp = catchAsync(async function (req, res, next) {
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

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect e-mail and password", 401));
  }

  const refreshToken = generateJWT(user._id, "refreshToken", "30d");
  const authToken = generateJWT(user._id, "authToken", "2h");
  res.status(200).json({
    status: "success",
    message: "login successful, proceed to hapenin  😊",
    data: {
      refreshToken,
      authToken,
    },
  });
});

exports.forgotPassword = catchAsync(async function (req, res, next) {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("e-mail  is required", 400));
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

  await new Email(user).sendReset(user.createResetOtp());

  await user.save();

  res.status(200).json({
    status: "success",
    message: "OTP has been sent to your e-mail",
  });
});

exports.resetPassword = catchAsync(async function (req, res, next) {
  const { email, confirmPassword, password, otp } = req.body;

  if (confirmPassword !== password) {
    return next(
      new AppError("password and confirm password  have to be the same", 400)
    );
  }

  if (!email || !password || !otp) {
    return next(new AppError("e-mail, password and OTP are required", 400));
  }

  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  const user = await User.findOne({
    email,
    resetPasswordOtp: hashedOTP,
    resetPasswordOtpExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("OTP  is invalid or has expired  ", 400));
  }

  user.password = password;
  user.resetPasswordOtp = undefined;
  user.resetPasswordOtpExpiresAt = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "your password has been updated successfully",
  });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError("The refresh token is required", 401));
  }

  let decodedRefreshToken;
  try {
    decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError("Invalid or expired refresh token", 401));
  }

  if (decodedRefreshToken.type !== "refreshToken") {
    return next(new AppError("Invalid token type", 401));
  }

  const authToken = req.headers.authorization?.split(" ")[1];
  if (authToken) {
    try {
      const decodedAuthToken = jwt.verify(authToken, process.env.JWT_SECRET);

      if (
        decodedAuthToken.type !== "authToken" ||
        decodedAuthToken.id !== decodedRefreshToken.id
      ) {
        return next(
          new AppError("Invalid tokens: They belong to different users", 401)
        );
      }
    } catch (err) {
      if (err.name !== "TokenExpiredError") {
        return next(new AppError("Invalid auth token", 401));
      }
    }
  }

  const user = await User.findById(decodedRefreshToken.id);
  if (!user) {
    return next(new AppError("Invalid token, this user does not exist", 401));
  }

  const newAuthToken = generateJWT(user._id, "authToken", "2h");
  const newRefreshToken = generateJWT(user._id, "refreshToken", "30d");

  res.status(200).json({
    status: "success",
    message: "New auth token has been issued successfully",
    data: {
      authToken: newAuthToken,
      refreshToken: newRefreshToken,
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  const authToken = req.headers.authorization?.split(" ")[1];

  if (!authToken) {
    return next(new AppError("The auth token is required", 401));
  }
  const decoded = jwt.verify(authToken, process.env.JWT_SECRET);

  if (decoded.type !== "authToken") {
    return next(new AppError("Invalid token, pls login again", 401));
  }

  const convertedTimestamp = new Date(decoded.exp * 1000);
  const now = new Date();
  if (convertedTimestamp < now) {
    return next(new AppError("Token has expired, pls login again", 401));
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("Invalid token this user does not exist", 401));
  }

  req.user = user;
  next();
});
