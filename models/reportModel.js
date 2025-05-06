const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      required: [true, "The reason for reporting event is required"],
    },

    event: {
      type: mongoose.Schema.ObjectId,

      ref: "Event",
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
