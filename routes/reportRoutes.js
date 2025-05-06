const express = require("express");
const reportController = require("./../controllers/reportController");

const router = express.Router();

router.route("/:eventId").post(reportController.createReport);

module.exports = router;
