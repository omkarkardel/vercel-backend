const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    skills: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    requiredSkills: {
      type: [String],
      default: []
    },
    members: {
      type: [teamMemberSchema],
      default: []
    },
    maxMembers: {
      type: Number,
      default: 5
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Team", teamSchema);