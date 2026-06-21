const mongoose = require("mongoose");
const { ROLE } = require("../utils/roles");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    roleTarget: {
      type: String,
      enum: [...Object.values(ROLE), "all"],
      default: null
    },
    type: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    targetModel: {
      type: String,
      default: ""
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Notification", notificationSchema);