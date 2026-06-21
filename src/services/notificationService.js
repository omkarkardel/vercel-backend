const Notification = require("../models/Notification");
const socketService = require("./socketService");

const createNotification = async ({ recipient, roleTarget, type, message, targetModel, targetId }) => {
  const notification = await Notification.create({
    recipient: recipient || null,
    roleTarget: roleTarget || null,
    type,
    message,
    targetModel: targetModel || "",
    targetId: targetId || null
  });

  const payload = {
    id: notification._id,
    type,
    message,
    targetModel,
    targetId,
    createdAt: notification.createdAt
  };

  if (recipient) {
    socketService.emitToUser(recipient, payload);
  } else if (roleTarget && roleTarget !== "all") {
    socketService.emitToRole(roleTarget, payload);
  } else {
    socketService.emitToAll(payload);
  }

  return notification;
};

module.exports = { createNotification };