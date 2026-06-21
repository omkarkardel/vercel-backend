const express = require("express");
const { listNotifications, markAsRead } = require("../controllers/notificationController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, listNotifications);
router.patch("/:notificationId/read", authenticate, markAsRead);

module.exports = router;