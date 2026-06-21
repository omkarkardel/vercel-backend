const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user.userId })
    .sort({ createdAt: -1 })
    .limit(40)
    .lean();

  return res.json(apiResponse({ notifications }, "Notifications fetched"));
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.notificationId,
      recipient: req.user.userId
    },
    {
      $set: { isRead: true }
    },
    { new: true }
  );

  return res.json(apiResponse({ notification }, "Notification marked as read"));
});

module.exports = {
  listNotifications,
  markAsRead
};