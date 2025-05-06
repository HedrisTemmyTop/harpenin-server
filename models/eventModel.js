const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,

      required: [true, "Event title is a required input field"],
    },
    description: {
      type: String,

      required: [true, "Event description is a required input field"],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "The event must belong to a user"],
    },

    information: String,
    photos: {
      type: [String],
      required: [true, "Event needs to have some photos"],
      maxLength: [4, "Maximum photos has to be 4"],
    },

    type: {
      type: String,
      required: [true, "Event type is a required input field"],
      validate: {
        validator: function (v) {
          return v === "single-day" || v === "multiple-day";
        },
        message: "event type can either be single-day or multiple-day",
      },
    },
    dates: {
      type: [Date],
      required: [true, "Event date is a required input field"],
      validate: {
        validator: function (v) {
          if (this.type === "single-day") {
            return v.length === 1;
          } else {
            return v.length >= 1;
          }
        },

        message:
          "single day event has to have one date while multiple days have 2 or more",
      },
    },
    locationType: {
      type: String,
      required: [true, "Event location type is a required input field"],
      validate: {
        validator: function (v) {
          return v === "online" || v === "physical";
        },
        message: "event location type can either be online or physical",
      },
    },
    location: {
      type: String,

      required: [true, "Event location is a required input field"],
    },

    paymentType: {
      type: String,
      required: [true, "Event payment type is a required input field"],
      validate: {
        validator: function (v) {
          return v === "free" || v === "free-and-paid" || v === "paid";
        },
        message:
          "Event payment type can either be free, paid or free with paid options",
      },
    },

    registrationLink: {
      type: String,

      required: [true, "Event registration link is a required input field"],
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
