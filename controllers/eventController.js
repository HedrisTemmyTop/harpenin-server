const Event = require("../models/eventModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.createEvent = catchAsync(async function (req, res, next) {
  if (!req.body.title) {
    return next(new AppError("Event title is required", 400));
  }

  const photos = req.files.map((file) => file.path);

  console.log(req.files, "files here ===>");
  const newEvent = await Event.create({
    title: req.body.title,
    description: req.body.description,
    information: req.body.information,

    photos,
    type: req.body.type,
    locationType: req.body.locationType,
    location: req.body.location,
    paymentType: req.body.paymentType,
    registrationLink: req.body.registrationLink,
    dates: req.body.dates,
  });

  res.status(201).json({
    status: "success",
    message: "event has been created successfully",
    data: newEvent,
  });
});

exports.getSingleEvent = catchAsync(async function (req, res, next) {
  console.log(req.params);
  if (!req.params.id) {
    return next(
      new AppError("Event id is required to get an event details", 400)
    );
  }
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError("Invalid id: event could not be found"));
  }

  res.status(200).json({
    status: "success",
    message: "event details has been gotten successfully",
    data: event,
  });
});
