const catchAsync = require("../utils/catchAsync");
const Report = require("../models/reportModel");
const AppError = require("../utils/AppError");

exports.createReport = catchAsync(async function (req, res, next) {
  if (!req.params.eventId) {
    return next(new AppError("The event id is required to report an event"));
  }

  await Report.create({
    reason: req.body.reason,
    event: req.params.eventId,
  });

  res.status(201).json({
    status: "success",
    message: "This event has been reported successfully",
  });
});
