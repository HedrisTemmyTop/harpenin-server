const express = require("express");

const eventController = require("./../controllers/eventController");
const authController = require("../controllers/authController");
const upload = require("../utils/upload");
const router = express.Router();

router
  .route("/")
  .post(
    authController.protect,
    upload.array("photos", 4),
    eventController.createEvent
  );

router.route("/:id").get(eventController.getSingleEvent);

module.exports = router;
