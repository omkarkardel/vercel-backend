const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    venue: {
      type: String,
      required: true
    },
    mapLink: {
      type: String,
      default: ""
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    gallery: {
      type: [String],
      default: []
    },
    maxAttendees: {
      type: Number,
      default: 300
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Event", eventSchema);